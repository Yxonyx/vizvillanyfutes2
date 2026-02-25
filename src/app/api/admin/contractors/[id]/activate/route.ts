import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

// POST /api/admin/contractors/[id]/activate - Reactivate suspended contractor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractorId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);
    const adminClient = createAdminClient();

    // Check if user is admin
    const { data: userMeta, error: metaError } = await supabase
      .from('user_meta')
      .select('role')
      .single();

    if (metaError || userMeta?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admin can activate contractors' },
        { status: 401 }
      );
    }

    // Update contractor status back to 'approved'
    const { data: contractor, error } = await adminClient
      .from('contractor_profiles')
      .update({ 
        status: 'approved',
        internal_notes: 'Reactivated by admin',
      })
      .eq('id', contractorId)
      .select('display_name, user_id')
      .single();

    if (error) {
      console.error('Error activating contractor:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Also update user_meta to activate user account
    if (contractor?.user_id) {
      await adminClient
        .from('user_meta')
        .update({ status: 'active' })
        .eq('user_id', contractor.user_id);
    }

    // Send notification email to contractor
    if (contractor?.user_id) {
      try {
        const { data: authUser } = await adminClient.auth.admin.getUserById(contractor.user_id);
        const contractorEmail = authUser?.user?.email;

        if (contractorEmail) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                          request.headers.get('origin') ||
                          `${request.nextUrl.protocol}//${request.nextUrl.host}`;

          await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'contractor_approved',
              data: {
                to_email: contractorEmail,
                display_name: contractor.display_name,
                login_link: `${baseUrl}/login`,
              },
            }),
          });
        }
      } catch (emailError) {
        console.warn('Failed to send activation notification:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor activated successfully',
    });

  } catch (error) {
    console.error('Error activating contractor:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
