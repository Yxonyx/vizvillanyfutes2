'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, ChevronRight, ArrowRight, Phone, Calendar,
  Droplets, Zap, Flame, AlertTriangle, Shield, FileCheck,
  Receipt, Star, Clock, MapPin, CheckCircle, Users, User,
  Building, Wrench, ThumbsUp, Award, Briefcase, Send, Gift
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
  { value: '100%', label: 'Minőség és Megbízhatóság' },
];





export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, role, isLoading } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Uber-Style Hero Section */}
      <section className="relative w-full h-[100dvh] lg:h-auto lg:min-h-[85vh] bg-zinc-950 overflow-hidden flex flex-col lg:justify-center pt-0 lg:pt-28 lg:pb-20 border-b border-white/5">

        {/* Desktop Gradient Overlay - Dark Gray on the left (softer), fading quickly to transparent on the right */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-zinc-950/95 via-zinc-950/20 to-transparent z-10 pointer-events-none"></div>

        {/* BACKGROUND - Map Visualization */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <TeaserMap />
        </div>

        {/* LEFT/BOTTOM - Floating Bottom Sheet (Mobile) & Landing Text (Desktop) */}
        <div className="relative z-20 flex-1 flex flex-col justify-end lg:justify-center w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pointer-events-none h-full">
          <div className="bg-vvm-blue-950/95 backdrop-blur-2xl lg:bg-transparent lg:backdrop-blur-none rounded-t-[2.5rem] lg:rounded-none px-4 pt-3 pb-4 sm:p-8 lg:p-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] lg:shadow-none border-t border-white/15 lg:border-0 pointer-events-auto w-full lg:w-[60%] xl:w-[55%] flex flex-col lg:justify-center">

            {/* Mobile drag handle indicator */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 lg:hidden opacity-80"></div>

            {/* MOBILE HERO (Uber bottom sheet style) */}
            <div className="text-white space-y-2 text-center flex flex-col items-center lg:hidden">
              <h1 className="text-3xl leading-[1.1] sm:text-4xl font-black font-heading tracking-tight text-center">
                Kérj <span className="text-vvm-yellow-400">segítséget</span> azonnal!
              </h1>

              <p className="text-xs sm:text-base text-blue-50/90 max-w-lg leading-relaxed font-light mx-auto">
                <strong className="text-white font-semibold">Rendelj szakit, mint egy taxit!</strong> A platform, ami azonnal összeköt az ellenőrzött szerelőkkel.
              </p>

              {/* Main CTA - Compact "Wolt" Style Action Row */}
              <div className="w-full flex gap-3">
                {isAuthenticated ? (
                  role === 'contractor' ? (
                    <>
                      <button
                        onClick={() => router.push('/contractor/dashboard')}
                        className="flex-1 bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-sm py-3.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_4px_20px_rgba(250,204,21,0.3)]"
                      >
                        <Search className="w-5 h-5" />
                        <span className="whitespace-nowrap">Munkák</span>
                      </button>
                      <Link href="/fiok" className="flex-1 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-lg border border-white/20 text-white font-bold text-sm py-3.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95">
                        <Award className="w-5 h-5" />
                        <span className="whitespace-nowrap">Kredit</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'customer', autoAdd: true } }))}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm py-3.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        <span className="whitespace-nowrap">Hiba!</span>
                      </button>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'customer', initialTab: 'own' } }))}
                        className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur-lg border border-white/20 text-white font-bold text-sm py-3.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                      >
                        <FileCheck className="w-5 h-5" />
                        <span className="whitespace-nowrap">Hibáim</span>
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <Link href="/login?role=customer" className="flex-1 bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-[15px] py-3.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_4px_20px_rgba(250,204,21,0.3)]">
                      <User className="w-5 h-5 flex-shrink-0" />
                      <span>Ügyfél</span>
                    </Link>
                    <Link href="/login" className="flex-1 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-lg border border-white/20 text-white font-bold text-[15px] py-3.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95">
                      <Wrench className="w-5 h-5 flex-shrink-0" />
                      <span>Szakember</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="w-full pt-3 border-t border-white/10 mt-1 flex justify-center">
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 sm:gap-x-12 w-fit">
                  {[
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: 'Ellenőrzött' },
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: 'Azonnali' },
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: 'Garanciális' },
                    { icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />, text: '0-24 Elérhető' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[13px] sm:text-sm text-blue-100/90 font-medium justify-start">
                      {item.icon}
                      <span className="whitespace-nowrap">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP HERO (Original Layout) */}
            <div className="hidden lg:flex flex-col items-start space-y-6 text-left pr-8 w-full max-w-[700px]">
              <h1 className="text-[2.75rem] lg:text-[3.5rem] xl:text-[4rem] font-bold font-heading tracking-tight leading-[1.1] text-white">
                Találd meg a <br />
                tökéletes <span className="text-vvm-yellow-400">szakembert</span><br />
                percek alatt!
              </h1>

              <p className="text-lg text-blue-100/90 max-w-lg leading-relaxed font-light">
                <strong className="text-white font-semibold tracking-wide">Rendelj szakit, mint egy taxit!</strong><br />
                A VízVillanyFűtés az új generációs platform, ami azonnal
                összeköt téged a közeledben lévő, ellenőrzött víz-, villany- és
                fűtésszerelőkkel.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
                {isAuthenticated ? (
                  role === 'contractor' ? (
                    <>
                      <button
                        onClick={() => router.push('/contractor/dashboard')}
                        className="bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(250,204,21,0.3)]"
                      >
                        <Search className="w-6 h-6" />
                        <span>Munkák böngészése</span>
                      </button>
                      <Link href="/fiok" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105">
                        <Award className="w-6 h-6" />
                        <span>Kreditégyenlegem</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'customer', autoAdd: true } }))}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
                      >
                        <AlertTriangle className="w-6 h-6" />
                        <span>Hiba bejelentése!</span>
                      </button>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode: 'customer', initialTab: 'own' } }))}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                      >
                        <FileCheck className="w-6 h-6" />
                        <span>Folyamatban</span>
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <Link href="/login?role=customer" className="flex-1 bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-gray-900 font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(250,204,21,0.3)]">
                      <User className="w-6 h-6 flex-shrink-0" />
                      <span className="whitespace-nowrap">Ügyfél vagyok</span>
                    </Link>
                    <Link href="/login" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105">
                      <Wrench className="w-6 h-6 flex-shrink-0" />
                      <span className="whitespace-nowrap">Szakember vagyok</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-8 w-full mt-auto">
                <div className="flex items-center gap-3 mb-6 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="text-[2rem] font-black text-white leading-none whitespace-nowrap">4.9 / 5</div>
                    <div className="w-px h-8 bg-white/20 mx-2 hidden sm:block"></div>
                    <div className="flex text-vvm-yellow-400">
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 font-medium whitespace-nowrap">
                    <div className="bg-white p-0.5 rounded-full flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    Google értékelés
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {[
                    { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: 'Ellenőrzött mesterek' },
                    { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: 'Gyorsabb kereső' },
                    { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: 'Számlaképes szakember' },
                    { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, text: '24/7 Elérhető' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[15px] text-blue-100/90 font-medium whitespace-nowrap">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="pt-12 md:pt-16 pb-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorksAnimation />
          <p className="text-center text-xs sm:text-sm text-gray-900 font-bold tracking-wider mt-6 px-4 py-2 opacity-80">
            Magyarország leginnovatívabb szakember kereső rendszere
          </p>
        </div>
      </section>

      {/* Why Choose Us Section - Image Matched Style */}
      <section className="relative py-12 lg:py-20 bg-gradient-to-br from-vvm-blue-800 via-vvm-blue-700 to-vvm-blue-900 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Badge-less Layout */}
          <div className="py-8 md:py-12 lg:py-16 relative">
            <div className="relative z-10 flex flex-col">

              {/* Centered Massive Title */}
              <div className="flex flex-col items-center text-center mb-10 md:mb-14">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.05] font-bold font-heading tracking-tight text-white mb-3 lg:mb-4 px-2">
                  Miért a <br className="sm:hidden" />VízVillanyFűtés?
                </h2>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-vvm-yellow-500 tracking-tight">
                  Mert az időd drága.
                </p>
              </div>

              {/* Clean Text Blocks restores original text */}
              <div className="grid md:grid-cols-2 gap-8 lg:gap-16">

                {/* Paragraph 1 */}
                <div>
                  <p className="text-base lg:text-lg text-gray-300 leading-relaxed font-light">
                    <strong className="text-white font-bold">Tudjuk, milyen frusztráló tucatnyi weboldalt végighívni</strong>, csak hogy kiderüljön: mindenki hetekre előre be van táblázva. Ráadásul a legjobb szakiknak gyakran nincs is weboldala, így esélyed sincs rájuk találni. <strong className="text-vvm-yellow-500 font-bold">Mi ezt a keresgélést spóroljuk meg neked.</strong>
                  </p>
                </div>

                {/* Paragraph 2 */}
                <div>
                  <p className="text-base lg:text-lg text-gray-300 leading-relaxed font-light">
                    Félsz, kit engedsz be a lakásba? Erre a garancia a <strong className="text-white font-bold">független értékelési rendszerünk</strong>. A munkavégzés után adott valós ügyfélvélemények szűrik a szakikat. Ha egy mesterember megbízható és tisztességes munkát végez, nálunk a jó értékeléseknek köszönhetően <strong className="text-vvm-yellow-500 font-bold">egyre több munkát vihet el</strong>. Win-win szituáció!
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Wolt-style compact categories) */}
      <section className="relative py-8 lg:py-16 bg-white overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center mb-10 lg:mb-14 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-vvm-blue-900 mb-3 lg:mb-4">Szolgáltatások</h2>
            <p className="text-sm sm:text-base lg:text-lg font-medium text-slate-500 max-w-xl mx-auto">
              Válassz kategóriát, és találd meg a megfelelő szakembert azonnal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                href={service.link}
                className="group relative flex flex-col bg-white p-6 sm:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden active:scale-[0.98]"
              >
                {/* Icon Container */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${service.color} flex items-center justify-center text-white mb-5 sm:mb-6`}>
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold font-heading text-vvm-blue-900 leading-tight mb-3">
                  {service.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-grow">
                  {service.description}
                </p>

                {/* Link at the bottom */}
                <div className="flex items-center text-[13px] sm:text-sm text-vvm-blue-600 font-bold group-hover:gap-1.5 transition-all mt-auto pt-4 border-t border-slate-50">
                  <span>Részletek</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor Registration Hero */}
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
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold font-heading mb-6 leading-[1.1] tracking-tight text-white mt-4 sm:mt-0">
                Legyél te is a <span className="text-vvm-yellow-400">szakemberünk!</span>
              </h2>

              <p className="text-lg md:text-xl text-blue-100 mb-8 font-light leading-relaxed max-w-lg">
                <strong className="text-white font-semibold">Mi hozzuk az ügyfelet</strong>, te pedig elvégzed a munkát. Maradj <strong className="text-white font-semibold">szabadúszó</strong>, mi csak a <strong className="text-white font-semibold">marketinget és a kapcsolatépítést</strong> biztosítjuk számodra.
              </p>

              <ul className="space-y-4 mb-8 border border-white/10 rounded-2xl p-5 bg-vvm-blue-800/80 backdrop-blur-md lg:border-0 lg:p-0 lg:rounded-none lg:bg-transparent lg:backdrop-blur-none">
                {[
                  { icon: <MapPin className="w-4 h-4" />, color: 'bg-sky-500', text: 'Folyamatos ügyfélkapcsolatok Budapest és Pest megyében' },
                  { icon: <Award className="w-4 h-4" />, color: 'bg-emerald-500', text: '10.000 Ft kezdő kredit az induláshoz' },
                  { icon: <Receipt className="w-4 h-4" />, color: 'bg-amber-500', text: 'Nincs százalékos jutalék, te egyezel meg az ügyféllel' },
                  { icon: <Briefcase className="w-4 h-4" />, color: 'bg-indigo-500', text: 'Egy ügyfél közvetítése kb. egy kávé ára (~2.000 Ft)' },
                  { icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500', text: 'Rugalmas időbeosztás, maradsz a saját főnököd' },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-blue-50 font-medium">
                    <span className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <Link
                  href="/csatlakozz-partnerkent#szakember_regisztracio"
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-vvm-yellow-400 to-vvm-yellow-500 hover:from-vvm-yellow-300 to-vvm-yellow-400 text-gray-900 font-black text-[13px] sm:text-base py-3.5 sm:py-4 px-3 sm:px-8 rounded-xl gap-1.5 sm:gap-2 transition-all transform hover:scale-[1.03] shadow-[0_0_30px_rgba(250,204,21,0.3)]"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Regisztrálok szakemberként</span>
                </Link>
                <Link
                  href="/csatlakozz-partnerkent"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold flex-1 py-3.5 sm:py-4 px-3 sm:px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[13px] sm:text-base"
                >
                  <span>Tudj meg többet</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>

              {/* Mobile Affiliate Banner (Hidden on Desktop) */}
              <div className="mt-4 sm:mt-8 lg:hidden animate-fade-in-up">
                <Link href="/ajanlo-program" className="relative overflow-hidden block bg-white/5 border border-white/10 rounded-2xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md group transition-all active:scale-[0.98] hover:bg-white/10 hover:border-white/20">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-vvm-yellow-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.4)] relative overflow-hidden">
                      <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                      {/* Shine effect on icon */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-shine opacity-50" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold leading-tight mb-0.5 text-[13px] sm:text-[14px]">Érdekel, hogyan szerezhetsz még <span className="text-vvm-yellow-400">10.000 Ft</span> értékben kreditet?</h4>
                      <div className="flex items-center gap-1 text-blue-200 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase">
                        Kreditgyűjtő program <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                  {/* Subtle decorative glow */}
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-vvm-yellow-400/15 blur-2xl rounded-full pointer-events-none"></div>
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
              <div className="absolute bottom-4 -right-2 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 z-20" style={{ animation: 'float 3s ease-in-out 1.5s infinite' }}>
                <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Te szabod</div>
                  <div className="text-[10px] text-gray-500 font-medium">az árat az ügyféllel</div>
                </div>
              </div>

              {/* Floating Affiliate Banner */}
              {!user && (
                <Link href="/ajanlo-program" className="absolute top-1/2 -right-16 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-4 flex flex-col gap-3 z-30 transform transition-transform hover:scale-105 border border-emerald-100 group" style={{ animation: 'float 4s ease-in-out 0.2s infinite' }}>
                  <div className="flex items-start gap-3 w-56">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-1">Érdekel, hogyan szerezhetsz még 10.000 Ft értékben kreditet?</h4>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    Mutasd a részleteket <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              )}

            </div>
          </div>
        </div>
      </section >




      {/* Testimonials */}
      < section className="py-16 md:py-24 bg-gray-50" >
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
              <div className="flex items-center gap-3">
                <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" className="w-8 h-8" />
                <div className="font-extrabold text-gray-800 text-xl">4.9 / 5</div>
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
      </section >

      {/* Final CTA */}
      < section className="py-16 md:py-24 bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white relative overflow-hidden" >
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
            <Link href="/csatlakozz-partnerkent" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-6 sm:px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-base sm:text-lg border border-white/20">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Szakember vagyok</span>
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
      </section >
    </div >
  );
}

