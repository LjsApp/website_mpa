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
    if (!data) return id; // not taken
  }
  throw new Error("Gagal generate Tracking ID unik. Coba lagi.");
}

// ─── Admin: Create tracking ─────────────────────────────────────────────────

export const createTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { po_number: string; customer: string; item_name: string; event_date?: string }) =>
    z
      .object({
        po_number: z.string().min(1),
        customer: z.string().min(1),
        item_name: z.string().min(1),
        event_date: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const id = await generateUniqueTrackingId();
    const sb = supabaseAdmin as any;
    const { data: row, error } = await sb
      .from("order_trackings")
      .insert({ id, po_number: data.po_number, customer: data.customer, item_name: data.item_name, status: "PO Diterima" })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Auto-insert first update
    await sb.from("tracking_updates").insert({
      tracking_id: id,
      status: "PO Diterima",
      note: "Purchase Order telah diterima.",
      event_date: data.event_date ? new Date(data.event_date).toISOString() : new Date().toISOString(),
    });
    invalidateAll();
    return row;
  });

// ─── Admin: Update tracking header ─────────────────────────────────────────

export const updateTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id: string; po_number: string; customer: string; item_name: string }) =>
      z
        .object({
          id: z.string(),
          po_number: z.string().min(1),
          customer: z.string().min(1),
          item_name: z.string().min(1),
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

// ─── Admin: Add tracking update (timeline entry) ────────────────────────────

export const addTrackingUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tracking_id: string; status: string; note?: string; event_date?: string }) =>
    z
      .object({
        tracking_id: z.string(),
        status: z.string().min(1),
        note: z.string().optional(),
        event_date: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const insertData = {
      tracking_id: data.tracking_id,
      status: data.status,
      note: data.note,
      event_date: data.event_date ? new Date(data.event_date).toISOString() : new Date().toISOString(),
    };
    const { data: row, error } = await sb
      .from("tracking_updates")
      .insert(insertData)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Recalculate status from latest update by event_date
    const { data: latest } = await sb
      .from("tracking_updates")
      .select("status")
      .eq("tracking_id", data.tracking_id)
      .order("event_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      await sb
        .from("order_trackings")
        .update({ status: latest.status })
        .eq("id", data.tracking_id);
    }
    invalidateAll();
    return row;
  });

// ─── Admin: Edit tracking update (timeline entry) ───────────────────────────

export const updateTrackingUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; tracking_id: string; status: string; note?: string; event_date?: string }) =>
    z
      .object({
        id: z.string(),
        tracking_id: z.string(),
        status: z.string().min(1),
        note: z.string().optional(),
        event_date: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { id, tracking_id, ...fields } = data;
    const updateData: any = {
      status: fields.status,
      note: fields.note ?? null,
    };
    if (fields.event_date) {
      updateData.event_date = new Date(fields.event_date).toISOString();
    }
    const { data: row, error } = await sb
      .from("tracking_updates")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Recalculate status from latest update by event_date
    const { data: latest } = await sb
      .from("tracking_updates")
      .select("status")
      .eq("tracking_id", tracking_id)
      .order("event_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      await sb
        .from("order_trackings")
        .update({ status: latest.status })
        .eq("id", tracking_id);
    }
    invalidateAll();
    return row;
  });

// ─── Admin: Delete tracking update (timeline entry) ────────────────────────

export const deleteTrackingUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; tracking_id: string }) =>
    z.object({ id: z.string(), tracking_id: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const { error } = await sb.from("tracking_updates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    // Recalculate current status from latest remaining update by event_date
    const { data: latest } = await sb
      .from("tracking_updates")
      .select("status")
      .eq("tracking_id", data.tracking_id)
      .order("event_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      await sb
        .from("order_trackings")
        .update({ status: latest.status })
        .eq("id", data.tracking_id);
    }
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

// ─── Admin: Get single tracking with updates ────────────────────────────────

export const getTrackingWithUpdates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = supabaseAdmin as any;
    const [{ data: tracking }, { data: updates }] = await Promise.all([
      sb.from("order_trackings").select("*").eq("id", data.id).maybeSingle(),
      sb
        .from("tracking_updates")
        .select("*")
        .eq("tracking_id", data.id)
        .order("event_date", { ascending: true, nullsFirst: false }),
    ]);
    if (!tracking) throw new Error("Tracking tidak ditemukan");
    return { tracking: tracking as OrderTracking, updates: (updates ?? []) as TrackingUpdate[] };
  });

// ─── Public: Get tracking by ID (no auth required) ─────────────────────────

export const getPublicTracking = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = supabaseAdmin as any;
    const trackingId = data.id.trim().toUpperCase();
    const [{ data: tracking, error }, { data: updates }] = await Promise.all([
      sb.from("order_trackings").select("*").eq("id", trackingId).maybeSingle(),
      sb
        .from("tracking_updates")
        .select("*")
        .eq("tracking_id", trackingId)
        .order("event_date", { ascending: true, nullsFirst: false }),
    ]);
    if (error) throw new Error(error.message);
    if (!tracking) return null;
    return { tracking: tracking as OrderTracking, updates: (updates ?? []) as TrackingUpdate[] };
  });

// ─── Types ──────────────────────────────────────────────────────────────────

export type OrderTracking = {
  id: string;
  po_number: string;
  customer: string;
  item_name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TrackingUpdate = {
  id: string;
  tracking_id: string;
  status: string;
  note?: string;
  created_at: string;
  event_date?: string;
};

export const TRACKING_STATUSES = [
  "PO Diterima",
  "Barang Diproses",
  "Siap Dikirim",
  "Dalam Pengiriman",
  "Barang Diterima",
] as const;
