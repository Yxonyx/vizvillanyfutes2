import { NextRequest, NextResponse } from 'next/server';
import { notifyCustomerJobCreated } from '@/lib/services/leadNotificationService';

export async function POST(request: NextRequest) {
    try {
        const { customerEmail, customerName, jobTitle, trade } = await request.json();

        if (!customerEmail || !jobTitle) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        // Fire-and-forget (but await for API response)
        await notifyCustomerJobCreated({
            customerEmail,
            customerName: customerName || 'Ügyfél',
            jobTitle,
            trade: trade || 'viz',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending lead notification:', error);
        return NextResponse.json({ success: true }); // Don't fail the main flow
    }
}
