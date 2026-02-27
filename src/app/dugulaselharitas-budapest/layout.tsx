import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Duguláselhárítás Budapest - SOS 0-24 Gépi Tisztítás | Azonnali Kiszállás',
  description: 'Duguláselhárítás Budapesten 0-24 órában. ✓ Gépi csőtisztítás ✓ WC dugulás ✓ Lefolyó dugulás ✓ Kameradiagnosztika ✓ Azonnali riasztás ✓ Fix árak. Kérjen ajánlatot most!',
  keywords: [
    'duguláselhárítás budapest',
    'duguláselhárítás sos',
    'gépi csőtisztítás',
    'wc dugulás',
    'lefolyó dugulás',
    'csőtisztítás',
    'kameradiagnosztika',
    'azonnali duguláselhárítás',
    'duguláselhárítás pest megye',
  ],
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/dugulaselharitas-budapest',
  },
  openGraph: {
    title: 'Duguláselhárítás Budapest - SOS 0-24 | VízVillanyFűtés',
    description: 'Gépi duguláselhárítás Budapesten 0-24 órában. WC, lefolyó, csatorna - azonnali megoldás.',
    url: 'https://www.vizvillanyfutes.hu/dugulaselharitas-budapest',
  },
};

// Service schema for rich snippets
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Duguláselhárítás',
  name: 'Duguláselhárítás Budapest',
  description: 'Professzionális gépi duguláselhárítás Budapesten 0-24 órában. WC, lefolyó, csatorna dugulás elhárítása, kameradiagnosztika.',
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
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceType: 'SOS szolgáltatás',
    availableLanguage: 'Hungarian',
    servicePostalAddress: {
      '@type': 'PostalAddress',
      addressLocality: 'Budapest',
      addressCountry: 'HU',
    },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Duguláselhárítási szolgáltatások',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Mosdó/kád dugulás',
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
          name: 'WC dugulás',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '22000',
          priceCurrency: 'HUF',
          minPrice: '22000',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Gépi csőtisztítás',
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '35000',
          priceCurrency: 'HUF',
          minPrice: '35000',
        },
      },
    ],
  },
};

export default function DugulaselharitasLayout({
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


