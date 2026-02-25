import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// POST /api/admin/contractors/[id]/reject - Reject contractor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractorId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    const body = await request.json().catch(() => ({}));
    const internalNotes = body.internal_notes || body.reason || null;

    // Use database function to reject contractor
    const { data, error } = await supabase.rpc('reject_contractor', {
      p_contractor_id: contractorId,
      p_internal_notes: internalNotes,
    });

    if (error) {
      console.error('Error rejecting contractor:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reject contractor' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor rejected',
    });

  } catch (error) {
    console.error('Error rejecting contractor:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
