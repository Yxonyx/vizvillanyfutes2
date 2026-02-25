import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/admin/jobs/[id] - Get single job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Check if user is admin or dispatcher
    const { data: isAuthorized, error: authCheckError } = await supabase.rpc('is_admin_or_dispatcher');
    
    if (authCheckError || !isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(*),
        address:addresses(*),
        assignments:job_assignments(
          *,
          contractor:contractor_profiles(*)
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { job },
    });

  } catch (error) {
    console.error('Error getting job:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Check if user is admin or dispatcher
    const { data: isAuthorized, error: authCheckError } = await supabase.rpc('is_admin_or_dispatcher');
    
    if (authCheckError || !isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, cancellation_reason, ...otherUpdates } = body;

    const updateData: Record<string, unknown> = { ...otherUpdates };
    
    if (status) {
      updateData.status = status;
    }
    
    if (cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason;
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If cancelling, also cancel any pending assignments
    if (status === 'cancelled') {
      await supabase
        .from('job_assignments')
        .update({ status: 'cancelled' })
        .eq('job_id', jobId)
        .in('status', ['pending', 'accepted']);
    }

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data: { job },
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/jobs/[id] - Cancel/delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Check if user is admin or dispatcher
    const { data: isAuthorized, error: authCheckError } = await supabase.rpc('is_admin_or_dispatcher');
    
    if (authCheckError || !isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete - set status to cancelled
    const { data: job, error } = await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling job:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Also cancel any pending assignments
    await supabase
      .from('job_assignments')
      .update({ status: 'cancelled' })
      .eq('job_id', jobId)
      .eq('status', 'pending');

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
      data: { job },
    });

  } catch (error) {
    console.error('Error cancelling job:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
