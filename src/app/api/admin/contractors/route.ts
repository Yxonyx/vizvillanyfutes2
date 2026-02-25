import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ContractorStatus, Trade } from '@/lib/supabase/types';

// Force dynamic rendering - prevent any caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/contractors - List all contractors with filtering
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
    const status = searchParams.get('status') as ContractorStatus | null;
    const trade = searchParams.get('trade') as Trade | null;
    const serviceArea = searchParams.get('service_area');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('contractor_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (trade) {
      query = query.contains('trades', [trade]);
    }
    if (serviceArea) {
      query = query.contains('service_areas', [serviceArea]);
    }

    const { data: contractors, error, count } = await query;

    if (error) {
      console.error('Error fetching contractors:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        contractors,
        pagination: {
          limit,
          offset,
          total: count,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error listing contractors:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
