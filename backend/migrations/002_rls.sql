-- VibeHotel Row Level Security Policies
-- Run AFTER 001_schema.sql

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============ PROFILES ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: anyone can read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles: users update own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============ PROPERTIES ============
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties: public read"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "properties: admin insert"
  ON properties FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "properties: admin update"
  ON properties FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "properties: admin delete"
  ON properties FOR DELETE
  USING (public.is_admin());

-- ============ PROPERTY IMAGES ============
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_images: public read"
  ON property_images FOR SELECT
  USING (true);

CREATE POLICY "property_images: admin insert"
  ON property_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "property_images: admin delete"
  ON property_images FOR DELETE
  USING (public.is_admin());

-- ============ BOOKINGS ============
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings: own or admin read"
  ON bookings FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "bookings: user insert own"
  ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings: user update own or admin"
  ON bookings FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ============ STORAGE ============
-- Bucket "property-images" must already exist (created via Dashboard or API).

-- Public read
CREATE POLICY "property-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Admin upload
CREATE POLICY "property-images: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

-- Admin delete
CREATE POLICY "property-images: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND public.is_admin());
