import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GYIK - Árak, Kiállás, Foglalás Kérdések | VízVillanyFűtés',
  description: 'Válaszok a leggyakrabban felmerülő kérdésekre vízszerelés, villanyszerelés és fűtésszerelés témában. Árak, kiállás, foglalás, fizetési módok.',
  alternates: {
    canonical: 'https://www.vizvillanyfutes.hu/gyik',
  },
};

// FAQ Schema for rich snippets in Google
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Mennyibe kerül a kiszállás?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A kiszállási díj Budapest teljes területén egységesen 5.900 Ft. Ha a munkát elfogadja és elvégezzük, ez az összeg nem kerül külön felszámolásra, beépül a munkadíjba.',
      },
    },
    {
      '@type': 'Question',
      name: 'Mennyi időn belül tudnak jönni?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SOS hibaelhárítás esetén (csőtörés, áramkimaradás) a szakemberek gyorsan kiérnek. Normál bejelentés esetén általában 1-3 munkanapon belül tudnak időpontot adni.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hogyan tudok feladatot meghirdetni?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A weboldalunkon található űrlap kitöltésével egyszerűen megadhatja a probléma részleteit. A rendszer értesíti a környékén lévő szabad szakembereket, akik ezt követően felveszik Önnel a kapcsolatot.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hol működnek, mely területeken vállalnak munkát?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Budapesten (minden kerületben) és Pest megye településein is találhat szakembert. SOS hibaelhárítás esetén Budapest teljes területén gyorsan találhat azonnali segítséget.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hogyan fizethetek?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fizethet készpénzzel vagy bankkártyával a helyszínen a munka végeztével. Céges ügyfeleknek átutalás is lehetséges előzetes egyeztetés alapján.',
      },
    },
    {
      '@type': 'Question',
      name: 'Dolgoznak hétvégén és ünnepnapokon is?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Igen, rendszerünk 0-24 órában elérhető, beleértve a hétvégéket és ünnepeket is. Sürgősségi esetben a szakemberek egyedi díjszabást alkalmazhatnak, amelyet az ajánlatban előre egyeztetnek Önnel.',
      },
    },
  ],
};

export default function GyikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}


