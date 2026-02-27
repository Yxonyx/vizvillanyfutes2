'use client';

import { useState, useEffect, Suspense } from 'react';
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
    description: 'Nincs százalékos sikerdíj! Minden kiajánlott összekötés (lead) fix összegbe, nagyjából 2.000 Ft kreditbe kerül. A munkadíjat te magad alkudod ki az ügyféllel és 100%-ban nálad marad.',
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
    answer: 'A rendszerünk kredites alapon működik. Mi lényegében összehozunk az ügyféllel. Minden ügyfélkapcsolat (lead) feloldása fix, alacsony összegbe kerül (kb. egy kávé ára, ~2.000 Ft). Nincs jutalék, a munkadíjban ti állapodtok meg az ügyféllel, és az mind a tiéd. Induláskor ráadásul 10.000 Ft kezdő kreditet adunk, így az elején ingyen próbálhatod ki a rendszert!',
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-vvm-blue-500 selection:text-white">
      {/* Hero Section - Premium Modern Look */}
      <section className="relative pt-28 md:pt-32 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <Image
            src="/login_bg.webp"
            alt="Background"
            fill
            className="object-cover opacity-30 scale-[1.02]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-50"></div>
        </div>

        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vvm-blue-500/20 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Value Proposition */}
            <div className="max-w-2xl">
              {referralCode ? (
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 transform transition-transform hover:scale-105 backdrop-blur-md">
                  <Gift className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide">Meghívóval érkeztél! 10.000 Ft bónusz a regisztrációhoz</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-vvm-blue-500/20 border border-vvm-blue-500/30 text-vvm-blue-300 backdrop-blur-md">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-wide">Csatlakozz a legjobb szakikhoz Magyarországon</span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 drop-shadow-lg">
                {referralCode ? 'Gyorsabb növekedés, ' : 'Kiszámítható munkák, '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vvm-blue-400 to-sky-300">
                  NULLA jutalék.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                {referralCode
                  ? 'Egy ismerősöd meghívott a rendszerbe! Regisztrálj most, végezd el az első munkádat, és csatlakozz ahhoz az exkluzív szakemberhálózathoz, ahol a munkadíj 100%-ban nálad marad.'
                  : 'Csatlakozz Magyarország legdinamikusabban fejlődő víz-villany-fűtésszerelő hálózatához. Te elvégzed a munkát, a díjat te\u00A0szabod\u00A0meg mi csak összekötünk az ügyféllel.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => document.getElementById('szakember_regisztracio')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-xl bg-vvm-blue-600 hover:bg-vvm-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2">
                  {referralCode ? 'Kérem a bónuszt & Csatlakozom' : 'Regisztráció indítása'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => document.getElementById('miert_erdemes_csatlakozni')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-lg backdrop-blur-sm transition-all flex items-center justify-center">
                  Mire számíthatok?
                </button>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Nincs hűségidő</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Nincs %-os rablás</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Ingyenes regisztráció</div>
              </div>
            </div>

            {/* Right Column: Dynamic Feature Cards Container */}
            <div className="relative lg:h-[500px] hidden md:block">
              <div className="absolute inset-0 flex flex-col items-end gap-6 pt-10">

                {/* Floating Card 1: 10k Bonus Target */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl transform transition-transform hover:-translate-x-4 hover:bg-white/15">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Garantált Induló Kredit</h3>
                      <p className="text-slate-300 text-sm leading-snug">10.000 Ft értékű ajándék kredit az első címed igényléséhez {referralCode && 'a meghívódnak köszönhetően'}. Kockázatmentes indulás.</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: 100% Revenue */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl transform transition-transform hover:-translate-x-4 hover:bg-white/15 mr-12 lg:mr-20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vvm-blue-400 to-indigo-600 flex items-center justify-center shadow-inner flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Fix Lead Árak</h3>
                      <p className="text-slate-300 text-sm leading-snug">~2.000 Ft-ért kapod meg az ügyfél adatait. Onnantól a te üzleted, a munkadíj 100%-ban nálad marad.</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 3: Automation */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl transform transition-transform hover:-translate-x-4 hover:bg-white/15">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-inner flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Precízen Szűrt Ügyfelek</h3>
                      <p className="text-slate-300 text-sm leading-snug">Csak valós, megerősített igényeket továbbítunk neked. Vége a komolytalan érdeklődőknek.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Join */}
      <section id="miert_erdemes_csatlakozni" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-heading mb-4">
              Miért éri meg velünk dolgozni?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A hagyományos hirdetési modellek elavultak. Mi egy fair, átlátható és költséghatékony alternatívát kínálunk a modern szakembereknek.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-vvm-blue-600 group-hover:text-vvm-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Hogyan működik az együttműködés?
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-vvm-blue-200 hidden md:block"></div>

            <div className="space-y-8">
              {processSteps.map((step) => (
                <div key={step.number} className="relative flex gap-6">
                  <div className="w-16 h-16 bg-vvm-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 z-10">
                    {step.number}
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
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

      {/* Application Form */}
      <section id="szakember_regisztracio" className="py-24 relative overflow-hidden">
        {/* Blurred background image with sophisticated gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-slate-900">
          <Image
            src="/login_bg.webp"
            alt="Háttér"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            quality={80}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-vvm-blue-900/90 via-slate-900/95 to-slate-900/90 backdrop-blur-[2px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-10">
            {referralCode && (
              <div className="inline-flex items-center gap-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-6 py-4 mb-8 shadow-lg shadow-emerald-500/10">
                <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-inner">
                  <Gift className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h4 className="text-emerald-800 font-black text-sm uppercase tracking-wider mb-0.5">Aktivált bónusz</h4>
                  <p className="text-emerald-950 font-semibold text-sm sm:text-base">Jóváhagyás után: <span className="text-emerald-700 font-bold">10.000 Ft*</span> induló egyenleg a fiókodban.</p>
                </div>
              </div>
            )}
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-heading mb-4 tracking-tight">
              Regisztrálj és növeld a bevételed
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Töltsd ki az alábbi felvételi űrlapot. Munkatársunk hamarosan felveszi veled a kapcsolatot a megadott elérhetőségeken.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Sikeres regisztráció!</h3>
              <p className="text-slate-300 mb-8 text-lg">
                Fiókod sikeresen létrejött a rendszerben és jelenleg adminisztrátori jóváhagyásra vár.
                Kérjük türelmedet!
              </p>

              <div className="bg-slate-900/50 rounded-2xl p-6 mb-10 max-w-md mx-auto border border-slate-700/50">
                <p className="text-slate-400 font-semibold mb-3 uppercase tracking-wider text-sm">A következő lépések:</p>
                <ul className="text-slate-200 text-left space-y-3 font-medium">
                  <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-vvm-blue-500/20 text-vvm-blue-400 flex items-center justify-center text-xs">1</div> Adatok ellenőrzése a rendszerben</li>
                  <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-vvm-blue-500/20 text-vvm-blue-400 flex items-center justify-center text-xs">2</div> Értesítés a fiók aktiválásáról</li>
                  <li className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-vvm-blue-500/20 text-vvm-blue-400 flex items-center justify-center text-xs">3</div> Bejelentkezés és munkák feloldása</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                  Vissza a főoldalra
                </Link>
                <Link href="/login" className="px-8 py-4 rounded-xl bg-vvm-blue-600 hover:bg-vvm-blue-500 text-white font-bold shadow-lg shadow-vvm-blue-500/30 transition-all">
                  Tovább a bejelentkezéshez
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4 sm:p-10 space-y-6 sm:space-y-8 shadow-2xl relative">
              {/* Dynamic glass effect at top */}
              <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none"></div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-slate-50 p-4 sm:p-8 rounded-2xl border border-slate-100">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 border-b border-slate-200 pb-3 sm:pb-4">
                  <User className="w-5 h-5 text-vvm-blue-600" /> Alapvető adatok
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Teljes név <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="Kovács János"
                      value={formData.teljesNev}
                      onChange={(e) => setFormData(prev => ({ ...prev, teljesNev: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail cím *
                    </label>
                    <input
                      type="email"
                      required
                      className="input-field"
                      placeholder="pelda@email.hu"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

              </div>

              {/* Password & Security */}
              <div className="bg-slate-50 p-4 sm:p-8 rounded-2xl border border-slate-100">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 border-b border-slate-200 pb-3 sm:pb-4">
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
                      className={`input-field ${formData.password && !isPasswordValid ? 'border-red-500 ring-1 ring-red-500' : ''}`}
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
                      className={`input-field ${formData.passwordConfirm && !doPasswordsMatch ? 'border-red-500 ring-1 ring-red-500' : ''}`}
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
              <div className="bg-slate-50 p-4 sm:p-8 rounded-2xl border border-slate-100">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 border-b border-slate-200 pb-3 sm:pb-4">
                  <Briefcase className="w-5 h-5 text-vvm-blue-600" /> Szakmai adatok
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Telefonszám <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        className={`input-field pl-12 ${!isPhoneValid ? 'border-red-500 ring-1 ring-red-500' : ''}`}
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
                      className="input-field bg-white"
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
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2 sm:mb-3">
                    Munkaterület(ek) <span className="text-red-500">*</span> <span className="text-slate-500 text-xs font-normal">(több is választható)</span>
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                    {munkateruletOptions.map(opt => (
                      <label key={opt} className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.munkaterulet.includes(opt) ? 'border-vvm-blue-500 bg-vvm-blue-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-vvm-blue-200'}`}>
                        <div className={`w-5 h-5 sm:w-5 sm:h-5 shrink-0 rounded flex items-center justify-center border transition-colors ${formData.munkaterulet.includes(opt) ? 'bg-vvm-blue-500 border-vvm-blue-500' : 'bg-white border-slate-300'}`}>
                          {formData.munkaterulet.includes(opt) && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.munkaterulet.includes(opt)}
                          onChange={() => handleMunkateruletChange(opt)}
                          className="sr-only"
                        />
                        <span className={`text-sm sm:text-sm font-medium leading-tight ${formData.munkaterulet.includes(opt) ? 'text-vvm-blue-900' : 'text-slate-700'}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Vállalkozói forma <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="input-field bg-white"
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
                      Szakmai tapasztalat <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="input-field bg-white"
                      value={formData.tapasztalat}
                      onChange={(e) => setFormData(prev => ({ ...prev, tapasztalat: e.target.value }))}
                    >
                      <option value="" disabled>Válassz...</option>
                      {tapasztalatOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Felelősségbiztosítás <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="input-field bg-white"
                      value={formData.biztositas}
                      onChange={(e) => setFormData(prev => ({ ...prev, biztositas: e.target.value }))}
                    >
                      <option value="" disabled>Válassz...</option>
                      {biztositasOptions.map(opt => (
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
                      className="input-field bg-white"
                      value={formData.kapacitas}
                      onChange={(e) => setFormData(prev => ({ ...prev, kapacitas: e.target.value }))}
                    >
                      <option value="" disabled>Válassz...</option>
                      {kapacitasOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-slate-50 p-4 sm:p-8 rounded-2xl border border-slate-100">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 border-b border-slate-200 pb-3 sm:pb-4">
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
                    className="input-field bg-white resize-none"
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
              <div className="pt-4 border-t border-slate-100">
                <div className="mb-8">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={`mt-0.5 w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${formData.adatkezelesElfogadva ? 'bg-vvm-blue-500 border-vvm-blue-500' : 'bg-white border-slate-300 group-hover:border-vvm-blue-400'}`}>
                      {formData.adatkezelesElfogadva && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      required
                      className="sr-only"
                      checked={formData.adatkezelesElfogadva}
                      onChange={(e) => setFormData(prev => ({ ...prev, adatkezelesElfogadva: e.target.checked }))}
                    />
                    <span className="text-slate-600 leading-relaxed font-medium">
                      Kijelentem, hogy elolvastam és elfogadom az <Link href="/adatkezeles" className="text-vvm-blue-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer">Adatkezelési Tájékoztatót</Link> valamint az <Link href="/aszf" className="text-vvm-blue-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer">ÁSZF</Link>-et, és hozzájárulok, hogy a megadott adataim alapján felvegyék velem a kapcsolatot. <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`w-full py-5 px-8 rounded-2xl text-lg font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3 ${!canSubmit || isSubmitting
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-vvm-blue-600 to-sky-500 hover:from-vvm-blue-700 hover:to-sky-600 hover:-translate-y-1 hover:shadow-2xl shadow-vvm-blue-500/30'
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
                <p className="text-center text-xs text-slate-400 mt-6 max-w-2xl mx-auto">
                  *A 10.000 Ft promóciós kredit készpénzre vagy azonnali átutalásra nem váltható, kizárólag a platformon történő kapcsolatfelvételi adatok vásárlására (lead-feloldásra) használható fel a fiók sikeres adminisztrátori jóváhagyását követően. A szolgáltatás nyújtója a <Link href="/aszf" className="underline">Szabályzatban</Link> leírtak szerint fenntartja a promóció visszavonásának jogát visszaélés gyanúja esetén.
                </p>
              </div>
            </form>
          )}
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

