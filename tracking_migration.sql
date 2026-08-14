-- ==========================================
-- ORDER TRACKING SYSTEM MIGRATION
-- Jalankan di Supabase SQL Editor
-- ==========================================

-- Trigger updated_at untuk order_trackings
CREATE TABLE public.order_trackings (
  id         TEXT PRIMARY KEY,
  po_number  TEXT NOT NULL,
  customer   TEXT NOT NULL,
  item_name  TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'PO Diterima',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_trackings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_order_trackings_updated
  BEFORE UPDATE ON public.order_trackings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "public read order_trackings"
  ON public.order_trackings FOR SELECT USING (true);
CREATE POLICY "admin write order_trackings"
  ON public.order_trackings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================

CREATE TABLE public.tracking_updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT NOT NULL REFERENCES public.order_trackings(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tracking_updates"
  ON public.tracking_updates FOR SELECT USING (true);
CREATE POLICY "admin write tracking_updates"
  ON public.tracking_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
