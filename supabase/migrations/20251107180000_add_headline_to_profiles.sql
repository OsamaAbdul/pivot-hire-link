-- Add headline column to profiles for account settings UI
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;

-- Optional: ensure updated_at is refreshed on updates (function exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;