-- Create table to persist partner applications with server-side validation via NOT NULL constraints
begin;

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company text not null,
  contact_person text not null,
  email text not null check (position('@' in email) > 1),
  partnership_type text not null,
  message text not null,
  logo_data_url text not null
);

commit;