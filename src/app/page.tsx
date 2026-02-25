'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, ChevronRight, ArrowRight, Phone, Calendar,
  Droplets, Zap, Flame, AlertTriangle, Shield, FileCheck,
  Receipt, Star, Clock, MapPin, CheckCircle, Users, User,
  Building, Wrench, ThumbsUp, Award
} from 'lucide-react';

// Problem suggestions for the search
const problemSuggestions = [
  { text: 'Csöpög a csap', icon: Droplets, category: 'viz', problem: 'csaptelep' },
  { text: 'Nincs áram', icon: Zap, category: 'villany', problem: 'nincs_aram' },
  { text: 'Dugulás', icon: Droplets, category: 'viz', problem: 'dugulas' },
  { text: 'Leveri a Fi-relét', icon: AlertTriangle, category: 'villany', problem: 'fi_rele' },
  { text: 'Csőtörés', icon: Droplets, category: 'viz', problem: 'csotores' },
  { text: 'Nem melegszik a radiátor', icon: Flame, category: 'futes', problem: 'radiator' },
];

import TeaserMap from '@/components/TeaserMap';
import MarketplaceSimulationOverlay from '@/components/MarketplaceSimulationOverlay';
import HowItWorksAnimation from '@/components/HowItWorksAnimation';
import { supabase } from '@/lib/supabase/client';

// Service cards data
const services = [
  {
    icon: Droplets,
    title: 'Vízszerelők',
    description: 'Csőtörés, duguláselhárítás, bojler javítás. Magasra értékelt helyi szakemberek várják a hívásod.',
    color: 'bg-sky-500',
    link: '/vizszerelo-budapest',
    features: ['Átlag 15 perces elfogadás', 'Azonnali SOS kiállás', 'Többszáz ellenőrzött szaki'],
  },
  {
    icon: Zap,
    title: 'Villanyszerelők',
    description: 'Áramkimaradás, zárlat, okosotthon kiépítés. Csak érvényes engedéllyel rendelkező mesterek.',
    color: 'bg-amber-500',
    link: '/villanyszerelo-budapest',
    features: ['Hibaelhárítás azonnal', 'Fi-relé bekötés', 'Kizárólag regisztrált szerelők'],
  },
  {
    icon: Flame,
    title: 'Fűtésszerelők',
    description: 'Radiátor csere, kazán javítás, hőszivattyúk. Megbízható fűtésszerelők egy kattintásra.',
    color: 'bg-orange-500',
    link: '/futeskorszerusites',
    features: ['Kazán és bojler javítás', 'Padlófűtés', 'Gyors segítség télen is'],
  },
  {
    icon: AlertTriangle,
    title: 'SOS Szolgáltatások (0-24)',
    description: 'Balesetveszély, ömlő víz vagy áramkimaradás? Kérj azonnali sürgősségi kiszállást.',
    color: 'bg-red-500',
    link: '/dugulaselharitas-budapest',
    features: ['Legközelebbi szaki riasztása', '0-24 ügyelet tartás', 'Akár 1 órán belüli kiállás'],
  },
];

// Testimonials
const testimonials = [
  {
    name: 'Boros Attila',
    location: 'Budapest, XIII. kerület',
    rating: 5,
    text: 'Szombat délután tört el a cső. Feladtam a munkát a weboldalon, és 5 percen belül rá is csapott egy szerelő, aki történetesen a szomszéd utcában volt épp. Zseniális!',
    service: 'SOS Vízszerelés',
  },
  {
    name: 'Nagy Eszter',
    location: 'Budaörs',
    rating: 5,
    text: 'Nagyon féltem vadidegeneket beengedni a lakásba, de itt minden szakember előre igazolt, és láttam a többiek értékelését is mielőtt kiérkezett.',
    service: 'Villanyszerelés',
  },
  {
    name: 'Fehér Dávid',
    location: 'Budapest, II. kerület',
    rating: 5,
    text: 'A radiátor kezdett el csöpögni. Korábban napokig hívogattam a szerelőket, most kiírtam ide, és másnap reggelre már meg volt oldva.',
    service: 'Fűtésszerelő',
  },
];

// Stats
const stats = [
  { value: '500+', label: 'Regisztrált Szakember' },
  { value: '15 perc', label: 'Átlagos Elfogadási Idő' },
  { value: '4.9', label: 'Átlagos Értékelés', suffix: '★' },
  { value: '1 év', label: 'Alap Garancia a Munkákra' },
];

interface GrantFormState {
  buildingYear: string;
  heatingSystem: string;
  workType: string;
}

// Mobile App Dashboard for authenticated users
// Renders MarketplaceSimulationOverlay directly — NO demo TeaserMap
function MobileAppDashboard({ isContractor }: { isContractor: boolean }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data) setLeads(data);
    };
    fetchLeads();

    // Realtime subscription
    const sub = supabase
      .channel('mobile-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'viz': return <Droplets className="w-4 h-4 text-white" />;
      case 'villany': return <Zap className="w-4 h-4 text-white" />;
      case 'futes': return <Flame className="w-4 h-4 text-white" />;
      default: return <Wrench className="w-4 h-4 text-white" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'viz': return 'bg-sky-500 shadow-sky-500/50';
      case 'villany': return 'bg-amber-500 shadow-amber-500/50';
      case 'futes': return 'bg-orange-500 shadow-orange-500/50';
      default: return 'bg-slate-500 shadow-slate-500/50';
    }
  };

  return (
    <MarketplaceSimulationOverlay
      mockLeads={leads}
      getIcon={getIcon}
      getColor={getColor}
      viewMode={isContractor ? 'contractor' : 'customer'}
      user={user ? { id: user.id, email: user.email } : undefined}
    />
  );
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, role, isLoading } = useAuth();
  const [grantForm, setGrantForm] = useState<GrantFormState>({
    buildingYear: '',
    heatingSystem: '',
    workType: '',
  });

  // Note: isMobile was used for mobile app dashboard, no longer needed
  // All users (mobile + desktop) now see the normal homepage with real map

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-vvm-blue-800 via-vvm-blue-700 to-vvm-blue-900 overflow-hidden pt-16 pb-6 lg:pt-20 lg:pb-10 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-vvm-blue-950/60 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-3">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-center">

            {/* LEFT - Landing Text */}
            <div className="text-white space-y-5 z-20">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 shadow-lg">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="font-medium text-emerald-100">Rendelj szakit, mint egy taxit!</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-bold font-heading leading-[1.1] tracking-tight">
                Találd meg a tökéletes<br />
                <span className="text-vvm-yellow-400">szakembert</span> percek alatt!
              </h1>

              <p className="text-lg md:text-xl text-blue-100 max-w-lg leading-relaxed font-light">
                A VízVillanyFűtés az új generációs platform, ami azonnal összeköt téged a közeledben lévő, ellenőrzött víz-, villany- és fűtésszerelőkkel.
              </p>

              {/* Main CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  role === 'contractor' ? (
                    <>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'contractor' } }))}
                        className="bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)]"
                      >
                        <Search className="w-6 h-6" />
                        <span>Elérhető munkák</span>
                      </button>
                      <Link href="/fiok" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-colors">
                        <Award className="w-6 h-6" />
                        <span>Kredit & Statisztikám</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'customer', autoAdd: true } }))}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                      >
                        <AlertTriangle className="w-6 h-6" />
                        <span>Hibát jelzek!</span>
                      </button>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'customer', initialTab: 'own' } }))}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-colors"
                      >
                        <FileCheck className="w-6 h-6" />
                        <span>Bejelentéseim</span>
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <Link href="/foglalas" className="bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                      <User className="w-6 h-6" />
                      <span>Ügyfél vagyok</span>
                    </Link>
                    <Link href="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-colors">
                      <Wrench className="w-6 h-6" />
                      <span>Szakember vagyok</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust indicators & Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-white/10">

                {/* Google Rating Badge */}
                <div className="flex flex-col pr-6 border-r border-white/10 hidden sm:flex">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-3xl font-bold text-white leading-none">4.9</span>
                    <svg className="w-6 h-6 text-vvm-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-blue-200 text-sm font-medium">Google értékelés</span>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-blue-100">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">100% Ellenőrzött mesterek</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">Gyorsabb a hagyományos keresésnél</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">Számlaképes munkavégzés</span>
                  </div>
                </div>

                {/* Mobile Google Rating (shown only on small screens) */}
                <div className="flex items-center gap-3 sm:hidden pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-white leading-none">4.9</span>
                    <svg className="w-5 h-5 text-vvm-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-blue-200 text-sm font-medium">Google értékelés</span>
                </div>

              </div>
            </div>

            {/* RIGHT - Dynamic Map Visualization */}
            <div className="relative w-full h-full lg:min-h-[420px] z-20">
              <TeaserMap />
            </div>

          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="trust-badge">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="font-medium text-gray-800">Ellenőrzött szakemberek</span>
            </div>
            <div className="trust-badge">
              <Shield className="w-8 h-8 text-vvm-blue-500" />
              <span className="font-medium text-gray-800">Garanciális munka</span>
            </div>
            <div className="trust-badge">
              <Receipt className="w-8 h-8 text-vvm-yellow-500" />
              <span className="font-medium text-gray-800">Hivatalos számla</span>
            </div>
            <div className="trust-badge">
              <FileCheck className="w-8 h-8 text-orange-500" />
              <span className="font-medium text-gray-800">Pályázathoz elfogadott</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 via-indigo-50/60 to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorksAnimation />
          <p className="text-center text-xs sm:text-sm text-slate-400 font-medium tracking-wider mt-12 px-4">
            —&nbsp;Magyarország leginnovatívabb szakember kereső rendszere&nbsp;—
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Miben tudunk segíteni?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Platformunk összeköti azokat, akiknek víz-, villany- vagy fűtésproblémájuk van, azokkal a szakemberekkel, akik azonnal meg tudják oldani. Gyorsan, egyszerűen, megbízhatóan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link
                key={index}
                href={service.link}
                className="service-card group"
              >
                <div className={`service-icon ${service.color}`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-vvm-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center text-vvm-blue-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Részletek</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Registration Incentive Section */}
      <section className="py-12 md:py-16 relative overflow-hidden bg-vvm-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content - The Pitch */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-sm text-blue-100 shadow-sm backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-vvm-yellow-400" />
                <span className="font-semibold tracking-wide uppercase text-[11px]">Limitált ajánlat új csatlakozóknak</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold font-heading leading-[1.1] tracking-tight text-white">
                Szakember vagy? Dolgozz ott, ahol akarsz, akkor, amikor akarsz.
              </h2>

              <p className="text-base md:text-lg text-blue-100 leading-relaxed font-light">
                Csak kiválasztod a térképen a számodra szimpatikus munkát, a neked megfelelő helyen – és már indulhatsz is. Próbáld ki rendszerünket: regisztrálj most, és <strong className="text-vvm-yellow-400 font-semibold">10 000 Ft induló kreditet kapsz ajándékba</strong>, amiből azonnal elkezdhetsz munkákat vállalni.
              </p>

              <div className="bg-white/10 border border-white/20 rounded-xl p-4 relative overflow-hidden group hover:border-vvm-yellow-400 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-vvm-yellow-400/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-vvm-yellow-400/30 transition-all"></div>

                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2.5">
                  <div className="bg-vvm-yellow-400 text-gray-900 p-1.5 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  Induló Ajándék: <span className="text-vvm-yellow-400">10 000 Ft</span> Kredit
                </h3>

                <ul className="space-y-2 font-medium text-blue-50 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Regisztrálj most, és jóváírunk <strong>10 000 Ft</strong> értéket a fiókodban.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Ebből a keretből <strong>azonnal elkezdhetsz munkákat vállalni</strong> a térképről.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Kockázatmentes próbalehetőség – próbáld ki a rendszert ingyen!</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link href="/login" className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-vvm-yellow-400 to-vvm-yellow-500 hover:from-vvm-yellow-300 hover:to-vvm-yellow-400 text-gray-900 font-black text-base py-3.5 px-8 rounded-xl gap-2.5 transition-all transform hover:scale-[1.03] shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                  <Wrench className="w-5 h-5" />
                  <span>Szakember Regisztráció / Belépés</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <p className="text-xs text-blue-200/70 text-center sm:text-left mt-2">Rugalmas beosztás • Kiszámítható bevétel • Garantált ügyfélkör</p>
              </div>
            </div>

            {/* Right Content - Visuals / Social Proof */}
            <div className="relative mt-6 lg:mt-0 lg:ml-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-2xl rounded-[3rem] -z-10"></div>

              <div className="grid gap-4 relative">
                {/* Card 1 */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Térképes Munkaválasztás</div>
                      <div className="text-sm text-slate-400">Lásd azonnal mi van a közeledben</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Nem a diszpécser osztja a munkát. Felnyitod az appot, látod a térképen az elérhető feladatokat a közeledben, és lecsapsz arra, amelyik szimpatikus.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl transform hover:-translate-y-1 transition-transform duration-300 lg:-ml-8 lg:mr-8 border-l-4 border-l-vvm-yellow-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-vvm-yellow-500/20 rounded-full flex items-center justify-center text-vvm-yellow-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Nincs jutalék, csak Fix Díj</div>
                      <div className="text-sm text-slate-400">Tartsd meg, amit megkeresel</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Nem vonunk le %-os jutalékot a munkadíjadból. Csak egy fix (munkától függő) "Lead Díjat" fizetsz a feladat megnyitásáért a kreditegyenlegedből.
                  </p>
                </div>

                {/* Testimonial Snippet */}
                <div className="relative mt-3 group">
                  <div className="absolute -left-2.5 -top-2.5 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-slate-900 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                    </svg>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl pt-5 italic text-sm text-indigo-100/90 leading-relaxed backdrop-blur-sm relative">
                    Mióta itt vállalok munkát, ott és akkor dolgozom, amikor akarok. A 10 ezer forintos bónuszból 3 kisebb munkát is el tudtam vinni első nap!
                    <div className="mt-4 flex items-center gap-3 not-italic">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">TJ</div>
                      <div className="text-xs">
                        <span className="block font-semibold text-white">Tóth József</span>
                        <span className="text-indigo-300">Vízszerelő, XIV. ker.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Grant Calculator Lead Magnet */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyGjR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Award className="w-4 h-4" />
                <span>Otthonfelújítási Program 2025</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Tudja meg 1 perc alatt, <br />
                jogosult-e akár <span className="text-amber-300">6 millió Ft</span> <br />
                támogatásra!
              </h2>

              <p className="text-lg text-emerald-100 mb-8">
                Víz–villany–fűtés korszerűsítésre pályázati támogatás igényelhető.
                Mi segítünk a teljes ügyintézésben – a papírmunkától a kivitelezésig.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Ingyenes jogosultság ellenőrzés</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Teljes pályázati dokumentáció készítése</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Sikerdíjas konstrukció – csak ha nyer</span>
                </div>
              </div>

              <Link href="/palyazat-kalkulator" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-4 px-8 rounded-xl hover:bg-emerald-50 transition-colors shadow-xl">
                <span>Ingyenes jogosultság ellenőrzés</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-sm text-emerald-200 mt-4">
                Nem kötelez szerződéskötésre, csak tájékoztató.
              </p>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 sm:mb-6">Gyors előszűrés</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mikor épült az ingatlan?
                    </label>
                    <select
                      className="input-field"
                      value={grantForm.buildingYear}
                      onChange={(e) => setGrantForm(prev => ({ ...prev, buildingYear: e.target.value }))}
                    >
                      <option value="">Válasszon...</option>
                      <option value="1970-elott">1970 előtt</option>
                      <option value="1970-1990">1970-1990 között</option>
                      <option value="1990-utan">1990 után</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Milyen fűtési rendszer van?
                    </label>
                    <select
                      className="input-field"
                      value={grantForm.heatingSystem}
                      onChange={(e) => setGrantForm(prev => ({ ...prev, heatingSystem: e.target.value }))}
                    >
                      <option value="">Válasszon...</option>
                      <option value="gazkazan">Gázkazán</option>
                      <option value="tavfutes">Távfűtés</option>
                      <option value="elektromos">Elektromos</option>
                      <option value="vegyes">Vegyes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mit szeretne korszerűsíteni?
                    </label>
                    <select
                      className="input-field"
                      value={grantForm.workType}
                      onChange={(e) => setGrantForm(prev => ({ ...prev, workType: e.target.value }))}
                    >
                      <option value="">Válasszon...</option>
                      <option value="futes">Fűtésrendszer</option>
                      <option value="villany">Villamos hálózat</option>
                      <option value="viz">Vízvezeték rendszer</option>
                      <option value="kombinalt">Kombinált felújítás</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (grantForm.buildingYear) params.set('eppitkoz', grantForm.buildingYear);
                      if (grantForm.heatingSystem) params.set('futes', grantForm.heatingSystem);
                      if (grantForm.workType) params.set('munka', grantForm.workType);
                      router.push(`/palyazat-kalkulator${params.toString() ? '?' + params.toString() : ''}`);
                    }}
                    className="btn-secondary w-full py-4 text-lg mt-4"
                  >
                    Jogosultság ellenőrzése
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Amit ügyfeleink mondanak</h2>
            <p className="section-subtitle">
              Több ezer elégedett ügyfél Budapesten és Pest megyében.
            </p>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-[85vw] xs:w-[75vw] md:w-auto snap-start">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </div>
                  </div>
                  <div className="text-sm text-vvm-blue-600 font-medium">
                    {testimonial.service}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Google Reviews Badge */}
          <div className="mt-12 flex justify-center">
            <div className="bg-white rounded-xl shadow-lg px-8 py-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" className="w-8 h-8" />
                <div>
                  <div className="font-bold text-gray-800">4.9 / 5</div>
                  <div className="text-sm text-gray-500">1200+ sikeres kiszállás</div>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 leading-tight">
            Többé nem kell hetekig <br />
            <span className="text-vvm-yellow-400">könyörögni egy szerelőnek!</span>
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Dobd fel a problémádat a platformra 1 perc alatt teljesen ingyenesen, és dőlj hátra: az elérhető ügyeskezű szomszéd szerelők fognak versengeni a munkádért.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 mt-10">
            <Link href="/foglalas" className="bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold px-10 py-5 rounded-2xl text-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              <User className="w-6 h-6" />
              <span>Ügyfél vagyok</span>
            </Link>
            <Link href="/visszahivas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-6 sm:px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-base sm:text-lg border border-white/20">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Visszahívást kérek</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              <span>Ingyenes árajánlat</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>1 év garancia</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>SOS 2 órán belül</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

