import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Hasznos Tanácsok Vízszereléshez, Villanyszereléshez',
  description: 'Praktikus tippek és útmutatók otthonának karbantartásához. Vízszerelési, villanyszerelési és fűtésszerelési szakértői cikkek.',
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/blog',
  },
  openGraph: {
    title: 'Blog - Hasznos Tanácsok | VízVillanyFűtés',
    description: 'Praktikus tippek és útmutatók vízszereléshez, villanyszereléshez, fűtésszereléshez.',
    url: 'https://www.vizvillanyfutes.hu/blog',
  },
};

// Blog schema
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'VízVillanyFűtés Blog',
  description: 'Hasznos tanácsok és útmutatók vízszereléshez, villanyszereléshez és fűtésszereléshez',
  url: 'https://www.vizvillanyfutes.hu/blog',
  publisher: {
    '@type': 'Organization',
    name: 'VízVillanyFűtés',
    url: 'https://www.vizvillanyfutes.hu',
  },
  inLanguage: 'hu-HU',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {children}
    </>
  );
}


