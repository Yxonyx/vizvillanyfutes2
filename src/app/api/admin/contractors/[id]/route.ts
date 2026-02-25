import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/admin/contractors/[id] - Get contractor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractorId } = await params;
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

    const { data: contractor, error } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('id', contractorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Contractor not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching contractor:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get assignment statistics
    const { data: assignments } = await supabase
      .from('job_assignments')
      .select('status')
      .eq('contractor_id', contractorId);

    const stats = {
      total_assignments: assignments?.length || 0,
      pending: assignments?.filter(a => a.status === 'pending').length || 0,
      accepted: assignments?.filter(a => a.status === 'accepted').length || 0,
      declined: assignments?.filter(a => a.status === 'declined').length || 0,
      cancelled: assignments?.filter(a => a.status === 'cancelled').length || 0,
    };

    return NextResponse.json({
      success: true,
      data: { contractor, stats },
    });

  } catch (error) {
    console.error('Error getting contractor:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contractors/[id] - Update contractor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractorId } = await params;
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

    const updates = await request.json();

    const { data: contractor, error } = await supabase
      .from('contractor_profiles')
      .update(updates)
      .eq('id', contractorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating contractor:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor updated successfully',
      data: { contractor },
    });

  } catch (error) {
    console.error('Error updating contractor:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
