# Admin Role Test Plan

This plan verifies admin authentication, elevated permissions, security constraints, and error handling.

## Prerequisites
- Environment variables set:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (e.g., mimieamichy@gmail.com / admin)
- Run migrations to apply admin role and policies.

## Steps
1. Seed Admin User
   - Run `npm run seed:admin` to create or ensure the admin user and assign roles.

2. Verify Admin Authentication
   - Run `npm run verify:admin` to sign in with admin credentials.
   - Expect: Successful sign-in, `app_metadata.role` prints as `admin`.

3. Test Elevated Permissions (Read)
   - The verify script queries counts from `profiles`, `user_roles`, `jobs`, `applications`.
   - Expect: No RLS errors; counts returned for all tables.

4. Test Security Constraints
   - Attempt info access as a non-admin user (manual): sign in with a developer/recruiter and query `user_roles`.
   - Expect: RLS error or empty result depending on policy.

5. Error Handling
   - Intentionally provide wrong admin password.
   - Expect: Structured error printed by verify script; no session.

## Frontend Gating
- Navigate to `/admin` while signed in as admin.
- Expect: Admin dashboard loads.
- Navigate as non-admin.
- Expect: Redirect with error message.

## Cleanup
- To revoke admin:
  - Remove `user_roles` entry: `DELETE FROM public.user_roles WHERE user_id = '<id>' AND role = 'admin';`
  - Update `app_metadata.role` to null via `auth.admin.updateUserById`.