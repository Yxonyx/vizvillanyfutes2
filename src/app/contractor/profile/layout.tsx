import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil szerkesztése | VízVillanyFűtés',
  description: 'Szakember profil szerkesztése',
};

export default function ContractorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
