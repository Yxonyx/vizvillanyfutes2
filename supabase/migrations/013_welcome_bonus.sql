-- Replace approve_contractor to include welcome bonus and referral bonus
CREATE OR REPLACE FUNCTION public.approve_contractor(
    p_contractor_id UUID,
    p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_referred_by UUID;
    v_has_welcome_bonus BOOLEAN;
BEGIN
    -- Check if user is admin or dispatcher
    IF NOT public.is_admin_or_dispatcher() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized'
        );
    END IF;
    
    -- Get user_id and referred_by from contractor profile
    SELECT user_id, referred_by INTO v_user_id, v_referred_by
    FROM public.contractor_profiles 
    WHERE id = p_contractor_id;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Contractor not found'
        );
    END IF;
    
    -- Check if they already got a welcome bonus
    SELECT EXISTS (
        SELECT 1 FROM public.credit_transactions 
        WHERE contractor_id = p_contractor_id 
        AND transaction_type = 'welcome_bonus'
    ) INTO v_has_welcome_bonus;

    -- Update contractor profile
    UPDATE public.contractor_profiles
    SET 
        status = 'approved',
        internal_notes = COALESCE(p_internal_notes, internal_notes),
        credit_balance = CASE WHEN NOT v_has_welcome_bonus THEN credit_balance + 10000 ELSE credit_balance END
    WHERE id = p_contractor_id;

    -- Update user_meta
    UPDATE public.user_meta
    SET status = 'active'
    WHERE user_id = v_user_id;

    -- Insert welcome bonus transaction if not exists
    IF NOT v_has_welcome_bonus THEN
        INSERT INTO public.credit_transactions (
            contractor_id, amount, transaction_type, description
        ) VALUES (
            p_contractor_id, 10000, 'welcome_bonus', 'Regisztrációs induló bónusz'
        );

        -- Give referral bonus if applicable
        IF v_referred_by IS NOT NULL THEN
            UPDATE public.contractor_profiles
            SET credit_balance = credit_balance + 5000
            WHERE id = v_referred_by;

            INSERT INTO public.credit_transactions (
                contractor_id, amount, transaction_type, reference_id, description
            ) VALUES (
                v_referred_by, 5000, 'referral_bonus', p_contractor_id, 'Ajánlási bónusz sikeres regisztrációért'
            );
        END IF;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'contractor_id', p_contractor_id,
        'bonus_awarded', NOT v_has_welcome_bonus
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Retroactively give welcome bonus to existing approved contractors who don't have it yet
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT id, referred_by FROM public.contractor_profiles 
        WHERE status = 'approved' 
        AND NOT EXISTS (
            SELECT 1 FROM public.credit_transactions 
            WHERE contractor_id = contractor_profiles.id AND transaction_type = 'welcome_bonus'
        )
    LOOP
        -- Add 10000 to balance
        UPDATE public.contractor_profiles
        SET credit_balance = credit_balance + 10000
        WHERE id = r.id;

        -- Record transaction
        INSERT INTO public.credit_transactions (
            contractor_id, amount, transaction_type, description
        ) VALUES (
            r.id, 10000, 'welcome_bonus', 'Regisztrációs induló bónusz (utólagos)'
        );

        -- Referral bonus
        IF r.referred_by IS NOT NULL THEN
            UPDATE public.contractor_profiles
            SET credit_balance = credit_balance + 5000
            WHERE id = r.referred_by;

            INSERT INTO public.credit_transactions (
                contractor_id, amount, transaction_type, reference_id, description
            ) VALUES (
                r.referred_by, 5000, 'referral_bonus', r.id, 'Ajánlási bónusz (utólagos)'
            );
        END IF;
    END LOOP;
END;
$$;
