-- supabase/migrations/010_escrow_interests.sql

ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;
ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_transaction_type_check
CHECK (transaction_type IN ('top_up', 'topup', 'lead_purchase', 'refund', 'welcome_bonus', 'referral_bonus', 'interest_escrow', 'interest_refund'));

-- 1. express_job_interest
CREATE OR REPLACE FUNCTION public.express_job_interest(p_job_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_contractor_profile_id UUID;
    v_job RECORD;
    v_lead_price INTEGER;
    v_credit_balance INTEGER;
    v_existing_interest_id UUID;
BEGIN
    -- 0. Resolve contractor
    SELECT id, credit_balance
    INTO v_contractor_profile_id, v_credit_balance
    FROM public.contractor_profiles
    WHERE user_id = auth.uid()
    FOR UPDATE;

    IF v_contractor_profile_id IS NULL THEN
        RAISE EXCEPTION 'Nincs profil / Contractor profile not found';
    END IF;

    -- 1. Fetch job
    SELECT j.id, j.status, j.lead_price
    INTO v_job
    FROM public.jobs j
    WHERE j.id = p_job_id
    FOR UPDATE;

    IF v_job IS NULL THEN
        RAISE EXCEPTION 'Munka nem található / Job not found';
    END IF;

    IF v_job.status <> 'open' THEN
        RAISE EXCEPTION 'Ez a munka már nem elérhető / Job no longer open';
    END IF;

    v_lead_price := v_job.lead_price;

    -- 2. Check sufficient credit balance
    IF v_credit_balance < v_lead_price THEN
        RAISE EXCEPTION 'Nincs elegendő kreditegyenleged az ajánlattételhez. Szükséges: % Ft, Elérhető: % Ft', v_lead_price, v_credit_balance;
    END IF;

    -- 3. Check for existing interest
    SELECT id INTO v_existing_interest_id
    FROM public.job_interests
    WHERE job_id = p_job_id AND contractor_id = v_contractor_profile_id;

    IF v_existing_interest_id IS NOT NULL THEN
        RAISE EXCEPTION 'Már jelezted az érdeklődésed ezen a munkán';
    END IF;

    -- 4. Deduct credit (Escrow)
    UPDATE public.contractor_profiles
    SET credit_balance = credit_balance - v_lead_price
    WHERE id = v_contractor_profile_id;

    -- 5. Record credit transaction
    INSERT INTO public.credit_transactions (
        contractor_id, amount, transaction_type, reference_id, description
    ) VALUES (
        v_contractor_profile_id,
        -v_lead_price,
        'interest_escrow',
        p_job_id,
        'Érdeklődés leadása - összeg zárolva'
    );

    -- 6. Create pending interest
    INSERT INTO public.job_interests (
        job_id, contractor_id, status
    ) VALUES (
        p_job_id, v_contractor_profile_id, 'pending'
    );

    -- 7. Hide job from map setting status to unassigned
    UPDATE public.jobs
    SET status = 'unassigned'
    WHERE id = p_job_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Érdeklődés sikeresen rögzítve, ' || v_lead_price || ' kredit zárolva.'
    );
END;
$function$;


-- 2. accept_job_interest
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
    -- 1. Fetch and lock the interest
    SELECT ji.*
    INTO v_interest
    FROM public.job_interests ji
    WHERE ji.id = p_interest_id
    FOR UPDATE;

    IF v_interest IS NULL THEN
        RAISE EXCEPTION 'Interest not found';
    END IF;

    IF v_interest.status <> 'pending' THEN
        RAISE EXCEPTION 'Interest already processed';
    END IF;

    -- 2. Verify caller owns the job
    SELECT j.*
    INTO v_job
    FROM public.jobs j
    WHERE j.id = v_interest.job_id
    FOR UPDATE;

    IF v_job IS NULL THEN
        RAISE EXCEPTION 'Job not found';
    END IF;

    IF v_job.customer_id <> auth.uid() THEN
        RAISE EXCEPTION 'You do not own this job';
    END IF;

    -- 3. Fetch contractor info
    SELECT cp.id, cp.display_name, cp.phone, cp.referred_by
    INTO v_contractor
    FROM public.contractor_profiles cp
    WHERE cp.id = v_interest.contractor_id;

    -- 4. Mark interest as accepted
    UPDATE public.job_interests
    SET status = 'accepted', updated_at = now()
    WHERE id = p_interest_id;

    -- Note: We don't deduct credit because it was already deducted in escrow.
    -- (Optionally we could update the transaction type to 'lead_purchase' but it's fine).

    -- 5. Update job status to assigned
    UPDATE public.jobs
    SET status = 'assigned'
    WHERE id = v_job.id;

    -- 6. Referral Bonus Logic
    IF v_contractor.referred_by IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.job_interests 
            WHERE contractor_id = v_contractor.id AND status = 'accepted' AND id <> p_interest_id
        ) INTO v_first_purchase_check;
        
        IF v_first_purchase_check THEN
            SELECT id INTO v_referrer_profile_id FROM public.contractor_profiles WHERE id = v_contractor.referred_by;
            IF v_referrer_profile_id IS NOT NULL THEN
                UPDATE public.contractor_profiles
                SET credit_balance = credit_balance + 5000
                WHERE id = v_referrer_profile_id;
                
                INSERT INTO public.credit_transactions (
                    contractor_id, amount, transaction_type, description
                ) VALUES (
                    v_referrer_profile_id, 5000, 'referral_bonus'::transaction_type, 'Szakember hozzád kapcsolódó első sikeres munkája bónusz'
                );

                UPDATE public.contractor_profiles
                SET referral_reward_paid = true
                WHERE id = v_contractor.id;
            END IF;
        END IF;
    END IF;

    -- 7. Return success
    RETURN json_build_object(
        'success', true,
        'interest_id', p_interest_id,
        'contractor', json_build_object(
            'name', v_contractor.display_name,
            'phone', v_contractor.phone
        )
    );
END;
$function$;

-- 3. reject_job_interest
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
    -- 1. Fetch interest
    SELECT ji.*
    INTO v_interest
    FROM public.job_interests ji
    WHERE ji.id = p_interest_id
    FOR UPDATE;

    IF v_interest IS NULL THEN
        RAISE EXCEPTION 'Nincs ilyen kérelem / Interest not found';
    END IF;

    IF v_interest.status <> 'pending' THEN
        RAISE EXCEPTION 'A státusz már nem függő / Interest already processed';
    END IF;

    -- 2. Verify caller
    SELECT j.*
    INTO v_job
    FROM public.jobs j
    WHERE j.id = v_interest.job_id
    FOR UPDATE;

    IF v_job IS NULL THEN
        RAISE EXCEPTION 'Job not found';
    END IF;

    IF v_job.customer_id <> auth.uid() THEN
        RAISE EXCEPTION 'Csak a munka feladója hajthatja végre ezt a műveletet';
    END IF;

    v_lead_price := v_job.lead_price;
    v_contractor_profile_id := v_interest.contractor_id;

    -- 3. Mark interest as rejected
    UPDATE public.job_interests
    SET status = 'rejected', updated_at = now()
    WHERE id = p_interest_id;

    -- 4. Mark job as open again
    UPDATE public.jobs
    SET status = 'open'
    WHERE id = v_job.id;

    -- 5. Refund the escrowed credit
    UPDATE public.contractor_profiles
    SET credit_balance = credit_balance + v_lead_price
    WHERE id = v_contractor_profile_id;

    -- 6. Record the refund
    INSERT INTO public.credit_transactions (
        contractor_id, amount, transaction_type, reference_id, description
    ) VALUES (
        v_contractor_profile_id,
        v_lead_price,
        'interest_refund'::transaction_type,
        v_job.id,
        'Ügyfél visszautasította - zárolt összeg visszatérítve'
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Szaki elutasítva. Munkát ismét közzétettük.'
    );
END;
$function$;
