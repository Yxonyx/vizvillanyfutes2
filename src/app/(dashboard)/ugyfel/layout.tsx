'use client';

import { useEffect } from 'react';

export default function UgyfelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Lock body scroll on dashboard pages — the dashboard handles its own scrolling
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, []);

    return (
        <div className="h-dvh w-full overflow-hidden relative bg-slate-50">
            {children}
        </div>
    );
}
