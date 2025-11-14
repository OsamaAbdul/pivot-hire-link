-- Add application_deadline to jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS application_deadline date;

-- Extend recruiter_profiles with onboarding-related fields
ALTER TABLE public.recruiter_profiles ADD COLUMN IF NOT EXISTS hiring_preferences text;
ALTER TABLE public.recruiter_profiles ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.recruiter_profiles ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.recruiter_profiles ADD COLUMN IF NOT EXISTS verification_docs_url text;
ALTER TABLE public.recruiter_profiles ADD COLUMN IF NOT EXISTS verification_status text;

-- Optional: default verification_status to 'pending'
UPDATE public.recruiter_profiles SET verification_status = COALESCE(verification_status, 'pending');