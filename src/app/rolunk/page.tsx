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
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-24 pb-16 lg:pt-32 lg:pb-20 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 -left-20 w-80 h-80 bg-vvm-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs className="mb-6 lg:mb-8 text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-xs md:text-sm text-blue-200 mb-6 border border-white/20 backdrop-blur-sm shadow-sm">
                <Rocket className="w-4 h-4" />
                <span className="font-semibold tracking-wide">Egy teljesen új megközelítés</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 leading-tight">
                Mint egy Uber,<br />
                <span className="text-vvm-yellow-400">de szerelőknek.</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed font-light">
                A VízVillanyFűtés egy modern magyar platform, ami valós időben
                összeköt téged a közeledben lévő, ellenőrzött víz-, villany- és
                fűtésszerelőkkel. A szakemberek versenyeznek a munkádért.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login?role=customer" className="btn-primary py-4 px-8 justify-center shadow-xl shadow-vvm-blue-900/20">
                  <User className="w-5 h-5" />
                  <span>Szakembert keresek</span>
                </Link>
                <Link href="/csatlakozz-partnerkent" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/30">
                  <Wrench className="w-5 h-5" />
                  <span>Szakember vagyok</span>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6 lg:pl-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 lg:p-6 text-center border border-white/10 shadow-lg hover:bg-white/15 transition-colors"
                >
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1 lg:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-blue-200 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 lg:gap-4 mb-8">
            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-sky-50 rounded-2xl flex items-center justify-center shadow-sm border border-sky-100">
              <Droplets className="w-6 h-6 lg:w-8 lg:h-8 text-sky-500" />
            </div>
            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
              <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-amber-500" />
            </div>
            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100">
              <Flame className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 font-heading mb-6">
            A probléma, amit megoldunk
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-6 font-medium">
            Ki ne járt volna úgy, hogy elromlott valami otthon, és <strong>órákig, napokig kellett keresni egy szabad szerelőt?</strong>
          </p>
          <p className="text-base lg:text-lg text-slate-500 leading-relax">
            Ismerősök, Facebook-csoportok, elavult telefonkönyv... A hagyományos szakemberkeresés lassú,
            bizonytalan és tele van rejtett kockázatokkal. Mi ezt gondoltuk újra egy modern,
            adatvezérelt platformmal, ahol a feladást percek alatt megoldod, és a szakemberek
            versenyeznek a munkádért.
          </p>
        </div>
      </section>

      {/* Inspiration */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 font-heading mb-4">
              Amik inspiráltak minket
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
              A legjobb platformokból merítettünk, és adaptáltuk a hazai piacra a bevált modelleket.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {inspirations.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:border-vvm-blue-100 transition-all text-center group">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-vvm-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:-translate-y-1 transition-transform">
                  <Lightbulb className="w-7 h-7 lg:w-8 lg:h-8 text-vvm-blue-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-3">{item.name}</h3>
                <p className="text-sm lg:text-base text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="text-vvm-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Alapelveink</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 font-heading mb-4">
              Értékeink
            </h2>
            <p className="text-base lg:text-xl text-slate-600 max-w-2xl mx-auto">
              Ezek az alapelvek vezérelnek a fejlesztés és a működés minden lépésében
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-slate-50 rounded-3xl p-6 lg:p-8 hover:shadow-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-6 h-6 lg:w-7 lg:h-7 text-vvm-blue-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 font-heading mb-6">
                Hogyan működik?
              </h2>
              <p className="text-base lg:text-lg text-slate-600 mb-8 lg:mb-12">
                A platform lényege az egyszerűség. Ahogy egy ételt rendelsz vagy autót hívsz,
                úgy kérsz itt is szakembert – néhány perc alatt.
              </p>

              <div className="space-y-6 lg:space-y-8 relative">
                <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-slate-200 z-0 hidden sm:block"></div>

                <div className="flex items-start gap-4 lg:gap-6 relative z-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md ring-4 ring-slate-50">
                    1
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">Jelezd a problémát</h4>
                    <p className="text-slate-600 text-sm lg:text-base">Néhány gombnyomással válaszd ki, mi romlott el, a rendszer pedig kategorizálja.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 lg:gap-6 relative z-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md ring-4 ring-slate-50">
                    2
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">Szakemberek értesülnek</h4>
                    <p className="text-slate-600 text-sm lg:text-base">A közeledben lévő ellenőrzött mesterek azonnal értesítést kapnak a telefonjukra.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 lg:gap-6 relative z-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md ring-4 ring-slate-50">
                    3
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">Te választasz</h4>
                    <p className="text-slate-600 text-sm lg:text-base">Hasonlítsd össze az ajánlatokat: értékelés, ár és kiszállási idő alapján Te döntesz.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 lg:gap-6 relative z-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-vvm-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 text-slate-800 font-bold text-lg shadow-md ring-4 ring-slate-50">
                    4
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">Értékeld a munkát</h4>
                    <p className="text-slate-600 text-sm lg:text-base">Minden elvégzett munka után értékelni tudod a mestert, ami fenntartja a minőséget.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-6 lg:p-10 shadow-xl border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-20 -mt-20"></div>

              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-6 lg:mb-8 relative z-10">Miért a VízVillanyFűtés?</h3>
              <div className="space-y-4 lg:space-y-5 relative z-10">
                {[
                  'Valós idejű, térképes szakemberkeresés',
                  '100% független és átlátható',
                  'Ellenőrzött, számlaképes mesterek',
                  'Kizárólag valós ügyfélértékelések',
                  'Ingyenes profil az ügyfeleknek',
                  'SOS bejelentés perceken belüli válasszal',
                  'Hitelesített, megbízható partnerhálózat',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 lg:gap-4 bg-white/60 p-3 rounded-xl border border-white/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm lg:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 font-heading mb-4">
              Az utunk
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
              Egy ötletből indultunk, és most építjük Magyarország legmodernebb valós idejű szakemberplatformját.
            </p>
          </div>

          <div className="relative">
            {/* The line - strictly on the left on mobile, centered on desktop */}
            <div className="absolute left-[20px] md:left-1/2 top-4 bottom-4 w-1 bg-slate-100 md:-translate-x-1/2 rounded-full hidden sm:block"></div>

            <div className="space-y-6 md:space-y-12">
              {milestones.map((milestone, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={index} className="relative flex md:justify-center items-start md:items-center">

                    {/* The circle node */}
                    <div className="absolute left-[13px] md:left-1/2 top-5 md:top-1/2 md:-translate-y-1/2 w-4 h-4 bg-vvm-blue-600 rounded-full shadow-[0_0_0_4px_white] z-10 md:-translate-x-1/2 hidden sm:block"></div>

                    {/* Desktop Left Side Wrapper */}
                    <div className={`hidden md:flex w-1/2 pr-12 justify-end ${isEven ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm text-right w-full sm:max-w-md hover:shadow-md transition-shadow">
                        <span className="text-vvm-blue-600 font-bold tracking-wider mb-2 block">{milestone.year}</span>
                        <p className="text-slate-600 text-sm leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>

                    {/* Right Side / Mobile Layout Combo Wrapper */}
                    <div className={`w-full md:w-1/2 sm:pl-12 flex ${isEven ? 'md:hidden' : 'md:flex'}`}>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm w-full sm:max-w-md md:text-left text-left hover:shadow-md transition-shadow">
                        <span className="text-vvm-blue-600 font-bold tracking-wider mb-2 block">{milestone.year}</span>
                        <p className="text-slate-600 text-sm leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>

                    {/* Desktop Filler for layout when Right Side is active but it's an even item - wait, flex covers it */}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-vvm-blue-400/20 rounded-full blur-3xl -mb-20 -ml-20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-4 lg:mb-6">
            Csatlakozz a jövő platformjához!
          </h2>
          <p className="text-base lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Akár ügyfél vagy, akár szakember, nálunk mindenki jól jár. Fedezd fel az előnyöket!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=customer" className="btn-primary py-4 px-8 lg:px-10 text-base lg:text-lg shadow-xl shadow-vvm-blue-900/30 justify-center">
              <User className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Ingyenes ajánlatkérés</span>
            </Link>
            <Link href="/csatlakozz-partnerkent" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 lg:px-10 rounded-xl transition-all inline-flex items-center justify-center gap-2 text-base lg:text-lg border border-white/10 hover:border-white/30">
              <Wrench className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Szakemberként csatlakozom</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
