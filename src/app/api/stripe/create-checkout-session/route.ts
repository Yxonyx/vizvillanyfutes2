import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initializing Stripe client inside the handler to be build-safe
function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-01-28.clover',
    });
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const supabase = createServerClient(authHeader || undefined);

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const { data: profileId, error: profileError } = await supabase.rpc('get_contractor_profile_id');
        if (profileError || !profileId) {
            return NextResponse.json({ success: false, error: 'Contractor profile not found' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, bonus } = body;

        if (!amount || amount < 1000) {
            return NextResponse.json({ success: false, error: 'Érvénytelen összeg.' }, { status: 400 });
        }

        // Determine the host for success/cancel URLs
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const origin = `${protocol}://${host}`;

        const totalCredits = amount + (bonus || 0);

        const stripe = getStripe();
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'huf',
                        product_data: {
                            name: `VízVillanyFűtés - ${totalCredits} Kredit`,
                            description: 'Kredit egyenleg feltöltés lead vásárlásokhoz.',
                            images: ['https://vizvillanyfutes.hu/icon.svg'], // Optional logo
                        },
                        unit_amount: amount, // HUF is a zero-decimal currency in Stripe — no * 100 needed
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/contractor/dashboard?topup=success`,
            cancel_url: `${origin}/contractor/topup?topup=cancelled`,
            client_reference_id: profileId, // CRITICAL: This links the payment to the contractor
            metadata: {
                total_credits: totalCredits.toString(), // Amount of credits they actually get (including bonus)
            }
        });

        return NextResponse.json({
            success: true,
            sessionId: session.id,
        });

    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
