'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Droplets, Zap, Flame, CheckCircle, ArrowRight,
  Users, DollarSign, Headphones, Clock, Shield,
  ChevronDown, Phone, Mail, Building, Briefcase,
  Calendar, Star, MapPin, FileText, Send, Lock,
  Gift, Sparkles, Trophy, User, AlertTriangle
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatHungarianPhone, isValidHungarianPhone } from '@/utils/phoneFormat';

// Target profiles
const targetProfiles = [
  {
    type: 'vizszerelo',
    icon: Droplets,
    color: 'sky',
    title: 'Önálló vízszerelő vállalkozók',
    description: 'Vízszerelőket keresünk, akik saját szerszámokkal és vállalkozói engedéllyel rendelkeznek, és szeretnének kiszámíthatóbb, tervezhetőbb munkamennyiséget.',
  },
  {
    type: 'villanyszerelo',
    icon: Zap,
    color: 'amber',
    title: 'Villanyszerelő mesterek és csapatok',
    description: 'Egyéni villanyszerelőket és kisebb csapatokat is várunk, akik szívesen vállalnak hibajavítást, kisebb felújításokat, mérőhely rendezést és panel / társasházi munkákat.',
  },
  {
    type: 'futesszerelo',
    icon: Flame,
    color: 'orange',
    title: 'Fűtésszerelők, kazános szakemberek',
    description: 'Kazáncsere, karbantartás, fűtéskorszerűsítés, energetikai felújítások területén jártas szakembereket keresünk, akik hosszabb távú, magasabb értékű projekteket is vállalnak.',
  },
];

// Benefits
const benefits = [
  {
    icon: Users,
    title: 'Megbízható lead generálás',
    description: 'Mi összekötünk az ügyféllel, te pedig elvégzed a munkát. Hirdetés és marketing helyett elég csak a szakmádra koncentrálnod.',
  },
  {
    icon: DollarSign,
    title: 'Egy kávé ára egy ügyfélért',
    description: 'Nincs zsákbamacska, és nincs százalékos sikerdíj sem! A kredit csak akkor vonódik le, ha az ügyfél elfogadott szakemberként kiválaszt.',
  },
  {
    icon: Headphones,
    title: 'Backoffice támogatás',
    description: 'Ügyfélkommunikáció, időpont egyeztetés, alap adminisztráció – ezt mi kezeljük. Te a helyszíni munkára koncentrálsz.',
  },
  {
    icon: Clock,
    title: 'Kockázatmentes indulás',
    description: 'A sikeres regisztráció és adminisztrátori jóváhagyás után 10.000 Ft induló kreditet* írunk jóvá, így az első néhány ügyfelet teljesen ingyen hozunk neked.',
  },
];

// Requirements
const coreRequirements = [
  'Érvényes egyéni vállalkozói vagy cég státusz (EV, Kkt, Bt, Kft stb.)',
  'Számlaképesség (KATA, átalányadó, stb.)',
  'Saját szerszámkészlet az alapvető munkákhoz',
  'Szakmai gyakorlat és önálló munkavégzés',
  'Megbízhatóság, pontos megjelenés az egyeztetett időpontban',
  'Kulturált kommunikáció az ügyfelekkel',
];

// Process steps
const processSteps = [
  {
    number: 1,
    title: 'Regisztráció az oldalon',
    description: 'Kitöltöd a lenti regisztrációs űrlapot és létrehozod a szakember fiókodat. Email címed és jelszavad lesz a belépési adatod.',
  },
  {
    number: 2,
    title: 'Jóváhagyás és ellenőrzés',
    description: 'Munkatársunk átnézi a regisztrációdat, szükség esetén felveszi veled a kapcsolatot. Ez általában 1-2 munkanapot vesz igénybe.',
  },
  {
    number: 3,
    title: 'Hozzáférés a Szakember Portálhoz',
    description: 'Jóváhagyás után beléphetsz a Szakember Portálba, ahol látod a munkáidat, elfogadhatod vagy elutasíthatod a megbízásokat.',
  },
  {
    number: 4,
    title: 'Első munkák fogadása',
    description: 'A portálon keresztül kapod a munkákat. Elfogadod, kimész a helyszínre, elvégzed a munkát, és jelzed a befejezést.',
  },
  {
    number: 5,
    title: 'Folyamatos együttműködés',
    description: 'Ha jól teljesítesz, egyre több és jobb munkát kapsz. A portálon mindent nyomon követhetsz.',
  },
];

// Testimonials
const testimonials = [
  {
    name: 'Hegedűs Tamás',
    role: 'Vízszerelő mester',
    location: 'Budapest XIV.',
    quote: 'Évi 8–9 hónapban gyakorlatilag tele van a naptár. Nem nekem kell hirdetéssel foglalkozni, csak megyek a címre és dolgozom.',
  },
  {
    name: 'Lakatos Ádám',
    role: 'Villanyszerelő',
    location: 'Pest megye',
    quote: 'Végre egy rendszer, ahol nem húznak le százalékos jutalékkal. Fix áron megkapom a címet, onnantól pedig velem egyezik meg az ügyfél. Tiszta sor.',
  },
];

// FAQ
const faqs = [
  {
    question: 'Alkalmazottként is csatlakozhatok, vagy mindenképp vállalkozónak kell lennem?',
    answer: 'A szakember program kifejezetten vállalkozókra, alvállalkozókra van kialakítva (EV, Kft stb.). Alkalmazotti jogviszonyt nem kínálunk.',
  },
  {
    question: 'Mennyivel előre kapom meg a munkák adatait?',
    answer: 'Normál munkáknál jellemzően 1–3 nappal korábban, SOS munkáknál azonnal, telefonos vagy appos értesítéssel.',
  },
  {
    question: 'Van-e területi kizárólagosság?',
    answer: 'Bizonyos területeken törekszünk a kapacitás- és területi optimalizálásra, de teljes kizárólagosságot általában nem vállalunk. A cél, hogy mindenkinek legyen elég, de ne legyen túlterhelés.',
  },
  {
    question: 'Hogyan történik az elszámolás és kifizetés?',
    answer: 'A rendszerünk kredites alapon működik. Nincs zsákbamacska: a kredit (kb. egy kávé ára, ~2.000 Ft) csak akkor vonódik le a fiókodból, ha az ügyfél elfogadott szakemberként kiválaszt. Nincs százalékos jutalék, a munkadíjban ti állapodtok meg az ügyféllel, és az 100%-ban a tiéd. Induláskor ráadásul 10.000 Ft kezdő kreditet adunk, így az elején ingyen próbálhatod ki a rendszert!',
  },
  {
    question: 'Mennyi munkát tudtok adni havonta?',
    answer: 'Ez függ a szezonális időszakoktól, a szakmádtól és a területi lefedettségtől. A célunk, hogy a jó szakembereinknek folyamatos, tervezhető munkamennyiséget biztosítsunk.',
  },
];

// Form options
const szakmaOptions = [
  'Vízszerelő',
  'Villanyszerelő',
  'Fűtésszerelő',
  'Komplex (víz + villany + fűtés)',
  'Egyéb, gépészet / épületgépészet',
];

const munkateruletOptions = [
  'Budapest – Pesti oldal',
  'Budapest – Budai oldal',
  'Agglomeráció (pl. Budaörs, Törökbálint, Érd, Szentendre)',
  'Pest megye – egyéb',
];

const vallalkozoiFormaOptions = [
  'Egyéni vállalkozó',
  'Kft.',
  'Bt.',
  'Kkt.',
  'Még nincs vállalkozásom, de tervezem',
];

const tapasztalatOptions = [
  '0–2 év',
  '3–5 év',
  '6–10 év',
  '10+ év',
];

const kapacitasOptions = [
  '1–2 munka / hét',
  '3–5 munka / hét',
  '6–10 munka / hét',
  '10+ munka / hét',
  'Szezonálisan változó',
];

const biztositasOptions = [
  'Igen',
  'Nem, de vállalom, hogy kötök',
  'Nem, és nem is tervezek',
];

// Field mapping functions
const mapSzakmaToTrades = (szakma: string): string[] => {
  const mapping: Record<string, string[]> = {
    'Vízszerelő': ['viz'],
    'Villanyszerelő': ['villany'],
    'Fűtésszerelő': ['futes'],
    'Komplex (víz + villany + fűtés)': ['viz', 'villany', 'futes'],
    'Egyéb, gépészet / épületgépészet': ['combined'],
  };
  return mapping[szakma] || ['viz'];
};

const mapMunkateruletToServiceAreas = (munkateruletek: string[]): string[] => {
  const areas: string[] = [];
  munkateruletek.forEach(m => {
    if (m === 'Budapest – Pesti oldal') {
      areas.push('V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX');
    } else if (m === 'Budapest – Budai oldal') {
      areas.push('I', 'II', 'III', 'XI', 'XII', 'XXI', 'XXII', 'XXIII');
    } else {
      areas.push(m);
    }
  });
  return Array.from(new Set(areas)); // Remove duplicates
};

const mapVallalkozoiFormaToType = (forma: string): 'individual' | 'company' => {
  if (forma === 'Egyéni vállalkozó') return 'individual';
  return 'company';
};

const mapTapasztalatToYears = (tapasztalat: string): number => {
  const mapping: Record<string, number> = {
    '0–2 év': 1,
    '3–5 év': 4,
    '6–10 év': 8,
    '10+ év': 15,
  };
  return mapping[tapasztalat] || 1;
};

function PartnerOnboardingContent() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teljesNev: '',
    email: '',
    password: '',
    passwordConfirm: '',
    telefon: '',
    szakma: '',
    munkaterulet: [] as string[],
    vallalkozoiForma: '',
    biztositas: '',
    tapasztalat: '',
    bemutatkozas: '',
    kapacitas: '',
    weboldal: '',
    megjegyzes: '',
    adatkezelesElfogadva: false,
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHungarianPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefon: formatted }));
  };

  const isPhoneValid = formData.telefon === '' || isValidHungarianPhone(formData.telefon);
  const isPasswordValid = formData.password.length >= 8;
  const doPasswordsMatch = formData.password === formData.passwordConfirm;

  const handleMunkateruletChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      munkaterulet: prev.munkaterulet.includes(option)
        ? prev.munkaterulet.filter(t => t !== option)
        : [...prev.munkaterulet, option],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!isPasswordValid) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie');
      setIsSubmitting(false);
      return;
    }

    if (!doPasswordsMatch) {
      setError('A két jelszó nem egyezik');
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the backend API to register contractor
      const response = await fetch('/api/contractors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          display_name: formData.teljesNev,
          phone: formData.telefon,
          type: mapVallalkozoiFormaToType(formData.vallalkozoiForma),
          trades: mapSzakmaToTrades(formData.szakma),
          service_areas: mapMunkateruletToServiceAreas(formData.munkaterulet),
          years_experience: mapTapasztalatToYears(formData.tapasztalat),
          referralCode: referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        // Handle specific errors
        const errorMessage = data.error || 'Hiba történt a regisztráció során.';
        if (errorMessage.includes('already registered')) {
          setError('Ez az email cím már regisztrálva van. Kérjük jelentkezz be vagy használj másik email címet.');
        } else if (errorMessage.includes('password')) {
          setError('A jelszónak legalább 8 karakter hosszúnak kell lennie');
        } else {
          setError(errorMessage);
        }
      }
    } catch {
      setError('Hiba történt a küldés során. Kérjük próbáld újra később.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    formData.teljesNev &&
    formData.email &&
    formData.password &&
    formData.passwordConfirm &&
    isPasswordValid &&
    doPasswordsMatch &&
    formData.telefon &&
    isPhoneValid &&
    formData.szakma &&
    formData.munkaterulet.length > 0 &&
    formData.vallalkozoiForma &&
    formData.biztositas &&
    formData.tapasztalat &&
    formData.bemutatkozas &&
    formData.kapacitas &&
    formData.adatkezelesElfogadva;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-vvm-blue-500 selection:text-white overflow-x-hidden">
      {/* Hero Section - Dark Blue Theme matching User Reference */}
      <section
        className="relative w-full min-h-[auto] lg:min-h-[85vh] overflow-hidden flex flex-col justify-center pt-24 pb-16 lg:pt-28 lg:pb-24 border-b border-[#001f3f]"
        style={{
          backgroundColor: '#002f5d',
          backgroundImage: 'url(/partner-hero-bg-dark.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >

        {/* Subtle dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-zinc-950/40 z-10 pointer-events-none"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Column: Copy & Value Proposition */}
            <div className="flex flex-col items-start text-left w-full max-w-[600px]">
              {referralCode ? (
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-emerald-500/20 text-emerald-400 font-medium rounded-xl text-sm backdrop-blur-sm">
                  <Gift className="w-4 h-4 flex-shrink-0" />
                  <span>Meghívóval érkeztél! 10.000 Ft bónusz</span>
                </div>
              ) : null}

              <h1 className="text-[2.25rem] leading-[1.1] sm:text-[3rem] lg:text-[4rem] xl:text-[4.75rem] font-bold font-heading tracking-tight text-white mb-6 drop-shadow-md break-words">
                {referralCode ? 'Növekedj gyorsabban,' : (
                  <>Kiszámítható<br />munkák,</>
                )}<br />
                <span className="text-[#ffc107]">NULLA jutalék.</span>
              </h1>

              <div className="mb-8 max-w-[500px]">
                {referralCode
                  ? <p className="text-[15px] sm:text-base md:text-lg text-slate-300 leading-relaxed font-light">Egy ismerősöd meghívott a rendszerbe! Regisztrálj most, végezd el az első munkádat, és csatlakozz ahhoz az exkluzív hálózathoz, ahol a munkadíj 100%-ban nálad marad.</p>
                  : (
                    <>
                      <div className="text-white font-bold text-[1.15rem] sm:text-xl md:text-2xl flex items-start gap-2.5 mb-3 leading-tight tracking-wide drop-shadow-sm">
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#ffc107] flex-shrink-0 mt-[2px] sm:mt-0.5" />
                        <span>Mi hozzuk az ügyfeleket, te végzed a munkát.</span>
                      </div>
                      <p className="text-[15px] sm:text-base md:text-lg text-white leading-relaxed font-semibold">
                        Maradj <strong className="text-[#ffc107]">szabadúszó</strong>, mi a marketingből vesszük ki a részünk. Csatlakozz Magyarország legdinamikusabb hálózatához!
                      </p>
                    </>
                  )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                {/* Desktop Button */}
                <button
                  onClick={() => document.getElementById('szakember_regisztracio')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden sm:flex bg-[#ffc107] hover:bg-[#e0a800] text-[#002f5d] font-bold text-[15px] py-4 px-8 rounded-xl items-center justify-center gap-2 transition-all shadow-lg w-full sm:w-auto"
                >
                  {referralCode ? 'Kérem a bónuszt & Csatlakozom' : 'Regisztrálok szakemberként'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                {/* Mobile Button - Scroll indicator */}
                <button
                  onClick={() => document.getElementById('miert_erdemes_csatlakozni')?.scrollIntoView({ behavior: 'smooth' })}
                  className="sm:hidden bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[15px] py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all w-full"
                >
                  Tudj meg többet
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { icon: <CheckCircle className="w-4 h-4 text-[#20c997]" />, text: 'Nincs hűségidő' },
                  { icon: <CheckCircle className="w-4 h-4 text-[#20c997]" />, text: 'Rugalmas beosztás' },
                  { icon: <CheckCircle className="w-4 h-4 text-[#20c997]" />, text: 'Ingyenes csatlakozás' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[14px] text-slate-300 font-medium whitespace-nowrap">
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Features Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 relative z-20 w-full max-w-[500px] ml-auto">

              {/* Item 1 */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-black/40 transition-colors flex flex-col justify-center shadow-lg group">
                <div className="w-12 h-12 rounded-2xl bg-[#00a8ff]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-[#00a8ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h4 className="text-[1.05rem] font-bold text-white mb-2 leading-tight">Kiszámítható ügyfélkör</h4>
                <p className="text-slate-300 font-light text-[13px] leading-relaxed">Folyamatos munkák Budapesten és Pest megyében</p>
              </div>

              {/* Item 2 */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-black/40 transition-colors flex flex-col justify-center shadow-lg group">
                <div className="w-12 h-12 rounded-2xl bg-[#20c997]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gift className="w-6 h-6 text-[#20c997]" />
                </div>
                <h4 className="text-[1.05rem] font-bold text-white mb-2 leading-tight">10.000 Ft ajándék</h4>
                <p className="text-slate-300 font-light text-[13px] leading-relaxed">Kezdő egyenleg az azonnali induláshoz</p>
              </div>

              {/* Item 3 */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-black/40 transition-colors flex flex-col justify-center shadow-lg group">
                <div className="w-12 h-12 rounded-2xl bg-[#ffb100]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-[#ffb100]" />
                </div>
                <h4 className="text-[1.05rem] font-bold text-white mb-2 leading-tight">Te egyezel meg</h4>
                <p className="text-slate-300 font-light text-[13px] leading-relaxed">Nincs rablás. A munkadíj 100%-ban nálad marad.</p>
              </div>

              {/* Item 4 */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-black/40 transition-colors flex flex-col justify-center shadow-lg group">
                <div className="w-12 h-12 rounded-2xl bg-[#6658ff]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-[#6658ff]" />
                </div>
                <h4 className="text-[1.05rem] font-bold text-white mb-2 leading-tight">Szűrt, valós igények</h4>
                <p className="text-slate-300 font-light text-[13px] leading-relaxed">Részletekbe menően előszűrt érdeklődők</p>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* Miért érdemes csatlakozni */}
      <section id="miert_erdemes_csatlakozni" className="py-20 lg:py-32 bg-white relative border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-[2rem] lg:text-[2.75rem] font-bold font-heading text-zinc-950 mb-6 tracking-tight">Mit kapsz a Hálózattól?</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-light">
              Felejtsd el a marketinget és az ajánlatkéréseket hajkurászását. Ne aggódj azon, holnapután honnan lesz munkád.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-zinc-50 border border-zinc-200 p-8 rounded-3xl hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                  <div className="mb-6 rounded-2xl bg-white w-16 h-16 flex items-center justify-center border border-zinc-200 group-hover:border-vvm-blue-200 group-hover:bg-vvm-blue-50 transition-all shadow-sm">
                    <Icon className="w-8 h-8 text-vvm-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-zinc-950 mb-3">{benefit.title}</h3>
                  <p className="text-zinc-600 leading-relaxed text-[15px]">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quality Matters Highlight */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-vvm-blue-600 via-vvm-blue-700 to-indigo-800 p-8 md:p-12 shadow-2xl shadow-vvm-blue-500/20">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Star className="w-10 h-10 md:w-12 md:h-12 text-amber-400 fill-amber-400/20" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                  A minőségi munka nálunk hamar kamatozik!
                </h3>
                <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed font-medium">
                  Megbízható és tisztességes munkavégzés esetén az elégedett ügyfelek <span className="text-amber-400 font-bold">pozitív értékelései</span> garantálják, hogy folyamatosan és egyre több megbízáshoz juss a rendszerben. Nálunk tényleg a szakértelem a legjobb ajánlólevél.
                </p>
              </div>

              <div className="flex-shrink-0 hidden lg:block">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <span>Kiemelt státusz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-sm font-semibold">
                <Shield className="w-4 h-4" /> Alapkövetelmények
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-heading mb-6">
                Kiket várunk a csapatba?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Platformunk minőségének kulcsa a megbízható szakemberbázis. Olyan kollégákat keresünk, akik szeretik a szakmájukat, tisztelik az ügyfeleket, és hosszú távon terveznek velünk.
              </p>
              <div className="grid gap-4">
                {coreRequirements.slice(0, 3).map((req, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="mt-1 bg-green-100 p-1 rounded-full flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{req}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="grid gap-4">
                {coreRequirements.slice(3).map((req, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="mt-1 bg-green-100 p-1 rounded-full flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{req}</span>
                  </div>
                ))}

                <div className="mt-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Előnyt jelent
                  </h4>
                  <p className="text-amber-800 text-sm">Azonnali rendelkezésre állás (hibaelhárítás), precíz ügyfélkommunikáció modern eszközökön keresztül, referenciák.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-32 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-[2rem] lg:text-[2.75rem] font-bold font-heading text-zinc-950 mb-6 tracking-tight">Hogyan működik az együttműködés?</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-light">
              Egyszerű, átlátható folyamat, hogy minél hamarabb elkezdhess dolgozni és pénzt keresni.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-zinc-200 z-0 hidden md:block"></div>

            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <div key={index} className="flex gap-6 relative z-10 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-bold font-heading text-vvm-blue-600 border border-zinc-200 group-hover:border-vvm-blue-300 transition-colors z-10">
                    {step.number}
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex-1 hover:shadow-md transition-shadow group-hover:border-zinc-300">
                    <h3 className="text-xl font-bold font-heading text-zinc-950 mb-3">{step.title}</h3>
                    <p className="text-zinc-600 leading-relaxed text-[15px]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Mit mondanak a szakembereink?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-vvm-blue-50 to-vvm-blue-100 rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-vvm-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
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
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-gray-600 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Szakember Regisztráció Form */}
      <section id="szakember_regisztracio" className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden border-t border-slate-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-vvm-blue-50/50 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-12">
            {referralCode && (
              <div className="inline-flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-8 shadow-sm text-left">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 flex-shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-emerald-800 font-bold text-sm tracking-wide mb-0.5">Aktivált bónusz</h4>
                  <p className="text-emerald-700 text-[13px] sm:text-sm">Jóváhagyás után: <span className="font-bold">10.000 Ft*</span> induló egyenleg.</p>
                </div>
              </div>
            )}
            <h2 className="text-[2rem] lg:text-[2.75rem] font-bold font-heading text-slate-900 mb-4 tracking-tight">Várjuk Jelentkezésedet!</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">Töltsd ki az alábbi felvételi űrlapot, és kollégáink hamarosan felveszik veled a kapcsolatot a részletekkel.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 lg:p-12 shadow-xl shadow-slate-200/50 border border-slate-200 relative">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-vvm-blue-200 blur-3xl rounded-full opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-vvm-yellow-200 blur-3xl rounded-full opacity-50 pointer-events-none"></div>

            {isSubmitted ? (
              <div className="relative z-10 py-4 sm:py-6">
                {/* Header - compact */}
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 mb-1">Sikeres regisztráció!</h3>
                  <p className="text-slate-500 text-sm sm:text-base">Fiókod sikeresen létrejött a rendszerben.</p>
                </div>

                {/* Info cards - side by side on sm+ */}
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {/* Admin approval warning */}
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-amber-800 font-bold text-sm">Jóváhagyásra vár!</span>
                    </div>
                    <p className="text-amber-700 text-xs sm:text-[13px] leading-relaxed">
                      A bejelentkezés csak az <strong>adminisztrátori jóváhagyás után</strong> lehetséges. Amint jóváhagyjuk, azonnal be tudsz lépni.
                    </p>
                  </div>

                  {/* Email notification info */}
                  <div className="bg-vvm-blue-50 border border-vvm-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-vvm-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-vvm-blue-800 font-bold text-sm">E-mail értesítést küldünk!</span>
                    </div>
                    <p className="text-vvm-blue-700 text-xs sm:text-[13px] leading-relaxed">
                      A jóváhagyásról <strong>automatikus e-mail értesítést</strong> kapsz. Nem kell folyamatosan ellenőrizned!
                    </p>
                  </div>
                </div>

                {/* Steps - horizontal on sm+, compact */}
                <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
                  <p className="text-slate-400 font-semibold mb-3 text-xs tracking-wide uppercase">Következő lépések:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { num: '✓', label: 'Regisztráció kész', bg: 'bg-emerald-100', text: 'text-emerald-600' },
                      { num: '2', label: 'Admin jóváhagyás', bg: 'bg-amber-100', text: 'text-amber-600' },
                      { num: '3', label: 'E-mail értesítés', bg: 'bg-vvm-blue-100', text: 'text-vvm-blue-600' },
                      { num: '4', label: 'Munkák fogadása', bg: 'bg-vvm-blue-100', text: 'text-vvm-blue-600' },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center gap-1.5">
                        <div className={`w-7 h-7 rounded-full ${step.bg} flex items-center justify-center text-xs font-bold ${step.text}`}>{step.num}</div>
                        <span className="text-slate-600 text-xs font-medium leading-tight">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Link href="/" className="bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-bold text-sm sm:text-base py-3 px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-vvm-blue-600/20">
                    Vissza a főoldalra
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Basic Info */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                    <User className="w-5 h-5 text-vvm-blue-600" /> Alapvető adatok
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Személynév / Cégnév <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        placeholder="Minta János / Minta Kft."
                        value={formData.teljesNev}
                        onChange={(e) => setFormData(prev => ({ ...prev, teljesNev: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-mail cím <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        placeholder="pelda@email.hu"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                </div>


                {/* Password & Security */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                    <Lock className="w-5 h-5 text-vvm-blue-600" /> Biztonsági adatok
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Jelszó <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm ${formData.password && !isPasswordValid ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`}
                        placeholder="Minimum 8 karakter"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                      {formData.password && !isPasswordValid && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Minimum 8 karakter szükséges</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Jelszó megerősítése <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm ${formData.passwordConfirm && !doPasswordsMatch ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`}
                        placeholder="Jelszó újra"
                        value={formData.passwordConfirm}
                        onChange={(e) => setFormData(prev => ({ ...prev, passwordConfirm: e.target.value }))}
                      />
                      {formData.passwordConfirm && !doPasswordsMatch && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> A két jelszó nem egyezik</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                    <Briefcase className="w-5 h-5 text-vvm-blue-600" /> Szakmai adatok
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Telefonszám <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          autoComplete="tel"
                          className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm ${!isPhoneValid ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`}
                          placeholder="+36 30 123 4567"
                          value={formData.telefon}
                          onChange={handlePhoneChange}
                        />
                      </div>
                      {!isPhoneValid && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Érvényes magyar telefonszámot adj meg</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Fő szakterület <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        value={formData.szakma}
                        onChange={(e) => setFormData(prev => ({ ...prev, szakma: e.target.value }))}
                      >
                        <option value="" disabled>Válassz szakterületet...</option>
                        {szakmaOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Work Area */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Munkaterület(ek) <span className="text-red-500">*</span> <span className="text-slate-500 text-xs font-normal">(több is választható)</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {munkateruletOptions.map(opt => (
                        <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${formData.munkaterulet.includes(opt) ? 'border-vvm-blue-500 bg-vvm-blue-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-vvm-blue-200'}`}>
                          <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border transition-colors ${formData.munkaterulet.includes(opt) ? 'bg-vvm-blue-500 border-vvm-blue-500' : 'bg-white border-slate-300'}`}>
                            {formData.munkaterulet.includes(opt) && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.munkaterulet.includes(opt)}
                            onChange={() => handleMunkateruletChange(opt)}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium leading-tight ${formData.munkaterulet.includes(opt) ? 'text-vvm-blue-900' : 'text-slate-700'}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Vállalkozói forma <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        value={formData.vallalkozoiForma}
                        onChange={(e) => setFormData(prev => ({ ...prev, vallalkozoiForma: e.target.value }))}
                      >
                        <option value="" disabled>Válassz...</option>
                        {vallalkozoiFormaOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Felelősségbiztosítás <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        value={formData.biztositas}
                        onChange={(e) => setFormData(prev => ({ ...prev, biztositas: e.target.value }))}
                      >
                        <option value="" disabled>Rendelkezel biztosítással?</option>
                        {biztositasOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Szakmai tapasztalat <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        value={formData.tapasztalat}
                        onChange={(e) => setFormData(prev => ({ ...prev, tapasztalat: e.target.value }))}
                      >
                        <option value="" disabled>Hány éves tapasztalatod van?</option>
                        {tapasztalatOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Heti kapacitás <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                        value={formData.kapacitas}
                        onChange={(e) => setFormData(prev => ({ ...prev, kapacitas: e.target.value }))}
                      >
                        <option value="" disabled>Hány munkát tudsz elvállalni?</option>
                        {kapacitasOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Weboldal vagy szakmai Facebook / Instagram <span className="text-slate-400 font-normal">(opcionális de ajánlott)</span>
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm"
                      placeholder="https://"
                      value={formData.weboldal}
                      onChange={(e) => setFormData(prev => ({ ...prev, weboldal: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Megjegyzés / Egyéb információ <span className="text-slate-400 font-normal">(opcionális)</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm resize-none"
                      placeholder="Ide írhatsz bármilyen egyéb információt, speciális igényt..."
                      value={formData.megjegyzes}
                      onChange={(e) => setFormData(prev => ({ ...prev, megjegyzes: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 sm:pb-3">
                    <FileText className="w-5 h-5 text-vvm-blue-600" /> Bemutatkozás és Portfólió
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Rövid szakmai bemutatkozás <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={1500}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-vvm-blue-500 focus:ring-1 focus:ring-vvm-blue-500 transition-colors shadow-sm resize-none"
                      placeholder="Mivel foglalkozol pontosan? Milyen típusú munkákat vállalsz legszívesebben? Mi a te 'szupererőd' szakemberként?"
                      value={formData.bemutatkozas}
                      onChange={(e) => setFormData(prev => ({ ...prev, bemutatkozas: e.target.value }))}
                    />
                    <div className="flex justify-end mt-2">
                      <span className={`text-xs font-medium ${formData.bemutatkozas.length > 1400 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {formData.bemutatkozas.length}/1500 karakter
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Weboldal / Facebook / Google profil <span className="text-slate-400 font-normal">(opcionális)</span>
                    </label>
                    <input
                      type="url"
                      className="input-field bg-white"
                      placeholder="https://szerelo-mester.hu | fb.com/..."
                      value={formData.weboldal}
                      onChange={(e) => setFormData(prev => ({ ...prev, weboldal: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Megjegyzés / Egyéb információ <span className="text-slate-400 font-normal">(opcionális)</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      className="input-field bg-white resize-none"
                      placeholder="Ide írhatsz bármilyen egyéb információt, speciális igényt..."
                      value={formData.megjegyzes}
                      onChange={(e) => setFormData(prev => ({ ...prev, megjegyzes: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Submit Area */}
                <div className="pt-6 sm:pt-8 mt-4 sm:mt-6 border-t border-slate-200">
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                      <div className={`mt-1 w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${formData.adatkezelesElfogadva ? 'bg-vvm-blue-500 border-vvm-blue-500' : 'bg-white border-slate-300 group-hover:border-vvm-blue-400'}`}>
                        {formData.adatkezelesElfogadva && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        required
                        className="sr-only"
                        checked={formData.adatkezelesElfogadva}
                        onChange={(e) => setFormData(prev => ({ ...prev, adatkezelesElfogadva: e.target.checked }))}
                      />
                      <span className="text-slate-600 text-[13.5px] sm:text-sm leading-snug font-medium">
                        Kijelentem, hogy elolvastam és elfogadom az <Link href="/adatkezeles" className="text-vvm-blue-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer">Adatkezelési Tájékoztatót</Link> valamint az <Link href="/aszf" className="text-vvm-blue-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer">ÁSZF</Link>-et, és hozzájárulok, hogy a megadott adataim alapján felvegyék velem a kapcsolatot. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full py-4 sm:py-5 px-8 rounded-2xl text-lg sm:text-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3 ${!canSubmit || isSubmitting
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-vvm-blue-600 to-sky-500 hover:from-vvm-blue-700 hover:to-sky-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-vvm-blue-500/20 shadow-vvm-blue-500/30'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Regisztráció véglegesítése...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        <span>Regisztráció és fiók létrehozása</span>
                      </>
                    )}
                  </button>
                  {!canSubmit && (
                    <p className="text-center text-sm text-slate-500 mt-4">A regisztrációhoz minden kötelező mezőt (*) ki kell tölteni, és el kell fogadni a feltételeket.</p>
                  )}
                  <p className="text-center text-xs text-slate-400 mt-6 max-w-3xl mx-auto leading-relaxed">
                    *A 10.000 Ft promóciós kredit készpénzre vagy azonnali átutalásra nem váltható, kizárólag a platformon történő kapcsolatfelvételi adatok vásárlására (lead-feloldásra) használható fel a fiók sikeres adminisztrátori jóváhagyását követően. A szolgáltatás nyújtója a <Link href="/aszf" className="underline hover:text-slate-500">Szabályzatban</Link> leírtak szerint fenntartja a promóció visszavonásának jogát visszaélés gyanúja esetén.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Internal Links for SEO */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-semibold text-gray-900 mb-4">Kapcsolódó oldalak:</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/vizszerelo-budapest" className="text-vvm-blue-600 hover:underline">
              Vízszerelő szolgáltatásaink Budapesten →
            </Link>
            <Link href="/palyazat-kalkulator" className="text-vvm-blue-600 hover:underline">
              Fűtéskorszerűsítés és pályázatok →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PartnerOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-vvm-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <PartnerOnboardingContent />
    </Suspense>
  );
}

