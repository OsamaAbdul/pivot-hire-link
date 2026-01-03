# Admin Role Permissions (Supabase)

This document outlines the elevated permissions for the `admin` role as configured via `supabase/migrations/20251117_add_admin_role_and_policies.sql`.

## Role Definition
- `user_role` enum extended with `admin`.
- `public.user_roles` table stores user-to-role mappings.
- `public.is_admin(user_id)` returns `true` if:
  - The user has `admin` in `public.user_roles`, or
  - The JWT contains `app_metadata.role = 'admin'`.

## Policies (CRUD)
- `profiles`: Admin can select, insert, update, delete.
- `developer_profiles`: Admin can select, insert, update, delete.
- `recruiter_profiles`: Admin can select, insert, update, delete.
- `jobs`: Admin can select, insert, update, delete.
- `applications`: Admin can select, insert, update, delete.
- `partner_applications`: Admin can select, insert, update, delete (if table exists).
- `user_roles`: Admin can select and modify (insert/update/delete) roles.

Policies use `public.is_admin(auth.uid())` for gating.

## JWT Claims
- Admin seeding sets `app_metadata.role = 'admin'` (visible in the session JWT claim).
- Client gating also leverages `user.app_metadata.role === 'admin'`.

## Notes
- RLS policies are additive; admin overrides coexist with existing developer/recruiter policies.
- To revoke admin, remove entry from `public.user_roles` and clear `app_metadata.role`.