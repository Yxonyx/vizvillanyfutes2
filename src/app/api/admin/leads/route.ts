import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/leads - List all leads
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
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Use admin client to query leads (bypasses RLS)
        const adminClient = createAdminClient();

        let query = adminClient
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        const { data: leads, error } = await query;

        if (error) {
            console.error('Error fetching leads:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Enrich leads with purchase info if any
        const leadIds = (leads || []).map(l => l.id);
        let purchases: Record<string, any[]> = {};

        if (leadIds.length > 0) {
            const { data: purchaseData } = await adminClient
                .from('lead_purchases')
                .select(`
          *,
          contractor:contractor_profiles(id, display_name, phone)
        `)
                .in('job_id', leadIds);

            if (purchaseData) {
                for (const p of purchaseData) {
                    if (!purchases[p.job_id]) purchases[p.job_id] = [];
                    purchases[p.job_id].push(p);
                }
            }
        }

        // Enrich leads with purchase data
        const enrichedLeads = (leads || []).map(lead => ({
            ...lead,
            purchases: purchases[lead.id] || [],
        }));

        return NextResponse.json({
            success: true,
            data: {
                leads: enrichedLeads,
                pagination: { limit, offset, total: leads?.length || 0 },
            },
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });

    } catch (error) {
        console.error('Error listing leads:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
