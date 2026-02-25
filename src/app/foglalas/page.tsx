'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle,
  Droplets, Zap, Flame, AlertTriangle, Calendar, Clock,
  MapPin, Phone, Mail, User, Building, Shield,
  Info, Star, Truck, Send, Camera, Video, LogIn
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatHungarianPhone, isValidHungarianPhone } from '@/utils/phoneFormat';
import { useAuth } from '@/contexts/AuthContext';

// Problem categories
const problemCategories = [
  {
    id: 'viz',
    name: 'Vízszerelés',
    icon: Droplets,
    color: 'bg-sky-500',
    problems: [
      { id: 'csotores', name: 'Csőtörés', sos: true },
      { id: 'dugulas', name: 'Dugulás', sos: true },
      { id: 'csaptelep', name: 'Csaptelep csere' },
      { id: 'wc', name: 'WC tartály probléma' },
      { id: 'bojler', name: 'Bojler javítás/csere' },
      { id: 'szifon', name: 'Szifon csere' },
      { id: 'egyeb_viz', name: 'Egyéb vízszerelési munka' },
    ]
  },
  {
    id: 'villany',
    name: 'Villanyszerelés',
    icon: Zap,
    color: 'bg-amber-500',
    problems: [
      { id: 'nincs_aram', name: 'Nincs áram', sos: true },
      { id: 'fi_rele', name: 'Fi-relé lever', sos: true },
      { id: 'biztositekatabla', name: 'Biztosítéktábla korszerűsítés' },
      { id: 'konnektor', name: 'Konnektor/kapcsoló csere' },
      { id: 'vilagitas', name: 'Világítás szerelés' },
      { id: 'atvezetekeles', name: 'Teljes átvezetékelés' },
      { id: 'ev_tolto', name: 'EV töltő telepítés' },
      { id: 'egyeb_villany', name: 'Egyéb villanyszerelési munka' },
    ]
  },
  {
    id: 'futes',
    name: 'Fűtés / Energetika',
    icon: Flame,
    color: 'bg-orange-500',
    problems: [
      { id: 'radiator', name: 'Radiátor nem melegszik' },
      { id: 'kazan', name: 'Kazán probléma' },
      { id: 'padlofutes', name: 'Padlófűtés' },
      { id: 'termosztat', name: 'Termosztát csere' },
      { id: 'hoszivatyu', name: 'Hőszivattyú előkészítés' },
      { id: 'egyeb_futes', name: 'Egyéb fűtéssel kapcsolatos' },
    ]
  },
];

// Rooms
const rooms = [
  { id: 'konyha', name: 'Konyha' },
  { id: 'furdo', name: 'Fürdőszoba' },
  { id: 'wc', name: 'WC' },
  { id: 'nappali', name: 'Nappali' },
  { id: 'haloszoba', name: 'Hálószoba' },
  { id: 'pince', name: 'Pince' },
  { id: 'terasz', name: 'Terasz/Erkély' },
  { id: 'teljes', name: 'Teljes lakás' },
  { id: 'egyeb', name: 'Egyéb' },
];

// Time slots
const generateTimeSlots = () => {
  const slots = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    slots.push({
      date: date,
      dateStr: date.toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' }),
      times: i === 0
        ? ['14:00-16:00', '16:00-18:00'] // Limited slots for today
        : ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'],
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }

  return slots;
};

// Loading fallback for Suspense
function BookingPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Betöltés...</p>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function BookingPageContent() {
  const searchParams = useSearchParams();
  const { user, isCustomer } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // ... (rest of state remains same, just inserting error state)
    // Step 1
    category: '',
    problem: '',
    description: '',
    isSOS: false,
    room: '',
    hasChildren: false,
    hasElderly: false,
    files: [] as File[],

    // Step 2
    selectedDate: null as Date | null,
    selectedTime: '',
    isExpress: false,

    // Step 3
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Budapest',
    district: '',
    floor: '',
    doorbell: '',
    accessNote: '',
    isCompany: false,
    companyName: '',
    taxNumber: '',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });

  // ... (skip to file input section)



  const timeSlots = generateTimeSlots();

  // Pre-fill form from URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    const problem = searchParams.get('problem');
    const description = searchParams.get('description');
    const sos = searchParams.get('sos');

    if (category || problem || description) {
      setFormData(prev => ({
        ...prev,
        category: category || prev.category,
        problem: problem || prev.problem,
        description: description ? decodeURIComponent(description) : prev.description,
        isSOS: sos === 'true' || prev.isSOS,
      }));
    }
  }, [searchParams]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && isCustomer) {
      setFormData(prev => ({
        ...prev,
        // @ts-ignore - checking user_metadata is safe
        name: user.user_metadata?.full_name || prev.name,
        email: user.email || prev.email,
        // @ts-ignore
        phone: user.user_metadata?.phone || prev.phone,
      }));
    }
  }, [user, isCustomer]);

  const selectedCategory = problemCategories.find(c => c.id === formData.category);
  const selectedProblem = selectedCategory?.problems.find(p => p.id === formData.problem);

  // Calculate estimated price based on selections
  const getEstimatedPrice = () => {
    let basePrice = 15000;
    if (formData.category === 'villany') basePrice = 18000;
    if (formData.category === 'futes') basePrice = 20000;
    if (formData.isExpress || formData.isSOS) basePrice *= 1.5;

    return {
      min: Math.round(basePrice * 0.8),
      max: Math.round(basePrice * 1.5),
    };
  };

  const estimatedPrice = getEstimatedPrice();

  const canProceedStep1 = formData.category && formData.problem && formData.description.length > 10;
  const canProceedStep2 = formData.selectedDate && formData.selectedTime;
  const canProceedStep3 = formData.name && isValidHungarianPhone(formData.phone) && formData.email && formData.address && formData.district && formData.acceptTerms && formData.acceptPrivacy;

  // State for job ID and auth after creation
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [createdMagicLink, setCreatedMagicLink] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Parse address into street and house number
      const addressParts = formData.address.match(/^(.+?)\s+(\d+\S*)\.?\s*$/);
      const street = addressParts ? addressParts[1] : formData.address;
      const houseNumber = addressParts ? addressParts[2] : '';

      // Determine job category based on flags
      let jobCategory: 'sos' | 'standard' | 'b2b_project' = 'standard';
      if (formData.isSOS) jobCategory = 'sos';
      else if (formData.isCompany) jobCategory = 'b2b_project';

      // Determine priority
      let priority: 'normal' | 'high' | 'critical' = 'normal';
      if (formData.isSOS) priority = 'critical';
      else if (formData.isExpress) priority = 'high';

      // Calculate preferred time range
      let preferredTimeFrom: string | undefined;
      let preferredTimeTo: string | undefined;
      if (formData.selectedDate && formData.selectedTime) {
        const [startTime, endTime] = formData.selectedTime.split('-').map(t => t.trim());
        const dateStr = formData.selectedDate.toISOString().split('T')[0];
        preferredTimeFrom = `${dateStr}T${startTime}:00`;
        preferredTimeTo = `${dateStr}T${endTime}:00`;
      }

      // Create job in database
      const jobResponse = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            id: user?.id,
            full_name: formData.name,
            phone: formData.phone,
            email: formData.email,
            type: formData.isCompany ? 'b2b' : 'b2c',
            company_name: formData.companyName || undefined,
          },
          address: {
            city: formData.city,
            district: formData.district,
            street: street,
            house_number: houseNumber,
            floor_door: [formData.floor, formData.doorbell].filter(Boolean).join(' / ') || undefined,
            notes: formData.accessNote || undefined,
          },
          job: {
            trade: formData.category as 'viz' | 'villany' | 'futes',
            category: jobCategory,
            title: selectedProblem?.name || 'Új munka',
            description: formData.description,
            priority: priority,
            preferred_time_from: preferredTimeFrom,
            preferred_time_to: preferredTimeTo,
            estimated_price_gross: estimatedPrice.max,
          },
        }),
      });

      const jobData = await jobResponse.json();

      if (jobResponse.ok && jobData.success) {
        setCreatedJobId(jobData.data?.job_id || null);
        setCreatedMagicLink(jobData.data?.magic_link || null);

        // Also send email notification (with files)
        const formDataToSend = new FormData();
        formDataToSend.append('type', 'booking');

        const bookingData = {
          category: selectedCategory?.name,
          problem: selectedProblem?.name,
          description: formData.description,
          room: rooms.find(r => r.id === formData.room)?.name,
          isSOS: formData.isSOS,
          isExpress: formData.isExpress,
          hasChildren: formData.hasChildren,
          hasElderly: formData.hasElderly,
          selectedDate: formData.selectedDate?.toLocaleDateString('hu-HU'),
          selectedTime: formData.selectedTime,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          floor: formData.floor,
          doorbell: formData.doorbell,
          accessNote: formData.accessNote,
          isCompany: formData.isCompany,
          companyName: formData.companyName,
          taxNumber: formData.taxNumber,
          acceptMarketing: formData.acceptMarketing,
          estimatedPrice: `${estimatedPrice.min.toLocaleString()} - ${estimatedPrice.max.toLocaleString()} Ft`,
          jobId: jobData.data?.job_id, // Include job ID in email
        };

        formDataToSend.append('data', JSON.stringify(bookingData));

        // Append files
        formData.files.forEach((file) => {
          formDataToSend.append('files', file);
        });

        // Send email (don't fail if this fails)
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            body: formDataToSend,
          });
        } catch {
          console.warn('Email notification failed, but job was created');
        }

        setIsSubmitted(true);
      } else {
        alert(jobData.error || 'Hiba történt a küldés során. Kérjük próbálja újra vagy hívjon minket telefonon.');
      }
    } catch {
      alert('Hiba történt a küldés során. Kérjük próbálja újra vagy hívjon minket telefonon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Probléma sikeresen bejelentve!</h1>
            <p className="text-gray-600 mb-6">
              Köszönjük megkeresését! Hamarosan felvesszük Önnel a kapcsolatot a megadott telefonszámon
              a szakember pontos érkezése és az árajánlat egyeztetése céljából.
            </p>
            {createdJobId && (
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Bejelentés azonosító:</p>
                <p className="font-mono text-sm text-gray-700">{createdJobId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}

            {createdMagicLink ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-green-800 mb-2">Ügyfélfiók automatikusan létrehozva!</h3>
                <p className="text-sm text-green-700 mb-4">
                  Hogy nyomon követhesse a szerelő érkezését, létrehoztunk Önnek egy jelszómentes Ügyfél Portált a megadott email címmel.
                </p>
                <a href={createdMagicLink} className="btn-primary w-full shadow-lg shadow-green-500/30">
                  <LogIn className="w-5 h-5 mr-2" />
                  Belépés az Ügyfél Portálra
                </a>
              </div>
            ) : (
              <div className="bg-vvm-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-vvm-blue-800">
                  <strong>Összefoglaló:</strong><br />
                  {selectedCategory?.name} - {selectedProblem?.name}<br />
                  {formData.selectedDate?.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })}, {formData.selectedTime}<br />
                  {formData.address}, {formData.district}. kerület
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/" className="btn-outline w-full">
                Vissza a főoldalra
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHungarianPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const isPhoneValid = formData.phone === '' || isValidHungarianPhone(formData.phone);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs className="mb-4" />

          <h1 className="text-3xl font-bold text-gray-900 font-heading">Probléma bejelentése</h1>
          <p className="text-gray-600 mt-2">Adja meg a probléma részleteit, és találja meg a megfelelő szakembert pár perc alatt.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Probléma' },
              { num: 2, label: 'Időpont' },
              { num: 3, label: 'Adatok' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-1 ${step >= s.num ? 'text-vvm-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step > s.num
                    ? 'bg-green-500 text-white'
                    : step === s.num
                      ? 'bg-vvm-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}>
                    {step > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.num}
                  </div>
                  <span className="text-xs sm:text-base font-medium text-center">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-full h-0.5 sm:h-1 mx-1 sm:mx-4 rounded flex-shrink-0 max-w-[40px] sm:max-w-[96px] ${step > s.num ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Step 1: Problem Description */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mi a probléma?</h2>

                {/* Category Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  {problemCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id, problem: '' }))}
                      className={`p-4 rounded-xl border-2 transition-all ${formData.category === cat.id
                        ? 'border-vvm-blue-500 bg-vvm-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-white mb-3 mx-auto`}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-gray-800 text-center">{cat.name}</div>
                    </button>
                  ))}
                </div>

                {/* Problem Selection */}
                {formData.category && (
                  <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Válassza ki a probléma típusát
                    </label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {selectedCategory?.problems.map((prob) => (
                        <button
                          key={prob.id}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            problem: prob.id,
                            isSOS: prob.sos || false
                          }))}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${formData.problem === prob.id
                            ? 'border-vvm-blue-500 bg-vvm-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <span className="font-medium text-gray-800">{prob.name}</span>
                          {prob.sos && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              SOS
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Írja le részletesen a problémát *
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="Pl.: A konyhai csap folyamatosan csöpög, hiába zárom el teljesen. Kb. 3 napja kezdődött..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
                <p className="mt-1 text-sm text-gray-500">Minimum 10 karakter szükséges</p>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Érintett helyiség
                </label>
                <div className="flex flex-wrap gap-2">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setFormData(prev => ({ ...prev, room: room.id }))}
                      className={`px-4 py-2.5 min-h-[44px] rounded-lg border transition-all ${formData.room === room.id
                        ? 'border-vvm-blue-500 bg-vvm-blue-50 text-vvm-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                    >
                      {room.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-vvm-blue-600 focus:ring-vvm-blue-500"
                    checked={formData.hasChildren}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasChildren: e.target.checked }))}
                  />
                  <span className="text-gray-700">Kisgyerek van a háztartásban</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-vvm-blue-600 focus:ring-vvm-blue-500"
                    checked={formData.hasElderly}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasElderly: e.target.checked }))}
                  />
                  <span className="text-gray-700">Idős személy van a háztartásban</span>
                </label>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mellékletek (nem kötelező)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-vvm-blue-400 hover:bg-vvm-blue-50/30 transition-all cursor-pointer bg-white group relative">
                  <div className="flex justify-center items-center gap-8 mb-4">
                    <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-vvm-blue-600 transition-colors">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        <Camera className="w-7 h-7 text-gray-400 group-hover:text-vvm-blue-600 transition-colors" />
                      </div>
                      <span className="font-semibold text-sm">Kép feltöltése</span>
                    </div>

                    <div className="h-12 w-px bg-gray-200"></div>

                    <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-vvm-blue-600 transition-colors">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        <Video className="w-7 h-7 text-gray-400 group-hover:text-vvm-blue-600 transition-colors" />
                      </div>
                      <span className="font-semibold text-sm">Videó feltöltése</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 group-hover:text-vvm-blue-500 transition-colors">
                    vagy húzza ide a fájlokat
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      setError(null);
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        const validFiles: File[] = [];
                        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

                        let hasLargeFile = false;
                        newFiles.forEach(file => {
                          if (file.size > MAX_FILE_SIZE) {
                            hasLargeFile = true;
                          } else {
                            validFiles.push(file);
                          }
                        });

                        if (hasLargeFile) {
                          setError('Egy vagy több fájl túl nagy (Max 10MB). A többi fájl hozzáadva.');
                        }

                        if (validFiles.length > 0) {
                          setFormData(prev => ({
                            ...prev,
                            files: [...prev.files, ...validFiles]
                          }));
                        }
                      }
                    }}
                  />
                </div>
                {error && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          {file.type.startsWith('video/') ? (
                            <Video className="w-5 h-5 text-vvm-blue-500" />
                          ) : (
                            <Camera className="w-5 h-5 text-vvm-blue-500" />
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            files: prev.files.filter((_, i) => i !== index)
                          }))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <span className="sr-only">Törlés</span>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SOS Option */}
              <div className={`p-4 rounded-xl border-2 ${formData.isSOS ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    checked={formData.isSOS}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSOS: e.target.checked }))}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-gray-900">SOS Expressz kiszállás</span>
                      <span className="text-sm text-red-600 font-medium">+50% felár</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Sürgős probléma? Szakemberünk 2 órán belül a helyszínen.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mikorra lenne szükség a szerelőre?</h2>
                <p className="text-gray-600">
                  {formData.isSOS
                    ? 'SOS expressz kiszállás – a lehető leghamarabb.'
                    : 'Normál kiszállás – általában 2-3 napon belül.'}
                </p>
              </div>

              {/* Express Option Toggle */}
              {!formData.isSOS && (
                <div className={`p-4 rounded-xl border-2 ${formData.isExpress ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      checked={formData.isExpress}
                      onChange={(e) => setFormData(prev => ({ ...prev, isExpress: e.target.checked }))}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-gray-900">Expressz kiszállás</span>
                        <span className="text-sm text-amber-600 font-medium">+30% felár</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Garantált kiszállás a választott időpontban.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Válasszon napot <span className="text-gray-400 text-xs font-normal ml-1">← húzza →</span>
                </label>
                <div className="relative">
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {timeSlots.slice(0, 7).map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          selectedDate: slot.date,
                          selectedTime: ''
                        }))}
                        disabled={slot.isToday && !formData.isSOS}
                        className={`flex-shrink-0 w-20 sm:w-24 p-2 sm:p-3 rounded-xl border-2 text-center transition-all snap-start ${formData.selectedDate?.toDateString() === slot.date.toDateString()
                          ? 'border-vvm-blue-500 bg-vvm-blue-50'
                          : slot.isToday && !formData.isSOS
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-xs text-gray-500">
                          {slot.isToday ? 'Ma' : slot.isTomorrow ? 'Holnap' : slot.date.toLocaleDateString('hu-HU', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {slot.date.getDate()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot.date.toLocaleDateString('hu-HU', { month: 'short' })}
                        </div>
                        {slot.isToday && formData.isSOS && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            SOS
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Scroll fade indicators */}
                  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden"></div>
                </div>
              </div>

              {/* Time Selection */}
              {formData.selectedDate && (
                <div className="animate-slide-up">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Válasszon időpontot
                  </label>
                  <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                    {timeSlots
                      .find(s => s.date.toDateString() === formData.selectedDate?.toDateString())
                      ?.times.map((time) => (
                        <button
                          key={time}
                          onClick={() => setFormData(prev => ({ ...prev, selectedTime: time }))}
                          className={`p-3 rounded-lg border-2 transition-all ${formData.selectedTime === time
                            ? 'border-vvm-blue-500 bg-vvm-blue-50 text-vvm-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                        >
                          <Clock className="w-4 h-4 inline mr-2" />
                          {time}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Adatok megadása</h2>
                <p className="text-gray-600">Kérjük, adja meg elérhetőségeit és a cím adatait.</p>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teljes név *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="Kovács János"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonszám *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      className={`input-field pl-10 ${!isPhoneValid ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="+36 30 123 4567"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                  {!isPhoneValid && (
                    <p className="mt-1 text-sm text-red-600">Kérjük, adjon meg érvényes magyar telefonszámot</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email cím *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="pelda@email.hu"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-vvm-blue-600" />
                  Cím adatok
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Város *
                    </label>
                    <input
                      type="text"
                      className="input-field bg-gray-50"
                      value={formData.city}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kerület *
                    </label>
                    <select
                      className="input-field"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    >
                      <option value="">Válasszon...</option>
                      {[...Array(23)].map((_, i) => (
                        <option key={i + 1} value={`${i + 1}`}>{i + 1}. kerület</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emelet
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="pl. 3. emelet"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cím (utca, házszám) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Kossuth Lajos utca 10."
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kaputelefon / Csengő
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="pl. 12-es csengő"
                      value={formData.doorbell}
                      onChange={(e) => setFormData(prev => ({ ...prev, doorbell: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bejutási útmutató
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="pl. A kapukód: 1234"
                      value={formData.accessNote}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessNote: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Company Billing */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-vvm-blue-600 focus:ring-vvm-blue-500"
                    checked={formData.isCompany}
                    onChange={(e) => setFormData(prev => ({ ...prev, isCompany: e.target.checked }))}
                  />
                  <span className="font-medium text-gray-700">Céges számlát kérek</span>
                </label>

                {formData.isCompany && (
                  <div className="grid md:grid-cols-2 gap-4 animate-slide-up">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cégnév *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          className="input-field pl-10"
                          placeholder="Példa Kft."
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adószám *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="12345678-1-42"
                        value={formData.taxNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-vvm-blue-600" />
                  Bejelentés összesítő
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Szolgáltatás:</span>
                    <span>{selectedProblem?.name || 'Nincs kiválasztva'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Időpont:</span>
                    <span>
                      {formData.selectedDate?.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })}, {formData.selectedTime}
                    </span>
                  </div>
                  {(formData.isSOS || formData.isExpress) && (
                    <div className="flex justify-between text-amber-600">
                      <span>{formData.isSOS ? 'SOS felár:' : 'Expressz felár:'}</span>
                      <span>+{formData.isSOS ? '50%' : '30%'}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
                    <span>Becsült összeg:</span>
                    <span className="text-vvm-blue-600">
                      {estimatedPrice.min.toLocaleString()} - {estimatedPrice.max.toLocaleString()} Ft
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    <strong>Garancia:</strong> Minden munkánkra minimum 1 év garanciát vállalunk.
                  </p>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-vvm-blue-600 focus:ring-vvm-blue-500"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  />
                  <span className="text-gray-700">
                    Elfogadom az <Link href="/aszf" className="text-vvm-blue-600 hover:underline">ÁSZF</Link>-et és a szolgáltatási feltételeket. *
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-vvm-blue-600 focus:ring-vvm-blue-500"
                    checked={formData.acceptPrivacy}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                  />
                  <span className="text-gray-700">
                    Elfogadom az <Link href="/adatkezeles" className="text-vvm-blue-600 hover:underline">Adatkezelési tájékoztatót</Link>. *
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-vvm-blue-600 focus:ring-vvm-blue-500"
                    checked={formData.acceptMarketing}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptMarketing: e.target.checked }))}
                  />
                  <span className="text-gray-700">
                    Szeretnék értesülni az akciókról és pályázati lehetőségekről.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-outline"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Vissza</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Tovább</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceedStep3 || isSubmitting}
                className="btn-primary py-4 px-8 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Küldés...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Szakember keresése</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-600">Garanciális munka</span>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500" />
            <span className="text-sm text-gray-600">4.9★ értékelés</span>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-vvm-blue-500" />
            <span className="text-sm text-gray-600">Ellenőrzött mesterek</span>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <Calendar className="w-8 h-8 text-slate-600" />
            <span className="text-sm text-gray-600">1 év garancia</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with Suspense boundary for useSearchParams
export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageLoading />}>
      <BookingPageContent />
    </Suspense>
  );
}
