'use client';

import Link from 'next/link';
import {
  Zap, CheckCircle, ArrowRight, Phone, Calendar, Clock,
  Shield, Star, MapPin, ChevronDown, AlertTriangle,
  Wrench, Award, FileCheck, ThumbsUp, HelpCircle, Lightbulb,
  Car, Home, Settings
} from 'lucide-react';
import { useState } from 'react';

// Price list data
const priceList = [
  { name: 'Kiszállási díj', price: '5 900 Ft', note: 'Budapest teljes területén' },
  { name: 'Konnektor csere', price: '8 500 Ft-tól', includes: 'Munkadíj + standard konnektor' },
  { name: 'Kapcsoló csere', price: '7 500 Ft-tól', includes: 'Munkadíj + kapcsoló' },
  { name: 'Lámpa szerelés (egyszerű)', price: '9 000 Ft-tól', includes: 'Munkadíj' },
  { name: 'Lámpa szerelés (csillár)', price: '15 000 Ft-tól', includes: 'Munkadíj' },
  { name: 'Fi-relé beépítés', price: '18 500 Ft-tól', includes: 'Munkadíj + Fi-relé' },
  { name: 'Biztosítéktábla bővítés', price: '25 000 Ft-tól', includes: 'Munkadíj' },
  { name: 'Biztosítéktábla csere', price: '45 000 Ft-tól', includes: 'Munkadíj + tábla' },
  { name: 'Teljes átvezetékelés (szoba)', price: '85 000 Ft-tól', includes: 'Munkadíj + anyag' },
  { name: 'EV töltő telepítés', price: '65 000 Ft-tól', includes: 'Munkadíj + bekötés' },
  { name: 'Hibaelhárítás', price: '12 000 Ft-tól', includes: 'Diagnosztika + javítás' },
];

// FAQ data
const faqs = [
  {
    question: 'Mikor van szükség villanyszerelőre?',
    answer: 'Villanyszerelőre akkor van szükség, ha nincs áram a lakásban vagy annak egy részén, ha "leveri a biztosítékot" vagy Fi-relét, ha égett szagot érez a konnektorok, kapcsolók környékén, vagy ha új elektromos berendezést szeretne felszereltetni. Soha ne próbáljon meg elektromos javítást végezni szakember nélkül!'
  },
  {
    question: 'Mennyire sürgős, ha nincs áram?',
    answer: 'Ha a teljes lakásban nincs áram, érdemes először ellenőrizni, hogy nem-e az elektromos szolgáltatónál van a hiba (szomszédoknál is kikapcsolt-e). Ha csak Önnél nincs, az SOS kategória – azonnal hívjon minket! Ha csak részlegesen van áram, az kevésbé sürgős, de mielőbb vizsgáltassa meg.'
  },
  {
    question: 'Mi az a Fi-relé és miért fontos?',
    answer: 'A Fi-relé (életvédelmi kapcsoló) egy olyan biztonsági eszköz, ami azonnal lekapcsol, ha áramütés veszélye áll fenn – például ha egy elektromos készülék meghibásodik. 2019 óta minden lakásban kötelező, és emberéletet menthet. Ha nincs, vagy régi, fontolja meg a beépítését vagy cseréjét.'
  },
  {
    question: 'Szükség van-e engedélyre a villanyszereléshez?',
    answer: 'Kisebb munkákhoz (konnektor, kapcsoló, lámpa csere) nem kell engedély. Nagyobb átalakításokhoz, biztosítéktábla cseréhez, teljes átvezetékeléshez vagy új bekötéshez engedély és szabványossági felülvizsgálat szükséges – ebben is segítünk.'
  },
  {
    question: 'Mennyibe kerül egy teljes lakás átvezetékelése?',
    answer: 'Ez nagyban függ a lakás méretétől, a vezetékek állapotától és az igényektől. Egy 50-60 m2-es lakás teljes átvezetékelése 350.000-500.000 Ft körül mozog, de minden esetben helyszíni felmérés alapján adunk pontos árajánlatot.'
  },
  {
    question: 'Tudnak elektromos autótöltőt is telepíteni?',
    answer: 'Igen! Elektromos autótöltő (EV töltő, wallbox) telepítését vállaljuk. Ez magában foglalja a szükséges áramkör kiépítését, a töltő felszerelését és üzembe helyezését. Társasházi parkolóban külön engedélyeztetés szükséges, amiben szintén segítünk.'
  },
];

// Services list
const services = [
  {
    id: 'hibaelharitas',
    name: 'Hibaelhárítás',
    description: 'Nincs áram? Leveri a biztosítékot? Gyors diagnosztika és javítás.',
    icon: AlertTriangle,
    sos: true,
  },
  {
    id: 'biztositekatabla',
    name: 'Biztosítéktábla',
    description: 'Biztosítéktábla korszerűsítés, bővítés, Fi-relé beépítés, szabványosítás.',
    icon: Settings,
  },
  {
    id: 'atvezetekeles',
    name: 'Átvezetékelés',
    description: 'Teljes vagy részleges átvezetékelés, elavult hálózat korszerűsítése.',
    icon: Home,
  },
  {
    id: 'vilagitas',
    name: 'Világítás szerelés',
    description: 'Lámpák, csillárok, LED szalagok, okos világítás szerelése.',
    icon: Lightbulb,
  },
  {
    id: 'konnektor-kapcsolo',
    name: 'Konnektor / Kapcsoló',
    description: 'Konnektor és kapcsoló csere, bővítés, USB-s konnektorok.',
    icon: Zap,
  },
  {
    id: 'ev-tolto',
    name: 'EV töltő telepítés',
    description: 'Elektromos autótöltő telepítés családi házba vagy társasházba.',
    icon: Car,
  },
];

export default function VillanyszerelPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Zap className="w-4 h-4" />
                <span>Villanyszerelés Budapest</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Villanyszerelő Budapest
              </h1>

              <p className="text-xl text-amber-100 mb-8">
                Professzionális villanyszerelés Budapesten és Pest megyében.
                Hibaelhárítás, biztosítéktábla, átvezetékelés – biztonságos, garanciális munkavégzés.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-amber-100">
                  <CheckCircle className="w-5 h-5 text-amber-200" />
                  <span>0-24 SOS kiszállás</span>
                </div>
                <div className="flex items-center gap-2 text-amber-100">
                  <CheckCircle className="w-5 h-5 text-amber-200" />
                  <span>Szabványos munkavégzés</span>
                </div>
                <div className="flex items-center gap-2 text-amber-100">
                  <CheckCircle className="w-5 h-5 text-amber-200" />
                  <span>Megbízható szakértelem</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login?role=customer" className="bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-lg">
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
                    <Zap className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">4.9★</div>
                    <div className="text-amber-200">500+ értékelés</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-200" />
                      <div>
                        <div className="font-semibold text-white">2 órán belül</div>
                        <div className="text-sm text-amber-200">SOS kiszállás</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-amber-200" />
                      <div>
                        <div className="font-semibold text-white">Szabványos munka</div>
                        <div className="text-sm text-amber-200">MSZ EN 60204-1</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-amber-200" />
                      <div>
                        <div className="font-semibold text-white">Felülvizsgálati jegyzőkönyv</div>
                        <div className="text-sm text-amber-200">Ha szükséges</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="bg-red-50 border-y border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800">
              <strong>Figyelmeztetés:</strong> Az elektromos munkák életveszélyesek lehetnek!
              Soha ne próbáljon meg elektromos javítást végezni szakképzett villanyszerelő nélkül.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white" id="szolgaltatasok">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Villanyszerelési szolgáltatásaink
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teljes körű villanyszerelési szolgáltatás háztartásoknak és vállalkozásoknak.
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
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-amber-600" />
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
                  className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700"
                >
                  <span>Időpont kérése</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fi-relé Section */}
      <section className="py-16 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 rounded-full px-4 py-2 text-sm text-amber-300 mb-6">
                <Shield className="w-4 h-4" />
                <span>Életvédelmi berendezés</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Van Fi-relé a lakásában?
              </h2>

              <p className="text-lg text-slate-300 mb-6">
                A Fi-relé (életvédelmi kapcsoló) azonnal lekapcsolja az áramot, ha áramütés veszélye áll fenn.
                2019 óta minden lakásban kötelező, és <strong className="text-white">emberéletet menthet</strong>.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Véd az áramütés ellen</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Kötelező minden lakásban (2019-től)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Gyors beépítés, akár 1 óra alatt</span>
                </div>
              </div>

              <Link href="/login?role=customer" className="btn-primary inline-flex">
                <span>Fi-relé beépítés kérése</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-slate-700/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">Mikor cserélje le a Fi-relét?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">Ha a tesztgombot megnyomva nem kapcsol le</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">Ha gyakran "kivág" ok nélkül</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">Ha 10 évnél régebbi</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">Ha nincs is (régi lakásokban)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Price List */}
      <section className="py-16 bg-white" id="arak">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Villanyszerelési áraink
            </h2>
            <p className="text-lg text-gray-600">
              Átlátható, fix árak – nincsenek rejtett költségek.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 bg-amber-500 text-white font-semibold">
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
                <div className="text-center text-amber-600 font-bold">{item.price}</div>
                <div className="text-right text-sm text-gray-500">{item.includes || item.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Megjegyzés:</strong> Az árak tájékoztató jellegűek. A pontos árat a helyszíni felmérés után adjuk meg.
              Nagyobb munkákhoz (átvezetékelés, tábla csere) mindig helyszíni felmérés szükséges.
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
                    <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Szüksége van villanyszerelőre?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Foglaljon időpontot online vagy hívjon minket – SOS esetén 2 órán belül a helyszínen vagyunk!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=customer" className="bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-lg shadow-lg">
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

