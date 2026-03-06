import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import {
    notifyCustomerRatingRequest,
    getEmailByUserId,
    getContractorEmail,
} from '@/lib/services/leadNotificationService';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const jobId = params.id;
        const body = await request.json();
        const { action } = body;

        if (!['cancel', 'complete'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        const adminClient = createAdminClient();
        const { data: job, error: jobError } = await adminClient
            .from('jobs')
            .select('id, status, created_by_user_id')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        // Verify ownership via auth user id
        if (job.created_by_user_id !== user.id) {
            return NextResponse.json({ success: false, error: 'Nincs jogosultságod.' }, { status: 403 });
        }

        if (action === 'cancel') {
            if (!['open', 'new', 'waiting'].includes(job.status)) {
                return NextResponse.json(
                    { success: false, error: 'Ezt a munkát már nem lehet törölni, mert egy szakember dolgozik rajta.' },
                    { status: 400 }
                );
            }
            const { error: updateError } = await adminClient
                .from('jobs')
                .update({ status: 'cancelled_by_customer' })
                .eq('id', jobId);
            if (updateError) return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
            return NextResponse.json({ success: true, message: 'Bejelentés sikeresen törölve' });
        }

        if (action === 'complete') {
            if (!['assigned', 'in_progress', 'scheduled'].includes(job.status)) {
                return NextResponse.json(
                    { success: false, error: 'Csak egy folyamatban lévő munkát lehet befejezettnek jelölni.' },
                    { status: 400 }
                );
            }
            const { error: updateError } = await adminClient
                .from('jobs')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', jobId);
            if (updateError) return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });

            // Fire-and-forget: send rating request email
            (async () => {
                try {
                    // Get job title
                    const { data: fullJob } = await adminClient
                        .from('jobs')
                        .select('title, created_by_user_id')
                        .eq('id', jobId)
                        .single();
                    if (!fullJob) return;

                    // Get customer info
                    const { data: customer } = await adminClient
                        .from('customers')
                        .select('full_name')
                        .eq('user_id', fullJob.created_by_user_id)
                        .single();

                    const customerEmail = await getEmailByUserId(fullJob.created_by_user_id);
                    if (!customerEmail) return;

                    // Find the contractor: first try accepted interest, then assignment
                    let contractorName = 'Szakember';
                    const { data: acceptedInterest } = await adminClient
                        .from('job_interests')
                        .select('contractor_id, contractor_profiles(display_name)')
                        .eq('job_id', jobId)
                        .eq('status', 'accepted')
                        .single();

                    if (acceptedInterest) {
                        contractorName = (acceptedInterest.contractor_profiles as any)?.display_name || 'Szakember';
                    } else {
                        const { data: assignment } = await adminClient
                            .from('job_assignments')
                            .select('contractor_profiles(display_name)')
                            .eq('job_id', jobId)
                            .eq('status', 'accepted')
                            .single();
                        if (assignment) {
                            contractorName = (assignment.contractor_profiles as any)?.display_name || 'Szakember';
                        }
                    }

                    await notifyCustomerRatingRequest({
                        customerEmail,
                        customerName: customer?.full_name || 'Ügyfél',
                        contractorName,
                        jobTitle: fullJob.title,
                        jobId,
                    });
                } catch (err) {
                    console.error('Error sending rating request email:', err);
                }
            })();

            return NextResponse.json({ success: true, message: 'Munka sikeresen befejezve!' });
        }

    } catch (error) {
        console.error('Error in customer job action:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a waiting lead or cancel a job
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const itemId = params.id;
        const adminClient = createAdminClient();

        // First try to find it as a lead
        const { data: lead } = await adminClient
            .from('leads')
            .select('id, contact_email, user_id, status')
            .eq('id', itemId)
            .single();

        if (lead) {
            // Verify ownership via user_id (primary) or contact_email (fallback)
            const isOwner = lead.user_id === user.id || lead.contact_email === user.email;
            if (!isOwner) {
                return NextResponse.json({ success: false, error: 'Nincs jogosultságod törölni ezt a bejelentést.' }, { status: 403 });
            }

            const { error: deleteError } = await adminClient
                .from('leads')
                .delete()
                .eq('id', itemId);

            if (deleteError) {
                console.error('Error deleting lead:', deleteError);
                return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, message: 'Bejelentés sikeresen törölve.' });
        }

        // Not a lead — try as a job
        console.log(`[DELETE] Lead not found for ID ${itemId}, trying jobs table...`);
        const { data: job, error: jobError } = await adminClient
            .from('jobs')
            .select('id, status, customer_id')
            .eq('id', itemId)
            .single();

        if (jobError || !job) {
            console.log(`[DELETE] Job not found for ID ${itemId}. Error:`, jobError?.message);
            return NextResponse.json({ success: false, error: 'Nem található bejelentés.' }, { status: 404 });
        }

        // Verify ownership
        if (job.customer_id !== user.id) {
            console.log(`[DELETE] Ownership mismatch: job.customer_id=${job.customer_id} user.id=${user.id}`);
            return NextResponse.json({ success: false, error: 'Nincs jogosultságod törölni ezt a bejelentést.' }, { status: 403 });
        }

        if (!['open', 'new', 'unassigned', 'waiting'].includes(job.status)) {
            return NextResponse.json(
                { success: false, error: 'Ezt a bejelentést már nem lehet törölni.' },
                { status: 400 }
            );
        }

        const { error: updateError } = await adminClient
            .from('jobs')
            .update({ status: 'cancelled_by_customer' })
            .eq('id', itemId);

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Bejelentés sikeresen törölve.' });

    } catch (error) {
        console.error('Error deleting customer item:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
