import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { expressInterest } from '@/lib/services/contractorService';
import {
    notifyCustomerContractorApplied,
    notifyContractorInterestSubmitted,
    getEmailByUserId,
    getContractorEmail,
} from '@/lib/services/leadNotificationService';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        // Verify authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const jobId = params.id;
        if (!jobId) {
            return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
        }

        // Delegate to service layer (handles lead→job conversion + RPC)
        const result = await expressInterest(supabase, jobId);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        // Fire-and-forget: send email notifications
        (async () => {
            try {
                const admin = createAdminClient();

                // Get contractor profile
                const { data: contractorProfile } = await admin
                    .from('contractor_profiles')
                    .select('id, display_name, user_id')
                    .eq('user_id', user.id)
                    .single();

                if (!contractorProfile) return;

                // Get the job data (may be the original lead ID or converted job)
                // Try to find the job by lead_id first (in case it was a lead), then by ID
                let job: any = null;
                const { data: jobByLead } = await admin
                    .from('jobs')
                    .select('id, title, trade, created_by_user_id, customer_id, lead_price')
                    .eq('lead_id', jobId)
                    .single();

                if (jobByLead) {
                    job = jobByLead;
                } else {
                    const { data: jobById } = await admin
                        .from('jobs')
                        .select('id, title, trade, created_by_user_id, customer_id, lead_price')
                        .eq('id', jobId)
                        .single();
                    job = jobById;
                }

                if (!job) return;

                // 1) Notify the CONTRACTOR: "Interest submitted, escrow held"
                const contractorEmail = user.email;
                if (contractorEmail) {
                    await notifyContractorInterestSubmitted({
                        contractorEmail,
                        contractorName: contractorProfile.display_name,
                        jobTitle: job.title,
                        escrowAmount: job.lead_price || 2000,
                    });
                }

                // 2) Notify the CUSTOMER: "A contractor applied to your job!"
                if (job.created_by_user_id) {
                    const customerEmail = await getEmailByUserId(job.created_by_user_id);

                    // Get customer name
                    let customerName = 'Ügyfél';
                    if (job.customer_id) {
                        const { data: customer } = await admin
                            .from('customers')
                            .select('full_name')
                            .eq('id', job.customer_id)
                            .single();
                        if (customer) customerName = customer.full_name;
                    }

                    if (customerEmail) {
                        await notifyCustomerContractorApplied({
                            customerEmail,
                            customerName,
                            contractorName: contractorProfile.display_name,
                            jobTitle: job.title,
                        });
                    }
                }
            } catch (err) {
                console.error('Error sending interest notifications:', err);
            }
        })();

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Unhandled error expressing interest:', error);

        // Handle known service errors as 404/500
        const message = error instanceof Error ? error.message : 'Unknown error';
        const status = message.includes('nem található') || message.includes('not found') ? 404 : 500;

        return NextResponse.json({ success: false, error: message }, { status });
    }
}
