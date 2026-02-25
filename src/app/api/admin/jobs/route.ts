import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { JobStatus, Trade, JobCategory, JobPriority } from '@/lib/supabase/types';

// Force dynamic rendering - prevent any caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/jobs - List all jobs with filtering
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const trade = searchParams.get('trade') as Trade | null;
    const category = searchParams.get('category') as JobCategory | null;
    const priority = searchParams.get('priority') as JobPriority | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(*),
        address:addresses(*),
        assignments:job_assignments(
          *,
          contractor:contractor_profiles(id, display_name, phone)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get raw status param for special filters
    const statusParam = searchParams.get('status');
    
    // Apply filters (skip if special filter)
    if (status && statusParam !== 'needs_reassignment') {
      query = query.eq('status', status);
    }
    if (trade) {
      query = query.eq('trade', trade);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: jobs, error, count } = await query;

    // Special filter for jobs needing reassignment (all assignments declined)
    let filteredJobs = jobs;
    if (statusParam === 'needs_reassignment' && jobs) {
      filteredJobs = jobs.filter(job => {
        const assignments = job.assignments || [];
        // Has assignments and all are declined
        return assignments.length > 0 && 
               assignments.every((a: { status: string }) => a.status === 'declined');
      });
    }

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
        jobs: filteredJobs,
        pagination: {
          limit,
          offset,
          total: statusParam === 'needs_reassignment' ? filteredJobs?.length : count,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error listing jobs:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/jobs - Update job
export async function PUT(request: NextRequest) {
  try {
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
    const { job_id, ...updates } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', job_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
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
