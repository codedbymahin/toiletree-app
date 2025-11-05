-- Migration: Ensure toilet-photos bucket and policies exist

INSERT INTO storage.buckets (id, name, public)
VALUES ('toilet-photos', 'toilet-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  BEGIN
    CREATE POLICY "Authenticated users can upload toilet photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'toilet-photos');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

DO $$
BEGIN
  BEGIN
    CREATE POLICY "Public can view toilet photos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'toilet-photos');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;


