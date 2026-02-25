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

        // 2. Fetch Purchased/Unlocked Jobs (My Jobs)
        // The RLS policy on 'jobs' allows contractors to SELECT jobs they have purchased.
        // We will query lead_purchases and join jobs.
        const { data: leadPurchases, error: leadsError } = await supabase
            .from('lead_purchases')
            .select(`
        id,
        price_paid,
        purchased_at,
        job:jobs(
          id, title, description, trade, category, status, priority, 
          preferred_time_from, preferred_time_to, created_at, updated_at,
          started_at, completed_at, lead_price,
          customer:customers(full_name, phone),
          address:addresses(city, district, street, house_number)
        )
      `)
            .eq('contractor_id', profile.id)
            .order('purchased_at', { ascending: false });

        if (openError) console.error('Error fetching open jobs:', openError);
        if (leadsError) console.error('Error fetching purchased leads:', leadsError);

        // Group the purchased jobs
        const purchasedJobs = (leadPurchases || []).map(lp => Array.isArray(lp.job) ? lp.job[0] : lp.job).filter(Boolean) as any[];
        const activeJobs = purchasedJobs.filter(j => j !== null && j.status !== 'completed' && j.status !== 'cancelled_by_customer');
        const completedJobs = purchasedJobs.filter(j => j !== null && (j.status === 'completed' || j.status === 'cancelled_by_customer'));

        return NextResponse.json({
            success: true,
            data: {
                creditBalance: profile.credit_balance,
                openJobs: openJobs || [],
                activeJobs,
                completedJobs,
                statistics: {
                    available: (openJobs || []).length,
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
