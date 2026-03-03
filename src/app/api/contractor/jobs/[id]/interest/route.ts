import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(
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

        let jobId = params.id;
        if (!jobId) {
            return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
        }

        // Check if this ID is a lead (from the leads table) rather than a job
        // If it's a lead, we need to convert it to a job first
        const supabaseAdmin = createAdminClient();
        const { data: existingJob } = await supabaseAdmin
            .from('jobs')
            .select('id')
            .eq('id', jobId)
            .single();

        if (!existingJob) {
            // Not found in jobs table — check if it's a lead
            const { data: lead, error: leadError } = await supabaseAdmin
                .from('leads')
                .select('*')
                .eq('id', jobId)
                .single();

            if (leadError || !lead) {
                return NextResponse.json({ success: false, error: 'Munka nem található / Job not found' }, { status: 404 });
            }

            // Convert the lead to a job entry so the RPC can work with it
            const tradeMap: Record<string, string> = {
                'viz': 'viz',
                'villany': 'villany',
                'futes': 'futes',
                'egyeb': 'viz',
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
                    const dummyPhone = `lead_${jobId}`;
                    const { data: newCustomer, error: custErr } = await supabaseAdmin
                        .from('customers')
                        .insert({
                            full_name: lead.contact_name || 'Ügyfél',
                            phone: lead.contact_phone || dummyPhone,
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
                const dummyPhone = `lead_${jobId}`;
                const { data: genericCustomer, error: gcErr } = await supabaseAdmin
                    .from('customers')
                    .insert({
                        full_name: lead.contact_name || 'Ügyfél (lead)',
                        phone: lead.contact_phone || dummyPhone,
                        email: lead.contact_email || null,
                        type: 'b2c',
                    })
                    .select('id')
                    .single();
                if (gcErr) console.error('Error creating generic customer:', gcErr);
                customerId = genericCustomer?.id || null;
            }

            if (!customerId) {
                return NextResponse.json({ success: false, error: 'Failed to create customer record' }, { status: 500 });
            }

            // Step 2: Create address record from lead's district info
            // Parse district string like "Budapest, XIV. kerület (Zugló), Margit híd"
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
                    house_number: '-', // Required field by the DB constraint
                })
                .select('id')
                .single();

            if (addrErr) console.error('Error creating address:', addrErr);

            if (!newAddress) {
                return NextResponse.json({ success: false, error: 'Failed to create address record' }, { status: 500 });
            }

            // Step 3: Create the job row
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
                    source: 'web_form', // Changed to match jobs_source_check constraint
                    lead_price: 2000,
                    created_by_user_id: lead.user_id || null,
                })
                .select('id')
                .single();

            if (insertError || !newJob) {
                console.error('Error converting lead to job:', insertError);
                return NextResponse.json({ success: false, error: 'Failed to process lead' }, { status: 500 });
            }

            // Step 4: Mark lead as converted
            await supabaseAdmin
                .from('leads')
                .update({ status: 'converted' })
                .eq('id', jobId);

            // Use the new job ID for the interest RPC
            jobId = newJob.id;
        }

        // Call the PostgreSQL RPC function 'express_job_interest'
        const { data, error } = await supabase.rpc('express_job_interest', {
            p_job_id: jobId
        });

        if (error) {
            console.error('Error expressing interest:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Unhandled error expressing interest:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
