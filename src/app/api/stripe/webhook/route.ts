import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initializing Stripe client inside the handler or locally to be build-safe
function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-01-28.clover',
    });
}

// Stripe requires the raw body to construct the event, but Next.js App Router exposes `request.text()`
export async function POST(request: NextRequest) {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    const stripe = getStripe();
    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error(`Webhook signature verification failed:`, err);
        return NextResponse.json({ error: 'Webhook payload verification failed' }, { status: 400 });
    }

    // Handle successful payments
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripePaymentIntentId = session.payment_intent as string;

        // Extract contractor ID and credit amount
        const contractorProfileId = session.client_reference_id;
        const totalCreditsStr = session.metadata?.total_credits;
        const totalCredits = parseInt(totalCreditsStr || '0', 10);

        if (!contractorProfileId || totalCredits <= 0) {
            console.error('Webhook error: Missing client_reference_id or invalid credit amount', session);
            return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
        }

        try {
            // Use Admin Client to bypass RLS and add credits
            const adminClient = createAdminClient();

            // Call the add_contractor_credits RPC
            // Wait, add_contractor_credits runs SECURITY DEFINER, so we just call it with the admin key
            const { data, error } = await adminClient.rpc('add_contractor_credits', {
                p_contractor_id: contractorProfileId,
                p_amount: totalCredits,
                p_description: `Stripe online befizetés. Tranzakció: ${stripePaymentIntentId}`
            });

            if (error) {
                console.error('Error executing add_contractor_credits RPC inside webhook:', error);
                return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
            }

            console.log(`✅ Webhook success: Added ${totalCredits} credits to contractor ${contractorProfileId}`);

        } catch (err) {
            console.error('Webhook database logic failed:', err);
            return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
