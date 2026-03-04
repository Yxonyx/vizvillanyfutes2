import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import {
    notifyContractorAccepted,
    notifyCustomerAcceptanceConfirmed,
    getContractorEmail,
    getEmailByUserId,
} from '@/lib/services/leadNotificationService';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const { interest_id } = await request.json();
        if (!interest_id) {
            return NextResponse.json({ success: false, error: 'interest_id is required' }, { status: 400 });
        }

        // Call the RPC
        const { data, error } = await supabase.rpc('accept_job_interest', { p_interest_id: interest_id });
        if (error) {
            console.error('Error accepting interest:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        // Fire-and-forget: send email notifications
        (async () => {
            try {
                const admin = createAdminClient();

                // Get the interest details to find the job + contractor
                const { data: interest } = await admin
                    .from('job_interests')
                    .select('id, contractor_id, job_id')
                    .eq('id', interest_id)
                    .single();

                if (!interest) return;

                // Get job details
                const { data: job } = await admin
                    .from('jobs')
                    .select('title, created_by_user_id, customer_id')
                    .eq('id', interest.job_id)
                    .single();

                if (!job) return;

                // Get contractor info
                const contractor = await getContractorEmail(interest.contractor_id);

                // Get customer info
                const customerUserId = job.created_by_user_id;
                const customerEmail = customerUserId ? await getEmailByUserId(customerUserId) : null;

                // Get customer name
                const { data: customer } = await admin
                    .from('customers')
                    .select('full_name, phone')
                    .eq('id', job.customer_id)
                    .single();

                const customerName = customer?.full_name || 'Ügyfél';
                const customerPhone = customer?.phone || '';

                // Notify contractor: "You've been accepted!"
                if (contractor.email) {
                    await notifyContractorAccepted({
                        contractorEmail: contractor.email,
                        contractorName: contractor.name,
                        customerName,
                        customerPhone,
                        jobTitle: job.title,
                    });
                }

                // Notify customer: "Acceptance confirmed, here's the contractor's info"
                if (customerEmail && data?.contractor) {
                    await notifyCustomerAcceptanceConfirmed({
                        customerEmail,
                        customerName,
                        contractorName: data.contractor.name || contractor.name,
                        contractorPhone: data.contractor.phone || '',
                        jobTitle: job.title,
                    });
                }
            } catch (err) {
                console.error('Error sending accept notifications:', err);
            }
        })();

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
