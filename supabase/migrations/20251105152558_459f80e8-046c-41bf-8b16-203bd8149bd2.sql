-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users cannot modify roles" ON public.user_roles;

-- Allow users to INSERT their own role (for signup and role selection)
CREATE POLICY "Users can set own role once"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Prevent users from updating or deleting roles
CREATE POLICY "Users cannot update roles"
  ON public.user_roles
  FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete roles"
  ON public.user_roles
  FOR DELETE
  USING (false);