import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import {
    notifyContractorRejected,
    getContractorEmail,
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

        // Get interest + job details BEFORE the RPC (so we have the lead_price for refund amount)
        const admin = createAdminClient();
        const { data: interest } = await admin
            .from('job_interests')
            .select('id, contractor_id, job_id')
            .eq('id', interest_id)
            .single();

        let jobTitle = 'Munka';
        let leadPrice = 2000;
        let contractorProfileId: string | null = null;

        if (interest) {
            contractorProfileId = interest.contractor_id;
            const { data: job } = await admin
                .from('jobs')
                .select('title, lead_price')
                .eq('id', interest.job_id)
                .single();
            if (job) {
                jobTitle = job.title;
                leadPrice = job.lead_price || 2000;
            }
        }

        // Call the RPC
        const { data, error } = await supabase.rpc('reject_job_interest', { p_interest_id: interest_id });
        if (error) {
            console.error('Error rejecting interest:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        // Fire-and-forget: notify contractor about rejection + refund
        if (contractorProfileId) {
            (async () => {
                try {
                    const contractor = await getContractorEmail(contractorProfileId!);
                    if (contractor.email) {
                        await notifyContractorRejected({
                            contractorEmail: contractor.email,
                            contractorName: contractor.name,
                            jobTitle,
                            refundAmount: leadPrice,
                        });
                    }
                } catch (err) {
                    console.error('Error sending rejection notification:', err);
                }
            })();
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Unhandled error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
