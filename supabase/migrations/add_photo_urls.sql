-- =====================================================
-- Migration: Add photo upload support to jobs AND leads
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- 1. Add photo_urls column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT NULL;

-- 2. Add photo_urls column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT NULL;

-- 3. Constraint: max 3 photos per job
DO $$ BEGIN
  ALTER TABLE public.jobs ADD CONSTRAINT max_3_photos 
    CHECK (photo_urls IS NULL OR array_length(photo_urls, 1) <= 3);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Constraint: max 3 photos per lead
DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT max_3_lead_photos 
    CHECK (photo_urls IS NULL OR array_length(photo_urls, 1) <= 3);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Create storage bucket for job photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos', 
  'job-photos', 
  true, 
  5242880,  -- 5MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies (skip if already exist)
DO $$ BEGIN
  CREATE POLICY "Public read job photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'job-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public upload job photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'job-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service delete job photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'job-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
