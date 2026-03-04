// =====================================================
// Job Service – Business logic for job creation
// Extracted from api/jobs/create/route.ts
// =====================================================

import { supabase } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/server';
import type { CreateJobRequest, Trade, JobCategory, JobPriority } from '@/lib/supabase/types';

// -----------------------------------------------------
// Geocoding
// -----------------------------------------------------
export async function geocodeAddress(address: {
    city?: string;
    district?: string;
    street?: string;
    house_number?: string;
}): Promise<{ latitude: number; longitude: number } | null> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return null;

    const parts = [
        address.house_number,
        address.street,
        address.district,
        address.city || 'Budapest',
        'Hungary',
    ].filter(Boolean);

    const query = encodeURIComponent(parts.join(', '));

    try {
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=hu`
        );
        const data = await res.json();

        if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            return { latitude: lat, longitude: lng };
        }
    } catch (err) {
        console.warn('Geocoding failed:', err);
    }
    return null;
}

// -----------------------------------------------------
// Form data mapping helpers
// -----------------------------------------------------
export function mapCategory(category: string, isSOS: boolean): JobCategory {
    if (isSOS) return 'sos';
    if (category === 'b2b' || category === 'b2b_project') return 'b2b_project';
    return 'standard';
}

export function mapTrade(category: string): Trade {
    const tradeMap: Record<string, Trade> = {
        vizszereles: 'viz',
        viz: 'viz',
        vízszerelés: 'viz',
        villanyszereles: 'villany',
        villany: 'villany',
        villanyszerelés: 'villany',
        futesszereles: 'futes',
        futes: 'futes',
        fűtésszerelés: 'futes',
        combined: 'combined',
        kombinált: 'combined',
    };
    return tradeMap[category?.toLowerCase()] || 'viz';
}

export function determinePriority(isSOS: boolean, isExpress: boolean): JobPriority {
    if (isSOS) return 'critical';
    if (isExpress) return 'high';
    return 'normal';
}

// -----------------------------------------------------
// Booking form → structured CreateJobRequest converter
// -----------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeJobRequest(body: any): CreateJobRequest {
    if (body.customer && body.address && body.job) {
        return body as CreateJobRequest;
    }

    return {
        customer: {
            full_name: body.name || 'Ismeretlen',
            phone: body.phone || '',
            email: body.email,
            type: body.isCompany ? 'b2b' : 'b2c',
            company_name: body.companyName,
        },
        address: {
            city: body.city || 'Budapest',
            district: body.district,
            postal_code: body.postalCode,
            street: body.address || body.street || '',
            house_number: body.houseNumber || '',
            floor_door: body.floor
                ? `${body.floor}${body.doorbell ? ' / ' + body.doorbell : ''}`
                : body.doorbell,
            notes: body.accessNote,
        },
        job: {
            trade: mapTrade(body.category),
            category: mapCategory(body.category, body.isSOS),
            title: body.problem || `Új munka - ${body.category || 'viz'}`,
            description: body.description || '',
            priority: determinePriority(body.isSOS, body.isExpress),
            preferred_time_from:
                body.selectedDate && body.selectedTime
                    ? `${body.selectedDate}T${body.selectedTime.split('-')[0].trim()}:00`
                    : undefined,
            preferred_time_to:
                body.selectedDate && body.selectedTime
                    ? `${body.selectedDate}T${body.selectedTime.split('-')[1]?.trim() || '18'}:00`
                    : undefined,
            estimated_price_gross: body.estimatedPrice ? parseFloat(body.estimatedPrice) : undefined,
        },
    };
}

// -----------------------------------------------------
// Lazy registration (passwordless customer via magic link)
// -----------------------------------------------------
export async function lazyRegisterCustomer(
    email: string,
    fullName: string,
    existingUserId?: string | null
): Promise<{ userId: string | null; magicLinkUrl: string | null }> {
    if (existingUserId) {
        return { userId: existingUserId, magicLinkUrl: null };
    }

    try {
        const supabaseAdmin = createAdminClient();

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                data: { role: 'customer', full_name: fullName },
            },
        });

        if (!linkError && linkData?.user) {
            const userId = linkData.user.id;
            const magicLinkUrl = linkData.properties?.action_link || null;

            await supabaseAdmin
                .from('user_meta')
                .upsert({ user_id: userId, role: 'customer', status: 'active' }, { onConflict: 'user_id' });

            console.log(`[Lazy Auth] Customer account linked/created: ${userId}`);
            return { userId, magicLinkUrl };
        }
    } catch (err) {
        console.warn('Silent failure on lazy auth registration:', err);
    }

    return { userId: null, magicLinkUrl: null };
}

// -----------------------------------------------------
// Core: Create a Job via Supabase RPC
// -----------------------------------------------------
export interface CreateJobResult {
    success: boolean;
    error?: string;
    job_id?: string;
    customer_id?: string;
    address_id?: string;
    magic_link?: string | null;
}

export async function createJob(jobData: CreateJobRequest): Promise<CreateJobResult> {
    // 1) Lazy auth
    const { userId: customerUserId, magicLinkUrl } = await lazyRegisterCustomer(
        jobData.customer.email || '',
        jobData.customer.full_name,
        jobData.customer.id || null
    );

    // 2) Geocode
    const coords = await geocodeAddress({
        city: jobData.address.city,
        district: jobData.address.district,
        street: jobData.address.street,
        house_number: jobData.address.house_number,
    });

    // 3) RPC
    const { data, error } = await supabase.rpc('create_job_from_form', {
        p_customer_full_name: jobData.customer.full_name,
        p_customer_phone: jobData.customer.phone,
        p_customer_email: jobData.customer.email || null,
        p_customer_type: jobData.customer.type || 'b2c',
        p_customer_company_name: jobData.customer.company_name || null,
        p_address_city: jobData.address.city || 'Budapest',
        p_address_district: jobData.address.district || null,
        p_address_postal_code: jobData.address.postal_code || null,
        p_address_street: jobData.address.street || null,
        p_address_house_number: jobData.address.house_number || null,
        p_address_floor_door: jobData.address.floor_door || null,
        p_address_notes: jobData.address.notes || null,
        p_job_trade: jobData.job.trade || 'viz',
        p_job_category: jobData.job.category || 'standard',
        p_job_title: jobData.job.title || null,
        p_job_description: jobData.job.description || null,
        p_job_priority: jobData.job.priority || 'normal',
        p_job_preferred_time_from: jobData.job.preferred_time_from || null,
        p_job_preferred_time_to: jobData.job.preferred_time_to || null,
        p_job_estimated_price_gross: jobData.job.estimated_price_gross || null,
        p_customer_user_id: customerUserId,
        p_job_latitude: coords?.latitude || null,
        p_job_longitude: coords?.longitude || null,
    });

    if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
    }

    const result = data as {
        success: boolean;
        error?: string;
        job_id?: string;
        customer_id?: string;
        address_id?: string;
    };

    if (!result.success) {
        return { success: false, error: result.error || 'Failed to create job' };
    }

    return {
        success: true,
        job_id: result.job_id,
        customer_id: result.customer_id,
        address_id: result.address_id,
        magic_link: magicLinkUrl,
    };
}

// -----------------------------------------------------
// Notification: Dispatch email (fire-and-forget)
// -----------------------------------------------------
export async function sendJobNotificationEmail(
    jobData: CreateJobRequest,
    jobId: string,
    magicLinkUrl: string | null
): Promise<void> {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'new_job_dispatcher',
                data: {
                    job_id: jobId,
                    trade: jobData.job.trade,
                    category: jobData.job.category,
                    priority: jobData.job.priority,
                    customer_name: jobData.customer.full_name,
                    phone: jobData.customer.phone,
                    district: jobData.address.district,
                    title: jobData.job.title,
                    description: jobData.job.description?.substring(0, 200),
                    magic_link: magicLinkUrl,
                },
            }),
        });
    } catch (emailError) {
        console.warn('Failed to send notification email:', emailError);
    }
}
