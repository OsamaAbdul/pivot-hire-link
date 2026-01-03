-- Add 'admin' to user_role enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'admin') THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END$$;

-- Function: is_admin - checks either table role or JWT app_metadata.role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::user_role)
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
$$;

-- Admin override policies for core tables
-- profiles
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
CREATE POLICY "Admins can select all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- developer_profiles
DROP POLICY IF EXISTS "Admins can select all developer profiles" ON public.developer_profiles;
CREATE POLICY "Admins can select all developer profiles"
  ON public.developer_profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all developer profiles" ON public.developer_profiles;
CREATE POLICY "Admins can update all developer profiles"
  ON public.developer_profiles FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert developer profiles" ON public.developer_profiles;
CREATE POLICY "Admins can insert developer profiles"
  ON public.developer_profiles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete developer profiles" ON public.developer_profiles;
CREATE POLICY "Admins can delete developer profiles"
  ON public.developer_profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- recruiter_profiles
DROP POLICY IF EXISTS "Admins can select all recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Admins can select all recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Admins can update all recruiter profiles"
  ON public.recruiter_profiles FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Admins can insert recruiter profiles"
  ON public.recruiter_profiles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Admins can delete recruiter profiles"
  ON public.recruiter_profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- jobs
DROP POLICY IF EXISTS "Admins can select all jobs" ON public.jobs;
CREATE POLICY "Admins can select all jobs"
  ON public.jobs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all jobs" ON public.jobs;
CREATE POLICY "Admins can update all jobs"
  ON public.jobs FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
CREATE POLICY "Admins can insert jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can delete jobs"
  ON public.jobs FOR DELETE
  USING (public.is_admin(auth.uid()));

-- applications
DROP POLICY IF EXISTS "Admins can select all applications" ON public.applications;
CREATE POLICY "Admins can select all applications"
  ON public.applications FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all applications" ON public.applications;
CREATE POLICY "Admins can update all applications"
  ON public.applications FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert applications" ON public.applications;
CREATE POLICY "Admins can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;
CREATE POLICY "Admins can delete applications"
  ON public.applications FOR DELETE
  USING (public.is_admin(auth.uid()));

-- partner_applications
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='partner_applications') THEN
    DROP POLICY IF EXISTS "Admins can select all partner applications" ON public.partner_applications;
    CREATE POLICY "Admins can select all partner applications"
      ON public.partner_applications FOR SELECT
      USING (public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Admins can update all partner applications" ON public.partner_applications;
    CREATE POLICY "Admins can update all partner applications"
      ON public.partner_applications FOR UPDATE
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Admins can insert partner applications" ON public.partner_applications;
    CREATE POLICY "Admins can insert partner applications"
      ON public.partner_applications FOR INSERT
      WITH CHECK (public.is_admin(auth.uid()));

    DROP POLICY IF EXISTS "Admins can delete partner applications" ON public.partner_applications;
    CREATE POLICY "Admins can delete partner applications"
      ON public.partner_applications FOR DELETE
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- user_roles: admins can view and modify roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can modify roles" ON public.user_roles;
CREATE POLICY "Admins can modify roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));