import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Árak - Vízszerelés, Villanyszerelés, Fűtésszerelés Árlista',
  description: 'Átlátható árak vízszerelésre, villanyszerelésre és fűtésszerelésre. ✓ Fix munkadíjak ✓ Rejtett költségek nélkül ✓ Megbízható mesterek.',
  keywords: [
    'vízszerelő árak',
    'villanyszerelő árak',
    'fűtésszerelő árak',
    'csaptelep csere ár',
    'duguláselhárítás ár',
    'biztosítéktábla csere ár',
  ],
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/arak',
  },
  openGraph: {
    title: 'Árak - Vízszerelés, Villanyszerelés Árlista | VízVillanyFűtés',
    description: 'Átlátható árak rejtett költségek nélkül az online platformon.',
    url: 'https://www.vizvillanyfutes.hu/arak',
  },
};

// PriceSpecification schema
const priceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VízVillanyFűtés Árlista',
  description: 'Vízszerelési, villanyszerelési és fűtésszerelési szolgáltatások árai',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Kiszállási díj',
        offers: {
          '@type': 'Offer',
          price: '5900',
          priceCurrency: 'HUF',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Csaptelep csere',
        offers: {
          '@type': 'Offer',
          price: '16500',
          priceCurrency: 'HUF',
          priceValidUntil: '2025-12-31',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Duguláselhárítás',
        offers: {
          '@type': 'Offer',
          price: '18000',
          priceCurrency: 'HUF',
          priceValidUntil: '2025-12-31',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Service',
        name: 'Fi-relé beépítés',
        offers: {
          '@type': 'Offer',
          price: '18500',
          priceCurrency: 'HUF',
          priceValidUntil: '2025-12-31',
        },
      },
    },
  ],
};

export default function ArakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSchema) }}
      />
      {children}
    </>
  );
}


