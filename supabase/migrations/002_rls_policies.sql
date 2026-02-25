-- =====================================================
-- VizVillanyFutes Backend - Row Level Security Policies
-- Version: 1.0.1
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if current user is admin or dispatcher
CREATE OR REPLACE FUNCTION public.is_admin_or_dispatcher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_meta 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'dispatcher')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_meta 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a contractor
CREATE OR REPLACE FUNCTION public.is_contractor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_meta 
        WHERE user_id = auth.uid() 
        AND role = 'contractor'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contractor profile ID for current user
CREATE OR REPLACE FUNCTION public.get_contractor_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.contractor_profiles 
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS: user_meta
-- =====================================================
ALTER TABLE public.user_meta ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "user_meta_admin_dispatcher_all" ON public.user_meta;
CREATE POLICY "user_meta_admin_dispatcher_all"
ON public.user_meta FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Contractors: read own row only
DROP POLICY IF EXISTS "user_meta_contractor_select_own" ON public.user_meta;
CREATE POLICY "user_meta_contractor_select_own"
ON public.user_meta FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- RLS: contractor_profiles
-- =====================================================
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "contractor_profiles_admin_dispatcher_all" ON public.contractor_profiles;
CREATE POLICY "contractor_profiles_admin_dispatcher_all"
ON public.contractor_profiles FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Contractors: read own profile
DROP POLICY IF EXISTS "contractor_profiles_contractor_select_own" ON public.contractor_profiles;
CREATE POLICY "contractor_profiles_contractor_select_own"
ON public.contractor_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Contractors: update own profile (except status and internal_notes)
DROP POLICY IF EXISTS "contractor_profiles_contractor_update_own" ON public.contractor_profiles;
CREATE POLICY "contractor_profiles_contractor_update_own"
ON public.contractor_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- RLS: customers
-- =====================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "customers_admin_dispatcher_all" ON public.customers;
CREATE POLICY "customers_admin_dispatcher_all"
ON public.customers FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Allow anonymous insert for public job submission
DROP POLICY IF EXISTS "customers_anon_insert" ON public.customers;
CREATE POLICY "customers_anon_insert"
ON public.customers FOR INSERT
TO anon
WITH CHECK (true);

-- Contractors: read customers for their assigned jobs
DROP POLICY IF EXISTS "customers_contractor_select_assigned" ON public.customers;
CREATE POLICY "customers_contractor_select_assigned"
ON public.customers FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND
    id IN (
        SELECT j.customer_id 
        FROM public.jobs j
        JOIN public.job_assignments ja ON ja.job_id = j.id
        WHERE ja.contractor_id = public.get_contractor_profile_id()
        AND ja.status IN ('pending', 'accepted')
    )
);

-- =====================================================
-- RLS: addresses
-- =====================================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "addresses_admin_dispatcher_all" ON public.addresses;
CREATE POLICY "addresses_admin_dispatcher_all"
ON public.addresses FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Allow anonymous insert for public job submission
DROP POLICY IF EXISTS "addresses_anon_insert" ON public.addresses;
CREATE POLICY "addresses_anon_insert"
ON public.addresses FOR INSERT
TO anon
WITH CHECK (true);

-- Contractors: read addresses for their assigned jobs
DROP POLICY IF EXISTS "addresses_contractor_select_assigned" ON public.addresses;
CREATE POLICY "addresses_contractor_select_assigned"
ON public.addresses FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND
    id IN (
        SELECT j.address_id 
        FROM public.jobs j
        JOIN public.job_assignments ja ON ja.job_id = j.id
        WHERE ja.contractor_id = public.get_contractor_profile_id()
        AND ja.status IN ('pending', 'accepted')
    )
);

-- =====================================================
-- RLS: jobs
-- =====================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "jobs_admin_dispatcher_all" ON public.jobs;
CREATE POLICY "jobs_admin_dispatcher_all"
ON public.jobs FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Allow anonymous insert for public job submission
DROP POLICY IF EXISTS "jobs_anon_insert" ON public.jobs;
CREATE POLICY "jobs_anon_insert"
ON public.jobs FOR INSERT
TO anon
WITH CHECK (true);

-- Contractors: select jobs they are assigned to
DROP POLICY IF EXISTS "contractors_select_assigned_jobs" ON public.jobs;
CREATE POLICY "contractors_select_assigned_jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (
    public.is_contractor() AND
    EXISTS (
        SELECT 1 FROM public.job_assignments ja
        WHERE ja.job_id = id
        AND ja.contractor_id = public.get_contractor_profile_id()
        AND ja.status IN ('pending', 'accepted', 'declined', 'cancelled')
    )
);

-- Contractors: update jobs they have accepted
DROP POLICY IF EXISTS "contractors_update_accepted_jobs" ON public.jobs;
CREATE POLICY "contractors_update_accepted_jobs"
ON public.jobs FOR UPDATE
TO authenticated
USING (
    public.is_contractor() AND
    EXISTS (
        SELECT 1 FROM public.job_assignments ja
        WHERE ja.job_id = id
        AND ja.contractor_id = public.get_contractor_profile_id()
        AND ja.status = 'accepted'
    )
)
WITH CHECK (
    public.is_contractor() AND
    -- Only allow certain status transitions
    status IN ('in_progress', 'completed')
);

-- =====================================================
-- RLS: job_assignments
-- =====================================================
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

-- Admin/Dispatcher: full access
DROP POLICY IF EXISTS "job_assignments_admin_dispatcher_all" ON public.job_assignments;
CREATE POLICY "job_assignments_admin_dispatcher_all"
ON public.job_assignments FOR ALL
TO authenticated
USING (public.is_admin_or_dispatcher())
WITH CHECK (public.is_admin_or_dispatcher());

-- Contractors: select their own assignments
DROP POLICY IF EXISTS "job_assignments_contractor_select_own" ON public.job_assignments;
CREATE POLICY "job_assignments_contractor_select_own"
ON public.job_assignments FOR SELECT
TO authenticated
USING (contractor_id = public.get_contractor_profile_id());

-- Contractors: update their own assignments (status and confirmed_start_time only)
DROP POLICY IF EXISTS "job_assignments_contractor_update_own" ON public.job_assignments;
CREATE POLICY "job_assignments_contractor_update_own"
ON public.job_assignments FOR UPDATE
TO authenticated
USING (contractor_id = public.get_contractor_profile_id())
WITH CHECK (contractor_id = public.get_contractor_profile_id());

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON public.customers, public.addresses, public.jobs TO anon;
GRANT SELECT ON public.customers, public.addresses, public.jobs TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_admin_or_dispatcher() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_contractor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_contractor_profile_id() TO authenticated;
