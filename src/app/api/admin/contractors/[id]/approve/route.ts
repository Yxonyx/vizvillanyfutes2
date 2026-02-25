import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// POST /api/admin/contractors/[id]/approve - Approve contractor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractorId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    const body = await request.json().catch(() => ({}));
    const internalNotes = body.internal_notes || null;

    // Use database function to approve contractor
    const { data, error } = await supabase.rpc('approve_contractor', {
      p_contractor_id: contractorId,
      p_internal_notes: internalNotes,
    });

    if (error) {
      console.error('Error approving contractor:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to approve contractor' },
        { status: 400 }
      );
    }

    // Get contractor details for email notification
    const { data: contractor } = await supabase
      .from('contractor_profiles')
      .select('display_name, user_id')
      .eq('id', contractorId)
      .single();

    // Get contractor's email
    let contractorEmail: string | null = null;
    if (contractor?.user_id) {
      const { data: authUser } = await supabase.auth.admin.getUserById(contractor.user_id);
      contractorEmail = authUser?.user?.email || null;
    }

    // Send approval notification email
    if (contractorEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contractor_approved',
            data: {
              to_email: contractorEmail,
              display_name: contractor?.display_name,
            },
          }),
        });
      } catch (emailError) {
        console.warn('Failed to send approval notification email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor approved successfully',
    });

  } catch (error) {
    console.error('Error approving contractor:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
