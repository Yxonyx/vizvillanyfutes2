'use client';

import Link from 'next/link';
import {
  Droplets, CheckCircle, ArrowRight, Phone, Calendar, Clock,
  Shield, Star, MapPin, ChevronDown, Play, AlertTriangle,
  Wrench, Award, FileCheck, ThumbsUp, HelpCircle
} from 'lucide-react';
import { useState } from 'react';

// Price list data
const priceList = [
  { name: 'Kiszállási díj', price: '5 900 Ft', note: 'Budapest teljes területén' },
  { name: 'Mosdó csaptelep csere', price: '16 500 Ft-tól', includes: 'Munkadíj + segédanyagok' },
  { name: 'Konyhai csaptelep csere', price: '18 500 Ft-tól', includes: 'Munkadíj + segédanyagok' },
  { name: 'WC tartály javítás', price: '12 000 Ft-tól', includes: 'Munkadíj + kisebb alkatrészek' },
  { name: 'WC tartály csere', price: '24 500 Ft-tól', includes: 'Munkadíj, tartály külön' },
  { name: 'Szifon csere', price: '8 500 Ft-tól', includes: 'Munkadíj + standard szifon' },
  { name: 'Bojler vízkőtelenítés', price: '19 500 Ft-tól', includes: 'Teljes körű karbantartás' },
  { name: 'Bojler csere (80L)', price: '32 000 Ft-tól', includes: 'Munkadíj, bojler külön' },
  { name: 'Csőtörés elhárítás', price: '25 000 Ft-tól', includes: 'Éjszaka/hétvége +50%' },
  { name: 'Duguláselhárítás (kézi)', price: '15 000 Ft-tól', includes: 'Standard dugulás' },
  { name: 'Duguláselhárítás (gépi)', price: '28 000 Ft-tól', includes: 'Súlyosabb dugulás' },
];

// FAQ data
const faqs = [
  {
    question: 'Mennyi idő alatt tudnak kijönni?',
    answer: 'Normál esetben 2-3 munkanapon belül tudunk időpontot adni. SOS hibaelhárítás (csőtörés, súlyos vízszivárgás) esetén akár 2 órán belül is a helyszínen vagyunk – ez esetben +50% expressz felár fizetendő.'
  },
  {
    question: 'Mi van, ha nem tudom pontosan, mi a probléma?',
    answer: 'Semmi gond! A szakember a helyszínen felmérést végez és megállapítja a pontos hibát. A felmérés a kiszállási díjban benne van. Ha a javítást elfogadja, a kiszállási díj nem kerül felszámolásra külön.'
  },
  {
    question: 'Kapok garanciát a munkára?',
    answer: 'Igen! Minden elvégzett munkára minimum 1 év garanciát vállalunk. Anyaggal végzett munkák esetén az anyag gyártói garanciája is érvényes (általában 2-5 év).'
  },
  {
    question: 'Mi történik, ha a javítás után újra elromlik?',
    answer: 'A garancia időn belül ingyenesen kijövünk és kijavítjuk a hibát. Ha a probléma más okból merül fel, új árajánlatot adunk, de kedvezményes kiszállási díjat alkalmazunk törzsvásárlóinknak.'
  },
  {
    question: 'Kaphatok számlát a munkáról?',
    answer: 'Természetesen! Minden munkáról hivatalos, NAV-kompatibilis számlát állítunk ki, ami pályázatokhoz (pl. Otthonfelújítási Program) is felhasználható.'
  },
  {
    question: 'Hogyan tudok fizetni?',
    answer: 'Készpénzzel vagy bankkártyával a helyszínen a munka végeztével. Céges ügyfeleknek átutalás is lehetséges előzetes egyeztetés alapján.'
  },
];

// Services list
const services = [
  {
    id: 'csotores',
    name: 'Csőtörés elhárítás',
    description: 'Gyors, professzionális csőtörés javítás 0-24 órában. Minden típusú cső (réz, műanyag, acél) esetén.',
    sos: true,
  },
  {
    id: 'dugulas',
    name: 'Duguláselhárítás',
    description: 'Kézi és gépi duguláselhárítás. Mosogató, lefolyó, WC, fővezeték dugulás megszüntetése.',
    sos: true,
  },
  {
    id: 'csaptelep',
    name: 'Csaptelep szerelés',
    description: 'Csaptelep javítás és csere. Minden típusú csaptelep: konyhai, fürdőszobai, kádtöltő.',
  },
  {
    id: 'wc',
    name: 'WC szerelés',
    description: 'WC tartály javítás és csere, öblítőszelep, lebegő WC szerelés, komplett WC csere.',
  },
  {
    id: 'bojler',
    name: 'Bojler szerelés',
    description: 'Villanybojler javítás, vízkőtelenítés, csere. 30-200 literes bojlerek szerelése.',
  },
  {
    id: 'szifon',
    name: 'Szifon csere',
    description: 'Mosdó, mosogató, zuhanytálca szifon csere. Szagzáras szifonok beépítése.',
  },
];

export default function VizszereloPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-600 overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Droplets className="w-4 h-4" />
                <span>Vízszerelés Budapest</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Vízszerelő Budapest
              </h1>

              <p className="text-xl text-sky-100 mb-8">
                Professzionális vízszerelés Budapesten és Pest megyében.
                Csőtörés, dugulás, csaptelep csere – gyors, garanciális munkavégzés fix árakkal.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sky-100">
                  <CheckCircle className="w-5 h-5 text-cyan-300" />
                  <span>0-24 SOS kiszállás</span>
                </div>
                <div className="flex items-center gap-2 text-sky-100">
                  <CheckCircle className="w-5 h-5 text-cyan-300" />
                  <span>1 év garancia</span>
                </div>
                <div className="flex items-center gap-2 text-sky-100">
                  <CheckCircle className="w-5 h-5 text-cyan-300" />
                  <span>Garancia minden munkára</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login?role=customer" className="btn-primary py-4 px-8 text-lg">
                  <Calendar className="w-5 h-5" />
                  <span>Időpontfoglalás</span>
                </Link>
                <Link href="/visszahivas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 border border-white/20">
                  <Phone className="w-5 h-5" />
                  <span>Visszahívást kérek</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <Droplets className="w-8 h-8 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">4.9★</div>
                    <div className="text-sky-200">500+ értékelés</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-300" />
                      <div>
                        <div className="font-semibold text-white">2 órán belül</div>
                        <div className="text-sm text-sky-200">SOS kiszállás</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-cyan-300" />
                      <div>
                        <div className="font-semibold text-white">Garanciális munkavégzés</div>
                        <div className="text-sm text-sky-200">Min. 1 év garancia</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-cyan-300" />
                      <div>
                        <div className="font-semibold text-white">Hivatalos számla</div>
                        <div className="text-sm text-sky-200">Pályázathoz elfogadott</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white" id="szolgaltatasok">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Vízszerelési szolgáltatásaink
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teljes körű vízszerelési szolgáltatás háztartásoknak és vállalkozásoknak.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                id={service.id}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow scroll-mt-24"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-sky-600" />
                  </div>
                  {service.sos && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      SOS
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link
                  href={`/login?role=customer`}
                  className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700"
                >
                  <span>Időpont kérése</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Hogyan dolgozunk?
            </h2>
            <p className="text-lg text-gray-600">
              Átlátható folyamat a hibabejelentéstől a megoldásig.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Foglalás', desc: 'Online hibabejelentés és időpontfoglalás.' },
              { icon: Wrench, title: 'Felmérés', desc: 'A szakember felméri a problémát helyszínen.' },
              { icon: ThumbsUp, title: 'Javítás', desc: 'Elfogadott árajánlat után azonnal dolgozunk.' },
              { icon: Award, title: 'Garancia', desc: 'Garanciális munka, hivatalos számlával.' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-sky-600" />
                </div>
                <div className="text-2xl font-bold text-sky-600 mb-2">{index + 1}.</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price List */}
      <section className="py-16 bg-white" id="arak">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Vízszerelési áraink
            </h2>
            <p className="text-lg text-gray-600">
              Átlátható, fix árak – nincsenek rejtett költségek.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 bg-sky-600 text-white font-semibold">
              <div>Szolgáltatás</div>
              <div className="text-center">Ár</div>
              <div className="text-right">Tartalmazza</div>
            </div>

            {priceList.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-4 items-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
              >
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-center text-sky-600 font-bold">{item.price}</div>
                <div className="text-right text-sm text-gray-500">{item.includes || item.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Megjegyzés:</strong> Az árak tájékoztató jellegűek, az anyagárat nem tartalmazzák.
              A pontos árat a helyszíni felmérés után adjuk meg. SOS (éjszaka, hétvége, ünnepnap) +50% felár.
            </p>
          </div>

          <div className="text-center mt-8">
            <Link href="/login?role=customer" className="btn-primary inline-flex py-4 px-8">
              <Calendar className="w-5 h-5" />
              <span>Kérjen árajánlatot</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Gyakran ismételt kérdések
            </h2>
          </div>

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
                    <HelpCircle className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="pl-8 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Szolgáltatási területünk
            </h2>
            <p className="text-lg text-gray-600">
              Budapest teljes területén és Pest megyében vállalunk munkát.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-gray-100 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3" />
                <p>Térkép</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Budapest I-XXIII. kerület</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {[...Array(23)].map((_, i) => (
                  <span key={i} className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    {i + 1}. ker.
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Pest megye kiemelt települések</h3>
              <div className="flex flex-wrap gap-2">
                {['Budaörs', 'Érd', 'Szigetszentmiklós', 'Dunakeszi', 'Szentendre', 'Gödöllő', 'Vác', 'Törökbálint'].map((city) => (
                  <span key={city} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Szüksége van vízszerelőre?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Foglaljon időpontot online vagy hívjon minket – SOS esetén 2 órán belül a helyszínen vagyunk!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=customer" className="btn-primary py-4 px-10 text-lg">
              <Calendar className="w-6 h-6" />
              <span>Online foglalás</span>
            </Link>
            <Link href="/visszahivas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-lg border border-white/20">
              <Phone className="w-6 h-6" />
              <span>Visszahívást kérek</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

