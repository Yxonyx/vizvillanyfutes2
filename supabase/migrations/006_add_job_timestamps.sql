-- Migration to add standalone marketplace tracking columns for jobs

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS final_price_gross INTEGER,
ADD COLUMN IF NOT EXISTS dispatcher_notes TEXT;

-- We also need these fields in the open_jobs_map view? 
-- Actually, the view shouldn't expose them unless necessary, but maybe it's fine.
-- Let's just recreate the view safely to ensure no schema mismatch breaks it.

CREATE OR REPLACE VIEW public.open_jobs_map AS
SELECT 
    id,
    trade,
    category,
    title,
    description,
    priority,
    status,
    preferred_time_from,
    preferred_time_to,
    created_at,
    updated_at,
    lead_price,
    latitude,
    longitude,
    district_or_city
FROM 
    public.jobs
WHERE 
    status = 'open';
