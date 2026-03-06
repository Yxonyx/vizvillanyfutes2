import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const { job_id, contractor_id, rating, comment } = await request.json();

        // Validate inputs
        if (!job_id || !contractor_id || !rating) {
            return NextResponse.json({ success: false, error: 'job_id, contractor_id, and rating are required' }, { status: 400 });
        }
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return NextResponse.json({ success: false, error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Get customer_id for this user
        const { data: customer, error: custErr } = await admin
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (custErr || !customer) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }

        // Verify the job belongs to this customer and is completed
        const { data: job, error: jobErr } = await admin
            .from('jobs')
            .select('id, status, created_by_user_id')
            .eq('id', job_id)
            .single();

        if (jobErr || !job) {
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        if (job.created_by_user_id !== user.id) {
            return NextResponse.json({ success: false, error: 'Not your job' }, { status: 403 });
        }

        if (job.status !== 'completed') {
            return NextResponse.json({ success: false, error: 'Job must be completed before rating' }, { status: 400 });
        }

        // Check if already rated
        const { data: existingRating } = await admin
            .from('contractor_ratings')
            .select('id')
            .eq('job_id', job_id)
            .eq('customer_id', customer.id)
            .single();

        if (existingRating) {
            return NextResponse.json({ success: false, error: 'Already rated this job' }, { status: 409 });
        }

        // Insert rating
        const { error: insertErr } = await admin
            .from('contractor_ratings')
            .insert({
                job_id,
                contractor_id,
                customer_id: customer.id,
                rating,
                comment: comment?.trim() || null,
            });

        if (insertErr) {
            console.error('Error inserting rating:', insertErr);
            return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Rating error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET: Fetch rating for a specific job (for the current customer)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const jobId = request.nextUrl.searchParams.get('job_id');
        const contractorId = request.nextUrl.searchParams.get('contractor_id');

        const admin = createAdminClient();

        // If contractor_id is provided, return avg rating + count for that contractor
        if (contractorId) {
            const { data: ratings, error } = await admin
                .from('contractor_ratings')
                .select('rating')
                .eq('contractor_id', contractorId);

            if (error) {
                return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            }

            const count = ratings?.length || 0;
            const avg = count > 0
                ? ratings!.reduce((sum, r) => sum + r.rating, 0) / count
                : 0;

            return NextResponse.json({ success: true, avg: Math.round(avg * 10) / 10, count });
        }

        // If job_id is provided, check if user already rated this job
        if (jobId) {
            const { data: customer } = await admin
                .from('customers')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!customer) {
                return NextResponse.json({ success: true, rating: null });
            }

            const { data: existing } = await admin
                .from('contractor_ratings')
                .select('rating, comment, created_at')
                .eq('job_id', jobId)
                .eq('customer_id', customer.id)
                .single();

            return NextResponse.json({ success: true, rating: existing || null });
        }

        return NextResponse.json({ success: false, error: 'job_id or contractor_id required' }, { status: 400 });

    } catch (error) {
        console.error('Rating GET error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
