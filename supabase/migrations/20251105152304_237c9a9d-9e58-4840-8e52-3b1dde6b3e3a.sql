-- Create user_roles table (reusing existing user_role enum)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role
FROM public.profiles 
WHERE role IS NOT NULL;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users cannot modify roles"
  ON public.user_roles
  FOR ALL
  USING (false);

-- Drop role column from profiles table
ALTER TABLE public.profiles DROP COLUMN role;

-- Update handle_new_user trigger to not reference role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Update RLS policies to use role checking function
DROP POLICY IF EXISTS "Recruiters can create jobs" ON public.jobs;
CREATE POLICY "Recruiters can create jobs"
  ON public.jobs
  FOR INSERT
  WITH CHECK (
    auth.uid() = recruiter_id AND 
    public.has_role(auth.uid(), 'recruiter'::user_role)
  );

DROP POLICY IF EXISTS "Recruiters can update own jobs" ON public.jobs;
CREATE POLICY "Recruiters can update own jobs"
  ON public.jobs
  FOR UPDATE
  USING (
    auth.uid() = recruiter_id AND 
    public.has_role(auth.uid(), 'recruiter'::user_role)
  );

DROP POLICY IF EXISTS "Recruiters can delete own jobs" ON public.jobs;
CREATE POLICY "Recruiters can delete own jobs"
  ON public.jobs
  FOR DELETE
  USING (
    auth.uid() = recruiter_id AND 
    public.has_role(auth.uid(), 'recruiter'::user_role)
  );

DROP POLICY IF EXISTS "Developers can create applications" ON public.applications;
CREATE POLICY "Developers can create applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (
    auth.uid() = developer_id AND 
    public.has_role(auth.uid(), 'developer'::user_role)
  );

DROP POLICY IF EXISTS "Recruiters can insert own profile" ON public.recruiter_profiles;
CREATE POLICY "Recruiters can insert own profile"
  ON public.recruiter_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    public.has_role(auth.uid(), 'recruiter'::user_role)
  );

DROP POLICY IF EXISTS "Recruiters can update own profile" ON public.recruiter_profiles;
CREATE POLICY "Recruiters can update own profile"
  ON public.recruiter_profiles
  FOR UPDATE
  USING (
    auth.uid() = user_id AND 
    public.has_role(auth.uid(), 'recruiter'::user_role)
  );

DROP POLICY IF EXISTS "Developers can insert own profile" ON public.developer_profiles;
CREATE POLICY "Developers can insert own profile"
  ON public.developer_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    public.has_role(auth.uid(), 'developer'::user_role)
  );

DROP POLICY IF EXISTS "Developers can update own profile" ON public.developer_profiles;
CREATE POLICY "Developers can update own profile"
  ON public.developer_profiles
  FOR UPDATE
  USING (
    auth.uid() = user_id AND 
    public.has_role(auth.uid(), 'developer'::user_role)
  );