import { NextRequest, NextResponse } from 'next/server';
import { normalizeJobRequest, createJob, sendJobNotificationEmail } from '@/lib/services/jobService';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 job creations per minute per IP
    const clientIp = getClientIp(request);
    const { success: rateLimitOk } = rateLimit(`jobs-create:${clientIp}`, 3, 60 * 1000);
    if (!rateLimitOk) {
      return NextResponse.json(
        { success: false, error: 'Túl sok kérés. Kérjük próbáld újra 1 perc múlva.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Normalize: supports both structured API format and booking form format
    const jobData = normalizeJobRequest(body);

    // Validate required fields
    if (!jobData.customer.full_name || !jobData.customer.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    if (!jobData.address.street) {
      return NextResponse.json(
        { success: false, error: 'Street address is required' },
        { status: 400 }
      );
    }

    // Delegate to service layer
    const result = await createJob(jobData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Fire-and-forget email notification
    sendJobNotificationEmail(jobData, result.job_id!, result.magic_link || null);

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: {
        job_id: result.job_id,
        customer_id: result.customer_id,
        address_id: result.address_id,
        magic_link: result.magic_link,
      },
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
