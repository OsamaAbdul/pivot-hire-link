import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL; // e.g. mimieamichy@gmail.com
const adminPassword = process.env.ADMIN_PASSWORD; // e.g. admin

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function ensureAdminUser() {
  // Try to create the admin user with app_metadata.role = 'admin'
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Admin' },
    app_metadata: { role: 'admin' },
  });
  if (error) {
    console.warn('createUser error:', error.message);
  }
  const user = data?.user;

  // Resolve user (created or existing by email)
  let finalUser = user;
  if (!finalUser) {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('listUsers error:', listError.message);
      process.exit(1);
    }
    finalUser = list.users.find((u) => u.email === adminEmail);
    if (!finalUser) {
      console.error('Admin user not found and could not be created.');
      process.exit(1);
    }
  }

  // Ensure role claim and reset password to ADMIN_PASSWORD
  const { error: updErr } = await supabase.auth.admin.updateUserById(finalUser.id, {
    app_metadata: { ...(finalUser.app_metadata || {}), role: 'admin' },
    password: adminPassword,
  });
  if (updErr) {
    console.warn('Failed to set admin role or password:', updErr.message);
  }

  // Grant admin role in public.user_roles
  const { error: roleErr } = await supabase
    .from('user_roles')
    .upsert({ user_id: finalUser.id, role: 'admin' }, { onConflict: 'user_id,role' });
  if (roleErr) {
    console.error('Failed to upsert admin role:', roleErr.message);
    process.exit(1);
  }

  console.log('Admin user ensured:', { id: finalUser.id, email: finalUser.email });
}

ensureAdminUser().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});