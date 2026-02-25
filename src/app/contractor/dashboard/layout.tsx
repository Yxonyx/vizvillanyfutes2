import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Szakember Dashboard',
  description: 'VízVillanyFűtés szakember dashboard - kezelje a munkáit és profiljét.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContractorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
