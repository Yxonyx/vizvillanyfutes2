import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const assignmentId = params.id;
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);
        const adminClient = createAdminClient();

        const body = await request.json();
        const action = body.action; // 'accept' or 'reject'

        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Action must be "accept" or "reject"' },
                { status: 400 }
            );
        }

        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // 2. Fetch assignment and job details
        const { data: assignmentData, error: assignmentError } = await adminClient
            .from('job_assignments')
            .select(`
        id,
        status,
        job_id,
        contractor_id,
        job:jobs(id, customer_id, status)
      `)
            .eq('id', assignmentId)
            .single();

        if (assignmentError || !assignmentData || !assignmentData.job) {
            return NextResponse.json(
                { success: false, error: 'Assignment not found' },
                { status: 404 }
            );
        }

        const job = Array.isArray(assignmentData.job) ? assignmentData.job[0] : assignmentData.job;

        // 3. Verify this job is actually owned by the authenticated customer
        if (job.customer_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'You do not have permission to respond to this assignment' },
                { status: 403 }
            );
        }

        if (assignmentData.status !== 'pending') {
            return NextResponse.json(
                { success: false, error: `Assignment is currently ${assignmentData.status}, cannot ${action}.` },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        // 4. Handle ACCEPT logic
        if (action === 'accept') {
            // 4a. Update the accepted assignment
            const { error: acceptUpdateError } = await adminClient
                .from('job_assignments')
                .update({
                    status: 'accepted',
                    accepted_at: now,
                    updated_at: now
                })
                .eq('id', assignmentId);

            if (acceptUpdateError) throw acceptUpdateError;

            // 4b. Update the job status to assigned/scheduled
            const { error: jobUpdateError } = await adminClient
                .from('jobs')
                .update({
                    status: 'assigned',
                    updated_at: now
                })
                .eq('id', job.id);

            if (jobUpdateError) throw jobUpdateError;

            // 4c. Reject all OTHER pending assignments for this job
            await adminClient
                .from('job_assignments')
                .update({
                    status: 'rejected',
                    declined_at: now,
                    notes: 'Az ügyfél más szakembert választott',
                    updated_at: now
                })
                .eq('job_id', job.id)
                .eq('status', 'pending')
                .neq('id', assignmentId);

            // Future feature: Refund credits to rejected contractors here!
            // This is crucial for the business model: only the accepted contractor pays.
            // E.g. call RPC 'refund_contractor_credits'

            return NextResponse.json({
                success: true,
                message: 'Szakember sikeresen elfogadva!',
            });
        }

        // 5. Handle REJECT logic
        if (action === 'reject') {
            // 5a. Update the assignment
            const { error: rejectUpdateError } = await adminClient
                .from('job_assignments')
                .update({
                    status: 'rejected',
                    declined_at: now,
                    notes: 'Az ügyfél elutasította a jelentkezést',
                    updated_at: now
                })
                .eq('id', assignmentId);

            if (rejectUpdateError) throw rejectUpdateError;

            // 5b. (Optional) Refund the single rejected contractor's credits here

            // 5c. Check if there are any other pending assignments. If not, revert job back to 'open'
            const { data: remainingPending } = await adminClient
                .from('job_assignments')
                .select('id')
                .eq('job_id', job.id)
                .eq('status', 'pending');

            if (!remainingPending || remainingPending.length === 0) {
                await adminClient
                    .from('jobs')
                    .update({
                        status: 'open',
                        updated_at: now
                    })
                    .eq('id', job.id);
            }

            return NextResponse.json({
                success: true,
                message: 'Jelentkezés elutasítva!',
            });
        }

    } catch (error) {
        console.error('Error responding to assignment as customer:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
