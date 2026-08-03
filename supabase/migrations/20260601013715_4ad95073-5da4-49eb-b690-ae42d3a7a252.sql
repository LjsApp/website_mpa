-- Testimonials table
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  name text NOT NULL,
  role text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read testimonials"
ON public.testimonials FOR SELECT
USING (true);

CREATE POLICY "admin write testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "admin upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));