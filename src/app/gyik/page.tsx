'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Search, Phone, Calendar, Droplets, Zap, Flame, CreditCard, Shield, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const faqCategories = [
  { id: 'all', name: 'Összes', icon: HelpCircle },
  { id: 'szolgaltatas', name: 'Szolgáltatás', icon: Droplets },
  { id: 'arak', name: 'Árak', icon: CreditCard },
  { id: 'foglalas', name: 'Foglalás', icon: Calendar },
  { id: 'garancia', name: 'Garancia', icon: Shield },
];

const faqs = [
  {
    id: 1,
    category: 'szolgaltatas',
    question: 'Milyen szolgáltatásokat nyújtanak?',
    answer: 'Teljes körű víz-, villany- és fűtésszerelési szolgáltatásokat nyújtunk. Ez magában foglalja a csőtörés elhárítást, duguláselhárítást, villanyszerelést, biztosítéktábla cserét, fűtéskorszerűsítést, kazáncserét és sok mást. Részletes listát az Árak oldalon talál.'
  },
  {
    id: 2,
    category: 'szolgaltatas',
    question: 'Hol működnek, mely területeken vállalnak munkát?',
    answer: 'Budapesten (minden kerületben) és Pest megye településein vállalunk munkát. SOS hibaelhárítás esetén Budapest teljes területén 2 órán belül a helyszínen vagyunk.'
  },
  {
    id: 3,
    category: 'szolgaltatas',
    question: 'Dolgoznak hétvégén és ünnepnapokon is?',
    answer: 'Igen, SOS hibaelhárítást 0-24 órában, az év minden napján vállalunk. Hétvégi és ünnepnapi kiszállás esetén a munkadíjra +50% felár kerül felszámolásra.'
  },
  {
    id: 4,
    category: 'arak',
    question: 'Mennyibe kerül a kiszállás?',
    answer: 'A kiszállási díj Budapest teljes területén egységesen 5.900 Ft. Ha a munkát elfogadja és elvégezzük, ez az összeg nem kerül külön felszámolásra, beépül a munkadíjba.'
  },
  {
    id: 5,
    category: 'arak',
    question: 'Az anyagárak benne vannak az árban?',
    answer: 'Az alapárak a munkadíjat és a segédanyagokat (tömítések, csavarok stb.) tartalmazzák. Nagyobb anyagok (csaptelep, bojler, radiátor) ára külön kerül felszámolásra, amit a helyszíni felméréskor pontosan megadunk.'
  },
  {
    id: 6,
    category: 'arak',
    question: 'Hogyan fizethetek?',
    answer: 'Fizethet készpénzzel vagy bankkártyával a helyszínen a munka végeztével. Céges ügyfeleknek átutalás is lehetséges előzetes egyeztetés alapján.'
  },
  {
    id: 7,
    category: 'foglalas',
    question: 'Hogyan tudok időpontot foglalni?',
    answer: 'Időpontot foglalhat online a weboldalunkon vagy visszahívást kérhet. Online foglalásnál azonnal látja az elérhető időpontokat és a becsült árat.'
  },
  {
    id: 8,
    category: 'foglalas',
    question: 'Mennyi időn belül tudnak jönni?',
    answer: 'SOS hibaelhárítás esetén (csőtörés, áramkimaradás) 2 órán belül a helyszínen vagyunk. Normál foglalás esetén általában 1-3 munkanapon belül tudunk időpontot adni.'
  },
  {
    id: 9,
    category: 'foglalas',
    question: 'Lemondhatom a foglalást?',
    answer: 'Igen, a munka megkezdése előtt 24 órával díjmentesen lemondható. 24 órán belüli lemondás esetén a kiszállási díj felszámolásra kerülhet.'
  },
  {
    id: 10,
    category: 'garancia',
    question: 'Kapok garanciát a munkára?',
    answer: 'Igen! Minden elvégzett munkára minimum 12 hónap garanciát vállalunk. A beépített anyagokra a gyártói garancia érvényes (általában 2-5 év). A garancia részleteit a számla melléklete tartalmazza.'
  },
  {
    id: 11,
    category: 'garancia',
    question: 'Mi történik, ha probléma van a munkával?',
    answer: 'Ha a garancia ideje alatt bármilyen probléma merül fel az elvégzett munkával kapcsolatban, díjmentesen kijavítjuk. Minden munkánkra 1 év garancia van.'
  },
  {
    id: 12,
    category: 'garancia',
    question: 'Kapok számlát a munkáról?',
    answer: 'Természetesen! Minden munkáról hivatalos, NAV-kompatibilis számlát állítunk ki, amely pályázatokhoz is felhasználható. A számlát letöltheti az ügyfélfiókjából.'
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
            Lépjen kapcsolatba ügyfélszolgálatunkkal, szívesen segítünk!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+36302696406" className="btn-primary py-4 px-8">
              <Phone className="w-5 h-5" />
              <span>+36 30 269 6406</span>
            </a>
            <Link href="/kapcsolat" className="btn-outline py-4 px-8">
              <span>Kapcsolatfelvétel</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

