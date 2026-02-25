import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elfelejtett jelszó',
  description: 'Állítsd vissza a jelszavadat a VízVillanyFűtés Szakember Portálhoz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
