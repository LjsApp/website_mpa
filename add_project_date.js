// Script to add project_date column directly via Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_date date;'
  });
  if (error) {
    console.error('RPC error:', error.message);
    // Try direct query
    const { data, error: e2 } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    console.log('Connection test:', e2 ? e2.message : 'OK');
  } else {
    console.log('Column added successfully');
  }
}

main();
