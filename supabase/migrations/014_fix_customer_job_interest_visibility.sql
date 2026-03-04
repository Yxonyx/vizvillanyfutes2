-- =====================================================
-- Fix: Customer cannot see contractor interests on their jobs
-- and cannot accept/reject because of wrong ownership check
-- =====================================================

-- Fix 1: Add RLS policy so customers can see interests on their jobs
DROP POLICY IF EXISTS "Customers can view interests on own jobs" ON public.job_interests;
CREATE POLICY "Customers can view interests on own jobs"
ON public.job_interests FOR SELECT
TO authenticated
USING (
    job_id IN (
        SELECT j.id FROM public.jobs j
        WHERE j.created_by_user_id = auth.uid()
    )
);

-- Fix 2: accept_job_interest checks created_by_user_id instead of customer_id
CREATE OR REPLACE FUNCTION public.accept_job_interest(p_interest_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_interest RECORD;
    v_job RECORD;
    v_contractor RECORD;
    v_first_purchase_check BOOLEAN;
    v_referrer_profile_id UUID;
BEGIN
    SELECT ji.* INTO v_interest FROM public.job_interests ji WHERE ji.id = p_interest_id FOR UPDATE;
    IF v_interest IS NULL THEN RAISE EXCEPTION 'Interest not found'; END IF;
    IF v_interest.status <> 'pending' THEN RAISE EXCEPTION 'Interest already processed'; END IF;

    SELECT j.* INTO v_job FROM public.jobs j WHERE j.id = v_interest.job_id FOR UPDATE;
    IF v_job IS NULL THEN RAISE EXCEPTION 'Job not found'; END IF;
    IF v_job.created_by_user_id <> auth.uid() THEN RAISE EXCEPTION 'You do not own this job'; END IF;

    SELECT cp.id, cp.display_name, cp.phone, cp.referred_by INTO v_contractor
    FROM public.contractor_profiles cp WHERE cp.id = v_interest.contractor_id;

    UPDATE public.job_interests SET status = 'accepted', updated_at = now() WHERE id = p_interest_id;
    UPDATE public.jobs SET status = 'assigned' WHERE id = v_job.id;

    IF v_contractor.referred_by IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.job_interests WHERE contractor_id = v_contractor.id AND status = 'accepted' AND id <> p_interest_id
        ) INTO v_first_purchase_check;
        IF v_first_purchase_check THEN
            SELECT id INTO v_referrer_profile_id FROM public.contractor_profiles WHERE id = v_contractor.referred_by;
            IF v_referrer_profile_id IS NOT NULL THEN
                UPDATE public.contractor_profiles SET credit_balance = credit_balance + 5000 WHERE id = v_referrer_profile_id;
                INSERT INTO public.credit_transactions (contractor_id, amount, transaction_type, description)
                VALUES (v_referrer_profile_id, 5000, 'referral_bonus'::transaction_type, 'Szakember hozzád kapcsolódó első sikeres munkája bónusz');
                UPDATE public.contractor_profiles SET referral_reward_paid = true WHERE id = v_contractor.id;
            END IF;
        END IF;
    END IF;

    RETURN json_build_object('success', true, 'interest_id', p_interest_id, 'contractor', json_build_object('name', v_contractor.display_name, 'phone', v_contractor.phone));
END;
$function$;

-- Fix 3: reject_job_interest checks created_by_user_id instead of customer_id
CREATE OR REPLACE FUNCTION public.reject_job_interest(p_interest_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_interest RECORD;
    v_job RECORD;
    v_contractor_profile_id UUID;
    v_lead_price INTEGER;
BEGIN
    SELECT ji.* INTO v_interest FROM public.job_interests ji WHERE ji.id = p_interest_id FOR UPDATE;
    IF v_interest IS NULL THEN RAISE EXCEPTION 'Nincs ilyen kérelem / Interest not found'; END IF;
    IF v_interest.status <> 'pending' THEN RAISE EXCEPTION 'A státusz már nem függő / Interest already processed'; END IF;

    SELECT j.* INTO v_job FROM public.jobs j WHERE j.id = v_interest.job_id FOR UPDATE;
    IF v_job IS NULL THEN RAISE EXCEPTION 'Job not found'; END IF;
    IF v_job.created_by_user_id <> auth.uid() THEN RAISE EXCEPTION 'Csak a munka feladója hajthatja végre ezt a műveletet'; END IF;

    v_lead_price := v_job.lead_price;
    v_contractor_profile_id := v_interest.contractor_id;

    UPDATE public.job_interests SET status = 'rejected', updated_at = now() WHERE id = p_interest_id;
    UPDATE public.jobs SET status = 'open' WHERE id = v_job.id;
    UPDATE public.contractor_profiles SET credit_balance = credit_balance + v_lead_price WHERE id = v_contractor_profile_id;

    INSERT INTO public.credit_transactions (contractor_id, amount, transaction_type, reference_id, description)
    VALUES (v_contractor_profile_id, v_lead_price, 'interest_refund'::transaction_type, v_job.id, 'Ügyfél visszautasította - zárolt összeg visszatérítve');

    RETURN json_build_object('success', true, 'message', 'Szaki elutasítva. Munkát ismét közzétettük.');
END;
$function$;
