import { Metadata } from 'next';
import Link from 'next/link';
import {
  Rocket, Shield, Zap, Users, Target, Lightbulb,
  Droplets, Flame, CheckCircle, ArrowRight, Wrench, User, Star
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Rólunk | VízVillanyFűtés',
  description: 'Ismerd meg a VízVillanyFűtés platformot. Azonnal összekötünk a közeledben lévő, ellenőrzött szakemberekkel.',
};

const stats = [
  { value: '100%', label: 'Ellenőrzött mesterek' },
  { value: '0 Ft', label: 'Ügyfél díj' },
  { value: 'Budapest', label: '+ Pest megye' },
  { value: '2025', label: 'Indulás éve' },
];

const values = [
  {
    icon: Rocket,
    title: 'Innováció',
    description: 'A hagyományos „ismerős ismerőse" keresést felváltjuk egy modern, valós idejű, térképalapú rendszerrel.'
  },
  {
    icon: Shield,
    title: 'Biztonság',
    description: 'Kizárólag ellenőrzött, számlaképes vállalkozók kerülhetnek a platformra. Valós ügyfélértékelések segítik a választást.'
  },
  {
    icon: Zap,
    title: 'Gyorsaság',
    description: 'Percek alatt ajánlatot kapsz a közeledben lévő szakemberektől. SOS esetben akár 1-2 óra alatt a helyszínen lehetnek.'
  },
  {
    icon: Target,
    title: 'Átláthatóság',
    description: 'A szakemberek versengő ajánlatokat adnak, Te döntesz az ár, az értékelés és az elérhetőség alapján. Nincs rejtett költség.'
  },
];

const milestones = [
  { year: '2024 Q3', event: 'Az ötlet megszületése. Felismertük, hogy a szakemberkeresés Magyarországon elavult és nehézkes.' },
  { year: '2024 Q4', event: 'Piackutatás és a platform tervezése az Uber, Wolt és Foodora modellek tanulmányozásával.' },
  { year: '2025 Q1', event: 'Az első verzió fejlesztése: valós idejű térkép, szakember-fiók és ügyféloldal.' },
  { year: '2025 Q2', event: 'Béta indulás Budapesten, az első szakemberek és ügyfelek csatlakozása.' },
  { year: '2025 Q3', event: 'Nyilvános indulás Budapest és Pest megye területén.' },
  { year: '2026', event: 'Országos terjeszkedés, vidéki városok bevonása és a rendszer folyamatos fejlesztése.' },
];

const inspirations = [
  {
    name: 'Uber',
    desc: 'Azonnal megmutatja, ki van a közeledben – valós idejű térképes megoldás.',
  },
  {
    name: 'Wolt / Foodora',
    desc: 'Versengő ajánlatok, gyors kiszolgálás, átlátható értékelések és árak.',
  },
  {
    name: 'Booking.com',
    desc: 'Összehasonlítható profilok, szűrők, és bizalomépítő ügyfélvélemények.',
  },
];

export default function RolunkPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs className="mb-8 text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-blue-200 mb-6 border border-white/20">
                <Rocket className="w-4 h-4" />
                <span className="font-semibold tracking-wide">Egy teljesen új megközelítés</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                Mint egy Uber,<br />
                <span className="text-vvm-yellow-400">de szerelőknek.</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                A VízVillanyFűtés egy modern magyar platform, ami valós időben
                összeköt téged a közeledben lévő, ellenőrzött víz-, villany- és
                fűtésszerelőkkel. A szakemberek versenyeznek a munkádért.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login?role=customer" className="btn-primary py-4 px-8">
                  <User className="w-5 h-5" />
                  <span>Szakembert keresek</span>
                </Link>
                <Link href="/csatlakozz-partnerkent" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  <span>Szakember vagyok</span>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center">
              <Droplets className="w-8 h-8 text-sky-600" />
            </div>
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-amber-600" />
            </div>
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-6">
            A probléma, amit megoldunk
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Ki ne járt volna úgy, hogy elromlott valami otthon, és <strong>órákig, napokig kellett keresni egy szabad szerelőt?</strong>
          </p>
          <p className="text-lg text-gray-500 leading-relaxed">
            Ismerősök, Facebook-csoportok, elavult telefonkönyv... A hagyományos szakemberkeresés lassú,
            bizonytalan és tele van rejtett kockázatokkal. Mi ezt gondoltuk újra egy modern,
            adatvezérelt platformmal, ahol a feladást percek alatt megoldod, és a szakemberek
            versenyeznek a munkádért.
          </p>
        </div>
      </section>

      {/* Inspiration */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-4">
              Amik inspiráltak minket
            </h2>
            <p className="text-lg text-gray-600">
              A legjobb platformokból merítettünk, és adaptáltuk a magyar piacra.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {inspirations.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow text-center">
                <div className="w-14 h-14 bg-vvm-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Lightbulb className="w-7 h-7 text-vvm-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.name}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-4">
              Értékeink
            </h2>
            <p className="text-xl text-gray-600">
              Ezek az alapelvek vezérelnek a fejlesztés minden lépésében
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-vvm-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-vvm-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-6">
                Hogyan működik?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                A platform lényege az egyszerűség. Ahogy egy Wolt rendelést adsz le,
                úgy kérsz itt szakembert.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Jelezd a problémát</h4>
                    <p className="text-gray-600">Írd le pár szóban, mi romlott el, a rendszer kategorizálja helyetted.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Szakemberek értesülnek</h4>
                    <p className="text-gray-600">A közeledben lévő mesterek azonnal push értesítést kapnak és ajánlatot adnak.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Te választasz</h4>
                    <p className="text-gray-600">Hasonlítsd össze az ajánlatokat: ár, értékelés, elérhetőség alapján Te döntesz.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-gray-900 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Értékeld a munkát</h4>
                    <p className="text-gray-600">A munka után értékeld a mestert, ezzel segítve másokat a választásban.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-vvm-blue-100 to-vvm-blue-200 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Miért a VízVillanyFűtés?</h3>
              <div className="space-y-4">
                {[
                  'Valós idejű, térképes szakemberkeresés',
                  'Versengő ajánlatok, Te döntesz',
                  'Ellenőrzött, számlaképes mesterek',
                  'Valós ügyfélértékelések minden munkáról',
                  'Ingyenes az ügyfeleknek',
                  'SOS bejelentés perceken belüli válasszal',
                  'Pályázathoz elfogadott számlák',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-4">
              Az utunk
            </h2>
            <p className="text-lg text-gray-600">
              Egy ötletből indultunk, és most építjük Magyarország valós idejű szakemberplatformját.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-vvm-blue-200 -translate-x-1/2"></div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 pr-8 text-right">
                    {index % 2 === 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 shadow-sm inline-block">
                        <span className="text-vvm-blue-600 font-bold">{milestone.year}</span>
                        <p className="text-gray-700 text-sm">{milestone.event}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-4 h-4 bg-vvm-blue-600 rounded-full border-4 border-white shadow-md z-10"></div>
                  <div className="w-1/2 pl-8">
                    {index % 2 !== 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 shadow-sm inline-block">
                        <span className="text-vvm-blue-600 font-bold">{milestone.year}</span>
                        <p className="text-gray-700 text-sm">{milestone.event}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Csatlakozz a jövő platformjához!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Akár ügyfél vagy, akár szakember, nálunk mindenki jól jár.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=customer" className="btn-primary py-4 px-10 text-lg">
              <User className="w-6 h-6" />
              <span>Ingyenes ajánlatkérés</span>
            </Link>
            <Link href="/csatlakozz-partnerkent" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-lg">
              <Wrench className="w-6 h-6" />
              <span>Szakemberként csatlakozom</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
