-- VibeHotel Reviews Migration
-- Run AFTER 001_schema.sql, 002_rls.sql
-- Adds the reviews table, RLS policies and a helper view for aggregated ratings

-- ============ TABLE ============
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID        NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  property_id  UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comfort      SMALLINT    NOT NULL CHECK (comfort BETWEEN 1 AND 5),
  cleanliness  SMALLINT    NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
  location     SMALLINT    NOT NULL CHECK (location BETWEEN 1 AND 5),
  price        SMALLINT    NOT NULL CHECK (price BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id     ON reviews(user_id);

-- ============ RLS ============
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public catalog)
CREATE POLICY "reviews: public read"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews: user insert own"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update only their own reviews
CREATE POLICY "reviews: user update own"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete only their own reviews
CREATE POLICY "reviews: user delete own"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- ============ AGGREGATION VIEW ============
-- Convenient read-only view used by the backend to enrich property responses.
CREATE OR REPLACE VIEW property_ratings AS
SELECT
  property_id,
  COUNT(*)                                                                     AS review_count,
  ROUND(AVG((comfort + cleanliness + location + price)::numeric / 4), 1)      AS avg_rating,
  ROUND(AVG(comfort::numeric), 1)                                              AS avg_comfort,
  ROUND(AVG(cleanliness::numeric), 1)                                         AS avg_cleanliness,
  ROUND(AVG(location::numeric), 1)                                            AS avg_location,
  ROUND(AVG(price::numeric), 1)                                               AS avg_price
FROM reviews
GROUP BY property_id;
