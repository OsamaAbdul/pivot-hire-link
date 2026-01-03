import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!url || !anonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}
if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function run() {
  const { data: signIn, error: signErr } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
  if (signErr) {
    console.error('Admin sign-in failed:', signErr.message);
    process.exit(1);
  }
  console.log('Signed in as admin:', signIn.session?.user?.email);

  // Check claim visibility
  console.log('Admin app_metadata:', signIn.session?.user?.app_metadata);

  // Test elevated permissions: select counts from protected tables
  const tables = ['profiles', 'user_roles', 'jobs', 'applications'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Select ${t} failed:`, error.message);
    } else {
      console.log(`Select ${t} count:`, count);
    }
  }

  // Attempt restricted select as validation
  const { data: rolesData, error: rolesErr } = await supabase.from('user_roles').select('user_id, role').limit(5);
  if (rolesErr) {
    console.error('Fetch user_roles failed:', rolesErr.message);
  } else {
    console.log('user_roles sample:', rolesData);
  }

  console.log('Admin verification completed.');
}

run().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});