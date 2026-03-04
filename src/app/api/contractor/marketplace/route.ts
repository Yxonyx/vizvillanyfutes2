import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getMarketplaceData } from '@/lib/services/contractorService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        // Delegate to service layer
        const data = await getMarketplaceData(supabase, user.id);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error getting marketplace data:', error);

        // Handle known service errors
        if (error instanceof Error && error.message === 'Contractor profile not found') {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
