import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/contractor/profile - Get own profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get contractor profile
    const { data: profile, error } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Contractor profile not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get user meta
    const { data: userMeta } = await supabase
      .from('user_meta')
      .select('role, status')
      .eq('user_id', user.id)
      .single();

    // Get referral stats
    let totalReferrals = 0;
    let paidReferrals = 0;

    if (profile && profile.id) {
      const { data: referrals } = await supabase
        .from('contractor_profiles')
        .select('id, referral_reward_paid')
        .eq('referred_by', profile.id);

      if (referrals) {
        totalReferrals = referrals.length;
        paidReferrals = referrals.filter(r => r.referral_reward_paid).length;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        user_meta: userMeta,
        email: user.email,
        affiliate_stats: {
          total_referrals: totalReferrals,
          total_earned: paidReferrals * 10000
        }
      },
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/contractor/profile - Update own profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Only allow updating certain fields
    const allowedFields = [
      'display_name',
      'phone',
      'legal_name',
      'tax_number',
      'company_registration',
      'trades',
      'service_areas',
      'years_experience',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from('contractor_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
