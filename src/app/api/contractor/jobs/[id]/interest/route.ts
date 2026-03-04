import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { expressInterest } from '@/lib/services/contractorService';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        // Verify authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const jobId = params.id;
        if (!jobId) {
            return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
        }

        // Delegate to service layer (handles lead→job conversion + RPC)
        const result = await expressInterest(supabase, jobId);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Unhandled error expressing interest:', error);

        // Handle known service errors as 404/500
        const message = error instanceof Error ? error.message : 'Unknown error';
        const status = message.includes('nem található') || message.includes('not found') ? 404 : 500;

        return NextResponse.json({ success: false, error: message }, { status });
    }
}
