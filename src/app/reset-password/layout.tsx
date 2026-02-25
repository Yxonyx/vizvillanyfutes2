import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jelszó visszaállítása',
  description: 'Állítsd be az új jelszavadat a VízVillanyFűtés Szakember Portálhoz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
