'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Phone, Briefcase, MapPin, Save, ArrowLeft,
  AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api, handleApiError } from '@/lib/api';

interface ContractorProfile {
  id: string;
  display_name: string;
  phone: string;
  legal_name?: string;
  tax_number?: string;
  company_registration?: string;
  trades: string[];
  service_areas: string[];
  years_experience?: number;
  status: string;
}

const TRADE_OPTIONS = [
  { value: 'viz', label: 'Vízszerelés' },
  { value: 'villany', label: 'Villanyszerelés' },
  { value: 'futes', label: 'Fűtésszerelés' },
  { value: 'combined', label: 'Kombinált' },
];

const AREA_OPTIONS = [
  'Budapest I.', 'Budapest II.', 'Budapest III.', 'Budapest IV.', 'Budapest V.',
  'Budapest VI.', 'Budapest VII.', 'Budapest VIII.', 'Budapest IX.', 'Budapest X.',
  'Budapest XI.', 'Budapest XII.', 'Budapest XIII.', 'Budapest XIV.', 'Budapest XV.',
  'Budapest XVI.', 'Budapest XVII.', 'Budapest XVIII.', 'Budapest XIX.', 'Budapest XX.',
  'Budapest XXI.', 'Budapest XXII.', 'Budapest XXIII.', 'Pest megye', 'Buda környék',
];

function ProfileContent() {
  const { user, refreshSession } = useAuth();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [companyRegistration, setCompanyRegistration] = useState('');
  const [trades, setTrades] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<{ profile: ContractorProfile }>('/api/contractor/profile');
        
        if (response.success && response.data?.profile) {
          const p = response.data.profile;
          setProfile(p);
          setDisplayName(p.display_name || '');
          setPhone(p.phone || '');
          setLegalName(p.legal_name || '');
          setTaxNumber(p.tax_number || '');
          setCompanyRegistration(p.company_registration || '');
          setTrades(p.trades || []);
          setServiceAreas(p.service_areas || []);
          setYearsExperience(p.years_experience || 0);
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await api.put('/api/contractor/profile', {
        display_name: displayName,
        phone,
        legal_name: legalName || null,
        tax_number: taxNumber || null,
        company_registration: companyRegistration || null,
        trades,
        service_areas: serviceAreas,
        years_experience: yearsExperience || null,
      });

      if (response.success) {
        setSuccess('Profil sikeresen mentve!');
        // Refresh session to update any cached profile data
        await refreshSession();
      } else {
        setError(response.error || 'Hiba történt a mentés során');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTrade = (trade: string) => {
    setTrades(prev => 
      prev.includes(trade) 
        ? prev.filter(t => t !== trade)
        : [...prev, trade]
    );
  };

  const toggleArea = (area: string) => {
    setServiceAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Betöltés...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/contractor/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Profil szerkesztése</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Status Badge */}
        {profile && (
          <div className={`mb-6 p-4 rounded-xl ${
            profile.status === 'approved' 
              ? 'bg-green-50 border border-green-200' 
              : profile.status === 'pending_approval'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {profile.status === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <span className={`font-medium ${
                profile.status === 'approved' ? 'text-green-700' : 'text-amber-700'
              }`}>
                Státusz: {profile.status === 'approved' ? 'Aktív szakember' : 
                          profile.status === 'pending_approval' ? 'Jóváhagyásra vár' : 'Elutasított'}
              </span>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-vvm-blue-600" />
              Alapadatok
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Megjelenítendő név *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefonszám *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tapasztalat (év)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-vvm-blue-600" />
              Vállalkozási adatok
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cégnév / Hivatalos név
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adószám
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cégjegyzékszám
                </label>
                <input
                  type="text"
                  value={companyRegistration}
                  onChange={(e) => setCompanyRegistration(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Trades */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-vvm-blue-600" />
              Szakterületek *
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {TRADE_OPTIONS.map(trade => (
                <button
                  key={trade.value}
                  type="button"
                  onClick={() => toggleTrade(trade.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    trades.includes(trade.value)
                      ? 'bg-vvm-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {trade.label}
                </button>
              ))}
            </div>
            {trades.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Legalább egy szakterület kiválasztása kötelező</p>
            )}
          </div>

          {/* Service Areas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-vvm-blue-600" />
              Szolgáltatási területek *
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    serviceAreas.includes(area)
                      ? 'bg-vvm-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
            {serviceAreas.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Legalább egy terület kiválasztása kötelező</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/contractor/dashboard"
              className="btn-outline py-3 px-6"
            >
              Mégse
            </Link>
            <button
              type="submit"
              disabled={isSaving || trades.length === 0 || serviceAreas.length === 0}
              className="btn-primary py-3 px-6 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Mentés...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Mentés</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContractorProfilePage() {
  return (
    <ProtectedRoute requiredRoles={['contractor']}>
      <ProfileContent />
    </ProtectedRoute>
  );
}
