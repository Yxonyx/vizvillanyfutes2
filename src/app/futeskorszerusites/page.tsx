'use client';

import Link from 'next/link';
import {
  Flame, CheckCircle, ArrowRight, Phone, Calendar, Clock,
  Shield, Star, ChevronDown, AlertTriangle, ThermometerSun,
  Wrench, Award, FileCheck, HelpCircle, Leaf, Euro, Home
} from 'lucide-react';
import { useState } from 'react';

// Services
const services = [
  {
    id: 'radiator',
    name: 'Radiátor szerelés',
    description: 'Radiátor csere, bővítés, termosztát szelep beépítés, hidraulikai beszabályozás.',
    icon: ThermometerSun,
  },
  {
    id: 'kazan',
    name: 'Kazán csere',
    description: 'Kondenzációs kazán telepítés partnerek bevonásával. Régi kazán bontása, új bekötése.',
    icon: Flame,
  },
  {
    id: 'padlofutes',
    name: 'Padlófűtés',
    description: 'Padlófűtés rendszer előkészítése, szerelése. Elektromos és vizes rendszerek.',
    icon: Home,
  },
  {
    id: 'hoszivatyu',
    name: 'Hőszivattyú előkészítés',
    description: 'Hőszivattyú rendszer elektromos és hidraulikai előkészítése, bekötése.',
    icon: Leaf,
  },
  {
    id: 'termosztat',
    name: 'Termosztát csere',
    description: 'Szobatermosztát, radiátor termosztát fejek cseréje. Okos termosztátok.',
    icon: ThermometerSun,
  },
  {
    id: 'energetika',
    name: 'Energetikai tanácsadás',
    description: 'Felmérés, tanácsadás energiahatékony megoldásokhoz és pályázatokhoz.',
    icon: Euro,
  },
];

// FAQ
const faqs = [
  {
    question: 'Milyen pályázati lehetőségek vannak fűtéskorszerűsítésre?',
    answer: 'Jelenleg az Otthonfelújítási Program keretében igényelhető támogatás fűtéskorszerűsítésre is. A támogatás összege a projekt költségének 50%-a, maximum 3 millió forint (teljes felújításnál max. 6 millió). Emellett vannak energetikai pályázatok is hőszivattyú, napelem rendszerekre. Segítünk a pályázati jogosultság ellenőrzésében és az ügyintézésben is!'
  },
  {
    question: 'Mennyibe kerül egy fűtéskorszerűsítés?',
    answer: 'A költség nagyban függ a lakás méretétől és a választott megoldástól. Egy 60-80 m2-es lakás teljes fűtés-korszerűsítése (kazáncsere + radiátorok + szabályozás) 800.000 - 1.500.000 Ft körül mozog. Hőszivattyúval drágább, de ott nagyobb a megtérülés. Minden esetben helyszíni felmérés alapján adunk pontos árajánlatot.'
  },
  {
    question: 'Mennyit lehet spórolni a fűtéskorszerűsítéssel?',
    answer: 'A megtakarítás jelentős lehet: egy régi, 20+ éves kazán cseréje modern kondenzációs kazánra 20-30%-os gázmegtakarítást hozhat. Hőszivattyúval akár 50-70% is lehet a megtakarítás. A pontos összeget a jelenlegi fogyasztás és az ingatlan paraméterei alapján tudjuk becsülni.'
  },
  {
    question: 'Tudnak gázszerelőt is küldeni?',
    answer: 'A fűtéskorszerűsítés gázos részét (kazán, gázvezeték) partnereinken keresztül oldjuk meg. Mi végezzük a víz-oldali és elektromos munkákat (radiátorok, csövezés, termosztátok, elektromos bekötés), és koordináljuk a teljes projektet egy kézből.'
  },
  {
    question: 'Érdemes hőszivattyúra cserélni?',
    answer: 'Hőszivattyú ideális választás jól szigetelt épületeknél, ahol padlófűtés vagy fan-coil van, és ahol a rezsiköltség csökkentése a cél. Gázkazán cseréjéhez képest drágább beruházás, de a működési költség alacsonyabb és pályázati támogatás is igényelhető. Segítünk eldönteni, mi a legjobb megoldás az Ön esetében.'
  },
];

export default function FuteskorszerusitesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Flame className="w-4 h-4" />
                <span>Fűtéskorszerűsítés</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Fűtéskorszerűsítés – <br />
                <span className="text-orange-200">pályázattal is!</span>
              </h1>

              <p className="text-xl text-orange-100 mb-8">
                Csökkentse a rezsit modern fűtésrendszerrel! Radiátor csere, kazán korszerűsítés,
                hőszivattyú előkészítés – pályázati támogatással is.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-orange-100">
                  <CheckCircle className="w-5 h-5 text-orange-200" />
                  <span>Akár 50% pályázati támogatás</span>
                </div>
                <div className="flex items-center gap-2 text-orange-100">
                  <CheckCircle className="w-5 h-5 text-orange-200" />
                  <span>20-50% rezsi megtakarítás</span>
                </div>
                <div className="flex items-center gap-2 text-orange-100">
                  <CheckCircle className="w-5 h-5 text-orange-200" />
                  <span>Pályázati ügyintézés</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/palyazat-kalkulator" className="btn-primary py-4 px-8 text-lg">
                  <Award className="w-5 h-5" />
                  <span>Pályázat kalkulátor</span>
                </Link>
                <Link href="/foglalas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 border border-white/20">
                  <Calendar className="w-5 h-5" />
                  <span>Helyszíni felmérés</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-green-600" />
                  Megtakarítási kalkulátor
                </h3>

                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-green-700 mb-1">Kondenzációs kazánnal</div>
                    <div className="text-2xl font-bold text-green-700">20-30% megtakarítás</div>
                    <div className="text-sm text-green-600">Évi 50.000-100.000 Ft</div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <div className="text-sm text-emerald-700 mb-1">Hőszivattyúval</div>
                    <div className="text-2xl font-bold text-emerald-700">50-70% megtakarítás</div>
                    <div className="text-sm text-emerald-600">Évi 150.000-300.000 Ft</div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl">
                    <div className="text-sm text-amber-700 mb-1">Pályázati támogatás</div>
                    <div className="text-2xl font-bold text-amber-700">Max. 6 millió Ft</div>
                    <div className="text-sm text-amber-600">Költség 50%-a</div>
                  </div>
                </div>

                <Link href="/palyazat-kalkulator" className="btn-secondary w-full mt-6">
                  <span>Számoljuk ki az Ön megtakarítását!</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white" id="szolgaltatasok">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Fűtéskorszerűsítési szolgáltatásaink
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teljes körű fűtéskorszerűsítés a felméréstől a garanciáig.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                id={service.id}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow scroll-mt-24"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link
                  href={`/foglalas?service=${service.id}`}
                  className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700"
                >
                  <span>Érdeklődés</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grant Info */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Award className="w-4 h-4" />
                <span>Pályázati támogatás</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Akár 6 millió Ft <br />
                támogatás fűtéskorszerűsítésre!
              </h2>

              <p className="text-lg text-emerald-100 mb-6">
                Az Otthonfelújítási Program keretében a fűtésrendszer korszerűsítése is támogatható.
                Mi segítünk a teljes folyamatban – a jogosultság ellenőrzésétől a pályázat beadásáig.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Ingyenes jogosultság ellenőrzés</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Pályázati dokumentáció elkészítése</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>NAV-kompatibilis számlák</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Sikerdíjas konstrukció</span>
                </div>
              </div>

              <Link href="/palyazat-kalkulator" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-4 px-8 rounded-xl hover:bg-emerald-50 transition-colors shadow-xl">
                <span>Jogosultság ellenőrzése</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Euro className="w-8 h-8 text-emerald-300 mb-3" />
                <div className="text-3xl font-bold mb-1">50%</div>
                <div className="text-emerald-200 text-sm">A költség felét fedezi a támogatás</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Award className="w-8 h-8 text-emerald-300 mb-3" />
                <div className="text-3xl font-bold mb-1">6M Ft</div>
                <div className="text-emerald-200 text-sm">Maximum támogatási összeg</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <FileCheck className="w-8 h-8 text-emerald-300 mb-3" />
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-emerald-200 text-sm">Ügyintézés megoldva</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Shield className="w-8 h-8 text-emerald-300 mb-3" />
                <div className="text-3xl font-bold mb-1">Sikerdíj</div>
                <div className="text-emerald-200 text-sm">Csak ha nyer a pályázat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
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
                    <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Készen áll a rezsi csökkentésére?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Kérjen ingyenes helyszíni felmérést és árajánlatot – pályázati lehetőségeket is ellenőrizzük!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/palyazat-kalkulator" className="btn-primary py-4 px-10 text-lg">
              <Award className="w-6 h-6" />
              <span>Pályázat ellenőrzés</span>
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


