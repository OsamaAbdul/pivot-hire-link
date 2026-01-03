-- Update handle_new_user trigger to assign role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role text;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Handle role assignment from metadata
  meta_role := NEW.raw_user_meta_data->>'role';
  
  -- Check if role is valid (developer or recruiter) and insert if so
  IF meta_role IS NOT NULL AND meta_role IN ('developer', 'recruiter') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, meta_role::public.user_role);
  END IF;

  RETURN NEW;
END;
$$;
