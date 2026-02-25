-- =====================================================
-- VizVillanyFutes Backend - Marketplace Refactor
-- Migration: 005
-- Description: Converts dispatcher model to decentralized
--              lead-generation marketplace (Uber/Wolt style).
-- =====================================================

-- =====================================================
-- 1. SCHEMA CHANGES: contractor_profiles
-- =====================================================

-- Add credit balance for lead purchasing
ALTER TABLE public.contractor_profiles
    ADD COLUMN IF NOT EXISTS credit_balance INTEGER NOT NULL DEFAULT 0;

-- =====================================================
-- 2. SCHEMA CHANGES: jobs table
-- =====================================================

-- Drop existing status constraint and replace with marketplace statuses
ALTER TABLE public.jobs
    DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_status_check
    CHECK (status IN ('new', 'open', 'unlocked', 'completed', 'cancelled_by_customer',
                      -- legacy statuses kept for backward compat
                      'unassigned', 'assigned', 'scheduled', 'in_progress', 'cancelled'));

-- Add marketplace columns
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS lead_price INTEGER NOT NULL DEFAULT 2000;

ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS district_or_city TEXT;

-- Index for geo queries and open job filtering
CREATE INDEX IF NOT EXISTS idx_jobs_lat_lng
    ON public.jobs(latitude, longitude)
    WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_jobs_status_open
    ON public.jobs(status)
    WHERE status = 'open';

-- =====================================================
-- 3. NEW TABLE: lead_purchases
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lead_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE RESTRICT NOT NULL,
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE RESTRICT NOT NULL,
    price_paid INTEGER NOT NULL,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Prevent double-selling the same lead
    CONSTRAINT lead_purchases_job_unique UNIQUE (job_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_purchases_contractor
    ON public.lead_purchases(contractor_id);

CREATE INDEX IF NOT EXISTS idx_lead_purchases_job
    ON public.lead_purchases(job_id);

-- =====================================================
-- 4. NEW TABLE: credit_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE RESTRICT NOT NULL,
    amount INTEGER NOT NULL, -- positive = top-up, negative = purchase
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('top_up', 'lead_purchase', 'refund')),
    reference_id UUID, -- optional FK to lead_purchases.id or payment reference
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_contractor
    ON public.credit_transactions(contractor_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_type
    ON public.credit_transactions(transaction_type);

-- =====================================================
-- 5. RLS: lead_purchases
-- =====================================================
ALTER TABLE public.lead_purchases ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "lead_purchases_admin_all" ON public.lead_purchases;
CREATE POLICY "lead_purchases_admin_all"
ON public.lead_purchases FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Contractors: read their own purchases
DROP POLICY IF EXISTS "lead_purchases_contractor_select_own" ON public.lead_purchases;
CREATE POLICY "lead_purchases_contractor_select_own"
ON public.lead_purchases FOR SELECT
TO authenticated
USING (contractor_id = public.get_contractor_profile_id());

-- =====================================================
-- 6. RLS: credit_transactions
-- =====================================================
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "credit_transactions_admin_all" ON public.credit_transactions;
CREATE POLICY "credit_transactions_admin_all"
ON public.credit_transactions FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Contractors: read their own transactions
DROP POLICY IF EXISTS "credit_transactions_contractor_select_own" ON public.credit_transactions;
CREATE POLICY "credit_transactions_contractor_select_own"
ON public.credit_transactions FOR SELECT
TO authenticated
USING (contractor_id = public.get_contractor_profile_id());

-- =====================================================
-- 7. UPDATED RLS: jobs - contractors can see open jobs
-- =====================================================

-- Allow any contractor to see jobs that are 'open' (map view)
DROP POLICY IF EXISTS "jobs_contractor_select_open" ON public.jobs;
CREATE POLICY "jobs_contractor_select_open"
ON public.jobs FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND status = 'open'
);

-- Allow contractors to see jobs they have purchased (unlocked)
DROP POLICY IF EXISTS "jobs_contractor_select_purchased" ON public.jobs;
CREATE POLICY "jobs_contractor_select_purchased"
ON public.jobs FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND
    EXISTS (
        SELECT 1 FROM public.lead_purchases lp
        WHERE lp.job_id = id
        AND lp.contractor_id = public.get_contractor_profile_id()
    )
);

-- =====================================================
-- 8. UPDATED RLS: customers - via lead_purchases
-- =====================================================

-- Contractors: read customers for jobs they have PURCHASED
DROP POLICY IF EXISTS "customers_contractor_select_purchased" ON public.customers;
CREATE POLICY "customers_contractor_select_purchased"
ON public.customers FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND
    id IN (
        SELECT j.customer_id
        FROM public.jobs j
        JOIN public.lead_purchases lp ON lp.job_id = j.id
        WHERE lp.contractor_id = public.get_contractor_profile_id()
    )
);

-- =====================================================
-- 9. UPDATED RLS: addresses - via lead_purchases
-- =====================================================

-- Contractors: read addresses for jobs they have PURCHASED
DROP POLICY IF EXISTS "addresses_contractor_select_purchased" ON public.addresses;
CREATE POLICY "addresses_contractor_select_purchased"
ON public.addresses FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND
    id IN (
        SELECT j.address_id
        FROM public.jobs j
        JOIN public.lead_purchases lp ON lp.job_id = j.id
        WHERE lp.contractor_id = public.get_contractor_profile_id()
    )
);

-- =====================================================
-- 10. SECURE VIEW: open jobs for map (safe data only)
-- =====================================================
CREATE OR REPLACE VIEW public.open_jobs_map AS
SELECT
    j.id,
    j.trade,
    j.category,
    j.title,
    j.description,
    j.lead_price,
    j.latitude,
    j.longitude,
    j.district_or_city,
    j.priority,
    j.created_at
FROM public.jobs j
WHERE j.status = 'open';

-- Grant select on the view
GRANT SELECT ON public.open_jobs_map TO authenticated;

-- =====================================================
-- 11. RPC: unlock_job_lead (ATOMIC lead purchase)
-- =====================================================
CREATE OR REPLACE FUNCTION public.unlock_job_lead(
    p_job_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_contractor_profile_id UUID;
    v_job RECORD;
    v_lead_price INTEGER;
    v_credit_balance INTEGER;
    v_lead_purchase_id UUID;
    v_customer RECORD;
    v_address RECORD;
BEGIN
    -- 0. Resolve contractor from auth.uid()
    SELECT id, credit_balance
    INTO v_contractor_profile_id, v_credit_balance
    FROM public.contractor_profiles
    WHERE user_id = auth.uid();

    IF v_contractor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Contractor profile not found for current user';
    END IF;

    -- 1. Lock and fetch job (FOR UPDATE prevents race conditions)
    SELECT j.id, j.status, j.lead_price, j.customer_id, j.address_id
    INTO v_job
    FROM public.jobs j
    WHERE j.id = p_job_id
    FOR UPDATE;

    IF v_job IS NULL THEN
        RAISE EXCEPTION 'Job not found';
    END IF;

    IF v_job.status <> 'open' THEN
        RAISE EXCEPTION 'Ez a munka már el lett vállalva / Already taken';
    END IF;

    v_lead_price := v_job.lead_price;

    -- 2. Check sufficient credit balance (re-read with lock)
    SELECT credit_balance
    INTO v_credit_balance
    FROM public.contractor_profiles
    WHERE id = v_contractor_profile_id
    FOR UPDATE;

    IF v_credit_balance < v_lead_price THEN
        RAISE EXCEPTION 'Nincs elegendő kreditegyenleg / Insufficient funds. Required: %, Available: %', v_lead_price, v_credit_balance;
    END IF;

    -- 3. Deduct credit
    UPDATE public.contractor_profiles
    SET credit_balance = credit_balance - v_lead_price
    WHERE id = v_contractor_profile_id;

    -- 4. Record credit transaction
    INSERT INTO public.credit_transactions (
        contractor_id, amount, transaction_type, reference_id, description
    ) VALUES (
        v_contractor_profile_id,
        -v_lead_price,
        'lead_purchase',
        p_job_id,
        'Lead vásárlás: ' || p_job_id::TEXT
    );

    -- 5. Record lead purchase
    INSERT INTO public.lead_purchases (
        job_id, contractor_id, price_paid
    ) VALUES (
        p_job_id, v_contractor_profile_id, v_lead_price
    )
    RETURNING id INTO v_lead_purchase_id;

    -- 6. Update job status
    UPDATE public.jobs
    SET status = 'unlocked'
    WHERE id = p_job_id;

    -- 7. Fetch customer & address details to return
    SELECT c.full_name, c.phone, c.email, c.company_name
    INTO v_customer
    FROM public.customers c
    WHERE c.id = v_job.customer_id;

    SELECT a.city, a.district, a.postal_code, a.street,
           a.house_number, a.floor_door, a.notes
    INTO v_address
    FROM public.addresses a
    WHERE a.id = v_job.address_id;

    -- 8. Return success with full contact details
    RETURN json_build_object(
        'success', true,
        'lead_purchase_id', v_lead_purchase_id,
        'job_id', p_job_id,
        'price_paid', v_lead_price,
        'remaining_balance', v_credit_balance - v_lead_price,
        'customer', json_build_object(
            'full_name', v_customer.full_name,
            'phone', v_customer.phone,
            'email', v_customer.email,
            'company_name', v_customer.company_name
        ),
        'address', json_build_object(
            'city', v_address.city,
            'district', v_address.district,
            'postal_code', v_address.postal_code,
            'street', v_address.street,
            'house_number', v_address.house_number,
            'floor_door', v_address.floor_door,
            'notes', v_address.notes
        )
    );

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ez a munka már meg lett vásárolva / Lead already purchased';
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12. RPC: add_contractor_credits (admin-only top-up)
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_contractor_credits(
    p_contractor_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT 'Manual top-up'
)
RETURNS JSON AS $$
BEGIN
    -- Only admin/dispatcher can top up credits
    IF NOT public.is_admin_or_dispatcher() THEN
        RAISE EXCEPTION 'Unauthorized: Only admin can add credits';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    -- Verify contractor exists
    IF NOT EXISTS (SELECT 1 FROM public.contractor_profiles WHERE id = p_contractor_id) THEN
        RAISE EXCEPTION 'Contractor not found';
    END IF;

    -- Add credit
    UPDATE public.contractor_profiles
    SET credit_balance = credit_balance + p_amount
    WHERE id = p_contractor_id;

    -- Record transaction
    INSERT INTO public.credit_transactions (
        contractor_id, amount, transaction_type, description
    ) VALUES (
        p_contractor_id, p_amount, 'top_up', p_description
    );

    RETURN json_build_object(
        'success', true,
        'contractor_id', p_contractor_id,
        'amount_added', p_amount,
        'new_balance', (SELECT credit_balance FROM public.contractor_profiles WHERE id = p_contractor_id)
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. RPC: refund_lead (admin-only refund)
-- =====================================================
CREATE OR REPLACE FUNCTION public.refund_lead(
    p_lead_purchase_id UUID,
    p_reason TEXT DEFAULT 'Admin refund'
)
RETURNS JSON AS $$
DECLARE
    v_purchase RECORD;
BEGIN
    -- Only admin/dispatcher can issue refunds
    IF NOT public.is_admin_or_dispatcher() THEN
        RAISE EXCEPTION 'Unauthorized: Only admin can issue refunds';
    END IF;

    -- Get purchase details
    SELECT lp.id, lp.job_id, lp.contractor_id, lp.price_paid
    INTO v_purchase
    FROM public.lead_purchases lp
    WHERE lp.id = p_lead_purchase_id;

    IF v_purchase IS NULL THEN
        RAISE EXCEPTION 'Lead purchase not found';
    END IF;

    -- Refund credit
    UPDATE public.contractor_profiles
    SET credit_balance = credit_balance + v_purchase.price_paid
    WHERE id = v_purchase.contractor_id;

    -- Record refund transaction
    INSERT INTO public.credit_transactions (
        contractor_id, amount, transaction_type, reference_id, description
    ) VALUES (
        v_purchase.contractor_id,
        v_purchase.price_paid, -- positive = refund
        'refund',
        v_purchase.job_id,
        'Refund: ' || p_reason
    );

    -- Set job back to open
    UPDATE public.jobs
    SET status = 'open'
    WHERE id = v_purchase.job_id;

    -- Remove lead purchase record
    DELETE FROM public.lead_purchases
    WHERE id = p_lead_purchase_id;

    RETURN json_build_object(
        'success', true,
        'refunded_amount', v_purchase.price_paid,
        'contractor_id', v_purchase.contractor_id,
        'job_id', v_purchase.job_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 14. UPDATED: create_job_from_form - set status to 'open'
--     and populate lat/lng/district_or_city
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_job_from_form(
    p_customer_full_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT DEFAULT NULL,
    p_customer_type TEXT DEFAULT 'b2c',
    p_customer_company_name TEXT DEFAULT NULL,
    p_address_city TEXT DEFAULT 'Budapest',
    p_address_district TEXT DEFAULT NULL,
    p_address_postal_code TEXT DEFAULT NULL,
    p_address_street TEXT DEFAULT NULL,
    p_address_house_number TEXT DEFAULT NULL,
    p_address_floor_door TEXT DEFAULT NULL,
    p_address_notes TEXT DEFAULT NULL,
    p_job_trade TEXT DEFAULT 'viz',
    p_job_category TEXT DEFAULT 'standard',
    p_job_title TEXT DEFAULT NULL,
    p_job_description TEXT DEFAULT NULL,
    p_job_priority TEXT DEFAULT 'normal',
    p_job_preferred_time_from TIMESTAMPTZ DEFAULT NULL,
    p_job_preferred_time_to TIMESTAMPTZ DEFAULT NULL,
    p_job_estimated_price_gross NUMERIC DEFAULT NULL,
    -- NEW marketplace parameters
    p_job_latitude DOUBLE PRECISION DEFAULT NULL,
    p_job_longitude DOUBLE PRECISION DEFAULT NULL,
    p_job_lead_price INTEGER DEFAULT 2000
)
RETURNS JSON AS $$
DECLARE
    v_customer_id UUID;
    v_address_id UUID;
    v_job_id UUID;
    v_district_or_city TEXT;
BEGIN
    -- Determine district_or_city for public display
    v_district_or_city := COALESCE(
        CASE WHEN p_address_district IS NOT NULL
             THEN p_address_city || ' ' || p_address_district
             ELSE NULL END,
        p_address_city
    );

    -- Upsert customer by phone (primary identifier)
    INSERT INTO public.customers (full_name, phone, email, type, company_name)
    VALUES (p_customer_full_name, p_customer_phone, p_customer_email, p_customer_type, p_customer_company_name)
    ON CONFLICT (phone) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, customers.email),
        company_name = COALESCE(EXCLUDED.company_name, customers.company_name),
        updated_at = now()
    RETURNING id INTO v_customer_id;

    IF v_customer_id IS NULL THEN
        SELECT id INTO v_customer_id
        FROM public.customers
        WHERE phone = p_customer_phone
        LIMIT 1;

        IF v_customer_id IS NULL THEN
            INSERT INTO public.customers (full_name, phone, email, type, company_name)
            VALUES (p_customer_full_name, p_customer_phone, p_customer_email, p_customer_type, p_customer_company_name)
            RETURNING id INTO v_customer_id;
        END IF;
    END IF;

    -- Insert address
    INSERT INTO public.addresses (
        customer_id, city, district, postal_code,
        street, house_number, floor_door, notes
    )
    VALUES (
        v_customer_id, p_address_city, p_address_district, p_address_postal_code,
        p_address_street, p_address_house_number, p_address_floor_door, p_address_notes
    )
    RETURNING id INTO v_address_id;

    -- Insert job with marketplace fields, status = 'open'
    INSERT INTO public.jobs (
        customer_id, address_id, source, trade, category,
        title, description, status, priority,
        preferred_time_from, preferred_time_to, estimated_price_gross,
        latitude, longitude, district_or_city, lead_price
    )
    VALUES (
        v_customer_id, v_address_id, 'web_form', p_job_trade, p_job_category,
        COALESCE(p_job_title, 'Új munka - ' || p_job_trade),
        COALESCE(p_job_description, ''),
        'open', p_job_priority,
        p_job_preferred_time_from, p_job_preferred_time_to, p_job_estimated_price_gross,
        p_job_latitude, p_job_longitude, v_district_or_city, p_job_lead_price
    )
    RETURNING id INTO v_job_id;

    RETURN json_build_object(
        'success', true,
        'customer_id', v_customer_id,
        'address_id', v_address_id,
        'job_id', v_job_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 15. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.lead_purchases TO authenticated;
GRANT ALL ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.open_jobs_map TO authenticated;

GRANT EXECUTE ON FUNCTION public.unlock_job_lead(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_contractor_credits(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_lead(UUID, TEXT) TO authenticated;

-- =====================================================
-- 16. COMMENTS
-- =====================================================
COMMENT ON TABLE public.lead_purchases IS 'Records of purchased job leads by contractors. Unique per job to prevent double-selling.';
COMMENT ON TABLE public.credit_transactions IS 'Audit log of all credit balance changes (top-ups, purchases, refunds).';
COMMENT ON VIEW public.open_jobs_map IS 'Safe public view of open jobs for map display. No sensitive customer/address data exposed.';
COMMENT ON FUNCTION public.unlock_job_lead IS 'Atomic RPC to purchase a job lead. Checks balance, deducts credits, records transaction, and reveals contact info.';
COMMENT ON FUNCTION public.add_contractor_credits IS 'Admin-only RPC to top up contractor credit balance.';
COMMENT ON FUNCTION public.refund_lead IS 'Admin-only RPC to refund a lead purchase and re-open the job.';
