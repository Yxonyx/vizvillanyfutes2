import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { AssignJobRequest } from '@/lib/supabase/types';

// POST /api/admin/jobs/assign - Assign job to contractor
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);
    const adminClient = createAdminClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin or dispatcher (try RPC first, fallback to direct query)
    let isAuthorized = false;
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin_or_dispatcher');
    
    if (rpcError || rpcResult === null) {
      console.warn('RPC is_admin_or_dispatcher failed, using direct query:', rpcError?.message);
      
      // Fallback: Check user_meta table directly
      const { data: userMeta } = await adminClient
        .from('user_meta')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      isAuthorized = userMeta?.role === 'admin' || userMeta?.role === 'dispatcher';
    } else {
      isAuthorized = rpcResult;
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin or dispatcher role required' },
        { status: 401 }
      );
    }

    const body: AssignJobRequest = await request.json();

    if (!body.job_id || !body.contractor_id) {
      return NextResponse.json(
        { success: false, error: 'Job ID and Contractor ID are required' },
        { status: 400 }
      );
    }

    // Try using database function first, fallback to direct insert if it fails
    let assignmentId: string | null = null;
    
    const { data, error } = await supabase.rpc('assign_job_to_contractor', {
      p_job_id: body.job_id,
      p_contractor_id: body.contractor_id,
      p_proposed_start_time: body.proposed_start_time || null,
      p_notes: body.notes || null,
    });

    if (error || !data?.success) {
      console.warn('RPC assign_job_to_contractor failed, using direct insert:', error?.message || data?.error);
      console.log('Assigning job:', body.job_id, 'to contractor:', body.contractor_id);
      
      // Fallback: Direct insert using admin client
      const now = new Date().toISOString();
      
      // First, check if there's already an active assignment
      const { data: existingAssignment } = await adminClient
        .from('job_assignments')
        .select('id')
        .eq('job_id', body.job_id)
        .in('status', ['pending', 'accepted'])
        .single();
      
      if (existingAssignment) {
        return NextResponse.json(
          { success: false, error: 'This job already has an active assignment' },
          { status: 400 }
        );
      }
      
      // Create the assignment directly
      const { data: newAssignment, error: insertError } = await adminClient
        .from('job_assignments')
        .insert({
          job_id: body.job_id,
          contractor_id: body.contractor_id,
          status: 'pending',
          assigned_at: now,
          proposed_start_time: body.proposed_start_time || null,
          notes: body.notes || null,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error creating assignment:', insertError);
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
      
      // Update job status to 'assigned'
      await adminClient
        .from('jobs')
        .update({ status: 'assigned', updated_at: now })
        .eq('id', body.job_id);
      
      assignmentId = newAssignment?.id;
      console.log('Assignment created successfully:', assignmentId, 'for contractor:', body.contractor_id);
    } else {
      const result = data as { success: boolean; error?: string; assignment_id?: string };
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to assign job' },
          { status: 400 }
        );
      }
      assignmentId = result.assignment_id || null;
    }

    // Get contractor details for email notification (use admin client)
    const { data: contractor } = await adminClient
      .from('contractor_profiles')
      .select('display_name, user_id')
      .eq('id', body.contractor_id)
      .single();

    // Get contractor's email using admin client
    let contractorEmail = null;
    if (contractor?.user_id) {
      const { data: authUser } = await adminClient.auth.admin.getUserById(contractor.user_id);
      contractorEmail = authUser?.user?.email;
    }

    // Get job details for email (use admin client to bypass RLS)
    const { data: job } = await adminClient
      .from('jobs')
      .select(`
        *,
        customer:customers(full_name, phone),
        address:addresses(city, district, street, house_number, floor_door)
      `)
      .eq('id', body.job_id)
      .single();

    // Send notification email to contractor
    if (contractorEmail && job) {
      try {
        const addressFull = [
          job.address?.city,
          job.address?.district ? `${job.address.district}. kerület` : '',
          job.address?.street,
          job.address?.house_number,
          job.address?.floor_door,
        ].filter(Boolean).join(', ');

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                        request.headers.get('origin') ||
                        `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'job_assigned_contractor',
            data: {
              to_email: contractorEmail,
              job_id: body.job_id,
              title: job.title,
              customer_name: job.customer?.full_name,
              address_full: addressFull,
              trade: job.trade,
              category: job.category,
              priority: job.priority,
              preferred_time_from: job.preferred_time_from,
              preferred_time_to: job.preferred_time_to,
              proposed_start_time: body.proposed_start_time,
              description: job.description?.substring(0, 300),
              dashboard_link: `${baseUrl}/contractor/dashboard`,
            },
          }),
        });
      } catch (emailError) {
        console.warn('Failed to send assignment notification email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Job assigned successfully',
      data: {
        assignment_id: assignmentId,
      },
    });

  } catch (error) {
    console.error('Error assigning job:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
