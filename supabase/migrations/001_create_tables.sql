-- =====================================================
-- VizVillanyFutes Backend - Database Schema
-- Version: 1.0.1
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: user_meta
-- Stores role and status for authenticated users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'dispatcher', 'contractor')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'pending_approval', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_meta_user_id ON public.user_meta(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meta_role ON public.user_meta(role);

-- =====================================================
-- TABLE: contractor_profiles
-- Detailed profiles for contractors
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contractor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    type TEXT CHECK (type IN ('individual', 'company')) DEFAULT 'individual',
    legal_name TEXT,
    tax_number TEXT,
    company_registration TEXT,
    trades TEXT[] NOT NULL,
    service_areas TEXT[] NOT NULL,
    years_experience INTEGER,
    is_employee BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('pending_approval', 'approved', 'rejected')) DEFAULT 'pending_approval',
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_status ON public.contractor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_trades ON public.contractor_profiles USING GIN(trades);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_service_areas ON public.contractor_profiles USING GIN(service_areas);

-- =====================================================
-- TABLE: customers
-- Customer information (B2C and B2B)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('b2c', 'b2b')) DEFAULT 'b2c',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_type ON public.customers(type);

-- =====================================================
-- TABLE: addresses
-- Customer addresses
-- =====================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    postal_code TEXT,
    street TEXT NOT NULL,
    house_number TEXT NOT NULL,
    floor_door TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON public.addresses(customer_id);

-- =====================================================
-- TABLE: jobs
-- Job/work order records
-- =====================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE RESTRICT NOT NULL,
    source TEXT CHECK (source IN ('web_form', 'phone', 'email', 'b2b')) DEFAULT 'web_form',
    trade TEXT CHECK (trade IN ('viz', 'villany', 'futes', 'combined')) NOT NULL,
    category TEXT CHECK (category IN ('sos', 'standard', 'b2b_project')) DEFAULT 'standard',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'unassigned', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'new',
    priority TEXT CHECK (priority IN ('normal', 'high', 'critical')) DEFAULT 'normal',
    preferred_time_from TIMESTAMPTZ,
    preferred_time_to TIMESTAMPTZ,
    estimated_price_gross NUMERIC,
    final_price_gross NUMERIC,
    currency TEXT DEFAULT 'HUF',
    dispatcher_notes TEXT,
    created_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_address_id ON public.jobs(address_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_trade ON public.jobs(trade);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON public.jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- =====================================================
-- TABLE: job_assignments
-- Links jobs to contractors
-- =====================================================
CREATE TABLE IF NOT EXISTS public.job_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
    proposed_start_time TIMESTAMPTZ,
    confirmed_start_time TIMESTAMPTZ,
    notes TEXT,
    created_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_assignments_job_id ON public.job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_contractor_id ON public.job_assignments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status ON public.job_assignments(status);

-- Create unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_assignments_unique 
ON public.job_assignments(job_id, contractor_id) 
WHERE status NOT IN ('declined', 'cancelled');

-- =====================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_user_meta_updated_at ON public.user_meta;
CREATE TRIGGER update_user_meta_updated_at
    BEFORE UPDATE ON public.user_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contractor_profiles_updated_at ON public.contractor_profiles;
CREATE TRIGGER update_contractor_profiles_updated_at
    BEFORE UPDATE ON public.contractor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_assignments_updated_at ON public.job_assignments;
CREATE TRIGGER update_job_assignments_updated_at
    BEFORE UPDATE ON public.job_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE public.user_meta IS 'Stores user roles and status. Links to auth.users.';
COMMENT ON TABLE public.contractor_profiles IS 'Detailed profiles for contractor users.';
COMMENT ON TABLE public.customers IS 'Customer records for job requests.';
COMMENT ON TABLE public.addresses IS 'Customer addresses for job locations.';
COMMENT ON TABLE public.jobs IS 'Work orders/job requests.';
COMMENT ON TABLE public.job_assignments IS 'Links jobs to assigned contractors.';
