import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Szakember regisztráció – Vízszerelő, Villanyszerelő, Fűtésszerelő | VízVillanyFűtés',
  description: 'Vízszerelő, villanyszerelő vagy fűtésszerelő vagy? Regisztrálj szakemberként és kapj folyamatos megbízásokat Budapest és Pest megye területén. Stabil munkák, átlátható kifizetés.',
  keywords: 'szakember regisztráció, vízszerelő munka, villanyszerelő munka, fűtésszerelő munka, szerelő regisztráció budapest',
  openGraph: {
    title: 'Szakember regisztráció – Legyél a csapatunk tagja! | VízVillanyFűtés',
    description: 'Regisztrálj szakemberként és kapj folyamatos megbízásokat. Mi hozzuk az ügyfelet, te végezd el a munkát!',
    url: 'https://www.vizvillanyfutes.hu/csatlakozz-partnerkent',
    type: 'website',
    images: [
      {
        url: 'https://www.vizvillanyfutes.hu/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VízVillanyFűtés Szakember Regisztráció',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Szakember regisztráció – Legyél a csapatunk tagja! | VízVillanyFűtés',
    description: 'Regisztrálj szakemberként és kapj folyamatos megbízásokat. Mi hozzuk az ügyfelet, te végezd el a munkát!',
    images: ['https://www.vizvillanyfutes.hu/opengraph-image.jpg'],
  },
};

export default function PartnerOnboardingLayout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "VízVillanyFűtés Partnerprogram",
    "description": "Víz-, villany- vagy fűtésszerelő vállalkozó vagy Budapesten vagy Pest megyében? Csatlakozz partnerhálózatunkhoz: stabil leadek, korrekt kifizetés, backoffice támogatás.",
    "url": "https://www.vizvillanyfutes.hu/csatlakozz-partnerkent",
    "mainEntity": {
      "@type": "Organization",
      "name": "VízVillanyFűtés",
      "url": "https://www.vizvillanyfutes.hu",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Partner Relations",
        "availableLanguage": "Hungarian"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {children}
    </>
  );
}

