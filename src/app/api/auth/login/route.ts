import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth login error:', authError);

      // Handle specific auth errors
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { success: false, error: 'Hibás email vagy jelszó' },
          { status: 401 }
        );
      }

      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { success: false, error: 'Kérjük erősítse meg email címét' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate' },
        { status: 401 }
      );
    }

    // Get user's role and status from user_meta
    const { data: userMeta, error: metaError } = await supabase
      .from('user_meta')
      .select('role, status')
      .eq('user_id', authData.user.id)
      .single();

    if (metaError) {
      console.error('Error fetching user meta:', metaError);
      // User exists but no meta - might be a new user
    }

    // Check if user is suspended
    if (userMeta?.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Fiók felfüggesztve. Kérjük vegye fel velünk a kapcsolatot.' },
        { status: 403 }
      );
    }

    // Block login until admin approves the account
    if (userMeta?.status === 'pending_approval') {
      return NextResponse.json(
        { success: false, error: 'Fiókja jóváhagyásra vár. Amint az admin jóváhagyja, szabadon bejelentkezhet.' },
        { status: 403 }
      );
    }

    // Get contractor profile if user is a contractor
    let contractorProfile = null;
    if (userMeta?.role === 'contractor') {
      const { data: profile } = await supabase
        .from('contractor_profiles')
        .select('id, display_name, status')
        .eq('user_id', authData.user.id)
        .single();

      contractorProfile = profile;

      // Check contractor approval status
      if (profile?.status === 'pending_approval') {
        return NextResponse.json(
          { success: false, error: 'Partner fiókja jóváhagyásra vár.' },
          { status: 403 }
        );
      }

      if (profile?.status === 'rejected') {
        return NextResponse.json(
          { success: false, error: 'Partner jelentkezése el lett utasítva.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: userMeta?.role || null,
          status: userMeta?.status || null,
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
        contractor_profile: contractorProfile,
      },
    });

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
