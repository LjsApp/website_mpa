import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { invalidateAll } from "@/lib/server-cache";

const TABLES = [
  "projects",
  "products",
  "articles",
  "brands",
  "clients",
  "company_info",
  "testimonials",
  "product_categories",
  "project_categories",
  "article_categories",
  "newsletter_subscribers",
  "page_views",
] as const;
type TableName = (typeof TABLES)[number];
const tableSchema = z.enum(TABLES as any);

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await (ctx.supabase as any).rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

/**
 * Check if the current authenticated user has the admin role.
 * Used in beforeLoad guards to protect admin routes at the page level.
 * Returns false (instead of throwing) so the caller can redirect gracefully.
 */
export const checkAdminRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any).rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return Boolean(data);
  });

export const adminList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: TableName }) => z.object({ table: tableSchema }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = context.supabase as any;
    const tablesWithSort = new Set([
      "projects",
      "products",
      "brands",
      "clients",
      "testimonials",
      "product_categories",
      "project_categories",
      "article_categories",
    ]);
    let q = sb.from(data.table).select("*");
    if (tablesWithSort.has(data.table)) {
      q = q.order("sort_order", { ascending: true });
    }
    if (data.table === "articles") {
      q = q.order("published_at", { ascending: false });
    } else if (data.table === "company_info") {
      q = q.order("updated_at", { ascending: false });
    } else {
      q = q.order("created_at", { ascending: false });
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

import { createSupabaseAdminClient } from "@/integrations/supabase/client.server";

export const adminUploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: FormData) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const file = data.get("file") as File;
    const path = data.get("path") as string;
    
    if (!file || !path) throw new Error("Missing file or path");

    const adminSb = createSupabaseAdminClient();
    
    // Convert File to ArrayBuffer for server-side upload
    const buffer = await file.arrayBuffer();
    
    const { error } = await adminSb.storage.from("media").upload(path, buffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = adminSb.storage.from("media").getPublicUrl(path);
    return publicUrl;
  });

export const adminUpsert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: TableName; row: Record<string, unknown> }) =>
    z.object({ table: tableSchema, row: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = context.supabase as any;
    const row = { ...data.row };
    delete row.created_at;

    // For products, category_label mirrors category (same value).
    // Ensure it's always synced.
    if (data.table === "products") {
      if (!row.brand) throw new Error("Brand wajib dipilih.");
      if (!row.category) throw new Error("Kategori wajib dipilih.");
      row.category_label = row.category;
    }

    if (row.id) {
      const { id, ...rest } = row;
      const { data: updated, error } = await sb
        .from(data.table)
        .update(rest)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw new Error(error.message);
      invalidateAll();
      return updated;
    } else {
      delete row.id;
      const { data: created, error } = await sb
        .from(data.table)
        .insert(row)
        .select()
        .maybeSingle();
      if (error) throw new Error(error.message);
      invalidateAll();
      return created;
    }
  });

export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: TableName; id: string | number }) =>
    z.object({ table: tableSchema, id: z.union([z.string(), z.number()]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = context.supabase as any;
    const { error } = await sb.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    invalidateAll();
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase as any;
    const tables: TableName[] = ["projects", "products", "articles", "brands", "clients"];
    const results = await Promise.all(
      tables.map(async (t) => {
        const { count } = await sb.from(t).select("*", { count: "exact", head: true });
        return [t, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(results) as Record<TableName, number>;
  });

export const getAnalyticsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    // Gunakan supabaseAdmin (service role) agar bypass RLS dan pasti bisa baca page_views
    const sb = supabaseAdmin as any;
    
    // Hitung tanggal 30 hari yang lalu
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
    const isoDate = date30DaysAgo.toISOString();

    const { data, error } = await sb
      .from("page_views")
      .select("created_at")
      .gte("created_at", isoDate)
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error("[Analytics] Error fetching page_views:", error.message);
      // Kembalikan array kosong jika tabel belum ada, agar tidak crash dashboard
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return [];
      }
      throw new Error(error.message);
    }
    
    // Group by date
    const viewsByDate: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      viewsByDate[dateStr] = 0;
    }

    if (data) {
      data.forEach((row: any) => {
        const dateStr = new Date(row.created_at).toISOString().split("T")[0];
        if (viewsByDate[dateStr] !== undefined) {
          viewsByDate[dateStr]++;
        }
      });
    }

    // Format for Recharts
    const chartData = Object.keys(viewsByDate).map(date => ({
      date,
      views: viewsByDate[date]
    }));

    return chartData;
  });