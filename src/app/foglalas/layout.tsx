import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Időpontfoglalás Online - Válasszon Időpontot | VízVillanyFűtés',
  description: 'Foglaljon időpontot online vízszerelésre, villanyszerelésre vagy fűtésszerelésre. ✓ Azonnali visszaigazolás ✓ Becsült ár előre ✓ 1 év garancia ✓ Gyors kiszállás.',
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/foglalas',
  },
  openGraph: {
    title: 'Online Időpontfoglalás | VízVillanyFűtés',
    description: 'Foglaljon időpontot online - azonnali visszaigazolás, becsült ár előre.',
    url: 'https://www.vizvillanyfutes.hu/foglalas',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FoglalasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


