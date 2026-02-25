import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createServerClient(authHeader || undefined);

    // Get current user using the auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          user: null,
          session: null,
        },
      });
    }

    // Get user's role and status from user_meta
    const { data: userMeta } = await supabase
      .from('user_meta')
      .select('role, status')
      .eq('user_id', user.id)
      .single();

    // Get contractor profile if applicable
    let contractorProfile = null;
    if (userMeta?.role === 'contractor') {
      const { data: profile } = await supabase
        .from('contractor_profiles')
        .select('id, display_name, phone, trades, service_areas, status')
        .eq('user_id', user.id)
        .single();
      
      contractorProfile = profile;
    }

    // Get current session token info from the auth header
    const token = authHeader?.replace('Bearer ', '');

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: userMeta?.role || null,
          status: userMeta?.status || null,
        },
        session: token ? {
          access_token: token,
          expires_at: null, // We don't have this info from the token alone
        } : null,
        contractor_profile: contractorProfile,
      },
    });

  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
