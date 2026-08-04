import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
sb.from("product_categories").select("*").then(r => console.log("product_categories:", r.data));
sb.from("project_categories").select("*").then(r => console.log("project_categories:", r.data));
