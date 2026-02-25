-- =====================================================
-- VizVillanyFutes Backend - Lead Interests & Deferred Credit
-- Migration: 008
-- Description: Adds lead_interests table for contractor
--              interest signaling. Credits are only deducted
--              when the customer accepts.
-- =====================================================

-- =====================================================
-- 1. TABLE: lead_interests
-- Contractor signals interest in a lead, customer accepts/rejects
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lead_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,       -- references the 'leads' table
    contractor_id UUID NOT NULL,  -- auth.uid() of the contractor
    contractor_name TEXT,         -- display name cached for customer view
    contractor_trades TEXT[],     -- trades cached for customer view
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    price_at_interest INTEGER NOT NULL DEFAULT 2000,  -- lead price snapshot
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Prevent duplicate interest from same contractor on same lead
    CONSTRAINT lead_interests_unique UNIQUE (lead_id, contractor_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_interests_lead
    ON public.lead_interests(lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_interests_contractor
    ON public.lead_interests(contractor_id);

CREATE INDEX IF NOT EXISTS idx_lead_interests_status
    ON public.lead_interests(status);

-- Auto-update timestamp
CREATE TRIGGER update_lead_interests_updated_at
    BEFORE UPDATE ON public.lead_interests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. RLS: lead_interests
-- =====================================================
ALTER TABLE public.lead_interests ENABLE ROW LEVEL SECURITY;

-- Contractors: can insert their own interests
DROP POLICY IF EXISTS "lead_interests_contractor_insert" ON public.lead_interests;
CREATE POLICY "lead_interests_contractor_insert"
ON public.lead_interests FOR INSERT
TO authenticated
WITH CHECK (contractor_id = auth.uid());

-- Contractors: can read their own interests
DROP POLICY IF EXISTS "lead_interests_contractor_select" ON public.lead_interests;
CREATE POLICY "lead_interests_contractor_select"
ON public.lead_interests FOR SELECT
TO authenticated
USING (contractor_id = auth.uid());

-- Contractors: can withdraw their own pending interests
DROP POLICY IF EXISTS "lead_interests_contractor_update" ON public.lead_interests;
CREATE POLICY "lead_interests_contractor_update"
ON public.lead_interests FOR UPDATE
TO authenticated
USING (contractor_id = auth.uid() AND status = 'pending')
WITH CHECK (status = 'withdrawn');

-- Lead owners: can see interests on their leads
DROP POLICY IF EXISTS "lead_interests_owner_select" ON public.lead_interests;
CREATE POLICY "lead_interests_owner_select"
ON public.lead_interests FOR SELECT
TO authenticated
USING (
    lead_id IN (
        SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
);

-- Lead owners: can accept/reject interests on their leads
DROP POLICY IF EXISTS "lead_interests_owner_update" ON public.lead_interests;
CREATE POLICY "lead_interests_owner_update"
ON public.lead_interests FOR UPDATE
TO authenticated
USING (
    lead_id IN (
        SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
)
WITH CHECK (status IN ('accepted', 'rejected'));

-- =====================================================
-- 3. Add contact columns to leads (revealed on accept)
-- =====================================================
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS contact_name TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- =====================================================
-- 4. RPC: accept_contractor_interest
-- Atomically: accept interest → deduct credit → reveal contact
-- =====================================================
CREATE OR REPLACE FUNCTION public.accept_contractor_interest(
    p_interest_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_interest RECORD;
    v_lead RECORD;
    v_contractor RECORD;
    v_new_balance INTEGER;
BEGIN
    -- 1. Fetch and lock the interest
    SELECT li.*
    INTO v_interest
    FROM public.lead_interests li
    WHERE li.id = p_interest_id
    FOR UPDATE;

    IF v_interest IS NULL THEN
        RAISE EXCEPTION 'Interest not found';
    END IF;

    IF v_interest.status <> 'pending' THEN
        RAISE EXCEPTION 'Interest already processed (status: %)', v_interest.status;
    END IF;

    -- 2. Verify caller owns the lead
    SELECT l.*
    INTO v_lead
    FROM public.leads l
    WHERE l.id = v_interest.lead_id;

    IF v_lead IS NULL THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;

    IF v_lead.user_id <> auth.uid() THEN
        RAISE EXCEPTION 'You do not own this lead';
    END IF;

    -- 3. Check contractor has enough credits
    SELECT cp.id, cp.credit_balance, cp.display_name, cp.phone
    INTO v_contractor
    FROM public.contractor_profiles cp
    WHERE cp.user_id = v_interest.contractor_id
    FOR UPDATE;

    IF v_contractor IS NULL THEN
        -- No contractor profile = free interest (might be informal)
        -- Accept without credit deduction
        UPDATE public.lead_interests
        SET status = 'accepted', updated_at = now()
        WHERE id = p_interest_id;

        RETURN json_build_object(
            'success', true,
            'interest_id', p_interest_id,
            'credit_deducted', 0,
            'message', 'Accepted (no contractor profile found, no credit deduction)'
        );
    END IF;

    IF v_contractor.credit_balance < v_interest.price_at_interest THEN
        RAISE EXCEPTION 'Contractor has insufficient credits (% available, % required)',
            v_contractor.credit_balance, v_interest.price_at_interest;
    END IF;

    -- 4. Deduct credit
    UPDATE public.contractor_profiles
    SET credit_balance = credit_balance - v_interest.price_at_interest
    WHERE id = v_contractor.id;

    v_new_balance := v_contractor.credit_balance - v_interest.price_at_interest;

    -- 5. Record credit transaction
    INSERT INTO public.credit_transactions (
        contractor_id, amount, transaction_type, reference_id, description
    ) VALUES (
        v_contractor.id,
        -v_interest.price_at_interest,
        'lead_purchase',
        v_interest.lead_id,
        'Lead elfogadva - kredit levonás'
    );

    -- 6. Accept the interest
    UPDATE public.lead_interests
    SET status = 'accepted', updated_at = now()
    WHERE id = p_interest_id;

    -- 7. Return success with contractor contact info for the customer
    RETURN json_build_object(
        'success', true,
        'interest_id', p_interest_id,
        'credit_deducted', v_interest.price_at_interest,
        'remaining_balance', v_new_balance,
        'contractor', json_build_object(
            'name', v_contractor.display_name,
            'phone', v_contractor.phone
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. PERMISSIONS
-- =====================================================
GRANT ALL ON public.lead_interests TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_contractor_interest(UUID) TO authenticated;

-- =====================================================
-- 6. COMMENTS
-- =====================================================
COMMENT ON TABLE public.lead_interests IS 'Tracks contractor interest in leads. Credits only deducted when customer accepts.';
COMMENT ON FUNCTION public.accept_contractor_interest IS 'Atomic: accept contractor interest → deduct credit → return contractor info.';
