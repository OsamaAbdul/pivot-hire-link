begin;

-- Ensure RLS is enabled (Supabase defaults to enabled for new tables)
alter table public.partner_applications enable row level security;

-- Allow inserts from both anonymous and authenticated clients
create policy "public_insert_partner_applications"
on public.partner_applications
for insert
to anon, authenticated
with check (true);

-- Optional: allow authenticated users to read submissions (exclude anon for privacy)
create policy "authenticated_select_partner_applications"
on public.partner_applications
for select
to authenticated
using (true);

commit;