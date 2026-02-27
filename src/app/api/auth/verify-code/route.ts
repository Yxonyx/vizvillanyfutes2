import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { success: false, error: 'Email és megerősítő kód megadása kötelező.' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // Find the verification code
        const { data: verificationData, error: fetchError } = await adminClient
            .from('verification_codes')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('code', code)
            .eq('used', false)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !verificationData) {
            return NextResponse.json(
                { success: false, error: 'Érvénytelen vagy lejárt megerősítő kód.' },
                { status: 400 }
            );
        }

        // Mark code as used
        await adminClient
            .from('verification_codes')
            .update({ used: true })
            .eq('id', verificationData.id);

        return NextResponse.json({ success: true, verified: true });

    } catch (error) {
        console.error('Error in verify-code:', error);
        return NextResponse.json(
            { success: false, error: 'Hiba történt.' },
            { status: 500 }
        );
    }
}
