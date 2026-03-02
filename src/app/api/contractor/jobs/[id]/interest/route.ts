import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

        const jobId = params.id;
        if (!jobId) {
            return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
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
