-- Drop old whatsapp columns from company_info
ALTER TABLE public.company_info DROP COLUMN IF EXISTS whatsapp;
ALTER TABLE public.company_info DROP COLUMN IF EXISTS whatsapp_2;
ALTER TABLE public.company_info DROP COLUMN IF EXISTS whatsapp_3;

-- Create new company_admins table
CREATE TABLE public.company_admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    phone text NOT NULL,
    instagram text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_admins_read_public"
    ON public.company_admins
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "company_admins_write_admin"
    ON public.company_admins
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger for updated_at (tanpa extension moddatetime)
CREATE OR REPLACE FUNCTION public.set_updated_at_company_admins()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_company_admins
    BEFORE UPDATE ON public.company_admins
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_company_admins();
