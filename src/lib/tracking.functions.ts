import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { invalidateAll } from "@/lib/server-cache";

// ─── Helpers ───────────────────────────────────────────────────────────────

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await (ctx.supabase as any).rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

/** Generate unique Tracking ID in format MPA-XXXXXX */
async function generateUniqueTrackingId(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const sb = supabaseAdmin as any;
  for (let attempt = 0; attempt < 10; attempt++) {
    let suffix = "";
    for (let i = 0; i < 6; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    const id = `MPA-${suffix}`;
    const { data } = await sb
      .from("order_trackings")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (!data) return id;
  }
  throw new Error("Gagal generate Tracking ID unik. Coba lagi.");
}

// ─── Admin: Create tracking ─────────────────────────────────────────────────

export const createTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { po_number: string; customer: string; item_name: string; courier?: string; resi_number?: string }) =>
    z
      .object({
        po_number: z.string().min(1),
        customer: z.string().min(1),
        item_name: z.string().min(1),
        courier: z.string().optional(),
        resi_number: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const id = await generateUniqueTrackingId();
    const sb = supabaseAdmin as any;
    const { data: row, error } = await sb
      .from("order_trackings")
      .insert({
        id,
        po_number: data.po_number,
        customer: data.customer,
        item_name: data.item_name,
        courier: data.courier || null,
        resi_number: data.resi_number || null,
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    invalidateAll();
    return row;
  });

// ─── Admin: Update tracking ─────────────────────────────────────────────────

export const updateTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id: string; po_number: string; customer: string; item_name: string; courier?: string; resi_number?: string }) =>
      z
        .object({
          id: z.string(),
          po_number: z.string().min(1),
          customer: z.string().min(1),
          item_name: z.string().min(1),
          courier: z.string().optional(),
          resi_number: z.string().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { id, ...rest } = data;
    const { data: row, error } = await sb
      .from("order_trackings")
      .update(rest)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    invalidateAll();
    return row;
  });

// ─── Admin: Delete tracking ─────────────────────────────────────────────────

export const deleteTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { error } = await sb.from("order_trackings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    invalidateAll();
    return { ok: true };
  });

// ─── Admin: List all trackings ──────────────────────────────────────────────

export const listTrackings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
      .from("order_trackings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as OrderTracking[];
  });

// ─── Public: Get tracking by ID (no auth required) ─────────────────────────

export const getPublicTracking = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = supabaseAdmin as any;
    const trackingId = data.id.trim().toUpperCase();
    const { data: tracking, error } = await sb
      .from("order_trackings")
      .select("*")
      .eq("id", trackingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!tracking) return null;
    return { tracking: tracking as OrderTracking };
  });

// ─── Types ──────────────────────────────────────────────────────────────────

export type OrderTracking = {
  id: string;
  po_number: string;
  customer: string;
  item_name: string;
  courier?: string | null;
  resi_number?: string | null;
  created_at: string;
  updated_at: string;
};

export const TRACKING_STATUSES = [
  "PO Diterima",
  "Barang Diproses",
  "Siap Dikirim",
  "Dalam Pengiriman",
  "Barang Diterima",
] as const;
