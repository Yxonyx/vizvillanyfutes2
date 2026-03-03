'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Hide footer only on mobile + homepage + authenticated (app mode)
    // if (pathname === '/' && isMobile && isAuthenticated && !isLoading) {
    //     return null;
    // }

    // Hide entirely on customer and contractor dashboard routes
    if (pathname?.startsWith('/ugyfel') || pathname?.startsWith('/contractor')) {
        return null;
    }

    return <Footer />;
}
