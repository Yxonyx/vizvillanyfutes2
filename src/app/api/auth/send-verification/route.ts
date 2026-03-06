import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { wrapHtml } from '@/lib/services/leadNotificationService';

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

        const htmlBody = wrapHtml('Megerősítő kód', `
          <div style="text-align:center;margin-bottom:20px;">
            <span style="display:inline-block;background:#dbeafe;color:#1e40af;font-size:12px;font-weight:700;padding:6px 16px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px;">🔑 Fiók megerősítés</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;margin:0 0 16px;color:#0f172a;text-align:center;">Megerősítő kódod</h1>
          <p style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 24px;text-align:center;">Az alábbi kóddal tudod megerősíteni a regisztrációdat:</p>
          <div style="background:#eff6ff;border:2px dashed #3b82f6;border-radius:16px;padding:24px;margin:0 0 24px;text-align:center;">
            <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1e40af;">${code}</span>
          </div>
          <p style="font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
            A kód <strong>15 percig</strong> érvényes.<br>
            Ha nem te kezdeményezted a regisztrációt, kérjük hagyd figyelmen kívül ezt az emailt.
          </p>
        `);

        const { error: emailError } = await resend.emails.send({
            from: 'VízVillanyFűtés <info@vizvillanyfutes.hu>',
            to: email,
            subject: '🔑 Megerősítő kód – VízVillanyFűtés regisztráció',
            html: htmlBody,
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
