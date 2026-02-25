import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);
    const adminClient = createAdminClient();

    const { data: profileId, error: profileError } = await supabase.rpc('get_contractor_profile_id');

    if (profileError || !profileId) {
      return NextResponse.json({ success: false, error: 'Contractor profile not found' }, { status: 401 });
    }

    // Check if contractor purchased this job lead
    const { data: purchase, error: purchaseError } = await adminClient
      .from('lead_purchases')
      .select('*')
      .eq('job_id', jobId)
      .eq('contractor_id', profileId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ success: false, error: 'Job not found or not purchased by you' }, { status: 404 });
    }

    const { data: job, error: jobError } = await adminClient
      .from('jobs')
      .select(`
        *,
        customer:customers(full_name, phone, email),
        address:addresses(*)
      `)
      .eq('id', jobId)
      .single();

    if (jobError) {
      return NextResponse.json({ success: false, error: jobError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { job, purchase },
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);
    const adminClient = createAdminClient();

    const body = await request.json();
    const { new_status, final_price_gross, note } = body;

    if (!new_status) {
      return NextResponse.json({ success: false, error: 'New status is required' }, { status: 400 });
    }

    if (!['in_progress', 'completed'].includes(new_status)) {
      return NextResponse.json({ success: false, error: 'Invalid status. Must be "in_progress" or "completed"' }, { status: 400 });
    }

    const { data: profileId, error: profileError } = await supabase.rpc('get_contractor_profile_id');

    if (profileError || !profileId) {
      return NextResponse.json({ success: false, error: 'Contractor profile not found' }, { status: 401 });
    }

    // Verify contractor bought the lead
    const { data: purchase, error: purchaseError } = await adminClient
      .from('lead_purchases')
      .select('id')
      .eq('job_id', jobId)
      .eq('contractor_id', profileId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ success: false, error: 'No purchased lead found for this job' }, { status: 403 });
    }

    const { data: currentJob, error: jobFetchError } = await adminClient
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (jobFetchError || !currentJob) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    if (currentJob.status === new_status) {
      return NextResponse.json({
        success: true,
        message: `Job is already ${new_status}`,
        data: { job: { id: jobId, status: new_status } },
      });
    }

    const validTransitions: Record<string, string[]> = {
      'unlocked': ['in_progress', 'completed'], // Unlocked handles the newly bought jobs
      'in_progress': ['completed'],
    };

    if (!validTransitions[currentJob.status]?.includes(new_status)) {
      return NextResponse.json({ success: false, error: `Cannot change status from ${currentJob.status} to ${new_status}` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updateData: any = { status: new_status, updated_at: now };

    if (new_status === 'in_progress') updateData.started_at = now;
    if (new_status === 'completed') {
      updateData.completed_at = now;
      if (final_price_gross) updateData.final_price_gross = final_price_gross;
    }
    if (note) updateData.dispatcher_notes = note;

    const { data: updatedJob, error: updateError } = await adminClient
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select('id, status, started_at, completed_at, updated_at')
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Job status updated to ${new_status}`, data: { job: updatedJob } });

  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
