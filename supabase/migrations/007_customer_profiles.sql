-- Migration: 007_customer_profiles.sql
-- Description: Adds user_id to customers table and creates lazy registration RLS policies

-- 1. Add user_id to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- 2. Update user_meta role constraint to allow 'customer'
ALTER TABLE public.user_meta DROP CONSTRAINT IF EXISTS user_meta_role_check;
ALTER TABLE public.user_meta ADD CONSTRAINT user_meta_role_check CHECK (role IN ('admin', 'dispatcher', 'contractor', 'customer'));

-- 3. RLS changes for customers table
-- (Customers can read and update their own profiles)
DROP POLICY IF EXISTS "customers_customer_all_own" ON public.customers;
CREATE POLICY "customers_customer_all_own"
ON public.customers FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. RLS changes for jobs table
-- (Customers can read their own jobs)
DROP POLICY IF EXISTS "jobs_customer_select_own" ON public.jobs;
CREATE POLICY "jobs_customer_select_own"
ON public.jobs FOR SELECT
TO authenticated
USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- 5. RLS changes for addresses table
-- (Customers can read their own addresses)
DROP POLICY IF EXISTS "addresses_customer_select_own" ON public.addresses;
CREATE POLICY "addresses_customer_select_own"
ON public.addresses FOR SELECT
TO authenticated
USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- 6. Update create_job_from_form to accept user_id
DROP FUNCTION IF EXISTS public.create_job_from_form(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, timestamp with time zone, timestamp with time zone, numeric);

CREATE OR REPLACE FUNCTION public.create_job_from_form(
    p_customer_full_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
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
    p_customer_user_id UUID DEFAULT NULL  -- Added parameter at the end
) RETURNS jsonb AS $$
DECLARE
    v_customer_id UUID;
    v_address_id UUID;
    v_job_id UUID;
    v_result jsonb;
BEGIN
    -- 1. Create or Find Customer
    -- First try to find by user_id if provided
    IF p_customer_user_id IS NOT NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE user_id = p_customer_user_id LIMIT 1;
    END IF;

    -- If not found by user_id, try by email or phone
    IF v_customer_id IS NULL THEN
        SELECT id INTO v_customer_id FROM public.customers 
        WHERE (p_customer_email IS NOT NULL AND email = p_customer_email)
           OR phone = p_customer_phone 
        LIMIT 1;
    END IF;

    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (full_name, phone, email, type, company_name, user_id)
        VALUES (p_customer_full_name, p_customer_phone, p_customer_email, p_customer_type, p_customer_company_name, p_customer_user_id)
        RETURNING id INTO v_customer_id;
    ELSE
        -- Update existing customer if user_id is missing but we have it now
        IF p_customer_user_id IS NOT NULL THEN
            UPDATE public.customers SET user_id = p_customer_user_id 
            WHERE id = v_customer_id AND user_id IS NULL;
        END IF;
    END IF;

    -- 2. Create or Find Address
    SELECT id INTO v_address_id FROM public.addresses 
    WHERE customer_id = v_customer_id 
      AND city = p_address_city 
      AND (street = p_address_street OR (street IS NULL AND p_address_street IS NULL))
      AND (house_number = p_address_house_number OR (house_number IS NULL AND p_address_house_number IS NULL))
    LIMIT 1;

    IF v_address_id IS NULL THEN
        INSERT INTO public.addresses (customer_id, city, district, postal_code, street, house_number, floor_door, notes)
        VALUES (v_customer_id, p_address_city, p_address_district, p_address_postal_code, p_address_street, p_address_house_number, p_address_floor_door, p_address_notes)
        RETURNING id INTO v_address_id;
    END IF;

    -- 3. Create Job
    INSERT INTO public.jobs (
        customer_id, address_id, source, trade, category, title, description,
        priority, preferred_time_from, preferred_time_to, estimated_price_gross
    )
    VALUES (
        v_customer_id, v_address_id, 'web_form', p_job_trade, p_job_category, 
        COALESCE(p_job_title, 'Új munka (' || p_job_trade || ')'), 
        COALESCE(p_job_description, ''),
        p_job_priority, p_job_preferred_time_from, p_job_preferred_time_to, p_job_estimated_price_gross
    )
    RETURNING id INTO v_job_id;

    -- Build return JSON
    v_result := jsonb_build_object(
        'success', true,
        'job_id', v_job_id,
        'customer_id', v_customer_id,
        'address_id', v_address_id
    );

    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
