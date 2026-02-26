'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, ChevronRight, ArrowRight, Phone, Calendar,
  Droplets, Zap, Flame, AlertTriangle, Shield, FileCheck,
  Receipt, Star, Clock, MapPin, CheckCircle, Users, User,
  Building, Wrench, ThumbsUp, Award, Briefcase, Send
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
      const { data } = await supabase.from('leads').select('*').eq('status', 'waiting').order('created_at', { ascending: false });
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
            <div className="text-white space-y-5 z-20 relative text-center lg:text-left items-center lg:items-start flex flex-col">
              {/* Subtle radial glow on mobile */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:-top-10 lg:-left-10 w-[300px] h-[300px] bg-vvm-blue-400/20 rounded-full blur-[100px] -z-10 lg:hidden"></div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 shadow-lg mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="font-medium text-white font-bold tracking-wide">Rendelj szakit, mint egy taxit!</span>
              </div>

              <h1 className="text-[2.25rem] md:text-5xl lg:text-[4rem] font-bold font-heading leading-[1.1] tracking-tight text-center lg:text-left">
                Találd meg a<br />
                <span className="whitespace-nowrap">tökéletes <span className="text-vvm-yellow-400">szakembert</span></span><br />
                percek alatt!
              </h1>

              <p className="text-xl md:text-xl text-blue-50 max-w-lg leading-relaxed font-light mx-auto lg:mx-0">
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
                    <Link href="/login?role=customer" className="bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
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
              <div className="pt-6 border-t border-white/10 space-y-4">

                {/* Google Rating Badge - visible on all screens */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15 w-fit mx-auto lg:mx-0 lg:bg-transparent lg:backdrop-blur-none lg:rounded-none lg:px-0 lg:py-0 lg:border-0">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white leading-none">4.9</span>
                    <div className="flex gap-0.5 ml-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-vvm-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-white/20 pl-3 lg:border-l-0 lg:pl-0 lg:ml-1">
                    <span className="text-blue-100 text-sm font-medium">Google értékelés</span>
                  </div>
                </div>

                {/* Features as compact 2x2 grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 lg:flex lg:gap-6">
                  {[
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: 'Ellenőrzött mesterek' },
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: 'Gyorsabb kereső' },
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: 'Számlaképes munka' },
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: '24/7 Elérhető' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-sm text-blue-100 font-medium">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* RIGHT - Dynamic Map Visualization */}
            <div className="relative w-full h-full lg:min-h-[420px] z-20">
              <TeaserMap />
            </div>

          </div>
        </div >
      </section >

      {/* Trust Bar */}
      < section className="bg-white border-b border-gray-100" >
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-100 via-blue-50 to-white overflow-hidden">
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

      {/* Contractor Registration Hero (Moved from registration page) */}
      <section className="relative bg-gradient-to-br from-vvm-blue-800 via-vvm-blue-700 to-vvm-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEg0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>

        {/* Mobile background figure — visible only below lg */}
        <div className="absolute inset-0 lg:hidden pointer-events-none" aria-hidden="true">
          <img
            src="/hero_stats_large.webp"
            alt=""
            className="absolute right-[-15%] top-0 h-[70%] w-auto object-contain object-top opacity-[0.4]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text content */}
            <div className="relative z-20">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 rounded-full px-4 py-2 text-sm text-emerald-300 mb-6 border border-emerald-500/30">
                <Briefcase className="w-4 h-4" />
                <span className="font-semibold tracking-wide uppercase text-[11px]">Szakember Regisztráció</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold font-heading mb-6 leading-[1.1] tracking-tight text-white">
                Legyél te is a <span className="text-vvm-yellow-400">szakemberünk!</span>
              </h2>

              <p className="text-lg md:text-xl text-blue-100 mb-8 font-light leading-relaxed max-w-lg">
                <strong className="text-white font-semibold">Mi hozzuk az ügyfelet</strong>, te pedig elvégzed a munkát. Maradj <strong className="text-white font-semibold">szabadúszó</strong>, mi csak a <strong className="text-white font-semibold">marketinget és a kapcsolatépítést</strong> biztosítjuk számodra.
              </p>

              <ul className="space-y-4 mb-8 border border-white/10 rounded-2xl p-5 bg-vvm-blue-800/80 backdrop-blur-md lg:border-0 lg:p-0 lg:rounded-none lg:bg-transparent lg:backdrop-blur-none">
                {[
                  { icon: <MapPin className="w-4 h-4" />, color: 'bg-sky-500', text: 'Folyamatos ügyfélkapcsolatok Budapest és Pest megyében' },
                  { icon: <Award className="w-4 h-4" />, color: 'bg-emerald-500', text: '10.000 Ft kezdő kredit az induláshoz' },
                  { icon: <Receipt className="w-4 h-4" />, color: 'bg-amber-500', text: 'Nincs százalékos jutalék — te egyezel meg az ügyféllel' },
                  { icon: <Briefcase className="w-4 h-4" />, color: 'bg-indigo-500', text: 'Egy ügyfél közvetítése kb. egy kávé ára (~2.000 Ft)' },
                  { icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500', text: 'Rugalmas időbeosztás — maradsz a saját főnököd' },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-blue-50 font-medium">
                    <span className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link
                  href="/csatlakozz-partnerkent#szakember_regisztracio"
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-vvm-yellow-400 to-vvm-yellow-500 hover:from-vvm-yellow-300 to-vvm-yellow-400 text-gray-900 font-black text-sm sm:text-base py-3.5 px-3 sm:px-8 rounded-xl gap-2 transition-all transform hover:scale-[1.03] shadow-[0_0_30px_rgba(250,204,21,0.3)]"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Regisztrálok szakemberként</span>
                </Link>
                <Link
                  href="/csatlakozz-partnerkent"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold flex-1 py-3.5 px-4 sm:px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <span>Tudj meg többet</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>

            {/* Right - Desktop figure (hidden on mobile, shown on lg+) */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-2xl rounded-[3rem] -z-10"></div>
              <img
                src="/hero_stats_large.webp"
                alt="Szakemberünk munka közben"
                className="w-full max-w-lg rounded-2xl shadow-2xl drop-shadow-xl object-contain"
              />

              {/* Floating Badge: Free registration */}
              <div className="absolute top-4 -left-8 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float z-20">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Ingyenes</div>
                  <div className="text-[10px] text-gray-500 font-medium">Regisztráció</div>
                </div>
              </div>

              {/* Floating Badge: Starting credit */}
              <div className="absolute bottom-8 -left-12 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 z-20" style={{ animation: 'float 3s ease-in-out 0.5s infinite' }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">10.000 Ft</div>
                  <div className="text-[10px] text-gray-500 font-medium">Induló kredit</div>
                </div>
              </div>

              {/* Floating Badge: No commission */}
              <div className="absolute top-12 -right-6 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 z-20" style={{ animation: 'float 3s ease-in-out 1s infinite' }}>
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">0% jutalék</div>
                  <div className="text-[10px] text-gray-500 font-medium">Nincs százalék</div>
                </div>
              </div>

              {/* Floating Badge: You set the price */}
              <div className="absolute bottom-16 -right-4 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 z-20" style={{ animation: 'float 3s ease-in-out 1.5s infinite' }}>
                <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Te szabod</div>
                  <div className="text-[10px] text-gray-500 font-medium">az árat az ügyféllel</div>
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

          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto py-8 px-4 -mx-4 md:p-8 md:-m-8 snap-x snap-mandatory md:snap-none scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
            <Link href="/login?role=customer" className="bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold px-10 py-5 rounded-2xl text-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
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
              <span>Ingyenes ajánlatkérés</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Versengő szakemberek</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Értékelt szakemberek</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

