import { Metadata } from 'next';
import Link from 'next/link';
import {
  Award, Shield, Clock, CheckCircle,
  Droplets, Zap, Flame, Heart, Target, Calendar, Phone
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Rólunk - Megbízható Szakemberek 2015 óta | VízVillanyFűtés',
  description: 'Ismerje meg a VízVillanyFűtés csapatát! Ellenőrzött szakemberek, garanciális munkavégzés Budapesten.',
};

const stats = [
  { value: '500+', label: 'Elégedett ügyfél' },
  { value: '150+', label: 'Aktív szakember' },
  { value: '4.9', label: 'Google értékelés', suffix: '★' },
  { value: '1 év', label: 'Garancia' },
];

const values = [
  {
    icon: Shield,
    title: 'Megbízhatóság',
    description: 'Minden szakemberünk háttérellenőrzésen esett át, biztosítottak vagyunk és garanciát vállalunk.'
  },
  {
    icon: Target,
    title: 'Átláthatóság',
    description: 'Fix árak, előzetes árajánlat – nincsenek rejtett költségek.'
  },
  {
    icon: Clock,
    title: 'Gyorsaság',
    description: 'SOS esetén 2 órán belül a helyszínen. Normál foglalás 1-3 munkanapon belül.'
  },
  {
    icon: Heart,
    title: 'Ügyfélközpontúság',
    description: 'Nem csak javítunk – tanácsot adunk, megelőzünk, és hosszú távon gondolkodunk.'
  },
];

const milestones = [
  { year: '2020', event: 'A VízVillanyFűtés alapítása' },
  { year: '2021', event: 'Első 1000 elvégzett munka' },
  { year: '2022', event: 'Fűtésszerelés szolgáltatás indítása' },
  { year: '2023', event: 'Online foglalási rendszer bevezetése' },
  { year: '2024', event: 'Pest megyei terjeszkedés' },
  { year: '2025', event: 'Pályázati tanácsadás indítása' },
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
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Víz, villany, fűtés – <br />
                <span className="text-vvm-yellow-400">egy megbízható kézben.</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                A VízVillanyFűtés nem csak egy szerelő keresés – hanem egy teljes szolgáltatási ökoszisztéma,
                ahol az ügyfelek, szakemberek és vállalkozások egyaránt nyernek.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/foglalas" className="btn-primary py-4 px-8">
                  <Calendar className="w-5 h-5" />
                  <span>Időpontfoglalás</span>
                </Link>
                <Link href="/kapcsolat" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>Kapcsolat</span>
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
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
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
            Küldetésünk
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Azt hisszük, hogy a háztartási problémák megoldása nem lehet stresszes, bizonytalan
            vagy drága. Célunk, hogy minden magyar otthonban legyen egy megbízható partner,
            akire számíthatnak – akár sürgős hibaelhárításról, akár tervezett felújításról van szó.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-4">
              Értékeink
            </h2>
            <p className="text-xl text-gray-600">
              Ezek az elvek vezérelnek minket minden nap
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
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

      {/* How We Work */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-6">
                Hogyan működünk?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                A VízVillanyFűtés platformon keresztül gyorsan és egyszerűen jut el
                az ellenőrzött szakemberekhez.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Probléma bejelentése</h4>
                    <p className="text-gray-600">Online vagy telefonon írja le a problémát</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Azonnali árajánlat</h4>
                    <p className="text-gray-600">Kapjon fix ársávot és válasszon időpontot</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Szakember kiközvetítése</h4>
                    <p className="text-gray-600">A legközelebbi, megfelelő szakembert küldjük</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vvm-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Garanciális munka</h4>
                    <p className="text-gray-600">Minden munkánkra 1 év garancia</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-vvm-blue-100 to-vvm-blue-200 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Miért minket válasszanak?</h3>
              <div className="space-y-4">
                {[
                  'Ellenőrzött, minősített szakemberek',
                  'Biztosított munkavégzés',
                  'Minimum 1 év garancia minden munkára',
                  'Átlátható árak, nincs rejtett költség',
                  'SOS kiszállás 2 órán belül',
                  'Pályázati dokumentáció készítése',
                  'Hivatalos számla minden munkáról',
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-4">
              Történetünk
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-vvm-blue-200 -translate-x-1/2"></div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 pr-8 text-right">
                    {index % 2 === 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-sm inline-block">
                        <span className="text-vvm-blue-600 font-bold">{milestone.year}</span>
                        <p className="text-gray-700">{milestone.event}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-4 h-4 bg-vvm-blue-600 rounded-full border-4 border-white shadow-md z-10"></div>
                  <div className="w-1/2 pl-8">
                    {index % 2 !== 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-sm inline-block">
                        <span className="text-vvm-blue-600 font-bold">{milestone.year}</span>
                        <p className="text-gray-700">{milestone.event}</p>
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
            Készen áll a megbízható megoldásra?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Foglaljon időpontot online, vagy hívjon minket most!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/foglalas" className="btn-primary py-4 px-10 text-lg">
              <Calendar className="w-6 h-6" />
              <span>Időpontfoglalás</span>
            </Link>
            <Link href="/visszahivas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-lg">
              <Phone className="w-6 h-6" />
              <span>Visszahívást kérek</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

