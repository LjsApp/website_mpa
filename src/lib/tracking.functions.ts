import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { invalidateAll } from "@/lib/server-cache";

// ───────── Helpers ──────────────────────────────────────────────────────────────

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

// ───────── Admin: Create tracking ───────────────────────────────────────────────

export const createTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { po_number: string; customer: string; resi: { resi_number: string; courier: string; item_name: string }[] }) =>
    z
      .object({
        po_number: z.string().min(1),
        customer: z.string().min(1),
        resi: z.array(z.object({
          resi_number: z.string().min(1),
          courier: z.string().min(1),
          item_name: z.string().min(1)
        })).optional().default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const id = await generateUniqueTrackingId();
    const sb = supabaseAdmin as any;
    
    // Insert Master PO
    const { data: row, error } = await sb
      .from("order_trackings")
      .insert({
        id,
        po_number: data.po_number,
        customer: data.customer,
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Insert Detail Resi
    if (data.resi.length > 0) {
      const resiData = data.resi.map((r, idx) => ({
        tracking_id: id,
        resi_number: r.resi_number,
        courier: r.courier,
        item_name: r.item_name,
        sort_order: idx,
      }));
      const { error: resiError } = await sb.from("order_resi").insert(resiData);
      if (resiError) throw new Error(resiError.message);
    }

    invalidateAll();
    return row;
  });

// ───────── Admin: Update tracking ───────────────────────────────────────────────

export const updateTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id: string; po_number: string; customer: string; resi: { id?: string; resi_number: string; courier: string; item_name: string }[] }) =>
      z
        .object({
          id: z.string(),
          po_number: z.string().min(1),
          customer: z.string().min(1),
          resi: z.array(z.object({
            id: z.string().optional(),
            resi_number: z.string().min(1),
            courier: z.string().min(1),
            item_name: z.string().min(1)
          })).optional().default([]),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    
    // Update Master PO
    const { data: row, error } = await sb
      .from("order_trackings")
      .update({ po_number: data.po_number, customer: data.customer })
      .eq("id", data.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Get existing resi
    const { data: existingResi } = await sb.from("order_resi").select("id").eq("tracking_id", data.id);
    const existingIds = new Set((existingResi || []).map((r: any) => r.id));
    
    const incomingIds = new Set(data.resi.map(r => r.id).filter((id): id is string => !!id));
    
    // Delete removed resi
    const toDelete = [...existingIds].filter(id => !incomingIds.has(id as string)) as string[];
    if (toDelete.length > 0) {
      await sb.from("order_resi").delete().in("id", toDelete);
    }
    
    // Upsert remaining resi
    // We must provide an id for all rows because Supabase upsert requires uniform keys
    const toUpsert = data.resi.map((r, idx) => ({
      id: r.id || crypto.randomUUID(),
      tracking_id: data.id,
      resi_number: r.resi_number,
      courier: r.courier,
      item_name: r.item_name,
      sort_order: idx,
    }));
    
    if (toUpsert.length > 0) {
      const { error: upsertError } = await sb.from("order_resi").upsert(toUpsert);
      if (upsertError) throw new Error(upsertError.message);
    }

    invalidateAll();
    return row;
  });

// ───────── Admin: Delete tracking ───────────────────────────────────────────────

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

// ───────── Admin: List all trackings ────────────────────────────────────────────

export const listTrackings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
      .from("order_trackings")
      .select("*, resi:order_resi(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    
    // Sort resi
    data.forEach((d: any) => {
      if (d.resi) {
        d.resi.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
    });
    
    return (data ?? []) as OrderTracking[];
  });

// ───────── Public: Get tracking by ID (no auth required) ───────────────────────

export const getPublicTracking = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = supabaseAdmin as any;
    const trackingIdOrPo = data.id.trim().toUpperCase();
    
    // Search by MPA-ID or PO Number
    const { data: tracking, error } = await sb
      .from("order_trackings")
      .select("*, resi:order_resi(*)")
      .or(`id.eq.${trackingIdOrPo},po_number.ilike.${trackingIdOrPo}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) throw new Error(error.message);
    if (!tracking) return null;
    
    if (tracking.resi) {
      tracking.resi.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
    
    return { tracking: tracking as OrderTracking };
  });


// ───────── Admin: List clients for dropdown ─────────────────────────────────────

export const listClientsMini = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { data, error } = await sb
      .from("clients")
      .select("name")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((c: any) => c.name);
  });

// ───────── Types ────────────────────────────────────────────────────────────────

export type OrderResi = {
  id: string;
  tracking_id: string;
  resi_number: string;
  courier: string;
  item_name: string;
  sort_order: number;
};

export type OrderTracking = {
  id: string;
  po_number: string;
  customer: string;
  resi: OrderResi[];
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
