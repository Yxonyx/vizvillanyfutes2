import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { ContractorRegistrationRequest, Trade } from '@/lib/supabase/types';

// Map trade names from Hungarian to database values
function mapTrades(trades: string[]): Trade[] {
  const tradeMap: Record<string, Trade> = {
    'vizszereles': 'viz',
    'viz': 'viz',
    'vízszerelés': 'viz',
    'villanyszereles': 'villany',
    'villany': 'villany',
    'villanyszerelés': 'villany',
    'futesszereles': 'futes',
    'futes': 'futes',
    'fűtésszerelés': 'futes',
    'combined': 'combined',
    'kombinált': 'combined',
  };

  return trades.map(t => tradeMap[t.toLowerCase()] || t as Trade);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both structured API format and partner form format
    let registrationData: ContractorRegistrationRequest;

    if (body.email && body.password && body.display_name) {
      // Structured API format
      registrationData = body as ContractorRegistrationRequest;
    } else {
      // Partner form format - convert to structured format
      registrationData = {
        email: body.email || '',
        password: body.password || '',
        display_name: body.teljesNev || body.display_name || '',
        phone: body.telefon || body.phone || '',
        type: body.vallalkozoiForma === 'ceg' ? 'company' : 'individual',
        legal_name: body.cegnev || body.legal_name,
        tax_number: body.adoszam || body.tax_number,
        trades: mapTrades(
          Array.isArray(body.szakma)
            ? body.szakma
            : body.trades || [body.szakma || 'viz']
        ),
        service_areas: Array.isArray(body.munkaterulet)
          ? body.munkaterulet
          : body.service_areas || [body.munkaterulet || 'Budapest'],
        years_experience: body.tapasztalat
          ? parseInt(body.tapasztalat)
          : body.years_experience,
      };
    }

    // Validate required fields
    if (!registrationData.email || !registrationData.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!registrationData.display_name || !registrationData.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    if (!registrationData.trades || registrationData.trades.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one trade is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (registrationData.password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registrationData.email,
      password: registrationData.password,
      options: {
        data: {
          display_name: registrationData.display_name,
          role: 'contractor',
        },
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);

      // Handle specific auth errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'Ez az email cím már regisztrálva van' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Step 2.5: Handle optional referral code
    let referredByUuid = null;
    const incomingReferralCode = body.referralCode || body.ref;

    if (incomingReferralCode && typeof incomingReferralCode === 'string' && incomingReferralCode.trim() !== '') {
      try {
        // We use the admin client here because a new unauthenticated user might not have read access
        // to other people's referral codes based on current RLS policies
        const { createAdminClient } = await import('@/lib/supabase/server');
        const adminClient = createAdminClient();

        const { data: referrerData } = await adminClient
          .from('contractor_profiles')
          .select('id')
          .eq('referral_code', incomingReferralCode.trim().toUpperCase())
          .single();

        if (referrerData && referrerData.id) {
          referredByUuid = referrerData.id;
        }
      } catch (err) {
        // If referral code is invalid or missing, we just ignore it and proceed
        console.warn('Invalid referral code provided:', incomingReferralCode, err);
      }
    }

    // Step 3: Create user_meta and contractor_profile using the database function
    const { data: profileData, error: profileError } = await supabase.rpc('register_contractor', {
      p_user_id: authData.user.id,
      p_display_name: registrationData.display_name,
      p_phone: registrationData.phone,
      p_type: registrationData.type || 'individual',
      p_legal_name: registrationData.legal_name || null,
      p_tax_number: registrationData.tax_number || null,
      p_company_registration: registrationData.company_registration || null,
      p_trades: registrationData.trades,
      p_service_areas: registrationData.service_areas || ['Budapest'],
      p_years_experience: registrationData.years_experience || null,
      p_referred_by: referredByUuid,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);

      // Try to clean up the auth user if profile creation failed
      // Note: This requires admin client with service role key

      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 500 }
      );
    }

    const result = profileData as { success: boolean; error?: string; user_meta_id?: string; contractor_profile_id?: string };

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create contractor profile' },
        { status: 500 }
      );
    }

    // Send notification email to admin
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_contractor_admin',
          data: {
            contractor_profile_id: result.contractor_profile_id,
            display_name: registrationData.display_name,
            phone: registrationData.phone,
            email: registrationData.email,
            trades: registrationData.trades.join(', '),
            service_areas: registrationData.service_areas?.join(', ') || 'Budapest',
          },
        }),
      });
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor registered successfully. Please wait for admin approval.',
      data: {
        user_id: authData.user.id,
        user_meta_id: result.user_meta_id,
        contractor_profile_id: result.contractor_profile_id,
      },
    });

  } catch (error) {
    console.error('Error registering contractor:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
