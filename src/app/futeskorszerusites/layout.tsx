import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fűtéskorszerűsítés Budapest - Kazáncsere, Hőszivattyú | Pályázattal',
  description: 'Fűtéskorszerűsítés Budapesten és Pest megyében. ✓ Kazáncsere ✓ Hőszivattyú telepítés ✓ Radiátor csere ✓ Padlófűtés ✓ Pályázati támogatás ✓ 1 év garancia. Kérjen ajánlatot!',
  keywords: [
    'fűtéskorszerűsítés',
    'kazáncsere budapest',
    'hőszivattyú telepítés',
    'radiátor csere',
    'padlófűtés szerelés',
    'fűtésszerelő budapest',
    'otthonfelújítási program',
    'energetikai korszerűsítés',
  ],
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/futeskorszerusites',
  },
  openGraph: {
    title: 'Fűtéskorszerűsítés - Kazáncsere, Hőszivattyú | VízVillanyFűtés',
    description: 'Komplex fűtéskorszerűsítés pályázati támogatással. Kazáncsere, hőszivattyú, padlófűtés.',
    url: 'https://www.vizvillanyfutes.hu/futeskorszerusites',
  },
};

// Service schema for rich snippets
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Fűtéskorszerűsítés',
  name: 'Fűtéskorszerűsítés Budapest',
  description: 'Komplex fűtéskorszerűsítési szolgáltatások: kazáncsere, hőszivattyú telepítés, radiátor csere, padlófűtés szerelés. Pályázati támogatás ügyintézéssel.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VízVillanyFűtés',
    url: 'https://www.vizvillanyfutes.hu',
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Budapest',
    },
    {
      '@type': 'State',
      name: 'Pest megye',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Fűtéskorszerűsítési szolgáltatások',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Kondenzációs kazán csere',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '85000',
          priceCurrency: 'HUF',
          minPrice: '85000',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Radiátor csere',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '25000',
          priceCurrency: 'HUF',
          minPrice: '25000',
        },
      },
    ],
  },
};

export default function FuteskorszerusitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  );
}


