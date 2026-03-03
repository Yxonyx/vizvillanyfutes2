import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        // Get Contractor Profile (for Credit Balance)
        const { data: profile, error: profileError } = await supabase
            .from('contractor_profiles')
            .select('id, credit_balance')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ success: false, error: 'Contractor profile not found' }, { status: 401 });
        }

        // 1. Fetch Open Jobs from secure view (for Map)
        const { data: openJobs, error: openError } = await supabase
            .from('open_jobs_map')
            .select('*')
            .order('created_at', { ascending: false });

        // 1b. Also fetch customer-submitted leads from the leads table
        const { data: openLeads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .eq('status', 'waiting')
            .order('created_at', { ascending: false });

        if (leadsError) console.error('Error fetching leads:', leadsError);

        // Map leads to the same format as open jobs so the dashboard can render them
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
        }));

        // Merge: leads first (newest customer submissions), then traditional jobs
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
          lead_price,
          customer:customers(full_name, phone, email),
          address:addresses(city, district, street, house_number)
        )
      `)
            .eq('contractor_id', profile.id)
            .order('created_at', { ascending: false });

        if (openError) console.error('Error fetching open jobs:', openError);
        if (interestsError) console.error('Error fetching purchased leads:', interestsError);

        // Map and Group the interested jobs
        const myInterests = leadInterests || [];

        // Attach the interest status context to each job so the frontend knows if it's pending, accepted, rejected
        const purchasedJobs = myInterests.map(i => {
            const j = Array.isArray(i.job) ? i.job[0] : i.job;
            if (!j) return null;
            return {
                ...j,
                assignment: {
                    id: i.id,
                    status: i.status
                }
            };
        }).filter(Boolean) as any[];

        const activeJobs = purchasedJobs.filter(j => j !== null && (j.assignment.status === 'pending' || j.assignment.status === 'accepted') && j.status !== 'completed' && j.status !== 'cancelled_by_customer');
        const completedJobs = purchasedJobs.filter(j => j !== null && (j.status === 'completed' || j.status === 'cancelled_by_customer' || j.assignment.status === 'rejected' || j.assignment.status === 'withdrawn'));

        console.log("DEBUG: purchasedJobs length =", purchasedJobs.length, ", activeJobs length = ", activeJobs.length);

        return NextResponse.json({
            success: true,
            data: {
                creditBalance: profile.credit_balance,
                openJobs: allOpenJobs,
                activeJobs,
                completedJobs,
                statistics: {
                    available: allOpenJobs.length,
                    active: activeJobs.length,
                    completed: completedJobs.length
                }
            }
        });

    } catch (error) {
        console.error('Error getting marketplace data:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
