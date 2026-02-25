import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { AssignmentStatus } from '@/lib/supabase/types';

// Force dynamic rendering - prevent any caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/contractor/assignments - Get all assignments for current contractor
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);
    const adminClient = createAdminClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try RPC first, fallback to direct query
    let profileId: string | null = null;
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('get_contractor_profile_id');
    
    if (rpcError || !rpcResult) {
      console.warn('RPC get_contractor_profile_id failed, using direct query:', rpcError?.message);
      
      // Fallback: Get contractor profile ID directly using admin client
      const { data: profile, error: profileError } = await adminClient
        .from('contractor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        console.error('Contractor profile not found for user:', user.id, profileError?.message);
        return NextResponse.json(
          { success: false, error: 'Contractor profile not found' },
          { status: 401 }
        );
      }
      
      profileId = profile.id;
    } else {
      profileId = rpcResult;
    }
    
    console.log('Fetching assignments for contractor:', profileId);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AssignmentStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query using admin client to bypass RLS on jobs table
    // This is safe because we already verified the contractor's identity above
    let query = adminClient
      .from('job_assignments')
      .select(`
        *,
        job:jobs(
          id,
          title,
          description,
          trade,
          category,
          priority,
          status,
          preferred_time_from,
          preferred_time_to,
          created_at,
          updated_at,
          started_at,
          completed_at,
          customer:customers(full_name, phone),
          address:addresses(city, district, street, house_number)
        )
      `, { count: 'exact' })
      .eq('contractor_id', profileId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    const { data: rawAssignments, error, count } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Filter out assignments with missing job data (deleted jobs, etc.)
    const assignments = (rawAssignments || []).filter(a => a.job !== null);

    // Calculate statistics using admin client
    const { data: stats } = await adminClient
      .from('job_assignments')
      .select('status')
      .eq('contractor_id', profileId);

    const statistics = {
      total: stats?.length || 0,
      pending: stats?.filter(a => a.status === 'pending').length || 0,
      accepted: stats?.filter(a => a.status === 'accepted').length || 0,
      declined: stats?.filter(a => a.status === 'declined').length || 0,
    };

    // Add server timestamp to help debug caching issues
    const serverTime = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: {
        assignments,
        statistics,
        pagination: {
          limit,
          offset,
          total: count,
        },
        _debug: {
          serverTime,
          assignmentCount: assignments.length,
          jobStatuses: assignments.map(a => ({ jobId: a.job?.id, status: a.job?.status })),
        },
      },
    }, {
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
        'X-Server-Time': serverTime,
      },
    });

  } catch (error) {
    console.error('Error getting assignments:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
