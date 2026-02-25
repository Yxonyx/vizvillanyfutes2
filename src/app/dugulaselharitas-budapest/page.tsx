'use client';

import Link from 'next/link';
import {
  Droplets, CheckCircle, ArrowRight, Phone, Calendar, Clock,
  Shield, Star, ChevronDown, AlertTriangle,
  Wrench, Award, HelpCircle, Waves
} from 'lucide-react';
import { useState } from 'react';

// Services
const services = [
  {
    name: 'Mosdó dugulás',
    description: 'Mosdó lefolyó duguláselhárítás kézi vagy gépi módszerrel.',
    price: '12 000 Ft-tól',
    time: '30-60 perc',
  },
  {
    name: 'Mosogató dugulás',
    description: 'Konyhai mosogató dugulás megszüntetése, zsírdugulás eltávolítása.',
    price: '12 000 Ft-tól',
    time: '30-60 perc',
  },
  {
    name: 'WC dugulás',
    description: 'WC duguláselhárítás speciális eszközökkel.',
    price: '15 000 Ft-tól',
    time: '30-90 perc',
  },
  {
    name: 'Kád/zuhanyzó dugulás',
    description: 'Fürdőkád és zuhanyzó lefolyó dugulásának megszüntetése.',
    price: '12 000 Ft-tól',
    time: '30-60 perc',
  },
  {
    name: 'Fővezeték dugulás',
    description: 'Társasházi fővezeték, szennyvízvezeték gépi tisztítása.',
    price: '35 000 Ft-tól',
    time: '1-3 óra',
  },
  {
    name: 'Kamera vizsgálat',
    description: 'Csővizsgáló kamerával a dugulás és csősérülés pontos helyének megállapítása.',
    price: '25 000 Ft-tól',
    time: '30-60 perc',
  },
];

// FAQ
const faqs = [
  {
    question: 'Mennyibe kerül a duguláselhárítás?',
    answer: 'A duguláselhárítás ára a dugulás típusától és súlyosságától függ. Egyszerű mosdó vagy mosogató dugulás 12.000-18.000 Ft, WC dugulás 15.000-25.000 Ft, fővezeték tisztítás 35.000 Ft-tól. A kiszállási díj (5.900 Ft) csak akkor kerül felszámolásra, ha nem rendeli meg a szolgáltatást.'
  },
  {
    question: 'Milyen gyorsan tudnak kijönni?',
    answer: 'SOS esetén (teljes dugulás, visszafolyás) 2 órán belül a helyszínen vagyunk – ez esetben +50% expressz felár fizetendő. Normál esetben 24-48 órán belül tudunk időpontot adni.'
  },
  {
    question: 'Mi okozza a dugulást?',
    answer: 'A legtöbb dugulást zsír és élelmiszermaradék (konyhában), haj és szappan (fürdőszobában), illetve WC-papíron kívüli tárgyak (WC-ben) okozzák. Régebbi épületeknél a csövek állapota is közrejátszhat.'
  },
  {
    question: 'Hogyan előzhető meg a dugulás?',
    answer: 'Használjon lefolyószűrőt a konyhában és fürdőszobában. Kerülje a zsír öntését a lefolyóba. Ne dobjon a WC-be zsebkendőt, nedves törlőkendőt, egészségügyi terméket. Havonta öntsön forró vizet a lefolyókba.'
  },
  {
    question: 'Mit tegyek, ha visszafolyik a víz?',
    answer: 'Ha a víz visszafolyik (akár a WC-ből, akár a lefolyókból), az sürgős helyzet – azonnal hívjon minket! Addig ne használja az érintett csapokat/WC-t, és ha teheti, zárja el a főcsapot. SOS esetén 2 órán belül ott vagyunk.'
  },
  {
    question: 'Kapok garanciát a munkára?',
    answer: 'Igen, a duguláselhárításra 30 napos garanciát vállalunk. Ha ugyanazon a helyen, ugyanazon okból ismét dugulás keletkezik, ingyenesen kijövünk és megoldjuk.'
  },
];

export default function DugulaselharitasPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-red-500/80 rounded-full px-4 py-2 text-sm mb-6 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">SOS – 2 órán belül kiszállunk!</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Duguláselhárítás <br />
                <span className="text-cyan-200">Budapest – 0-24</span>
              </h1>

              <p className="text-xl text-cyan-100 mb-8">
                Gépi és kézi duguláselhárítás Budapesten és Pest megyében.
                Mosdó, WC, lefolyó, fővezeték – gyors, garanciális megoldás.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-cyan-100">
                  <CheckCircle className="w-5 h-5 text-cyan-200" />
                  <span>2 órán belüli kiszállás</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-100">
                  <CheckCircle className="w-5 h-5 text-cyan-200" />
                  <span>Gépi tisztítás</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-100">
                  <CheckCircle className="w-5 h-5 text-cyan-200" />
                  <span>30 nap garancia</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="tel:+36302696406" className="btn-primary py-4 px-8 text-lg">
                  <Phone className="w-6 h-6" />
                  <span>+36 30 269 6406</span>
                </a>
                <Link href="/foglalas?service=dugulas&sos=true" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 border border-white/20">
                  <Calendar className="w-5 h-5" />
                  <span>Online foglalás</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center">
                    <Waves className="w-8 h-8 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">SOS Dugulás?</div>
                    <div className="text-gray-600">Azonnal segítünk!</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                    <Clock className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-semibold text-gray-900">2 órán belül</div>
                      <div className="text-sm text-gray-600">SOS kiszállás</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
                    <Wrench className="w-5 h-5 text-cyan-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Gépi tisztítás</div>
                      <div className="text-sm text-gray-600">Professzionális eszközökkel</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">30 nap garancia</div>
                      <div className="text-sm text-gray-600">Minden munkára</div>
                    </div>
                  </div>
                </div>

                <a href="tel:+36302696406" className="btn-secondary w-full py-4 text-lg">
                  <Phone className="w-5 h-5" />
                  <span>Hívjon most: +36 30 269 6406</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Milyen dugulásban segítünk?
            </h2>
            <p className="text-lg text-gray-600">
              Minden típusú dugulást megszüntetünk – háztartásitól az ipariig.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-600 font-bold">{service.price}</div>
                    <div className="text-sm text-gray-500">{service.time}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Sürgős dugulás?</h3>
                <p className="text-red-100">2 órán belül a helyszínen vagyunk!</p>
              </div>
            </div>
            <a href="tel:+36302696406" className="bg-white text-red-600 font-bold py-4 px-8 rounded-xl hover:bg-red-50 transition-colors inline-flex items-center gap-2 text-lg">
              <Phone className="w-6 h-6" />
              <span>+36 30 269 6406</span>
            </a>
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
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Phone, title: 'Hívás/Foglalás', desc: 'Hívjon minket vagy foglaljon online.' },
              { icon: Clock, title: 'Gyors kiszállás', desc: 'SOS: 2 óra, normál: 24-48 óra.' },
              { icon: Wrench, title: 'Diagnosztika + Javítás', desc: 'Megállapítjuk és megoldjuk a problémát.' },
              { icon: Shield, title: 'Garancia', desc: '30 napos garancia a munkára.' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-cyan-600" />
                </div>
                <div className="text-2xl font-bold text-cyan-600 mb-2">{index + 1}.</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
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
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-cyan-600 flex-shrink-0" />
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
      <section className="py-16 bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Dugulás? Ne várjon – hívjon most!
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            SOS esetén 2 órán belül a helyszínen vagyunk. Gépi duguláselhárítás, 30 nap garancia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+36302696406" className="btn-primary py-4 px-10 text-lg">
              <Phone className="w-6 h-6" />
              <span>SOS Hívás: +36 30 269 6406</span>
            </a>
            <Link href="/foglalas?service=dugulas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-lg border border-white/20">
              <Calendar className="w-6 h-6" />
              <span>Online foglalás</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


