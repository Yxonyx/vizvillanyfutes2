-- =====================================================
-- VizVillanyFutes Backend - Seed Data
-- Version: 1.0.1
-- 
-- NOTE: Run this AFTER creating test users in Supabase Auth UI
-- Replace the UUIDs below with actual user IDs from auth.users
-- =====================================================

-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> Authentication -> Users
-- 2. Create users with your chosen emails and STRONG passwords:
--    - admin@yourdomain.hu (role: admin)
--    - dispatcher@yourdomain.hu (role: dispatcher)
--    - contractor@yourdomain.hu (role: contractor)
-- 3. Copy the User UID for each created user
-- 4. Replace the placeholder UUIDs below with actual UIDs
-- 5. Run this script in SQL Editor
--
-- ⚠️ SECURITY: Never use weak or example passwords in production!
-- =====================================================

-- Placeholder function to be called after users are created
-- This creates the user_meta and contractor_profiles for test accounts

-- Example: After creating users, run something like:
/*
-- For Admin user (replace with actual UID)
INSERT INTO public.user_meta (user_id, role, status)
VALUES ('ADMIN_USER_UUID_HERE', 'admin', 'active');

-- For Dispatcher user (replace with actual UID)
INSERT INTO public.user_meta (user_id, role, status)
VALUES ('DISPATCHER_USER_UUID_HERE', 'dispatcher', 'active');

-- For Contractor user (replace with actual UID)
INSERT INTO public.user_meta (user_id, role, status)
VALUES ('CONTRACTOR_USER_UUID_HERE', 'contractor', 'active');

INSERT INTO public.contractor_profiles (
    user_id, 
    display_name, 
    phone, 
    type, 
    trades, 
    service_areas, 
    years_experience, 
    status
)
VALUES (
    'CONTRACTOR_USER_UUID_HERE',
    'Teszt Vízszerelő',
    '+36 30 000 0000',
    'individual',
    ARRAY['viz'],
    ARRAY['XI', 'XII'],
    5,
    'approved'
);
*/

-- =====================================================
-- Sample test data for development
-- This creates dummy customers and jobs for testing
-- =====================================================

-- Create test customers
INSERT INTO public.customers (id, type, full_name, phone, email, company_name)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'b2c', 'Teszt János', '+36 30 111 1111', 'teszt.janos@example.com', NULL),
    ('22222222-2222-2222-2222-222222222222', 'b2c', 'Minta Éva', '+36 30 222 2222', 'minta.eva@example.com', NULL),
    ('33333333-3333-3333-3333-333333333333', 'b2b', 'Kovács Péter', '+36 30 333 3333', 'kovacs@cegem.hu', 'Kovács Kft.')
ON CONFLICT DO NOTHING;

-- Create test addresses
INSERT INTO public.addresses (id, customer_id, city, district, postal_code, street, house_number, floor_door, notes)
VALUES 
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Budapest', 'XI', '1111', 'Bartók Béla út', '10', '2/5', 'Kapucsengő: 25'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Budapest', 'XII', '1121', 'Alkotás utca', '25', NULL, NULL),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Budapest', 'XIII', '1138', 'Váci út', '100', '5. emelet', 'Irodaház, recepciónál bejelentkezni')
ON CONFLICT DO NOTHING;

-- Create test jobs
INSERT INTO public.jobs (
    id, customer_id, address_id, source, trade, category, 
    title, description, status, priority,
    preferred_time_from, preferred_time_to
)
VALUES 
    (
        'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'web_form',
        'viz',
        'standard',
        'Csaptelep csere',
        'A konyhában lévő csaptelep csöpög, szeretném lecseréltetni egy modernre.',
        'new',
        'normal',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '3 days'
    ),
    (
        'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'web_form',
        'villany',
        'sos',
        'Áramkimaradás',
        'A lakás fele áram nélkül maradt, sürgős segítség kell!',
        'new',
        'critical',
        NULL,
        NULL
    ),
    (
        'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'b2b',
        'futes',
        'b2b_project',
        'Irodai fűtéskorszerűsítés',
        'Teljes irodai fűtésrendszer korszerűsítése, hőszivattyús megoldásra.',
        'new',
        'normal',
        NOW() + INTERVAL '1 week',
        NOW() + INTERVAL '2 weeks'
    )
ON CONFLICT DO NOTHING;

-- Add unique constraint on phone for customer upsert
-- (if not already exists from migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_phone_key'
    ) THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);
    END IF;
END $$;
