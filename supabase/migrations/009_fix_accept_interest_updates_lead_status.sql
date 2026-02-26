-- =====================================================
-- VizVillanyFutes Backend - Fix Accept Interest → Lead Status
-- Migration: 009
-- Description: When a contractor interest is accepted,
--              the lead status is now updated to 'accepted'
--              so it disappears from the map.
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
        -- No contractor profile = free interest
        UPDATE public.lead_interests
        SET status = 'accepted', updated_at = now()
        WHERE id = p_interest_id;

        -- NEW: Update lead status so it disappears from the map
        UPDATE public.leads
        SET status = 'accepted'
        WHERE id = v_interest.lead_id;

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

    -- 7. NEW: Update lead status so it disappears from the map
    UPDATE public.leads
    SET status = 'accepted'
    WHERE id = v_interest.lead_id;

    -- 8. Return success with contractor contact info for the customer
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
