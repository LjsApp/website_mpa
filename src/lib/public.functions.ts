import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { cached } from "@/lib/server-cache";

const TTL = 60_000;

export const listProjects = createServerFn({ method: "GET" }).handler(async () =>
  cached("projects:list", TTL, async () => {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
  }),
);

export const getProjectBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { project: null, related: [] };
    const { data: related } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("category", row.category)
      .neq("id", row.id)
      .order("sort_order", { ascending: true })
      .limit(3);
    return { project: row, related: related ?? [] };
  });

/* ============================ PRODUCTS ============================ */

export const listProducts = createServerFn({ method: "GET" }).handler(async () =>
  cached("products:list", TTL, async () => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
  }),
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return { product: null, related: [], company: null };
    const [relatedResult, companyResult] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .order("sort_order", { ascending: true })
        .limit(3),
      supabaseAdmin
        .from("company_info")
        .select("name, phone, email, whatsapp")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    return { product, related: relatedResult.data ?? [], company: companyResult.data ?? null };
  });

/* ============================ ARTICLES ============================ */

export const listArticles = createServerFn({ method: "GET" }).handler(async () =>
  cached("articles:list", TTL, async () => {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
  }),
);

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: article, error } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!article) return { article: null, related: [] };
    const { data: related } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("category", article.category)
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(3);
    return { article, related: related ?? [] };
  });

/* ============================ HOMEPAGE BUNDLE ============================ */

export const getHomeData = createServerFn({ method: "GET" }).handler(async () =>
  cached("home:data", TTL, async () => {
  const [company, brands, clients, testimonials, products, projects] = await Promise.all([
    supabaseAdmin.from("company_info").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from("brands").select("*").order("sort_order", { ascending: true }),
    supabaseAdmin.from("clients").select("*").order("sort_order", { ascending: true }),
    supabaseAdmin.from("testimonials").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
    supabaseAdmin.from("products").select("*").order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(9),
  ]);

  return {
    company: company.data ?? null,
    brands: brands.data ?? [],
    clients: clients.data ?? [],
    testimonials: testimonials.data ?? [],
    products: products.data ?? [],
    projects: projects.data ?? [],
  };
  }),
);

/* ============================ CATEGORIES & BRANDS ============================ */

export const listProductCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listProjectCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("project_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listArticleCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("article_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listBrands = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCompany = createServerFn({ method: "GET" }).handler(async () =>
  cached("company:info", TTL, async () => {
  const { data, error } = await supabaseAdmin
    .from("company_info")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
  }),
);

/* ============================ SETUP / SUPERADMIN BOOTSTRAP ============================ */

/**
 * Check if the system needs initial setup (no users in database).
 * Safe to call without auth — returns boolean only.
 */
export const checkNeedsSetup = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
  if (error) throw new Error(error.message);
  return { needsSetup: !data.users || data.users.length === 0 };
});

/**
 * Create the first superadmin user.
 * Server-side double check ensures this can only run when no users exist.
 * Uses email_confirm: true to skip email verification.
 */
export const setupSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) =>
    z
      .object({
        username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan underscore"),
        password: z.string().min(8, "Password minimal 8 karakter"),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    // Server-side guard: double-check no users exist (prevents race condition)
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
    if (listError) throw new Error(listError.message);
    if (usersData.users && usersData.users.length > 0) {
      throw new Error("Setup already completed. System already has an admin user.");
    }

    // Convert username to internal email format
    const email = `${data.username}@indotek.local`;

    // Create user with email already confirmed (no verification email sent)
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { username: data.username },
    });

    if (createError) throw new Error(createError.message);
    if (!createdUser.user) throw new Error("Gagal membuat pengguna.");

    // Assign admin role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: createdUser.user.id,
      role: "admin",
    });

    if (roleError) {
      // Cleanup: delete the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      throw new Error(`Gagal menetapkan peran admin: ${roleError.message}`);
    }

    return { success: true, email };
  });

/* ============================ ANALYTICS & NEWSLETTER ============================ */


export const trackPageView = createServerFn({ method: "POST" })
  .validator((d: { path: string; user_agent?: string }) =>
    z.object({ path: z.string(), user_agent: z.string().optional() }).parse(d)
  )
  .handler(async ({ data }) => {
    // Fire and forget - log error tapi jangan throw agar tidak memblok navigasi
    const { error } = await supabaseAdmin
      .from("page_views")
      .insert({ path: data.path, user_agent: data.user_agent ?? null });
    if (error) {
      console.error("[PageView] Insert error:", error.message, "| code:", error.code);
    }
    return { success: !error };
  });

/* ============================ COMPANY ADMINS ============================ */

export const listCompanyAdmins = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("company_admins")
      .select("id, name, phone, instagram, photo_url")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });