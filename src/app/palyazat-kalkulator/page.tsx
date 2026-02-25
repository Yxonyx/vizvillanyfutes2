'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Award, CheckCircle, ArrowRight, Phone, Calendar, 
  Shield, HelpCircle, 
  Clock, Building, Home,
  Flame, Leaf, FileCheck, AlertCircle, XCircle
} from 'lucide-react';

// Form options
const buildingYears = [
  { value: 'before_1970', label: '1970 előtt' },
  { value: '1970_1990', label: '1970-1990 között' },
  { value: '1990_2006', label: '1990-2006 között' },
  { value: 'after_2006', label: '2006 után' },
];

const propertyTypes = [
  { value: 'apartment', label: 'Társasházi lakás' },
  { value: 'house', label: 'Családi ház' },
  { value: 'semi', label: 'Ikerház' },
  { value: 'row', label: 'Sorház' },
];

const heatingTypes = [
  { value: 'gas_old', label: 'Régi gázkazán (15+ éves)' },
  { value: 'gas_new', label: 'Kondenzációs gázkazán' },
  { value: 'district', label: 'Távfűtés' },
  { value: 'electric', label: 'Elektromos fűtés' },
  { value: 'mixed', label: 'Vegyes/egyéb' },
];

const renovationTypes = [
  { value: 'heating', label: 'Fűtésrendszer korszerűsítés', icon: Flame },
  { value: 'heatpump', label: 'Hőszivattyú telepítés', icon: Leaf },
  { value: 'electrical', label: 'Villamos hálózat felújítás', icon: Building },
  { value: 'plumbing', label: 'Vízvezeték rendszer felújítás', icon: Home },
  { value: 'combined', label: 'Kombinált (több szakág)', icon: Award },
];

const buildingYearLabels: Record<string, string> = {
  before_1970: '1970 előtt',
  '1970_1990': '1970-1990 között',
  '1990_2006': '1990-2006 között',
  after_2006: '2006 után',
};

const propertyTypeLabels: Record<string, string> = {
  apartment: 'Társasházi lakás',
  house: 'Családi ház',
  semi: 'Ikerház',
  row: 'Sorház',
};

const heatingTypeLabels: Record<string, string> = {
  gas_old: 'Régi gázkazán (15+ éves)',
  gas_new: 'Kondenzációs gázkazán',
  district: 'Távfűtés',
  electric: 'Elektromos fűtés',
  mixed: 'Vegyes/egyéb',
};

const renovationTypeLabels: Record<string, string> = {
  heating: 'Fűtésrendszer korszerűsítés',
  heatpump: 'Hőszivattyú telepítés',
  electrical: 'Villamos hálózat felújítás',
  plumbing: 'Vízvezeték rendszer felújítás',
  combined: 'Kombinált (több szakág)',
};

export default function PalyazatKalkulatorPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    buildingYear: '',
    propertyType: '',
    heatingType: '',
    renovationType: '',
    hasSavings: '',
    email: '',
    phone: '',
    name: '',
  });
  const [result, setResult] = useState<null | 'likely' | 'conditional' | 'unlikely'>(null);

  const handleCalculate = async () => {
    setIsSubmitting(true);
    
    // Simple eligibility logic
    let score = 0;
    
    if (formData.buildingYear === 'before_1970' || formData.buildingYear === '1970_1990') {
      score += 2;
    } else if (formData.buildingYear === '1990_2006') {
      score += 1;
    }
    
    if (formData.heatingType === 'gas_old' || formData.heatingType === 'electric') {
      score += 2;
    } else if (formData.heatingType === 'mixed') {
      score += 1;
    }
    
    if (formData.renovationType === 'heating' || formData.renovationType === 'heatpump' || formData.renovationType === 'combined') {
      score += 2;
    } else {
      score += 1;
    }

    let resultType: 'likely' | 'conditional' | 'unlikely';
    if (score >= 5) {
      resultType = 'likely';
    } else if (score >= 3) {
      resultType = 'conditional';
    } else {
      resultType = 'unlikely';
    }

    // Send email
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subsidy',
          data: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            buildingType: propertyTypeLabels[formData.propertyType] || formData.propertyType,
            buildingYear: buildingYearLabels[formData.buildingYear] || formData.buildingYear,
            currentHeating: heatingTypeLabels[formData.heatingType] || formData.heatingType,
            plannedWork: renovationTypeLabels[formData.renovationType] || formData.renovationType,
            calculatorResult: resultType === 'likely' 
              ? 'Valószínűleg jogosult' 
              : resultType === 'conditional' 
                ? 'Feltételekkel jogosult lehet' 
                : 'Kevéssé valószínű a jogosultság',
          },
        }),
      });
    } catch {
      // Continue even if email fails
    }
    
    setResult(resultType);
    setStep(3);
    setIsSubmitting(false);
  };

  const canProceedStep1 = formData.buildingYear && formData.propertyType && formData.heatingType && formData.renovationType;
  const canProceedStep2 = formData.name && formData.phone && formData.email;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
            <Award className="w-4 h-4" />
            <span>Otthonfelújítási Program 2025</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Pályázati Jogosultság <br />
            <span className="text-emerald-200">Kalkulátor</span>
          </h1>
          
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Tudja meg 1 perc alatt, hogy jogosult-e akár 6 millió Ft támogatásra 
            víz–villany–fűtés korszerűsítésre!
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{step}/3 lépés</span>
              <span className="text-sm text-gray-500">
                {step === 1 ? 'Ingatlan adatok' : step === 2 ? 'Elérhetőségek' : 'Eredmény'}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Step 1: Property Info */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingatlan adatok</h2>
                  <p className="text-gray-600">Válaszoljon néhány kérdésre az ingatlanról.</p>
                </div>

                {/* Building Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mikor épült az ingatlan?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {buildingYears.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({ ...prev, buildingYear: option.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.buildingYear === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-800">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Milyen típusú az ingatlan?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: option.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.propertyType === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-800">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Heating Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Milyen fűtési rendszer van jelenleg?
                  </label>
                  <div className="space-y-2">
                    {heatingTypes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({ ...prev, heatingType: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          formData.heatingType === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-800">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Renovation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mit szeretne korszerűsíteni?
                  </label>
                  <div className="space-y-2">
                    {renovationTypes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({ ...prev, renovationType: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                          formData.renovationType === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <option.icon className={`w-6 h-6 ${formData.renovationType === option.value ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-800">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Tovább</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Elérhetőségek</h2>
                  <p className="text-gray-600">
                    Adja meg elérhetőségeit, hogy elküldhessük a részletes eredményt és 
                    szakértőink felvehessék Önnel a kapcsolatot.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teljes név *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Kovács János"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefonszám *
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+36 30 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email cím *
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="pelda@email.hu"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    Az adatait bizalmasan kezeljük és csak a pályázati tanácsadáshoz használjuk fel.
                    Nem kötelezi szerződéskötésre.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-outline flex-1"
                  >
                    Vissza
                  </button>
                  <button
                    onClick={handleCalculate}
                    disabled={!canProceedStep2 || isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Feldolgozás...
                      </span>
                    ) : (
                      <>
                        <span>Eredmény megtekintése</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Result */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                {/* Result Banner */}
                <div className={`p-6 rounded-2xl ${
                  result === 'likely' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                    : result === 'conditional'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    {result === 'likely' && <CheckCircle className="w-12 h-12" />}
                    {result === 'conditional' && <AlertCircle className="w-12 h-12" />}
                    {result === 'unlikely' && <XCircle className="w-12 h-12" />}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {result === 'likely' && 'Valószínűleg jogosult!'}
                        {result === 'conditional' && 'Feltételekkel jogosult lehet'}
                        {result === 'unlikely' && 'Kevéssé valószínű a jogosultság'}
                      </h2>
                      <p className="opacity-90">
                        {result === 'likely' && 'Az Ön ingatlana és tervei alapján jó eséllyel jogosult a pályázati támogatásra.'}
                        {result === 'conditional' && 'Bizonyos feltételek teljesülése esetén jogosult lehet a támogatásra.'}
                        {result === 'unlikely' && 'A jelenlegi adatok alapján a pályázati jogosultság nem valószínű.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-xl p-4">
                      <div className="text-3xl font-bold">Max. 6M Ft</div>
                      <div className="text-sm opacity-90">Lehetséges támogatás</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4">
                      <div className="text-3xl font-bold">50%</div>
                      <div className="text-sm opacity-90">Költség fedezhető</div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Következő lépések</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Ingyenes telefonos konzultáció</div>
                        <p className="text-gray-600 text-sm">
                          Szakértőnk hamarosan felhívja a megadott számon és részletesen átbeszéli a lehetőségeket.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Helyszíni felmérés</div>
                        <p className="text-gray-600 text-sm">
                          Ingyenes helyszíni felmérés a pontos költségvetés és pályázati dokumentáció elkészítéséhez.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Pályázat beadása</div>
                        <p className="text-gray-600 text-sm">
                          A teljes pályázati folyamatot mi intézzük – sikerdíjas konstrukcióban.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-emerald-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Szeretne ingyenes konzultációt?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Szakértőink hamarosan felhívják a megadott számon: <strong>{formData.phone}</strong>
                  </p>
                  <div className="flex gap-4">
                    <Link href="/foglalas" className="btn-primary flex-1">
                      <Calendar className="w-5 h-5" />
                      <span>Helyszíni felmérés kérése</span>
                    </Link>
                    <a href="tel:+3612345678" className="btn-outline flex-1">
                      <Phone className="w-5 h-5" />
                      <span>Hívjon most</span>
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setFormData({
                      buildingYear: '',
                      propertyType: '',
                      heatingType: '',
                      renovationType: '',
                      hasSavings: '',
                      email: '',
                      phone: '',
                      name: '',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm w-full text-center"
                >
                  Új kalkuláció indítása
                </button>
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Adatai biztonságban</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Gyors visszahívás</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>Nem kötelez semmire</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Gyakran ismételt kérdések a pályázatról
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Mennyi támogatást kaphatok?',
                a: 'Az Otthonfelújítási Program keretében a felújítási költségek 50%-a, maximum 3 millió forint igényelhető. Teljes felújítás (több szakág) esetén ez 6 millió forintra emelkedhet.'
              },
              {
                q: 'Milyen munkákra igényelhető?',
                a: 'Fűtéskorszerűsítés, kazáncsere, hőszivattyú telepítés, villamos hálózat felújítás, vízvezeték rendszer korszerűsítés, és ezek kombinációja is támogatható.'
              },
              {
                q: 'Mi a teendő, ha jogosult vagyok?',
                a: 'Szakértőink felhívják és egyeztetnek egy helyszíni felmérésről. Utána elkészítjük a részletes költségvetést és a pályázati dokumentációt – ezt sikerdíjas konstrukcióban vállaljuk.'
              },
              {
                q: 'Mennyibe kerül a pályázat készítése?',
                a: 'A pályázat elkészítése sikerdíjas: csak akkor kell fizetnie, ha a pályázat sikeres és megkapja a támogatást. A sikerdíj mértékéről az egyeztetéskor tájékoztatjuk.'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
