import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

const ADMIN_EMAIL = 'admin@indotek.local'
const ADMIN_PASSWORD = 'admin123'

export const Route = createFileRoute('/api/public/setup-admin')({
  server: {
    handlers: {
      POST: async () => {
        // Check if any admin already exists
        const { data: existing } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)

        if (existing && existing.length > 0) {
          return Response.json({ ok: true, message: 'Admin already exists' })
        }

        // Create admin user
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
        })

        if (createErr || !created.user) {
          // Maybe user exists but no role — find them
          const { data: list } = await supabaseAdmin.auth.admin.listUsers()
          const user = list?.users.find((u) => u.email === ADMIN_EMAIL)
          if (!user) {
            return Response.json({ ok: false, error: createErr?.message ?? 'Failed' }, { status: 500 })
          }
          await supabaseAdmin.from('user_roles').insert({ user_id: user.id, role: 'admin' })
          return Response.json({ ok: true, message: 'Role granted' })
        }

        await supabaseAdmin.from('user_roles').insert({ user_id: created.user.id, role: 'admin' })
        return Response.json({ ok: true, message: 'Admin created' })
      },
      GET: async () => Response.json({ ok: true, hint: 'POST to bootstrap admin' }),
    },
  },
})
