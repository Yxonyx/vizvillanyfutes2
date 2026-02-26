import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Droplets, Zap, Flame, Award, ChevronRight } from 'lucide-react';
import ShareButtons from '@/components/ShareButtons';

// Mock blog data - in real app this would come from a CMS or database
const blogPosts: Record<string, {
  title: string;
  content: string[];
  category: string;
  categoryLabel: string;
  author: string;
  date: string;
  readTime: string;
}> = {
  '1': {
    title: 'Hogyan előzze meg a téli csőtörést? 7 praktikus tipp',
    content: [
      'A téli hónapok különösen veszélyesek a vízvezetékekre. A fagyott csövek kitágulnak, majd amikor felolvadnak, repedések, szivárgások keletkezhetnek. De hogyan előzhetjük meg ezt a kellemetlen és költséges problémát?',
      '## 1. Szigetelje a csöveket',
      'A legfontosabb lépés a megelőzésben a csövek megfelelő szigetelése. Különösen fontos ez a fűtetlen helyiségekben (pince, garázs, padlástér) lévő csöveknél. A csőszigetelő hab olcsó és könnyen felszerelhető megoldás.',
      '## 2. Tartsa melegben a lakást',
      'Ha hosszabb időre elmegy otthonról, ne kapcsolja le teljesen a fűtést. Tartson legalább 10-12°C-ot a lakásban. Ez megakadályozza a belső csövek befagyását.',
      '## 3. Csöpögtesse a csapokat',
      'Extrém hidegben a csapok enyhe csöpögtetése megakadályozza a víz megfagyását a csövekben. A mozgó víz nehezebben fagy be.',
      '## 4. Nyissa ki a szekrényajtókat',
      'A mosdó és mosogató alatti szekrényajtók kinyitásával a meleg levegő eléri a falban futó csöveket is.',
      '## 5. Szerelje be a fagyvédelmi csapot',
      'A kerti csapoknál használjon fagyvédelmi csapot, és ősszel engedje le a vizet a külső vezetékekből.',
      '## 6. Ellenőrizze a szigetelést',
      'A falrepedések, rossz ablaktömítések hideg levegőt engedhetnek be, ami a falban futó csöveket veszélyezteti.',
      '## 7. Legyen kéznél a főcsap',
      'Ismerje a főcsap helyét, hogy vészhelyzet esetén gyorsan elzárhassa a vizet. A befagyott csövet SOHA ne próbálja nyílt lánggal felolvasztani!',
      '## Mit tegyen, ha mégis elfagy a cső?',
      'Ha gyanítja, hogy befagyott a cső (nem jön víz, vagy szokatlan zajokat hall), azonnal hívjon szakembert! A VízVillanyFűtés SOS szolgálata 2 órán belül a helyszínen van.',
    ],
    category: 'viz',
    categoryLabel: 'Vízszerelés',
    author: 'Kovács István',
    date: '2025. január 10.',
    readTime: '5 perc',
  },
  '2': {
    title: 'Mi az a Fi-relé és miért életmentő?',
    content: [
      'A Fi-relé (vagy életvédelmi kapcsoló) az egyik legfontosabb biztonsági berendezés az otthonunkban. Mégsem mindenki tudja, mire való és hogyan működik.',
      '## Mi az a Fi-relé?',
      'A Fi-relé (FI = Fehlerstrom-Schutzschalter, azaz hibaáram-védőkapcsoló) egy elektromos biztonsági eszköz, amely milliszekundumok alatt megszakítja az áramkört, ha áramütés veszélye áll fenn.',
      '## Hogyan működik?',
      'A Fi-relé folyamatosan méri a fázis és a nullavezetőn átfolyó áramot. Normál esetben ezeknek egyenlőnek kell lenniük. Ha valaki megérinti a fázisvezetőt (pl. hibás készüléket), az áram a testén keresztül a földbe folyik - ez a "szivárgó áram". A Fi-relé ezt érzékeli és azonnal lekapcsol.',
      '## Miért életmentő?',
      '- **30 mA-es Fi-relé**: Véd az áramütéstől - ez az emberi szív számára veszélyes szint alatt van',
      '- **Azonnali reakció**: 0,03 másodpercen belül lekapcsol',
      '- **Hibás készülékek védelme**: Jelzi, ha valamelyik készülék hibás',
      '## Mikor "vág ki" a Fi-relé?',
      'A leggyakoribb okok:',
      '- Nedvesség (fürdőszobai készülékek)',
      '- Hibás háztartási gép (mosógép, mosogatógép)',
      '- Sérült kábel',
      '- Túl sok készülék egy körön',
      '## Mit tegyen, ha kiold a Fi?',
      '1. Ne essen pánikba',
      '2. Húzza ki az összes készüléket az adott körön',
      '3. Próbálja visszakapcsolni a Fi-relét',
      '4. Egyenként dugja vissza a készülékeket - amelyiknél kiold, az a hibás',
      '5. Ha nem találja a hibát, hívjon szakembert!',
      '## Fontos: A Fi-relét havonta tesztelni kell!',
      'A relén lévő "TEST" gombbal ellenőrizhető a működés. Ha nem old ki, cseréltesse ki!',
    ],
    category: 'villany',
    categoryLabel: 'Villanyszerelés',
    author: 'Nagy Péter',
    date: '2025. január 8.',
    readTime: '4 perc',
  },
  '3': {
    title: 'Otthonfelújítási Program 2025: Amit tudni kell',
    content: [
      'Az Otthonfelújítási Program 2025-ben is folytatódik, és jelentős támogatást kínál a lakásfelújításokhoz. Összefoglaltuk a legfontosabb tudnivalókat.',
      '## Mekkora támogatás igényelhető?',
      '- **Alap támogatás**: A felújítási költségek 50%-a, maximum 3 millió forint',
      '- **Komplex felújítás**: Maximum 6 millió forint, ha több szakági munkát is végeztet',
      '## Mire lehet felhasználni?',
      'A támogatás az alábbi munkákra használható fel:',
      '- Fűtésrendszer korszerűsítés (kazáncsere, hőszivattyú)',
      '- Elektromos hálózat felújítása',
      '- Vízvezeték rendszer cseréje',
      '- Nyílászáró csere',
      '- Homlokzati hőszigetelés',
      '## Ki jogosult a támogatásra?',
      '- Legalább 1 gyermeket nevelő családok',
      '- A lakás a kérelmező tulajdonában van',
      '- Az ingatlan 1990 előtt épült (fűtéskorszerűsítésnél)',
      '- TB jogviszony vagy vállalkozói státusz',
      '## A VízVillanyFűtés segít!',
      'Cégünk teljes körű támogatást nyújt a pályázat során:',
      '- Ingyenes jogosultság ellenőrzés',
      '- Helyszíni felmérés és költségvetés készítése',
      '- Pályázati dokumentáció elkészítése',
      '- Kivitelezés pályázat-kompatibilis számlázással',
      '- Sikerdíjas konstrukció - csak sikeres pályázat esetén fizetendő',
      '## Hogyan kezdje el?',
      'Töltse ki online kalkulátorunkat, és 15 percen belül visszahívjuk!',
    ],
    category: 'palyazat',
    categoryLabel: 'Pályázatok',
    author: 'Szabó Anna',
    date: '2025. január 5.',
    readTime: '8 perc',
  },
  '4': {
    title: 'Miért nem melegszik a radiátor? 5 lehetséges ok',
    content: [
      'Ha a radiátor csak részben vagy egyáltalán nem melegszik, az nemcsak kellemetlen, de komoly energiapazarlást is okozhat. Nézzük meg a leggyakoribb okokat és megoldásokat!',
      '## 1. Levegő van a radiátorban',
      'A leggyakoribb probléma a légzsák. Ha a radiátor felső része hideg marad, míg az alja meleg, szinte biztos, hogy levegő van benne. Megoldás: légtelenítse a radiátort a légtelenítő szelepen keresztül, amíg víz nem jön ki.',
      '## 2. A termosztát szelep elakadt',
      'A termosztát szelep felelős a víz áramlásának szabályozásáért. Ha elakad (általában nyári állásban), a radiátor nem kap meleg vizet. Próbálja meg óvatosan mozgatni a szelep tűjét, vagy hívjon szakembert.',
      '## 3. A rendszer nincs beszabályozva',
      'Többlakásos házakban vagy nagyobb rendszereknél előfordulhat, hogy egyes radiátorok nem kapnak elég meleg vizet. Ilyenkor hidraulikai beszabályozás szükséges.',
      '## 4. Iszap és lerakódás a rendszerben',
      'Az évek során a fűtési rendszerben iszap, rozsda és vízkő rakódhat le. Ez csökkenti a hatékonyságot és eldugíthatja a radiátorokat. Megoldás: rendszer átmosatása szakemberrel.',
      '## 5. A kazán vagy keringető szivattyú hibás',
      'Ha egyik radiátor sem melegszik megfelelően, a probléma a központi egységgel lehet. A kazán vagy a keringető szivattyú meghibásodása az egész rendszert érinti.',
      '## Mikor hívjon szakembert?',
      'Ha a légtelenítés nem segít, vagy nem tudja azonosítani a problémát, ne próbálkozzon egyedül! A fűtési rendszer bonyolult, és a szakszerűtlen beavatkozás veszélyes lehet.',
      '## Megelőzés',
      'Évente egyszer érdemes átnézetni a fűtési rendszert. A VízVillanyFűtés csapata teljes körű fűtésrendszer karbantartást végez – foglaljon időpontot most!',
    ],
    category: 'futes',
    categoryLabel: 'Fűtés',
    author: 'Tóth Gábor',
    date: '2025. január 3.',
    readTime: '6 perc',
  },
  '5': {
    title: 'Leveri a Fi-relét – mit tegyek?',
    content: [
      'Ha gyakran "kivág" a Fi-relé (életvédelmi kapcsoló), az nem normális működés, és mindenképpen foglalkozni kell vele. Mutatjuk, mi lehet az ok és hogyan járjon el.',
      '## Mi az a Fi-relé és miért old ki?',
      'A Fi-relé (hibaáram-védőkapcsoló) véd az áramütéstől. Akkor old ki, ha szivárgó áramot érzékel – vagyis amikor az áram nem a megfelelő úton folyik vissza, hanem "elszökik" (például egy ember testén keresztül).',
      '## Leggyakoribb okok',
      '- **Nedvesség**: Párás fürdőszobában a készülékek könnyen nedvesedhetnek',
      '- **Hibás háztartási gép**: Mosógép, mosogatógép, bojler belső szigetelési hibája',
      '- **Sérült kábel**: Törött vagy megcsípett vezeték',
      '- **Kültéri készülékek**: Esővíz, pára a kerti lámpáknál, szivattyúknál',
      '- **Régi, elhasználódott Fi-relé**: A relé maga is meghibásodhat',
      '## Lépésről lépésre: mit tegyen?',
      '1. **Ne essen pánikba** – a Fi-relé pont azt csinálja, amit kell: védi Önt',
      '2. **Húzza ki az összes készüléket** az adott áramkörön',
      '3. **Próbálja visszakapcsolni** a Fi-relét',
      '4. **Egyenként dugja vissza** a készülékeket',
      '5. **Amelyiknél kiold**, az a hibás – ne használja tovább!',
      '## Ha nem találja a hibát',
      'Ha a fenti módszerrel nem sikerül megtalálni a hibás készüléket, vagy a Fi-relé készülékek nélkül is kiold, akkor a hiba a vezetékrendszerben van. Ilyenkor AZONNAL hívjon villanyszerelőt!',
      '## Fontos figyelmeztetés',
      'SOHA ne iktatja ki a Fi-relét, és ne próbálja áthidalni! Az Ön és családja életét védi. Inkább hívjon szakembert – a VízVillanyFűtés villanyszerelői akár aznap kiszállnak.',
    ],
    category: 'villany',
    categoryLabel: 'Villanyszerelés',
    author: 'Nagy Péter',
    date: '2024. december 28.',
    readTime: '4 perc',
  },
  '6': {
    title: 'Dugulásmegelőzés: egyszerű módszerek',
    content: [
      'A dugulás az egyik leggyakoribb és legkellemetlenebb háztartási probléma. A jó hír: a legtöbb dugulás megelőzhető néhány egyszerű szokás betartásával.',
      '## Mi okozza a dugulást?',
      'A lerakódások fokozatosan épülnek fel a csövekben. A leggyakoribb "bűnösök":',
      '- Zsír és olaj (konyha)',
      '- Haj és szappan (fürdőszoba)',
      '- Élelmiszer-maradékok',
      '- WC-papír túlzott használata',
      '- Nem lebomló anyagok (nedves törlőkendő, tampon)',
      '## 5 egyszerű megelőző szokás',
      '## 1. Soha ne öntse le a zsírt!',
      'A zsír és olaj a csövekben megdermed és lerakódik. Gyűjtse külön edénybe, és dobja a szemétbe.',
      '## 2. Használjon lefolyószűrőt',
      'Pár száz forintos befektetés, ami rengeteg bajt megelőz. A hajat és ételmaradékot felfogja, mielőtt a csőbe kerülne.',
      '## 3. Heti forró vizes öblítés',
      'Hetente egyszer öntsön le egy fazék forró vizet a lefolyókon. Ez feloldja a zsíros lerakódásokat.',
      '## 4. Szódabikarbóna + ecet havonta',
      'Természetes tisztítószer: szórjon a lefolyóba fél pohár szódabikarbónát, majd öntsön rá fél pohár ecetet. Hagyja 30 percig, majd öblítse forró vízzel.',
      '## 5. Figyeljen, mit önt/dob a WC-be',
      'A WC nem szemeteskuka! Csak WC-papír és emberi ürülék kerülhet bele. Minden más (törlőkendő, fültisztító, hajszál) dugulást okozhat.',
      '## Ha mégis dugulás van',
      'Először próbálkozzon pumpa (vákuumos) módszerrel. Ha nem segít, ne használjon agresszív vegyszereket – inkább hívjon szakembert! A VízVillanyFűtés gépi duguláselhárítása gyorsan és tisztán megoldja a problémát.',
    ],
    category: 'viz',
    categoryLabel: 'Vízszerelés',
    author: 'Kovács István',
    date: '2024. december 20.',
    readTime: '3 perc',
  },
  '7': {
    title: 'Energiatakarékos fűtési megoldások',
    content: [
      'A fűtés a háztartások egyik legnagyobb kiadása. De hogyan csökkentheti a számlát anélkül, hogy fázna? Mutatjuk a legjobb megoldásokat.',
      '## 1. Okos termosztát használata',
      'Az okos termosztát akár 20-30%-kal is csökkentheti a fűtésszámlát. Automatikusan csökkenti a hőmérsékletet, amikor nincs otthon, és felfűti a lakást mielőtt hazaér. Távolról is vezérelhető telefonról.',
      '## 2. Radiátor mögötti hőszigetelő fólia',
      'Olcsó és hatékony megoldás: a radiátor mögé helyezett alumínium hőszigetelő fólia visszaveri a hőt a szobába ahelyett, hogy a fal elnyelné.',
      '## 3. Nyílászárók szigetelése',
      'A hőveszteség jelentős része az ablakokon és ajtókon keresztül távozik. Ellenőrizze a tömítéseket, és szükség esetén cseréltesse ki őket.',
      '## 4. Hőmérséklet optimalizálása',
      'Minden 1°C csökkentés kb. 6% megtakarítást jelent. A 20-21°C ideális a nappaliban, 18°C a hálószobában, és 24°C a fürdőszobában.',
      '## 5. Rendszeres karbantartás',
      'A kazán éves karbantartása nemcsak a biztonság, hanem a hatékonyság szempontjából is fontos. Egy jól beállított kazán kevesebb gázt fogyaszt.',
      '## 6. Radiátorok szabadon hagyása',
      'Ne takarja le a radiátorokat bútorral vagy függönnyel! A hő így nem tud szabadon áramlani a szobában.',
      '## 7. Fűtéskorszerűsítés pályázattal',
      'Ha régi a kazánja, érdemes lehet korszerűsíteni. Az Otthonfelújítási Program keretében akár 50%-os támogatás is igényelhető. Érdeklődjön nálunk a lehetőségekről!',
      '## Hosszú távú megtakarítás',
      'A fenti tippek kombinálásával jelentős összeget spórolhat évente. Ha komolyabb korszerűsítésen gondolkodik, kérjen ingyenes felmérést a VízVillanyFűtéstől!',
    ],
    category: 'futes',
    categoryLabel: 'Fűtés',
    author: 'Tóth Gábor',
    date: '2024. december 15.',
    readTime: '7 perc',
  },
  '8': {
    title: 'LED világítás: előnyök és telepítés',
    content: [
      'A LED világítás mára az otthoni világítás alapja lett. Energiatakarékos, hosszú élettartamú, és rengeteg változatban kapható. Tudjon meg mindent a LED-ekről!',
      '## Miért válasszon LED-et?',
      '- **Energiatakarékosság**: 80-90%-kal kevesebb áramot fogyaszt, mint a hagyományos izzó',
      '- **Hosszú élettartam**: 15.000-50.000 óra működési idő (15-20 év normál használat mellett)',
      '- **Nem melegszik**: Biztonságosabb, és nem terheli a klímát nyáron',
      '- **Azonnali teljes fény**: Nem kell bevárni, mint az energiatakarékos izzóknál',
      '- **Környezetbarát**: Nem tartalmaz higanyt, újrahasznosítható',
      '## Hogyan válasszon LED izzót?',
      '## Fényerő (lumen)',
      'A LED izzóknál nem wattban, hanem lumenben mérjük a fényerőt:',
      '- 40W hagyományos = kb. 450 lumen',
      '- 60W hagyományos = kb. 800 lumen',
      '- 100W hagyományos = kb. 1600 lumen',
      '## Színhőmérséklet (Kelvin)',
      '- 2700K: Meleg fehér (nappaliba, hálószobába)',
      '- 4000K: Természetes fehér (konyhába, fürdőszobába)',
      '- 6500K: Hideg fehér (irodába, műhelybe)',
      '## Foglalat típusa',
      'Ellenőrizze a meglévő lámpatestek foglalatát: E27 (nagy), E14 (kis), GU10 (spot) a leggyakoribbak.',
      '## Telepítési tippek',
      '- Hagyományos izzó egyszerűen cserélhető LED-re',
      '- Halogén spotlámpáknál figyeljen a transzformátorra (LED-kompatibilis legyen)',
      '- Dimmerhez dimmelhető LED-et vegyen',
      '## Mikor hívjon szakembert?',
      'Egyszerű izzócserét bárki elvégezhet, de új lámpatest szerelése, kültéri világítás telepítése vagy bonyolultabb rendszerek már villanyszerelőt igényelnek. A VízVillanyFűtés szakemberei segítenek a világítás korszerűsítésében!',
    ],
    category: 'villany',
    categoryLabel: 'Villanyszerelés',
    author: 'Nagy Péter',
    date: '2024. december 10.',
    readTime: '5 perc',
  },
};

// Related posts
const relatedPosts = [
  { id: '4', title: 'Miért nem melegszik a radiátor? 5 lehetséges ok', category: 'futes' },
  { id: '5', title: 'Leveri a Fi-relét – mit tegyek?', category: 'villany' },
  { id: '6', title: 'Dugulásmegelőzés: egyszerű módszerek', category: 'viz' },
];

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = blogPosts[params.id];

  if (!post) {
    return { title: 'Cikk nem található | VízVillanyFűtés' };
  }

  return {
    title: `${post.title} | VízVillanyFűtés Blog`,
    description: post.content[0].substring(0, 160),
  };
}

const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  viz: Droplets,
  villany: Zap,
  futes: Flame,
  palyazat: Award,
};

const categoryColors: Record<string, string> = {
  viz: 'bg-sky-100 text-sky-700',
  villany: 'bg-amber-100 text-amber-700',
  futes: 'bg-orange-100 text-orange-700',
  palyazat: 'bg-emerald-100 text-emerald-700',
};

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPosts[params.id];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cikk nem található</h1>
          <p className="text-gray-600 mb-8">A keresett cikk nem létezik vagy törölve lett.</p>
          <Link href="/blog" className="btn-primary inline-flex">
            Vissza a bloghoz
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[post.category] || Droplets;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Vissza a bloghoz</span>
          </Link>

          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${categoryColors[post.category]}`}>
            <CategoryIcon className="w-4 h-4" />
            {post.categoryLabel}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-blue-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} olvasás</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  {post.content.map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }

                    // Simple bold text replacement for **text**
                    const renderInlineFormatting = (text: string) => {
                      const parts = text.split(/(\*\*.*?\*\*)/g);
                      return parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });
                    };

                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={index} className="list-disc list-inside text-gray-600 space-y-1 mb-2">
                          <li>{renderInlineFormatting(paragraph.replace('- ', ''))}</li>
                        </ul>
                      );
                    }
                    return (
                      <p key={index} className="text-gray-600 mb-4 leading-relaxed">
                        {renderInlineFormatting(paragraph)}
                      </p>
                    );
                  })}
                </div>

                {/* Share */}
                <ShareButtons
                  url={`https://www.vizvillanyfutes.hu/blog/${params.id}`}
                  title={post.title}
                />
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* CTA */}
              <div className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 rounded-2xl p-6 text-white mb-8 shadow-lg">
                <h3 className="font-bold text-xl mb-3">Sürgős segítség kell?</h3>
                <p className="text-blue-100 text-sm mb-6">
                  Add fel a munkát percek alatt, és válogass a közeledben lévő, ellenőrzött szakemberek ajánlatai közül!
                </p>
                <Link href="/login?role=customer" className="btn-primary w-full py-3 text-center flex items-center justify-center gap-2 mb-3">
                  <User className="w-5 h-5" />
                  Szakembert keresek
                </Link>
                <Link href="/csatlakozz-partnerkent" className="w-full py-3 text-center flex items-center justify-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                  Szakember vagyok, csatlakozom
                </Link>
              </div>

              {/* Related Posts */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Kapcsolódó cikkek</h3>
                <div className="space-y-4">
                  {relatedPosts.map((relPost) => (
                    <Link
                      key={relPost.id}
                      href={`/blog/${relPost.id}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-vvm-blue-600 flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                        <span className="text-gray-700 group-hover:text-vvm-blue-600 transition-colors">
                          {relPost.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

