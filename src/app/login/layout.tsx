import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Szakember Portál – Bejelentkezés',
  description: 'Bejelentkezés a VízVillanyFűtés Szakember Portálba. Regisztrált vízszerelők, villanyszerelők és fűtésszerelők számára.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
