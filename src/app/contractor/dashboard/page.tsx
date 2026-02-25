'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import {
  Briefcase, CheckCircle, AlertTriangle,
  LogOut, RefreshCw, Phone, Settings, X, Zap, CreditCard, Droplets, Flame, User, MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import JobCard from '@/components/JobCard';
import { api, handleApiError } from '@/lib/api';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEFAULT_VIEWPORT = {
  latitude: 47.4979,
  longitude: 19.0402,
  zoom: 11
};

function Notification({ message, type, onClose }: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' :
    type === 'error' ? 'bg-red-50 border-red-200' :
      'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-green-800' :
    type === 'error' ? 'text-red-800' :
      'text-blue-800';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertTriangle : Briefcase;
  const iconColor = type === 'success' ? 'text-green-600' :
    type === 'error' ? 'text-red-600' :
      'text-blue-600';

  return (
    <div className={`fixed top-24 right-4 z-50 max-w-md p-4 rounded-xl border ${bgColor} shadow-lg animate-in slide-in-from-right`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        <p className={`text-sm ${textColor} flex-1`}>{message}</p>
        <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const getTradeIcon = (trade: string) => {
  switch (trade) {
    case 'viz': return <Droplets className="w-5 h-5 text-sky-600" />;
    case 'villany': return <Zap className="w-5 h-5 text-amber-600" />;
    case 'futes': return <Flame className="w-5 h-5 text-orange-600" />;
    default: return <Briefcase className="w-5 h-5 text-purple-600" />;
  }
};

const getTradeColor = (trade: string) => {
  switch (trade) {
    case 'viz': return 'bg-sky-500';
    case 'villany': return 'bg-amber-500';
    case 'futes': return 'bg-orange-500';
    default: return 'bg-purple-500';
  }
};

function DashboardContent() {
  const { user, contractorProfile, logout } = useAuth();

  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'active' | 'completed'>('map');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<any>(`/api/contractor/marketplace?_t=${Date.now()}`);

      if (response.success && response.data) {
        setOpenJobs(response.data.openJobs || []);
        setActiveJobs(response.data.activeJobs || []);
        setCompletedJobs(response.data.completedJobs || []);
        setCreditBalance(response.data.creditBalance || 0);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  const handleMapJobClick = (job: any) => {
    // If clicking same job again, unselect it
    if (selectedJob?.id === job.id) setSelectedJob(null);
    else setSelectedJob(job);
  };

  const handleUnlock = async (jobId: string, leadPrice: number) => {
    if (creditBalance < leadPrice) {
      setNotification({ message: `Nincs elegendő kredited! Szükséges: ${leadPrice} Ft, Rendelkezésre áll: ${creditBalance} Ft. Kérlek töltsd fel az egyenleged.`, type: 'error' });
      return;
    }

    if (!confirm(`Biztosan megvásárolod ezt a munkát ${leadPrice} Ft-ért?`)) return;

    setActionLoading(jobId);
    try {
      const response = await api.post<any>(`/api/contractor/jobs/${jobId}/unlock`, {});
      if (response.success) {
        setNotification({ message: '✨ Sikeres vásárlás! A munka adatai feloldva.', type: 'success' });
        setSelectedJob(null);
        await fetchData(); // Full reload to get contact info and move to 'active'
        setActiveTab('active');
      } else {
        setNotification({ message: response.error || 'Vásárlás nem sikerült.', type: 'error' });
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setNotification({ message: errorMsg, type: 'error' });
      await fetchData(); // Might have been bought by someone else
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const response = await api.put<any>(`/api/contractor/jobs/${jobId}`, { new_status: 'in_progress' });
      if (response.success) {
        setNotification({ message: '🚀 Munka elkezdve!', type: 'success' });
        await fetchData();
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const response = await api.put<any>(`/api/contractor/jobs/${jobId}`, { new_status: 'completed' });
      if (response.success) {
        setNotification({ message: '🎉 Munka befejezve! Gratulálunk!', type: 'success' });
        await fetchData();
        setActiveTab('completed');
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Credit Balance */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Szakember Irányítópult</h1>
            <p className="text-gray-600">
              Üdv, <span className="font-semibold">{contractorProfile?.display_name || user?.email}</span>!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-vvm-blue-50 border border-vvm-blue-100 px-6 py-3 rounded-xl flex items-center gap-3 w-full sm:w-auto">
              <CreditCard className="w-5 h-5 text-vvm-blue-600" />
              <div>
                <p className="text-xs text-vvm-blue-800 uppercase tracking-wide font-bold">Egyenleg</p>
                <p className="text-xl font-bold text-vvm-blue-900">{creditBalance.toLocaleString('hu-HU')} Ft</p>
              </div>
            </div>

            <Link href="/contractor/topup" className="btn-primary w-full sm:w-auto">
              Feltöltés
            </Link>

            <div className="hidden sm:block w-px h-10 bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/contractor/profile" className="p-2 text-gray-500 hover:text-vvm-blue-600 hover:bg-vvm-blue-50 rounded-lg transition-colors" title="Profil">
                <Settings className="w-5 h-5" />
              </Link>
              <button onClick={handleRefresh} disabled={isLoading} className="p-2 text-gray-500 hover:text-vvm-blue-600 hover:bg-vvm-blue-50 rounded-lg transition-colors" title="Frissítés">
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => logout()} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Kijelentkezés">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'map' ? 'bg-vvm-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <MapPin className="w-4 h-4" />
            Elérhető munkák ({openJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-vvm-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Briefcase className="w-4 h-4" />
            Saját munkáim ({activeJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-vvm-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            Befejezett ({completedJobs.length})
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Betöltés...</p>
          </div>
        ) : (
          <div>
            {/* MAP TAB */}
            {activeTab === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Map Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[500px] lg:h-[700px] relative">
                  {!MAPBOX_TOKEN ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 flex-col p-6 text-center z-10">
                      <MapPin className="w-12 h-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-bold text-gray-700">Térkép nem elérhető</h3>
                      <p className="text-gray-500 max-w-sm mt-2">Kérlek állítsd be a NEXT_PUBLIC_MAPBOX_TOKEN környezeti változót a térkép használatához.</p>
                      <p className="text-gray-400 text-sm mt-4">Válaszd ki a munkákat a jobb oldali listából.</p>
                    </div>
                  ) : (
                    <Map
                      initialViewState={DEFAULT_VIEWPORT}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      mapboxAccessToken={MAPBOX_TOKEN}
                    >
                      <NavigationControl position="bottom-right" />
                      <GeolocateControl position="bottom-right" />

                      {openJobs.filter(j => j.latitude && j.longitude).map(job => (
                        <Marker
                          key={job.id}
                          latitude={job.latitude}
                          longitude={job.longitude}
                          anchor="bottom"
                          onClick={e => {
                            e.originalEvent.stopPropagation();
                            handleMapJobClick(job);
                          }}
                        >
                          <div className={`w-10 h-10 ${getTradeColor(job.trade)} rounded-full mt-2 -ml-5 flex items-center justify-center text-white shadow-lg cursor-pointer transform transition-transform hover:scale-110 ${selectedJob?.id === job.id ? 'ring-4 ring-vvm-yellow-400' : 'ring-2 ring-white'}`}>
                            {getTradeIcon(job.trade)}
                          </div>
                        </Marker>
                      ))}
                    </Map>
                  )}
                </div>

                {/* Job List / Selected Job Details */}
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedJob ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-700">Kiválasztott munka</h3>
                        <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
                      </div>
                      <JobCard job={selectedJob} onUnlock={handleUnlock} />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-gray-700 mb-2">Legújabb munkák a környékeden</h3>
                      {openJobs.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                          <p className="text-gray-600">Jelenleg nincs elérhető új munka a rendszerben.</p>
                        </div>
                      ) : (
                        openJobs.map((job) => (
                          <div key={job.id} className={`${actionLoading === job.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            <JobCard job={job} onUnlock={handleUnlock} />
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ACTIVE JOBS TAB */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nincs aktív munkád</h3>
                    <p className="text-gray-500">Visszatérhetsz a Térkép fülre, hogy megvásárolj egy elérhető munkát.</p>
                    <button onClick={() => setActiveTab('map')} className="mt-4 text-vvm-blue-600 font-medium hover:underline">Ugrás a térképre &rarr;</button>
                  </div>
                ) : (
                  activeJobs.map((job) => (
                    <div key={job.id} className={actionLoading === job.id ? 'opacity-50 pointer-events-none' : ''}>
                      <JobCard job={job} onStart={handleStart} onComplete={handleComplete} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* COMPLETED JOBS TAB */}
            {activeTab === 'completed' && (
              <div className="space-y-4">
                {completedJobs.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Még nincs befejezett munkád</h3>
                  </div>
                ) : (
                  completedJobs.map((job) => (
                    <div key={job.id}>
                      <JobCard job={job} showActions={false} />
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['contractor']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
