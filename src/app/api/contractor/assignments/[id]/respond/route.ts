import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { RespondToAssignmentRequest } from '@/lib/supabase/types';

// POST /api/contractor/assignments/[id]/respond - Accept or decline assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);
    const adminClient = createAdminClient();

    const body: Partial<RespondToAssignmentRequest> = await request.json();

    if (!body.action || !['accept', 'decline'].includes(body.action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Step 1: Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Step 2: Get contractor profile ID (try RPC first, fallback to direct query)
    let contractorProfileId: string | null = null;
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('get_contractor_profile_id');
    
    if (rpcError || !rpcResult) {
      console.warn('RPC get_contractor_profile_id failed, using direct query:', rpcError?.message);
      
      // Fallback: Get contractor profile ID directly
      const { data: profile, error: profileError } = await adminClient
        .from('contractor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        console.error('Contractor profile not found for user:', user.id, profileError?.message);
        return NextResponse.json(
          { success: false, error: 'Contractor profile not found' },
          { status: 401 }
        );
      }
      
      contractorProfileId = profile.id;
    } else {
      contractorProfileId = rpcResult;
    }
    
    console.log('Responding to assignment for contractor:', contractorProfileId);

    // Step 2: Get assignment details using admin client
    const { data: assignmentData, error: assignmentError } = await adminClient
      .from('job_assignments')
      .select(`
        id,
        contractor_id,
        status,
        job_id,
        job:jobs(id, title, trade, category, priority),
        contractor:contractor_profiles(display_name)
      `)
      .eq('id', assignmentId)
      .single();
    
    if (assignmentError || !assignmentData) {
      console.error('Assignment not found:', assignmentError);
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Type assertion for the assignment data (cast through unknown for Supabase nested types)
    const assignment = assignmentData as unknown as {
      id: string;
      contractor_id: string;
      status: string;
      job_id: string;
      job: { id: string; title: string; trade: string; category: string; priority: string } | null;
      contractor: { display_name: string } | null;
    };

    // Step 3: Verify this assignment belongs to the current contractor
    if (assignment.contractor_id !== contractorProfileId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to respond to this assignment' },
        { status: 403 }
      );
    }

    // Step 4: Check assignment is still pending (idempotent - allow if already in target state)
    const targetStatus = body.action === 'accept' ? 'accepted' : 'declined';
    if (assignment.status === targetStatus) {
      // Already in the target state - return success (idempotent)
      return NextResponse.json({
        success: true,
        message: `Assignment is already ${assignment.status}`,
        data: { assignment: { id: assignmentId, status: assignment.status, job: assignment.job } },
      });
    }
    
    if (assignment.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Assignment is already ${assignment.status}` },
        { status: 400 }
      );
    }

    // Step 5: Update assignment status using admin client (bypass RLS)
    const newStatus = body.action === 'accept' ? 'accepted' : 'declined';
    const now = new Date().toISOString();
    
    // Build update data with proper timestamps
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: now,
    };
    
    if (body.action === 'accept') {
      updateData.confirmed_start_time = body.confirmed_start_time || null;
      updateData.accepted_at = now;
    } else {
      // Store decline info with timestamp
      updateData.declined_at = now;
      updateData.notes = body.comment || 'Nincs indok megadva';
    }
    
    const { error: updateError } = await adminClient
      .from('job_assignments')
      .update(updateData)
      .eq('id', assignmentId);

    if (updateError) {
      console.error('Error updating assignment:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Step 6: Update job status based on action
    if (body.action === 'accept') {
      await adminClient
        .from('jobs')
        .update({ 
          status: 'scheduled',
          updated_at: now,
        })
        .eq('id', assignment.job_id);
    }

    // Step 7: If declined, check if any active assignments remain and update job status
    if (body.action === 'decline') {
      // Check if there are any other pending or accepted assignments for this job
      const { data: remainingAssignments, error: remainingError } = await adminClient
        .from('job_assignments')
        .select('id, status')
        .eq('job_id', assignment.job_id)
        .in('status', ['pending', 'accepted']);

      if (remainingError) {
        console.error('Failed to query remaining assignments:', remainingError);
        // Don't fail the whole request, but log the error - assignment was already updated
        // Just skip the job status update to be safe
      } else if (!remainingAssignments || remainingAssignments.length === 0) {
        // If no active assignments remain, set job status to 'unassigned'
        await adminClient
          .from('jobs')
          .update({ 
            status: 'unassigned',
            updated_at: now,
          })
          .eq('id', assignment.job_id);
      }
    }

    // If contractor declined, notify admin/dispatcher
    if (body.action === 'decline' && assignment?.job) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                        request.headers.get('origin') ||
                        `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        const adminEmail = process.env.ADMIN_EMAIL || process.env.DISPATCHER_EMAIL;
        
        if (adminEmail) {
          await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'job_declined_admin',
              data: {
                to_email: adminEmail,
                job_id: assignment.job.id,
                job_title: assignment.job.title,
                contractor_name: assignment.contractor?.display_name || 'Ismeretlen',
                trade: assignment.job.trade,
                category: assignment.job.category,
                priority: assignment.job.priority,
                decline_reason: body.comment || 'Nincs megadva',
                admin_link: `${baseUrl}/admin`,
              },
            }),
          });
        }
      } catch (emailError) {
        console.warn('Failed to send decline notification:', emailError);
      }
    }

    const actionText = body.action === 'accept' ? 'elfogadva' : 'elutasítva';

    // Fetch the updated assignment with job data to return to frontend
    const { data: updatedAssignment } = await adminClient
      .from('job_assignments')
      .select(`
        id, status, accepted_at, declined_at, updated_at,
        job:jobs(id, status, title, trade, category, priority)
      `)
      .eq('id', assignmentId)
      .single();

    return NextResponse.json({
      success: true,
      message: `Munka ${actionText}`,
      data: {
        assignment: updatedAssignment,
        action: body.action,
      },
    });

  } catch (error) {
    console.error('Error responding to assignment:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
