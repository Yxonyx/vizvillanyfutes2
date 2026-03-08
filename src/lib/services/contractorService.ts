// =====================================================
// Contractor Service – Business logic for marketplace & interest
// Extracted from api/contractor/marketplace/route.ts
//              and api/contractor/jobs/[id]/interest/route.ts
// =====================================================

import { createAdminClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// -----------------------------------------------------
// Types
// -----------------------------------------------------
export interface MarketplaceData {
    creditBalance: number;
    openJobs: any[];
    activeJobs: any[];
    completedJobs: any[];
    statistics: {
        available: number;
        active: number;
        completed: number;
    };
}

// -----------------------------------------------------
// Marketplace: Fetch all data for contractor dashboard
// -----------------------------------------------------
export async function getMarketplaceData(
    supabase: SupabaseClient,
    userId: string
): Promise<MarketplaceData> {
    // Get Contractor Profile (for Credit Balance)
    const { data: profile, error: profileError } = await supabase
        .from('contractor_profiles')
        .select('id, credit_balance')
        .eq('user_id', userId)
        .single();

    if (profileError || !profile) {
        throw new Error('Contractor profile not found');
    }

    // 1. Fetch Open Jobs from secure view (for Map)
    const { data: openJobs, error: openError } = await supabase
        .from('open_jobs_map')
        .select('*')
        .order('created_at', { ascending: false });

    if (openError) console.error('Error fetching open jobs:', openError);

    // 1b. Also fetch customer-submitted leads from the leads table
    const { data: openLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

    if (leadsError) console.error('Error fetching leads:', leadsError);

    // Map leads to the same format as open jobs
    const mappedLeads = (openLeads || []).map((lead: any) => ({
        id: lead.id,
        title: lead.title,
        description: lead.description || '',
        trade: lead.type === 'egyeb' ? 'viz' : (lead.type || 'viz'),
        category: 'standard',
        status: 'open',
        priority: 'high',
        latitude: lead.lat,
        longitude: lead.lng,
        district_or_city: lead.district || null,
        created_at: lead.created_at,
        lead_price: 2000,
        source: 'lead',
        photo_urls: lead.photo_urls || null,
    }));

    // Merge: leads first, then traditional jobs
    const allOpenJobs = [...mappedLeads, ...(openJobs || [])];

    // 2. Fetch Job Interests (My Jobs based on Escrow model)
    const { data: leadInterests, error: interestsError } = await supabase
        .from('job_interests')
        .select(`
      id,
      status,
      created_at,
      job:jobs(
        id, title, description, trade, category, status, priority,
        preferred_time_from, preferred_time_to, created_at, updated_at,
        lead_price, latitude, longitude, district_or_city, photo_urls,
        customer:customers(full_name, phone, email),
        address:addresses(city, district, street, house_number)
      )
    `)
        .eq('contractor_id', profile.id)
        .order('created_at', { ascending: false });

    if (interestsError) console.error('Error fetching purchased leads:', interestsError);

    // Map and Group the interested jobs
    const purchasedJobs = (leadInterests || [])
        .map((i) => {
            const j = Array.isArray(i.job) ? i.job[0] : i.job;
            if (!j) return null;
            return {
                ...j,
                assignment: { id: i.id, status: i.status },
            };
        })
        .filter(Boolean) as any[];

    const activeJobs = purchasedJobs.filter(
        (j) =>
            (j.assignment.status === 'pending' || j.assignment.status === 'accepted') &&
            j.status !== 'completed' &&
            j.status !== 'cancelled_by_customer'
    );

    const completedJobs = purchasedJobs.filter(
        (j) =>
            j.status === 'completed' ||
            j.status === 'cancelled_by_customer' ||
            j.assignment.status === 'rejected' ||
            j.assignment.status === 'withdrawn'
    );

    return {
        creditBalance: profile.credit_balance,
        openJobs: allOpenJobs,
        activeJobs,
        completedJobs,
        statistics: {
            available: allOpenJobs.length,
            active: activeJobs.length,
            completed: completedJobs.length,
        },
    };
}

// -----------------------------------------------------
// Lead → Job Conversion
// Resolves a lead ID to a real jobs table ID,
// creating customer + address + job records as needed.
// -----------------------------------------------------
export async function resolveLeadToJobId(leadId: string): Promise<string> {
    const supabaseAdmin = createAdminClient();

    // Check if this lead was ALREADY converted to a job
    const { data: alreadyConvertedJob } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('lead_id', leadId)
        .single();

    if (alreadyConvertedJob) {
        return alreadyConvertedJob.id;
    }

    // Fetch the lead
    const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (leadError || !lead) {
        throw new Error('Munka nem található / Job not found');
    }

    const tradeMap: Record<string, string> = {
        viz: 'viz',
        villany: 'villany',
        futes: 'futes',
        egyeb: 'viz',
    };

    // Step 1: Resolve or create customer
    let customerId: string | null = null;

    if (lead.user_id) {
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('user_id', lead.user_id)
            .single();

        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            const { data: newCustomer, error: custErr } = await supabaseAdmin
                .from('customers')
                .insert({
                    full_name: lead.contact_name || 'Ügyfél',
                    phone: lead.contact_phone || `lead_${leadId}`,
                    email: lead.contact_email || null,
                    user_id: lead.user_id,
                    type: 'b2c',
                })
                .select('id')
                .single();
            if (custErr) console.error('Error creating customer:', custErr);
            customerId = newCustomer?.id || null;
        }
    }

    if (!customerId) {
        const { data: genericCustomer, error: gcErr } = await supabaseAdmin
            .from('customers')
            .insert({
                full_name: lead.contact_name || 'Ügyfél (lead)',
                phone: lead.contact_phone || `lead_${leadId}`,
                email: lead.contact_email || null,
                type: 'b2c',
            })
            .select('id')
            .single();
        if (gcErr) console.error('Error creating generic customer:', gcErr);
        customerId = genericCustomer?.id || null;
    }

    if (!customerId) {
        throw new Error('Failed to create customer record');
    }

    // Step 2: Create address record from lead's district info
    const districtStr = lead.district || '';
    const cityMatch = districtStr.match(/^([^,]+)/);
    const districtMatch = districtStr.match(/([IVXLCDM]+\.?\s*kerület[^,]*)/i);
    const streetMatch = districtStr.match(/,\s*(?:[^,]*kerület[^,]*,\s*)?(.+)$/i);

    const { data: newAddress, error: addrErr } = await supabaseAdmin
        .from('addresses')
        .insert({
            customer_id: customerId,
            city: cityMatch ? cityMatch[1].trim() : 'Budapest',
            district: districtMatch ? districtMatch[1].trim() : null,
            street: streetMatch ? streetMatch[1].trim() : '-',
            house_number: '-',
        })
        .select('id')
        .single();

    if (addrErr || !newAddress) {
        console.error('Error creating address:', addrErr);
        throw new Error('Failed to create address record');
    }

    // Step 3: Create the job row WITH lead_id tracking
    const { data: newJob, error: insertError } = await supabaseAdmin
        .from('jobs')
        .insert({
            customer_id: customerId,
            address_id: newAddress.id,
            title: lead.title,
            description: lead.description || '',
            trade: tradeMap[lead.type] || 'viz',
            category: 'standard',
            status: 'open',
            priority: 'high',
            latitude: lead.lat,
            longitude: lead.lng,
            district_or_city: lead.district || null,
            source: 'web_form',
            lead_price: 2000,
            created_by_user_id: lead.user_id || null,
            lead_id: lead.id,
            photo_urls: lead.photo_urls || null,
        })
        .select('id')
        .single();

    if (insertError || !newJob) {
        console.error('Error converting lead to job:', insertError);
        throw new Error('Failed to process lead');
    }

    // Step 4: Mark lead as converted
    await supabaseAdmin.from('leads').update({ status: 'converted' }).eq('id', leadId);

    return newJob.id;
}

// -----------------------------------------------------
// Express Interest: resolves lead if needed, then calls RPC
// -----------------------------------------------------
export async function expressInterest(
    supabase: SupabaseClient,
    jobId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    // Check if this ID is an actual job or a lead
    const supabaseAdmin = createAdminClient();
    const { data: existingJob } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .single();

    let resolvedJobId = jobId;

    if (!existingJob) {
        // It's a lead — convert first
        resolvedJobId = await resolveLeadToJobId(jobId);
    }

    // Call the RPC
    const { data, error } = await supabase.rpc('express_job_interest', {
        p_job_id: resolvedJobId,
    });

    if (error) {
        console.error('Error expressing interest:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
