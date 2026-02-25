'use client';

import Link from 'next/link';
import {
  Droplets, Zap, Flame, CheckCircle, AlertTriangle,
  Calendar, Phone, HelpCircle, ChevronDown, Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';

// Price categories
const priceCategories = [
  {
    id: 'viz',
    name: 'Vízszerelés',
    icon: Droplets,
    color: 'bg-sky-500',
    colorLight: 'bg-sky-100 text-sky-700',
    prices: [
      { name: 'Kiszállási díj', price: '5 900 Ft', note: 'Budapest teljes területén' },
      { name: 'Mosdó csaptelep csere', price: '16 500 Ft-tól', includes: 'Munkadíj + segédanyagok' },
      { name: 'Konyhai csaptelep csere', price: '18 500 Ft-tól', includes: 'Munkadíj + segédanyagok' },
      { name: 'WC tartály javítás', price: '12 000 Ft-tól', includes: 'Munkadíj + kisebb alkatrészek' },
      { name: 'WC tartály csere', price: '24 500 Ft-tól', includes: 'Munkadíj, tartály külön' },
      { name: 'Szifon csere', price: '8 500 Ft-tól', includes: 'Munkadíj + standard szifon' },
      { name: 'Bojler vízkőtelenítés', price: '19 500 Ft-tól', includes: 'Teljes körű karbantartás' },
      { name: 'Bojler csere (80L)', price: '32 000 Ft-tól', includes: 'Munkadíj, bojler külön' },
      { name: 'Csőtörés elhárítás', price: '25 000 Ft-tól', includes: 'SOS felár nélkül' },
      { name: 'Duguláselhárítás (kézi)', price: '15 000 Ft-tól', includes: 'Standard dugulás' },
      { name: 'Duguláselhárítás (gépi)', price: '28 000 Ft-tól', includes: 'Súlyosabb dugulás' },
    ],
  },
  {
    id: 'villany',
    name: 'Villanyszerelés',
    icon: Zap,
    color: 'bg-amber-500',
    colorLight: 'bg-amber-100 text-amber-700',
    prices: [
      { name: 'Kiszállási díj', price: '5 900 Ft', note: 'Budapest teljes területén' },
      { name: 'Konnektor csere', price: '8 500 Ft-tól', includes: 'Munkadíj + standard konnektor' },
      { name: 'Kapcsoló csere', price: '7 500 Ft-tól', includes: 'Munkadíj + kapcsoló' },
      { name: 'Lámpa szerelés (egyszerű)', price: '9 000 Ft-tól', includes: 'Munkadíj' },
      { name: 'Lámpa szerelés (csillár)', price: '15 000 Ft-tól', includes: 'Munkadíj' },
      { name: 'Fi-relé beépítés', price: '18 500 Ft-tól', includes: 'Munkadíj + Fi-relé' },
      { name: 'Biztosítéktábla bővítés', price: '25 000 Ft-tól', includes: 'Munkadíj' },
      { name: 'Biztosítéktábla csere', price: '45 000 Ft-tól', includes: 'Munkadíj + tábla' },
      { name: 'Hibaelhárítás', price: '12 000 Ft-tól', includes: 'Diagnosztika + javítás' },
      { name: 'Átvezetékelés (szoba)', price: '85 000 Ft-tól', includes: 'Munkadíj + anyag' },
      { name: 'EV töltő telepítés', price: '65 000 Ft-tól', includes: 'Munkadíj + bekötés' },
    ],
  },
  {
    id: 'futes',
    name: 'Fűtés',
    icon: Flame,
    color: 'bg-orange-500',
    colorLight: 'bg-orange-100 text-orange-700',
    prices: [
      { name: 'Kiszállás + felmérés', price: '9 900 Ft', note: 'Levonva megrendeléskor' },
      { name: 'Radiátor csere (db)', price: '18 000 Ft-tól', includes: 'Munkadíj, radiátor külön' },
      { name: 'Termosztát szelep csere', price: '8 500 Ft-tól', includes: 'Munkadíj + szelep' },
      { name: 'Termosztát fej csere', price: '6 500 Ft-tól', includes: 'Munkadíj + fej' },
      { name: 'Radiátor légtelenítés', price: '4 500 Ft/db', includes: 'Teljes körű' },
      { name: 'Padlófűtés elosztó szerelés', price: '35 000 Ft-tól', includes: 'Munkadíj' },
      { name: 'Hidraulikai beszabályozás', price: '45 000 Ft-tól', includes: 'Teljes rendszer' },
      { name: 'Kazán bekötés előkészítés', price: '55 000 Ft-tól', includes: 'Víz-oldali munkák' },
      { name: 'Fűtésrendszer korszerűsítés', price: 'Egyedi árajánlat', includes: 'Helyszíni felmérés alapján' },
    ],
  },
];

// FAQ
const faqs = [
  {
    q: 'Mi tartozik a kiszállási díjba?',
    a: 'A kiszállási díj tartalmazza a helyszínre érkezést Budapest bármely kerületében, a probléma felmérését és a pontos árajánlat elkészítését. Ha a javítást elfogadja, a kiszállási díj nem kerül külön felszámolásra.'
  },
  {
    q: 'Az anyagárak benne vannak az árban?',
    a: 'Az árak általában a munkadíjat és a segédanyagokat (tömítések, csavarok stb.) tartalmazzák. A nagyobb anyagok (csaptelep, bojler, radiátor stb.) ára külön kerül felszámolásra. Ezeket a helyszíni felméréskor pontosan megadjuk.'
  },
  {
    q: 'Mikor kell SOS felárat fizetni?',
    a: 'SOS felár (a munkadíj +50%-a) fizetendő éjszakai (20:00-08:00), hétvégi és ünnepnapi kiszállás esetén, valamint sürgős, 2 órán belüli kiszállás esetén. Ezt a foglalásnál mindig előre jelezzük.'
  },
  {
    q: 'Hogyan fizethetek?',
    a: 'Fizethet készpénzzel vagy bankkártyával a helyszínen a munka végeztével. Céges ügyfeleknek átutalás is lehetséges előzetes egyeztetés alapján.'
  },
  {
    q: 'Kapok garanciát a munkára?',
    a: 'Igen! Minden elvégzett munkára minimum 1 év garanciát vállalunk. Anyaggal végzett munkák esetén az anyag gyártói garanciája is érvényes (általában 2-5 év).'
  },
];

export default function ArakPage() {
  const [activeCategory, setActiveCategory] = useState('viz');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Handle URL hash for direct category links
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && priceCategories.some(c => c.id === hash)) {
      setActiveCategory(hash);
    }
  }, []);

  const currentCategory = priceCategories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Breadcrumbs className="mb-6 justify-center text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Áraink
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Átlátható, fix árak – nincsenek rejtett költségek.
          </p>
          <p className="text-blue-200">
            A pontos árat minden esetben a helyszíni felmérés után adjuk meg.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30">
        <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-start sm:justify-center gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {priceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === cat.id
                    ? `${cat.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <cat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Price Table */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentCategory && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`${currentCategory.color} text-white p-6`}>
                <div className="flex items-center gap-3">
                  <currentCategory.icon className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">{currentCategory.name} árak</h2>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {currentCategory.prices.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.includes && (
                        <div className="text-sm text-gray-500">{item.includes}</div>
                      )}
                      {item.note && (
                        <div className="text-sm text-gray-500">{item.note}</div>
                      )}
                    </div>
                    <div className={`font-bold text-lg ${currentCategory.id === 'viz' ? 'text-sky-600' :
                        currentCategory.id === 'villany' ? 'text-amber-600' :
                          'text-orange-600'
                      }`}>
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>SOS felár:</strong> Éjszakai (20:00-08:00), hétvégi, ünnepnapi és sürgős kiszállás
                esetén a munkadíj +50%-a kerül felszámolásra.
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Megjegyzés:</strong> Az árak tájékoztató jellegűek és az anyagárat nem tartalmazzák.
                A végleges árat a helyszíni felmérés után adjuk meg, az elfogadás előtt.
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Kérjen személyre szabott árajánlatot!
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/foglalas" className="btn-primary py-4 px-8">
                <Calendar className="w-5 h-5" />
                <span>Időpontfoglalás</span>
              </Link>
              <a href="mailto:info@vizvillanyfutes.hu" className="btn-outline py-4 px-8">
                <Phone className="w-5 h-5" />
                <span>info@vizvillanyfutes.hu</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Mit tartalmaz az ár?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Benne van az árban
              </h3>
              <ul className="space-y-3">
                {[
                  'Kiszállás Budapest teljes területén',
                  'Probléma felmérése és diagnosztika',
                  'Munkadíj',
                  'Segédanyagok (tömítések, csavarok stb.)',
                  'Takarítás a munka után',
                  'Minimum 1 év garancia',
                  'Hivatalos számla',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Külön kerül felszámolásra
              </h3>
              <ul className="space-y-3">
                {[
                  'Nagyobb anyagok (csaptelep, bojler stb.)',
                  'SOS felár (éjszaka, hétvége)',
                  'Pest megyei kiszállás (távolságtól függően)',
                  'Speciális anyagok, alkatrészek',
                  'Nagyobb bontási munkák',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <span className="w-4 h-4 flex items-center justify-center text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Gyakran ismételt kérdések
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-vvm-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="pl-8 text-gray-600 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
