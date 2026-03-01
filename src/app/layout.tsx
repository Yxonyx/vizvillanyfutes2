import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';
import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import CookieConsent from '@/components/CookieConsent';
import { AuthProvider } from '@/contexts/AuthContext';



export const metadata: Metadata = {
  metadataBase: new URL('https://www.vizvillanyfutes.hu'),
  title: {
    default: 'VízVillanyFűtés - Vízszerelő és Villanyszerelő Budapest | SOS 0-24',
    template: '%s | VízVillanyFűtés',
  },
  description: 'Professzionális vízszerelő, villanyszerelő és fűtésszerelő Budapest és Pest megye területén. ✓ Gyors kiszállás ✓ Megbízható mesterek ✓ Fix árak ✓ Online ajánlatkérés. Kérjen ajánlatot most!',
  keywords: [
    'vízszerelő budapest',
    'villanyszerelő budapest',
    'fűtésszerelő budapest',
    'duguláselhárítás budapest',
    'csőtörés elhárítás',
    'villanyszerelő sos',
    'vízszerelő sos',
    'biztosítéktábla csere',
    'fi relé beépítés',
    'fűtéskorszerűsítés',
    'kazán csere',
    'radiátor szerelés',
    'otthonfelújítási program',
    'pályázat fűtéskorszerűsítés',
    'szakember kereső budapest',
    'vízszerelő pest megye',
  ],
  authors: [{ name: 'VízVillanyFűtés', url: 'https://www.vizvillanyfutes.hu' }],
  creator: 'VízVillanyFűtés',
  publisher: 'VízVillanyFűtés',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'VízVillanyFűtés - Vízszerelő, Villanyszerelő, Fűtésszerelő Budapest',
    description: 'Megbízható szakemberek Budapesten és Pest megyében. Gyors SOS kiszállás, gyors és okos kiajánlás, fix árak. Foglaljon online!',
    url: 'https://www.vizvillanyfutes.hu',
    siteName: 'VízVillanyFűtés',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VízVillanyFűtés - Vízszerelő, Villanyszerelő Budapest',
    description: 'Megbízható szakemberek Budapesten. Gyors SOS kiszállás, ellenőrzött mesterek, fix árak.',
    creator: '@vizvillanyfutes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu',
  },
  category: 'business',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

// Schema.org JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://www.vizvillanyfutes.hu/#organization',
      name: 'VízVillanyFűtés',
      alternateName: 'VízVillanyFűtés Budapest',
      description: 'Professzionális vízszerelő, villanyszerelő és fűtésszerelő szolgáltatások Budapesten és Pest megyében.',
      url: 'https://www.vizvillanyfutes.hu',
      logo: 'https://www.vizvillanyfutes.hu/icon',
      image: 'https://www.vizvillanyfutes.hu/opengraph-image',
      email: 'info@vizvillanyfutes.hu',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bódani út 2.',
        addressLocality: 'Budapest',
        postalCode: '1033',
        addressRegion: 'Budapest',
        addressCountry: 'HU',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 47.5562,
        longitude: 19.0412,
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
      knowsAbout: [
        "Vízszerelés",
        "Villanyszerelés",
        "Fűtéskorszerűsítés",
        "Duguláselhárítás SOS 0-24",
        "Csőtörés elhárítás",
        "Biztosítéktábla szerelés",
        "Kazáncsere",
        "Hőszivattyú beszerelés",
        "Szakember közvetítés",
      ],
      slogan: "Megbízható szakemberek, gyors és okos kiajánlás Budapesten és Pest megyében.",
      potentialAction: {
        "@type": "ReserveAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.vizvillanyfutes.hu/login?role=customer",
          "inLanguage": "hu",
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform"
          ]
        },
        "result": {
          "@type": "Reservation",
          "name": "Szakember foglalása"
        }
      },
      priceRange: '$$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '14:00',
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Szolgáltatások',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Vízszerelés',
              description: 'Csőtörés elhárítás, duguláselhárítás, csaptelep csere, bojler szerelés',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Villanyszerelés',
              description: 'Hibaelhárítás, biztosítéktábla csere, Fi-relé beépítés, teljes átvezetékelés',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Fűtésszerelés',
              description: 'Radiátor csere, kazán bekötés, padlófűtés, fűtéskorszerűsítés',
            },
          },
        ],
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '500',
        bestRating: '5',
        worstRating: '1',
      },
      sameAs: [
        'https://www.facebook.com/vizvillanyfutes',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.vizvillanyfutes.hu/#website',
      url: 'https://www.vizvillanyfutes.hu',
      name: 'VízVillanyFűtés',
      description: 'Vízszerelő, villanyszerelő és fűtésszerelő Budapest',
      publisher: {
        '@id': 'https://www.vizvillanyfutes.hu/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.vizvillanyfutes.hu/blog?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'hu-HU',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://www.vizvillanyfutes.hu/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Főoldal',
          item: 'https://www.vizvillanyfutes.hu',
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-PQBCLN2PMF" strategy="afterInteractive" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PQBCLN2PMF');
            `,
          }}
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F8DFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VízVillanyFűtés" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-900" suppressHydrationWarning>
        <AuthProvider>
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-vvm-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
          >
            Ugrás a tartalomhoz
          </a>

          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
          <CookieConsent />
        </AuthProvider>

        {/* Voiceflow Chat Widget */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(d, t) {
                var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
                v.onload = function() {
                  window.voiceflow.chat.load({
                    verify: { projectID: '69a34d17a52e1c0fcc16f23e' },
                    url: 'https://general-runtime.voiceflow.com',
                    versionID: 'production',
                    voice: {
                      url: "https://runtime-api.voiceflow.com"
                    }
                  });
                }
                v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
                v.type = "text/javascript";
                s.parentNode.insertBefore(v, s);
              })(document, 'script');
            `,
          }}
        />
      </body>
    </html>
  );
}

