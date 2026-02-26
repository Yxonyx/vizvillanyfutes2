'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Search, Phone, Calendar, Droplets, CreditCard, Shield, Wrench, User } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const faqCategories = [
  { id: 'all', name: 'Összes', icon: HelpCircle },
  { id: 'platform', name: 'A platform', icon: Droplets },
  { id: 'ugyfelek', name: 'Ügyfeleknek', icon: Calendar },
  { id: 'szakemberek', name: 'Szakembereknek', icon: Shield },
  { id: 'arak', name: 'Árak & Fizetés', icon: CreditCard },
];

const faqs = [
  // --- A platform ---
  {
    id: 1,
    category: 'platform',
    question: 'Mi az a VízVillanyFűtés platform?',
    answer: 'A VízVillanyFűtés egy online piactér, amely összeköti azokat, akiknek víz-, villany- vagy fűtésszerelőre van szükségük, a közelükben lévő, ellenőrzött szakemberekkel. Nem mi végezzük a munkát – mi biztosítjuk a platformot, ahol a legjobb szakembert megtalálhatod.'
  },
  {
    id: 2,
    category: 'platform',
    question: 'Hogyan működik a rendszer?',
    answer: 'Egyszerű: bejelented a problémádat (pl. csőtörés, villanyszerelés), a közeledben lévő szakemberek azonnal értesítést kapnak, majd versengő ajánlatokat küldenek neked. Te kiválasztod a számodra legjobb ajánlatot – ár, értékelés és elérhetőség alapján.'
  },
  {
    id: 3,
    category: 'platform',
    question: 'Milyen területen érhető el a szolgáltatás?',
    answer: 'Jelenleg Budapest összes kerületében és Pest megye településein érhető el a platform. Folyamatosan bővítjük a lefedett területeket – hamarosan vidéki városokban is elérhető leszünk.'
  },
  {
    id: 4,
    category: 'platform',
    question: 'Ellenőrzöttek a szakemberek?',
    answer: 'Igen! Minden szakember regisztrációja ellenőrzésen esik át. Kizárólag számlaképes, valós vállalkozással rendelkező mesterek kerülhetnek a platformra. Emellett az ügyfelek értékelései is segítenek a legjobb szakember kiválasztásában.'
  },

  // --- Ügyfeleknek ---
  {
    id: 5,
    category: 'ugyfelek',
    question: 'Hogyan tudok szakembert keresni?',
    answer: 'A főoldalon kattints az „Ügyfél vagyok" gombra, írd le a problémádat pár szóban, add meg a címedet, és a rendszer azonnal értesíti a közeledben lévő szakembereket. Perceken belül ajánlatokat kapsz.'
  },
  {
    id: 6,
    category: 'ugyfelek',
    question: 'Ingyenes az ajánlatkérés?',
    answer: 'Igen, az ajánlatkérés teljesen ingyenes az ügyfelek számára. Semmilyen regisztrációs díjat vagy platformdíjat nem számolunk fel. A fizetés közvetlenül a szakemberrel történik a munka elvégzése után.'
  },
  {
    id: 7,
    category: 'ugyfelek',
    question: 'Honnan tudom, hogy jó szakembert választok?',
    answer: 'Minden szakembernek van profilja, amelyen látható a korábbi munkáinak értékelése, a tapasztalata és az elérhetősége. Az ügyfelek valós értékeléseket hagynak, így könnyedén kiválaszthatod a legmegbízhatóbb mestert.'
  },
  {
    id: 8,
    category: 'ugyfelek',
    question: 'Mi van, ha sürgős a probléma (pl. csőtörés)?',
    answer: 'SOS hibabejelentésnél a rendszer kiemelt, azonnali értesítést küld a közeledben elérhető szakembereknek. Ilyen esetben a szakemberek jellemzően perceken belül válaszolnak, és akár 1-2 órán belül a helyszínre érhetnek.'
  },
  {
    id: 9,
    category: 'ugyfelek',
    question: 'Lemondhatom az ajánlatot vagy a megbeszélt időpontot?',
    answer: 'Igen, amíg a munka el nem kezdődik, bármikor lemondhatod. Javasoljuk, hogy minél előbb jelezd a lemondást a kiválasztott szakembernek, hogy ő is tudjon tervezni.'
  },

  // --- Szakembereknek ---
  {
    id: 10,
    category: 'szakemberek',
    question: 'Hogyan csatlakozhatok a platformhoz szakemberként?',
    answer: 'A „Szakember vagyok" gombra kattintva egyszerűen regisztrálhatsz. Szükséged lesz egy érvényes vállalkozói igazolásra és számlaképességre. A regisztrációt követően profilod ellenőrzésen esik át, és utána azonnal elkezdhetsz ajánlatokat adni.'
  },
  {
    id: 11,
    category: 'szakemberek',
    question: 'Mennyibe kerül a regisztráció szakembereknek?',
    answer: 'A regisztráció ingyenes! A platform kredit-alapú rendszerrel működik: 10.000 Ft induló kreditet kapsz, és csak akkor fizetsz, ha egy megbízást elfogadsz. Nincs havidíj, nincs százalékos jutalék – kizárólag az elfogadott munkáknál használsz kreditet.'
  },
  {
    id: 12,
    category: 'szakemberek',
    question: 'Hogyan kapok értesítést új munkákról?',
    answer: 'A közeledben feladott hibabejelentésekről azonnal push értesítést kapsz. Beállíthatod, hogy milyen típusú munkákat (víz, villany, fűtés) és milyen távolságon belül szeretnéd fogadni.'
  },
  {
    id: 13,
    category: 'szakemberek',
    question: 'Hogyan építhetem a reputációmat?',
    answer: 'Minden elvégzett munka után az ügyfél értékelést hagy, amelyben pontozza a munkád minőségét, a pontosságodat és az árazásodat. Minél jobb értékeléseid vannak, annál előrébb jelensz meg a listában, és annál több megbízást kaphatsz.'
  },

  // --- Árak & Fizetés ---
  {
    id: 14,
    category: 'arak',
    question: 'Mennyibe kerül egy szerelő?',
    answer: 'Az árakat közvetlenül a szakemberek adják meg ajánlatukban. A VízVillanyFűtés nem szab meg fix árakat – a szakemberek versenyeznek egymással, így Te mindig versenyképes, átlátható árat kapsz. Az Árak oldalon tájékoztató, piaci átlagárakat találsz.'
  },
  {
    id: 15,
    category: 'arak',
    question: 'Hogyan fizetek a szakembernek?',
    answer: 'A fizetés közvetlenül a szakemberrel történik, a munka elvégzése után. A legtöbb mester elfogad készpénzt és bankkártyát is. Az árat és a fizetési módot előre megbeszélitek.'
  },
  {
    id: 16,
    category: 'arak',
    question: 'Kapok számlát a munkáról?',
    answer: 'Igen! Kizárólag számlaképes vállalkozással rendelkező szakemberek regisztrálhatnak a platformra, tehát minden munkáról hivatalos számlát kapsz, ami pályázatokhoz is felhasználható.'
  },
  {
    id: 17,
    category: 'arak',
    question: 'Kell-e a platformnak fizetnem?',
    answer: 'Ügyfeleknek a platform használata teljesen ingyenes. Szakembereknek kredit-alapú rendszerrel működik: csak akkor „fizetsz", ha elfogadsz egy megbízást. Nincs havi előfizetés, nincs jutalékrendszer.'
  },
];

export default function GyikPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery === '' || matchesSearch);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Breadcrumbs className="mb-6 justify-center text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Gyakran Ismételt Kérdések
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Válaszok a leggyakrabban felmerülő kérdésekre
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Keresés a kérdések között..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 bg-white shadow-lg focus:ring-2 focus:ring-vvm-yellow-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${activeCategory === cat.id
                  ? 'bg-vvm-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-vvm-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                  </button>

                  {openFaq === faq.id && (
                    <div className="px-5 pb-5 pt-0 animate-fade-in">
                      <div className="pl-8 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nincs találat a keresésre.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 text-vvm-blue-600 font-medium hover:underline"
              >
                Összes kérdés megtekintése
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Nem találta meg a választ?
          </h2>
          <p className="text-gray-600 mb-8">
            Vegye fel velünk a kapcsolatot, vagy próbálja ki a platformot – az ajánlatkérés ingyenes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=customer" className="btn-primary py-4 px-8">
              <User className="w-5 h-5" />
              <span>Ingyenes ajánlatkérés</span>
            </Link>
            <Link href="/csatlakozz-partnerkent" className="btn-outline py-4 px-8">
              <Wrench className="w-5 h-5" />
              <span>Szakemberként csatlakozom</span>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Vagy hívjon minket: <a href="tel:+36302696406" className="text-vvm-blue-600 hover:underline">+36 30 269 6406</a>
          </p>
        </div>
      </section>
    </div>
  );
}

