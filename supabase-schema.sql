-- Toiletree Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  deletion_requested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- TOILETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS toilets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  accessibility_features JSONB,
  is_female_friendly BOOLEAN DEFAULT FALSE,
  has_water_access BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  average_rating DOUBLE PRECISION DEFAULT 0
);

-- Enable RLS on toilets
ALTER TABLE toilets ENABLE ROW LEVEL SECURITY;

-- Toilets policies
CREATE POLICY "Toilets are viewable by everyone"
  ON toilets FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can insert toilets"
  ON toilets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update toilets"
  ON toilets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete toilets"
  ON toilets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================
-- TOILET SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS toilet_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  submitted_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_female_friendly BOOLEAN DEFAULT FALSE,
  has_water_access BOOLEAN DEFAULT FALSE,
  is_paid BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on toilet_submissions
ALTER TABLE toilet_submissions ENABLE ROW LEVEL SECURITY;

-- Toilet submissions policies
CREATE POLICY "Users can view their own submissions"
  ON toilet_submissions FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all submissions"
  ON toilet_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can create submissions"
  ON toilet_submissions FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can update submissions"
  ON toilet_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================
-- STORAGE BUCKET & POLICIES
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'toilet-photos') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('toilet-photos', 'toilet-photos', true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Authenticated users can upload toilet photos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can upload toilet photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = ''toilet-photos'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Public can view toilet photos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view toilet photos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = ''toilet-photos'')';
  END IF;
END $$;

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  toilet_id UUID REFERENCES toilets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(toilet_id, user_id)
);

-- Enable RLS on ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  toilet_id UUID REFERENCES toilets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  toilet_id UUID REFERENCES toilets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('closed', 'dirty', 'broken', 'incorrect_location', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update average rating for a toilet
-- SECURITY DEFINER allows the function to update toilets even when triggered by regular users
CREATE OR REPLACE FUNCTION update_toilet_average_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE toilets
  SET average_rating = (
    SELECT COALESCE(AVG(stars::DOUBLE PRECISION), 0)
    FROM ratings
    WHERE toilet_id = COALESCE(NEW.toilet_id, OLD.toilet_id)
  )
  WHERE id = COALESCE(NEW.toilet_id, OLD.toilet_id);
  
  RETURN NULL;
END;
$$;

-- Trigger to automatically update average rating
DROP TRIGGER IF EXISTS trigger_update_toilet_rating ON ratings;
CREATE TRIGGER trigger_update_toilet_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_toilet_average_rating();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_toilets_location ON toilets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_toilets_status ON toilets(status);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON toilet_submissions(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_ratings_toilet_id ON ratings(toilet_id);
CREATE INDEX IF NOT EXISTS idx_reviews_toilet_id ON reviews(toilet_id);

