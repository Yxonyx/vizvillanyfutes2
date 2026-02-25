import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Villanyszerelő Budapest - SOS Áramszünet, Biztosítéktábla | 0-24',
  description: 'Megbízható villanyszerelő Budapest területén. ✓ SOS áramkimaradás ✓ Fi-relé beépítés ✓ Biztosítéktábla csere ✓ EV töltő telepítés ✓ 1 év garancia ✓ Fix árak. Hívjon most!',
  keywords: [
    'villanyszerelő budapest',
    'villanyszerelő sos',
    'áramszünet elhárítás',
    'biztosítéktábla csere',
    'fi relé beépítés',
    'konnektor csere',
    'lámpa szerelés',
    'ev töltő telepítés',
  ],
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/villanyszerelo-budapest',
  },
  openGraph: {
    title: 'Villanyszerelő Budapest - SOS 0-24 | VízVillanyFűtés',
    description: 'Professzionális villanyszerelés Budapesten. Áramkimaradás, biztosítéktábla, Fi-relé - gyors megoldás, fix árak.',
    url: 'https://www.vizvillanyfutes.hu/villanyszerelo-budapest',
  },
};

// Service schema for rich snippets
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Villanyszerelés',
  name: 'Villanyszerelő Budapest',
  description: 'Professzionális villanyszerelési szolgáltatások Budapesten: hibaelhárítás, biztosítéktábla csere, Fi-relé beépítés, EV töltő telepítés.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VízVillanyFűtés',
    url: 'https://www.vizvillanyfutes.hu',
  },
  areaServed: {
    '@type': 'City',
    name: 'Budapest',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Villanyszerelési szolgáltatások',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fi-relé beépítés',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '18500',
          priceCurrency: 'HUF',
          minPrice: '18500',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Biztosítéktábla csere',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '45000',
          priceCurrency: 'HUF',
          minPrice: '45000',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Konnektor csere',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '8500',
          priceCurrency: 'HUF',
          minPrice: '8500',
        },
      },
    ],
  },
};

export default function VillanyszerelolLayout({
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


