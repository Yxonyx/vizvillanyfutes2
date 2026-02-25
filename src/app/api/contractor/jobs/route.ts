import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/contractor/jobs - Get jobs assigned to current contractor
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Get contractor profile ID
    const { data: profileId, error: profileError } = await supabase.rpc('get_contractor_profile_id');
    
    if (profileError || !profileId) {
      return NextResponse.json(
        { success: false, error: 'Contractor profile not found' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get assignments for this contractor
    let query = supabase
      .from('job_assignments')
      .select(`
        *,
        job:jobs(
          *,
          customer:customers(full_name, phone, email),
          address:addresses(city, district, street, house_number, floor_door, notes)
        )
      `, { count: 'exact' })
      .eq('contractor_id', profileId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by assignment status
    if (status) {
      query = query.eq('status', status);
    }

    const { data: assignments, error, count } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        assignments,
        pagination: {
          limit,
          offset,
          total: count,
        },
      },
    });

  } catch (error) {
    console.error('Error getting jobs:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
