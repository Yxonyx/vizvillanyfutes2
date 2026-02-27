import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email cím megadása kötelező.' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // Check if email is already registered
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const alreadyRegistered = existingUsers?.users?.some(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (alreadyRegistered) {
            return NextResponse.json(
                { success: false, error: 'Ez az email cím már regisztrálva van. Kérjük jelentkezzen be.' },
                { status: 409 }
            );
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any previous codes for this email
        await adminClient
            .from('verification_codes')
            .delete()
            .eq('email', email.toLowerCase());

        // Store verification code (expires in 15 minutes)
        const { error: insertError } = await adminClient
            .from('verification_codes')
            .insert({
                email: email.toLowerCase(),
                code,
            });

        if (insertError) {
            console.error('Error storing verification code:', insertError);
            return NextResponse.json(
                { success: false, error: 'Hiba történt. Kérjük próbálja újra.' },
                { status: 500 }
            );
        }

        // Send verification email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ RESEND_API_KEY not set - code:', code);
            return NextResponse.json({ success: true, dev_mode: true });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error: emailError } = await resend.emails.send({
            from: 'VízVillanyFűtés <info@vizvillanyfutes.hu>',
            to: email,
            subject: '🔑 Megerősítő kód – VízVillanyFűtés regisztráció',
            html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e40af; font-size: 24px; margin: 0;">VízVillanyFűtés</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Fiók megerősítés</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 16px; margin-bottom: 24px;">
              Az Ön megerősítő kódja:
            </p>
            <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">
              A kód 15 percig érvényes.<br/>
              Ha nem Ön kezdeményezte a regisztrációt, kérjük hagyja figyelmen kívül ezt az emailt.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
            © VízVillanyFűtés.hu – Megbízható szakemberek, egy kattintásra.
          </p>
        </div>
      `,
        });

        if (emailError) {
            console.error('Resend error:', emailError);
            return NextResponse.json(
                { success: false, error: 'Nem sikerült elküldeni az emailt. Kérjük próbálja újra.' },
                { status: 500 }
            );
        }

        console.log(`✅ Verification code sent to ${email}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in send-verification:', error);
        return NextResponse.json(
            { success: false, error: 'Hiba történt.' },
            { status: 500 }
        );
    }
}
