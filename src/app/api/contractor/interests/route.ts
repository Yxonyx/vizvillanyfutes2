import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Fetch pending interests
        const { data: interests, error, count } = await supabase
            .from('job_interests')
            .select(`
        *,
        job:jobs(
          *,
          address:addresses(city, district, street, house_number, floor_door, notes)
        )
      `, { count: 'exact' })
            .eq('contractor_id', profileId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching job interests:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                interests,
                pagination: {
                    limit,
                    offset,
                    total: count,
                },
            },
        });

    } catch (error) {
        console.error('Error getting job interests:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
