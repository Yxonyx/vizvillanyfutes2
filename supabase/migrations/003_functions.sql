-- =====================================================
-- VizVillanyFutes Backend - Database Functions
-- Version: 1.0.1
-- =====================================================

-- =====================================================
-- FUNCTION: Create job from public form
-- Handles customer upsert, address insert, job insert
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
    p_job_estimated_price_gross NUMERIC DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_customer_id UUID;
    v_address_id UUID;
    v_job_id UUID;
BEGIN
    -- Upsert customer by phone (primary identifier)
    INSERT INTO public.customers (full_name, phone, email, type, company_name)
    VALUES (p_customer_full_name, p_customer_phone, p_customer_email, p_customer_type, p_customer_company_name)
    ON CONFLICT (phone) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, customers.email),
        company_name = COALESCE(EXCLUDED.company_name, customers.company_name),
        updated_at = now()
    RETURNING id INTO v_customer_id;
    
    -- If no conflict happened, we need to handle the case where phone is not unique
    -- Let's try to find existing customer first
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
    
    -- Insert job
    INSERT INTO public.jobs (
        customer_id, address_id, source, trade, category,
        title, description, status, priority,
        preferred_time_from, preferred_time_to, estimated_price_gross
    )
    VALUES (
        v_customer_id, v_address_id, 'web_form', p_job_trade, p_job_category,
        COALESCE(p_job_title, 'Új munka - ' || p_job_trade),
        COALESCE(p_job_description, ''),
        'new', p_job_priority,
        p_job_preferred_time_from, p_job_preferred_time_to, p_job_estimated_price_gross
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
-- FUNCTION: Register contractor
-- Creates auth user meta and contractor profile
-- =====================================================
CREATE OR REPLACE FUNCTION public.register_contractor(
    p_user_id UUID,
    p_display_name TEXT,
    p_phone TEXT,
    p_type TEXT DEFAULT 'individual',
    p_legal_name TEXT DEFAULT NULL,
    p_tax_number TEXT DEFAULT NULL,
    p_company_registration TEXT DEFAULT NULL,
    p_trades TEXT[] DEFAULT ARRAY['viz'],
    p_service_areas TEXT[] DEFAULT ARRAY['Budapest'],
    p_years_experience INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_meta_id UUID;
    v_contractor_profile_id UUID;
BEGIN
    -- Insert user_meta
    INSERT INTO public.user_meta (user_id, role, status)
    VALUES (p_user_id, 'contractor', 'pending_approval')
    RETURNING id INTO v_user_meta_id;
    
    -- Insert contractor profile
    INSERT INTO public.contractor_profiles (
        user_id, display_name, phone, type,
        legal_name, tax_number, company_registration,
        trades, service_areas, years_experience, status
    )
    VALUES (
        p_user_id, p_display_name, p_phone, p_type,
        p_legal_name, p_tax_number, p_company_registration,
        p_trades, p_service_areas, p_years_experience, 'pending_approval'
    )
    RETURNING id INTO v_contractor_profile_id;
    
    RETURN json_build_object(
        'success', true,
        'user_meta_id', v_user_meta_id,
        'contractor_profile_id', v_contractor_profile_id
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
-- FUNCTION: Assign job to contractor
-- Creates job assignment and updates job status
-- =====================================================
CREATE OR REPLACE FUNCTION public.assign_job_to_contractor(
    p_job_id UUID,
    p_contractor_id UUID,
    p_proposed_start_time TIMESTAMPTZ DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_assignment_id UUID;
    v_job_status TEXT;
BEGIN
    -- Check if user is admin or dispatcher
    IF NOT public.is_admin_or_dispatcher() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Only admin or dispatcher can assign jobs'
        );
    END IF;
    
    -- Check job exists
    SELECT status INTO v_job_status FROM public.jobs WHERE id = p_job_id;
    IF v_job_status IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Job not found'
        );
    END IF;
    
    -- Check contractor exists and is approved
    IF NOT EXISTS (
        SELECT 1 FROM public.contractor_profiles 
        WHERE id = p_contractor_id AND status = 'approved'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Contractor not found or not approved'
        );
    END IF;
    
    -- Insert assignment
    INSERT INTO public.job_assignments (
        job_id, contractor_id, status, 
        proposed_start_time, notes, created_by_user_id
    )
    VALUES (
        p_job_id, p_contractor_id, 'pending',
        p_proposed_start_time, p_notes, auth.uid()
    )
    RETURNING id INTO v_assignment_id;
    
    -- Update job status to assigned
    UPDATE public.jobs 
    SET status = 'assigned' 
    WHERE id = p_job_id;
    
    RETURN json_build_object(
        'success', true,
        'assignment_id', v_assignment_id
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Job is already assigned to this contractor'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Contractor accept/decline assignment
-- =====================================================
CREATE OR REPLACE FUNCTION public.contractor_respond_to_assignment(
    p_assignment_id UUID,
    p_action TEXT, -- 'accept' or 'decline'
    p_confirmed_start_time TIMESTAMPTZ DEFAULT NULL,
    p_comment TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_assignment RECORD;
    v_contractor_profile_id UUID;
BEGIN
    -- Get contractor profile ID
    v_contractor_profile_id := public.get_contractor_profile_id();
    
    IF v_contractor_profile_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Contractor profile not found'
        );
    END IF;
    
    -- Get assignment and verify ownership
    SELECT ja.*, j.id as job_id
    INTO v_assignment
    FROM public.job_assignments ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE ja.id = p_assignment_id
    AND ja.contractor_id = v_contractor_profile_id
    AND ja.status = 'pending';
    
    IF v_assignment IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Assignment not found or not pending'
        );
    END IF;
    
    IF p_action = 'accept' THEN
        -- Accept assignment
        UPDATE public.job_assignments
        SET 
            status = 'accepted',
            confirmed_start_time = COALESCE(p_confirmed_start_time, proposed_start_time),
            notes = CASE WHEN p_comment IS NOT NULL 
                        THEN COALESCE(notes || E'\n', '') || 'Contractor: ' || p_comment 
                        ELSE notes END
        WHERE id = p_assignment_id;
        
        -- Update job status to scheduled
        UPDATE public.jobs
        SET status = 'scheduled'
        WHERE id = v_assignment.job_id;
        
    ELSIF p_action = 'decline' THEN
        -- Decline assignment
        UPDATE public.job_assignments
        SET 
            status = 'declined',
            notes = CASE WHEN p_comment IS NOT NULL 
                        THEN COALESCE(notes || E'\n', '') || 'Decline reason: ' || p_comment 
                        ELSE notes END
        WHERE id = p_assignment_id;
        
        -- Update job status back to unassigned
        UPDATE public.jobs
        SET status = 'unassigned'
        WHERE id = v_assignment.job_id;
    ELSE
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid action. Use accept or decline'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'action', p_action,
        'assignment_id', p_assignment_id
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
-- FUNCTION: Contractor update job status
-- =====================================================
CREATE OR REPLACE FUNCTION public.contractor_update_job_status(
    p_job_id UUID,
    p_new_status TEXT, -- 'in_progress' or 'completed'
    p_final_price_gross NUMERIC DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_contractor_profile_id UUID;
    v_current_status TEXT;
BEGIN
    -- Get contractor profile ID
    v_contractor_profile_id := public.get_contractor_profile_id();
    
    IF v_contractor_profile_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Contractor profile not found'
        );
    END IF;
    
    -- Verify contractor has accepted assignment for this job
    IF NOT EXISTS (
        SELECT 1 FROM public.job_assignments
        WHERE job_id = p_job_id
        AND contractor_id = v_contractor_profile_id
        AND status = 'accepted'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No accepted assignment found for this job'
        );
    END IF;
    
    -- Get current job status
    SELECT status INTO v_current_status FROM public.jobs WHERE id = p_job_id;
    
    -- Validate status transition
    IF p_new_status NOT IN ('in_progress', 'completed') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid status. Use in_progress or completed'
        );
    END IF;
    
    -- Validate status flow
    IF p_new_status = 'in_progress' AND v_current_status NOT IN ('scheduled', 'assigned') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Can only start job from scheduled or assigned status'
        );
    END IF;
    
    IF p_new_status = 'completed' AND v_current_status NOT IN ('in_progress', 'scheduled') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Can only complete job from in_progress or scheduled status'
        );
    END IF;
    
    -- Update job
    UPDATE public.jobs
    SET 
        status = p_new_status,
        final_price_gross = COALESCE(p_final_price_gross, final_price_gross),
        dispatcher_notes = CASE WHEN p_note IS NOT NULL 
                              THEN COALESCE(dispatcher_notes || E'\n', '') || 'Contractor note: ' || p_note 
                              ELSE dispatcher_notes END
    WHERE id = p_job_id;
    
    RETURN json_build_object(
        'success', true,
        'job_id', p_job_id,
        'new_status', p_new_status
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
-- FUNCTION: Approve contractor
-- =====================================================
CREATE OR REPLACE FUNCTION public.approve_contractor(
    p_contractor_id UUID,
    p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user is admin or dispatcher
    IF NOT public.is_admin_or_dispatcher() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized'
        );
    END IF;
    
    -- Get user_id from contractor profile
    SELECT user_id INTO v_user_id 
    FROM public.contractor_profiles 
    WHERE id = p_contractor_id;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Contractor not found'
        );
    END IF;
    
    -- Update contractor profile
    UPDATE public.contractor_profiles
    SET 
        status = 'approved',
        internal_notes = COALESCE(p_internal_notes, internal_notes)
    WHERE id = p_contractor_id;
    
    -- Update user_meta
    UPDATE public.user_meta
    SET status = 'active'
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
        'success', true,
        'contractor_id', p_contractor_id
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
-- FUNCTION: Reject contractor
-- =====================================================
CREATE OR REPLACE FUNCTION public.reject_contractor(
    p_contractor_id UUID,
    p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user is admin or dispatcher
    IF NOT public.is_admin_or_dispatcher() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized'
        );
    END IF;
    
    -- Get user_id from contractor profile
    SELECT user_id INTO v_user_id 
    FROM public.contractor_profiles 
    WHERE id = p_contractor_id;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Contractor not found'
        );
    END IF;
    
    -- Update contractor profile
    UPDATE public.contractor_profiles
    SET 
        status = 'rejected',
        internal_notes = COALESCE(p_internal_notes, internal_notes)
    WHERE id = p_contractor_id;
    
    -- Update user_meta
    UPDATE public.user_meta
    SET status = 'suspended'
    WHERE user_id = v_user_id;
    
    RETURN json_build_object(
        'success', true,
        'contractor_id', p_contractor_id
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
-- Grant execute permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.create_job_from_form TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_contractor TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_job_to_contractor TO authenticated;
GRANT EXECUTE ON FUNCTION public.contractor_respond_to_assignment TO authenticated;
GRANT EXECUTE ON FUNCTION public.contractor_update_job_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_contractor TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_contractor TO authenticated;
