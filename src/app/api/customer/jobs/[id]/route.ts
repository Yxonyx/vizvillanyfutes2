import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const jobId = params.id;
        const body = await request.json();
        const { action } = body; // 'cancel'

        if (action !== 'cancel') {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        // Verify this job belongs to the current customer
        // RLS will ensure they can only see their own jobs (via customer.user_id)
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('id, status, customer_id')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ success: false, error: 'Job not found or access denied' }, { status: 404 });
        }

        // Only allow cancelling jobs that are still open (not yet unlocked by a contractor)
        if (job.status !== 'open' && job.status !== 'new') {
            return NextResponse.json(
                { success: false, error: 'Csak az "open" vagy "new" státuszú munkákat lehet törölni. Ha már egy szakember elfogadta, kérjük vegye fel velünk a kapcsolatot.' },
                { status: 400 }
            );
        }

        // Cancel the job
        const { error: updateError } = await supabase
            .from('jobs')
            .update({ status: 'cancelled_by_customer' })
            .eq('id', jobId);

        if (updateError) {
            console.error('Error cancelling job:', updateError);
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Bejelentés sikeresen törölve',
        });

    } catch (error) {
        console.error('Error in customer job action:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
