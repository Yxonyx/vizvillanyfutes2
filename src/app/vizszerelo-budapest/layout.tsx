import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vízszerelő Budapest - SOS Csőtörés, Duguláselhárítás | 2 Órán Belül',
  description: 'Megbízható vízszerelő Budapest területén. ✓ SOS csőtörés elhárítás ✓ Duguláselhárítás ✓ Csaptelep csere ✓ Bojler szerelés ✓ Számlaképes mesterek ✓ Fix árak. Kérjen ajánlatot most!',
  keywords: [
    'vízszerelő budapest',
    'vízszerelő sos',
    'csőtörés elhárítás',
    'duguláselhárítás budapest',
    'csaptelep csere',
    'bojler szerelés',
    'wc szerelés',
    'szivárgás javítás',
    'vízszerelő pest megye',
    'vízszerelés agglomeráció',
  ],
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/vizszerelo-budapest',
  },
  openGraph: {
    title: 'Vízszerelő Budapest - SOS 2 Órán Belül | VízVillanyFűtés',
    description: 'Professzionális vízszerelés Budapesten. Csőtörés, dugulás, csaptelep - gyors megoldás, fix árak.',
    url: 'https://www.vizvillanyfutes.hu/vizszerelo-budapest',
  },
};

// Service schema for rich snippets
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Vízszerelés',
  name: 'Vízszerelő Budapest',
  description: 'Professzionális vízszerelési szolgáltatások Budapesten: csőtörés elhárítás, duguláselhárítás, csaptelep csere, bojler szerelés.',
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
    name: 'Vízszerelési szolgáltatások',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Csaptelep csere',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '16500',
          priceCurrency: 'HUF',
          minPrice: '16500',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Duguláselhárítás',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '18000',
          priceCurrency: 'HUF',
          minPrice: '18000',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Bojler vízkőtelenítés',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '19500',
          priceCurrency: 'HUF',
          minPrice: '19500',
        },
      },
    ],
  },
};

export default function VizszereloLayout({
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


