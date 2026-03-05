-- Run in Supabase Dashboard → SQL Editor (safe to run multiple times)
-- Security: RLS + allowed_admins + insert via function only (no direct anon access to table).

-- ========== ALLOWED ADMINS (create first — lead policies reference this) ==========
CREATE TABLE IF NOT EXISTS public.allowed_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.allowed_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own row" ON public.allowed_admins;
CREATE POLICY "Admins can read own row"
  ON public.allowed_admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ========== LEADS TABLE ==========
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fullname text NOT NULL,
  phone text NOT NULL,
  source text NOT NULL CHECK (source IN ('business', 'students', 'freelancers')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'working_on', 'ended')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated read leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated update leads" ON public.leads;

CREATE POLICY "Allow authenticated read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.allowed_admins));

CREATE POLICY "Allow authenticated update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.allowed_admins))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.allowed_admins));

CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);


-- ========== SECURE INSERT: anon can only add leads via this function ==========
CREATE OR REPLACE FUNCTION public.insert_lead(
  p_fullname text,
  p_phone text,
  p_source text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF trim(coalesce(p_fullname, '')) = '' OR length(trim(p_fullname)) < 2 THEN
    RAISE EXCEPTION 'invalid_fullname';
  END IF;
  IF trim(coalesce(p_phone, '')) = '' OR length(regexp_replace(trim(p_phone), '\s|\+', '', 'g')) < 8 THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;
  IF p_source IS NULL OR p_source NOT IN ('business', 'students', 'freelancers') THEN
    RAISE EXCEPTION 'invalid_source';
  END IF;
  IF length(trim(p_fullname)) > 200 OR length(trim(p_phone)) > 30 THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  INSERT INTO public.leads (fullname, phone, source)
  VALUES (trim(p_fullname), trim(p_phone), p_source)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_lead(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.insert_lead(text, text, text) TO authenticated;


-- ========== AFTER FIRST RUN ==========
-- 1. Create admin: Dashboard → Authentication → Users → Add user (email + password).
-- 2. Add to allowed_admins (replace email):
--    INSERT INTO public.allowed_admins (user_id)
--    SELECT id FROM auth.users WHERE email = 'your-admin@example.com' LIMIT 1;
-- 3. Use only the anon key in the browser; never service_role.
