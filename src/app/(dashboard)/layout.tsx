import { AuthProvider } from '@/contexts/AuthContext';
import CookieConsent from '@/components/CookieConsent';

export const dynamic = 'force-dynamic';

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout skips the Header and ConditionalFooter of the main app
    // The inner /ugyfel/layout.tsx holds the specific height/scroll constraints
    return (
        <AuthProvider>
            <main id="dashboard-content" className="flex-1 w-full h-full bg-slate-50">
                {children}
            </main>
            <CookieConsent />
        </AuthProvider>
    );
}
