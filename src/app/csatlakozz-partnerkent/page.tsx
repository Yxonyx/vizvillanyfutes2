'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Droplets, Zap, Flame, CheckCircle, ArrowRight,
  Users, DollarSign, Headphones, Clock, Shield,
  ChevronDown, Phone, Mail, Building, Briefcase,
  Calendar, Star, MapPin, FileText, Send, Lock
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
    description: 'A sikeres regisztráció után azonnal adunk 10.000 Ft kreditet ajándékba, így az első néhány ügyfelet teljesen ingyen hozunk neked.',
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
    quote: 'Átlátható rendszer, fix elszámolás. Nem volt még vita a pénzen, azt kapom, amit előre megbeszéltünk.',
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

export default function PartnerOnboardingPage() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Target Profiles - Now acts as Hero */}
      <section className="pt-28 lg:pt-32 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs className="mb-12" />

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-gray-900">
              Kiket keresünk szakemberként?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tapasztalt, megbízható szakembereket várunk, akik szeretnének kiszámítható, tervezhető munkamennyiséget.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {targetProfiles.map((profile) => (
              <div
                key={profile.type}
                className={`bg-gradient-to-br from-${profile.color}-50 to-${profile.color}-100 rounded-2xl p-8 border-2 border-${profile.color}-200`}
              >
                <div className={`w-16 h-16 bg-${profile.color}-500 rounded-2xl flex items-center justify-center mb-6`}>
                  <profile.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold text-${profile.color}-800 mb-4`}>{profile.title}</h3>
                <p className="text-gray-600">{profile.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section id="miert_erdemes_csatlakozni" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Miért éri meg csatlakozni?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A VízVillanyFűtés ökoszisztéma előnyei szakemberek számára
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-vvm-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-vvm-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Kiket várunk a csapatba?
            </h2>
            <p className="text-lg text-gray-600">
              Olyan szakembereket keresünk, akik szeretik a munkájukat és megbízhatóak. A legfontosabb az ügyfelek elégedettsége.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-vvm-blue-600" />
              Amire szükség lesz
            </h3>
            <ul className="grid md:grid-cols-2 gap-4">
              {coreRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
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
      <section id="szakember_regisztracio" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-4 py-2 text-sm text-emerald-700 mb-4">
              <Lock className="w-4 h-4" />
              <span>Fiók létrehozása</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Szakember regisztráció
            </h2>
            <p className="text-lg text-gray-600">
              Hozd létre a fiókodat, és kezdj el munkákat kapni! A regisztráció után munkatársunk jóváhagyja a jelentkezésedet.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sikeres regisztráció!</h3>
              <p className="text-gray-600 mb-4">
                A szakember fiókod létrejött és jóváhagyásra vár.
                Amint munkatársunk ellenőrizte az adataidat, e-mailben értesítünk és megkezdheted a munkát!
              </p>
              <div className="bg-white rounded-xl p-4 mb-6 inline-block">
                <p className="text-sm text-gray-500 mb-1">Mi történik most?</p>
                <ul className="text-sm text-gray-700 text-left space-y-1">
                  <li>✓ Ellenőrizzük a regisztrációs adatokat</li>
                  <li>✓ E-mailben értesítünk a jóváhagyásról</li>
                  <li>✓ Bejelentkezhetsz és kapod az első munkákat</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Ez általában 1-2 munkanapot vesz igénybe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-primary inline-flex">
                  Vissza a főoldalra
                </Link>
                <Link href="/login" className="btn-outline inline-flex">
                  Bejelentkezés
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teljes név *
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

              {/* Password fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jelszó *
                  </label>
                  <input
                    type="password"
                    required
                    className={`input-field ${formData.password && !isPasswordValid ? 'border-red-500' : ''}`}
                    placeholder="Minimum 8 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  {formData.password && !isPasswordValid && (
                    <p className="mt-1 text-sm text-red-600">Minimum 8 karakter szükséges</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jelszó megerősítése *
                  </label>
                  <input
                    type="password"
                    required
                    className={`input-field ${formData.passwordConfirm && !doPasswordsMatch ? 'border-red-500' : ''}`}
                    placeholder="Jelszó újra"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData(prev => ({ ...prev, passwordConfirm: e.target.value }))}
                  />
                  {formData.passwordConfirm && !doPasswordsMatch && (
                    <p className="mt-1 text-sm text-red-600">A két jelszó nem egyezik</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonszám *
                  </label>
                  <input
                    type="tel"
                    required
                    className={`input-field ${!isPhoneValid ? 'border-red-500' : ''}`}
                    placeholder="+36 30 123 4567"
                    value={formData.telefon}
                    onChange={handlePhoneChange}
                  />
                  {!isPhoneValid && (
                    <p className="mt-1 text-sm text-red-600">Érvényes magyar telefonszámot adj meg</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Szakterület *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.szakma}
                    onChange={(e) => setFormData(prev => ({ ...prev, szakma: e.target.value }))}
                  >
                    <option value="">Válassz...</option>
                    {szakmaOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Work Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Munkaterület(ek) *
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {munkateruletOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-vvm-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.munkaterulet.includes(opt)}
                        onChange={() => handleMunkateruletChange(opt)}
                        className="w-4 h-4 rounded border-gray-300 text-vvm-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vállalkozói forma *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.vallalkozoiForma}
                    onChange={(e) => setFormData(prev => ({ ...prev, vallalkozoiForma: e.target.value }))}
                  >
                    <option value="">Válassz...</option>
                    {vallalkozoiFormaOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Szakmai tapasztalat *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.tapasztalat}
                    onChange={(e) => setFormData(prev => ({ ...prev, tapasztalat: e.target.value }))}
                  >
                    <option value="">Válassz...</option>
                    {tapasztalatOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Felelősségbiztosítás *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.biztositas}
                    onChange={(e) => setFormData(prev => ({ ...prev, biztositas: e.target.value }))}
                  >
                    <option value="">Válassz...</option>
                    {biztositasOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heti kapacitás *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.kapacitas}
                    onChange={(e) => setFormData(prev => ({ ...prev, kapacitas: e.target.value }))}
                  >
                    <option value="">Válassz...</option>
                    {kapacitasOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rövid szakmai bemutatkozás *
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={1500}
                  className="input-field"
                  placeholder="Mivel foglalkozol pontosan, milyen típusú munkákat vállalsz szívesen?"
                  value={formData.bemutatkozas}
                  onChange={(e) => setFormData(prev => ({ ...prev, bemutatkozas: e.target.value }))}
                />
                <p className="mt-1 text-sm text-gray-500">{formData.bemutatkozas.length}/1500 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weboldal / Facebook / Google profil (opcionális)
                </label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://..."
                  value={formData.weboldal}
                  onChange={(e) => setFormData(prev => ({ ...prev, weboldal: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés (opcionális)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  className="input-field"
                  placeholder="Kérdés, speciális igény, egyéb információ..."
                  value={formData.megjegyzes}
                  onChange={(e) => setFormData(prev => ({ ...prev, megjegyzes: e.target.value }))}
                />
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-vvm-blue-600"
                    checked={formData.adatkezelesElfogadva}
                    onChange={(e) => setFormData(prev => ({ ...prev, adatkezelesElfogadva: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700">
                    Elfogadom az <Link href="/adatkezeles" className="text-vvm-blue-600 hover:underline">Adatkezelési Tájékoztatót</Link> és
                    hozzájárulok, hogy a megadott adataim alapján felvegyék velem a kapcsolatot. *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Regisztráció folyamatban...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Fiók létrehozása és regisztráció</span>
                  </>
                )}
              </button>
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

