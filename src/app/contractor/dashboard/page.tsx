'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import {
  Briefcase, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight,
  LogOut, RefreshCw, Phone, Settings, X, Zap, CreditCard, Droplets, Flame, User, MapPin, Gift, Copy, Link as LinkIcon, Navigation
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import JobCard from '@/components/JobCard';
import { api, handleApiError } from '@/lib/api';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Loader2 } from 'lucide-react';

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
    <div className={`fixed top-24 right-4 z-[100] max-w-md p-4 rounded-xl border ${bgColor} shadow-lg animate-in slide-in-from-right`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        <p className={`text-sm ${textColor} flex-1 font-medium`}>{message}</p>
        <button onClick={onClose} className={`${textColor} hover:opacity-70 p-1`}>
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

  // SWR-powered marketplace data (replaces manual useEffect + setState)
  const {
    openJobs, activeJobs, completedJobs, creditBalance,
    isLoading, error, refresh: refreshMarketplace
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'map' | 'active' | 'completed' | 'affiliate'>('map');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // New state variables for swipe gestures
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Touch event handlers for swipe down
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndY(null); // Reset
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;
    const distance = touchEndY - touchStartY;
    const isDownSwipe = distance > minSwipeDistance;
    const isUpSwipe = distance < -minSwipeDistance;
    if (isDownSwipe) {
      // Swiped down - switch to 'map' tab which minimizes the panel
      setActiveTab('map');
    } else if (isUpSwipe && activeTab === 'map') {
      // Swiped up from map mode - expand panel to available tab
      setActiveTab('active');
    }
  };

  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<{ total_referrals: number, total_earned: number }>({ total_referrals: 0, total_earned: 0 });


  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Fly to job location when selected
  useEffect(() => {
    if (selectedJob && selectedJob.latitude && selectedJob.longitude) {
      const lat = Number(selectedJob.latitude);
      const lng = Number(selectedJob.longitude);
      const centerLat = window.innerWidth >= 1024 ? lat : lat - 0.08;

      mapRef.current?.flyTo({
        center: [lng, centerLat],
        zoom: 10,
        duration: 1500
      });
    }
  }, [selectedJob]);

  // Fit bounds to all jobs when loaded
  useEffect(() => {
    const mapJobs = activeTab === 'map' ? openJobs : (activeTab === 'active' ? activeJobs : []);
    const validJobs = mapJobs.filter(j => j?.latitude && j?.longitude);
    if (validJobs.length > 0 && mapRef.current && !selectedJob) {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      validJobs.forEach(j => {
        const lat = Number(j.latitude);
        const lng = Number(j.longitude);
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });

      // Add a little padding to the bounds
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        { padding: 50, duration: 1500, maxZoom: 10 }
      );
    }
  }, [openJobs, activeJobs, activeTab]);

  // Fetch affiliate/profile data separately (not part of marketplace)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileResponse = await api.get<any>('/api/contractor/profile');
        if (profileResponse.success && profileResponse.data) {
          if (profileResponse.data.profile?.referral_code) {
            setReferralCode(profileResponse.data.profile.referral_code);
          }
          if (profileResponse.data.affiliate_stats) {
            setAffiliateStats(profileResponse.data.affiliate_stats);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleRefresh = useCallback(async () => {
    refreshMarketplace();
  }, [refreshMarketplace]);

  const handleMapJobClick = (job: any) => {
    setSelectedJob(job);
    // Detail modal opens when 'Részletek' button is clicked inside the popup
  };

  const handleJobCardClick = (job: any) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleUnlock = async (jobId: string, leadPrice: number) => {
    if (creditBalance < leadPrice) {
      setNotification({ message: `Nincs elegendő kredited! Szükséges: ${leadPrice} Ft, Rendelkezésre áll: ${creditBalance} Ft. Kérlek töltsd fel az egyenleged.`, type: 'error' });
      return;
    }

    if (!confirm(`Biztosan kijelzed az érdeklődésed, és zárolni szeretnél 2.000 Ft értékű kreditet?`)) return;

    setActionLoading(jobId);
    try {
      const response = await api.post<any>(`/api/contractor/jobs/${jobId}/interest`, {});
      if (response.success) {
        setNotification({ message: '✨ Sikeres érdeklődés! 2.000 Ft zárolásra került. Várunk az ügyfél döntésére.', type: 'success' });
        setIsDetailModalOpen(false);
        setSelectedJob(null);
        await refreshMarketplace(); // SWR revalidation
        setActiveTab('active');
      } else {
        setNotification({ message: response.error || 'Vásárlás nem sikerült.', type: 'error' });
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setNotification({ message: errorMsg, type: 'error' });
      await refreshMarketplace(); // Might have been bought by someone else
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
        await refreshMarketplace();
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
        await refreshMarketplace();
        setIsDetailModalOpen(false);
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

  const mapJobs = activeTab === 'map' ? openJobs : (activeTab === 'active' ? activeJobs : []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-white lg:bg-slate-900 relative flex flex-col lg:block">
      {notification && (

        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Map Section: Full background on both desktop and mobile */}
      {/* Mobile Back Button */}
      <Link href="/" className="lg:hidden absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-slate-700 font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 active:scale-95 transition-all">
        <ArrowLeft className="w-4 h-4" /> Vissza
      </Link>
      <div className="h-full w-full absolute inset-0 z-0">
        {!MAPBOX_TOKEN ? (
          <div className="w-full h-full flex flex-col justify-center items-center bg-slate-100 p-8 text-center">
            <MapPin className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Térkép nem elérhető</h3>
          </div>
        ) : (
          <Map
            ref={mapRef}
            initialViewState={DEFAULT_VIEWPORT}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <div className="absolute top-24 lg:top-24 right-4 z-10 flex flex-col gap-2 scale-75 lg:scale-100">
              <NavigationControl showCompass={false} />
              <GeolocateControl />
            </div>

            {mapJobs.filter((j: any) => j?.latitude && j?.longitude).map((job: any) => (
              <Marker
                key={`map-job-${job.id}`}
                latitude={job.latitude}
                longitude={job.longitude}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  handleMapJobClick(job);
                }}
              >
                <div className="relative group cursor-pointer hover:scale-110 transition-transform z-10 hover:z-20">
                  <div className={`absolute -inset-2 rounded-full animate-ping opacity-20 ${getTradeColor(job.trade)}`}></div>
                  <div className={`relative w-10 h-10 lg:w-12 lg:h-12 rounded-full ${getTradeColor(job.trade)} shadow-xl flex items-center justify-center border-4 ${selectedJob?.id === job.id ? 'border-vvm-blue-900 ring-4 ring-vvm-blue-400' : 'border-white'}`}>
                    <div className="scale-75 lg:scale-100">{getTradeIcon(job.trade)}</div>
                  </div>
                </div>
              </Marker>
            ))}

            {selectedJob && !isDetailModalOpen && activeTab === 'map' && (
              <Popup
                longitude={selectedJob.longitude}
                latitude={selectedJob.latitude}
                anchor="bottom"
                offset={25}
                onClose={() => setSelectedJob(null)}
                closeOnClick={false}
                className="z-50 min-w-[300px] dashboard-map-popup"
                maxWidth="340px"
              >
                <div className="p-0.5">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getTradeColor(selectedJob.trade)} flex flex-shrink-0 items-center justify-center text-white shadow-md *:w-4 *:h-4 sm:*:w-5 sm:*:h-5`}>
                      {getTradeIcon(selectedJob.trade)}
                    </div>
                    <div className="flex-1 pr-1">
                      <h3 className="font-bold text-slate-800 text-[13px] sm:text-base leading-tight mb-0.5">{selectedJob.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        {selectedJob.district_or_city || 'Cím nem elérhető'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 text-slate-600 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4 text-[11px] sm:text-sm border border-slate-200 leading-snug italic shadow-inner line-clamp-2">
                    &quot;{selectedJob.description || 'Nincs leírás'}&quot;
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {activeJobs.some(j => j.id === selectedJob.id) || completedJobs.some(j => j.id === selectedJob.id) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsDetailModalOpen(true); }}
                        className="w-full bg-vvm-blue-600 hover:bg-vvm-blue-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <Briefcase className="w-4 h-4" />
                        Kezelt Munka Részletei
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsDetailModalOpen(true); }}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Részletek megtekintése
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        )}
      </div>

      {/* Content Section: Floating Overlays on Desktop, Bottom Sheet on Mobile */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col lg:flex-row lg:p-0 lg:gap-0 lg:pt-0 pointer-events-none">

        {/* Floating Navigation Pill */}
        <div className="hidden lg:block absolute top-4 left-[440px] xl:left-[480px] z-20 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center px-2 py-1.5 border border-slate-200/50 hover:shadow-xl hover:border-slate-300 transition-all">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:text-slate-900 font-bold text-sm hover:bg-slate-50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Vissza
            </Link>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-vvm-blue-500 animate-pulse"></div>
              <span className="text-slate-600 font-bold text-sm">Szakember Portál</span>
            </div>
          </div>
        </div>

        {/* Main Side Panel */}
        <div
          className={`w-full lg:w-[420px] xl:w-[460px] flex flex-col pointer-events-auto overflow-hidden transition-all duration-500 ease-in-out bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-15px_30px_rgba(0,0,0,0.05)] lg:shadow-[15px_0_30px_rgba(0,0,0,0.4)] border-t border-slate-100 lg:border-r lg:border-t-0 z-10 ${activeTab === 'map' ? 'h-[35vh] mt-[65vh] lg:h-full lg:mt-0' : 'h-[85vh] mt-[15vh] lg:h-full lg:mt-0'
            }`}
          style={{ touchAction: 'none' }}
          onTouchStart={(e) => { e.stopPropagation(); onTouchStart(e); }}
          onTouchMove={(e) => { e.stopPropagation(); onTouchMove(e); }}
          onTouchEnd={onTouchEnd}
        >

          {/* Grab Handle for Mobile */}
          <div className="w-full flex justify-center py-3 lg:hidden flex-shrink-0 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
          </div>

          {/* User & Balance Section */}
          <div
            className="bg-white/95 lg:bg-white backdrop-blur-xl lg:backdrop-blur-none lg:rounded-none p-5 lg:p-6 lg:border-b lg:border-slate-100 flex-shrink-0"
            // Stop propagation here so scrolling inside the content doesn't trigger the pull-down
            onTouchStart={(e) => {
              // Only allow pull down from the handle/header area
              if ((e.target as HTMLElement).closest('.custom-scrollbar')) {
                e.stopPropagation();
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 lg:w-12 lg:h-12 bg-vvm-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-vvm-blue-100">
                  <User className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h1 className="text-base lg:text-lg font-black text-slate-800 leading-none">Szakember Portál</h1>
                  <p className="text-[11px] lg:text-xs text-vvm-blue-700 font-bold mt-1.5 truncate max-w-[150px] lg:max-w-none">
                    {contractorProfile?.display_name || user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Link href="/contractor/profile" className="p-2 text-slate-400 hover:text-vvm-blue-600 hover:bg-vvm-blue-50 rounded-xl transition-all" title="Profil">
                  <Settings className="w-5 h-5" />
                </Link>
                <button onClick={() => logout()} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Kijelentkezés">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-3.5 lg:p-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                  <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-vvm-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">Egyenleg</p>
                  <p className="text-lg lg:text-xl font-black text-slate-900">{creditBalance.toLocaleString('hu-HU')} Ft</p>
                </div>
              </div>
              <Link href="/contractor/topup" className="px-4 py-2 lg:px-5 lg:py-2.5 bg-vvm-blue-600 text-white font-bold rounded-2xl text-[11px] lg:text-xs shadow-lg shadow-vvm-blue-100 hover:bg-vvm-blue-700 transition-all active:scale-95">
                Feltöltés
              </Link>
            </div>
          </div>

          {/* Jobs & Nav Section */}
          <div className="bg-white lg:bg-white/95 lg:backdrop-blur-xl lg:rounded-[2.5rem] lg:shadow-2xl lg:border lg:border-white/40 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Nav Tabs */}
            <div className="flex p-1.5 gap-1 bg-slate-100/50 rounded-full mx-4 mt-2 lg:mt-4 border border-slate-100/50 flex-shrink-0">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-3 rounded-full font-black text-[9px] lg:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'map' ? 'bg-vvm-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
              >
                <MapPin className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Elérhető</span>
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-3 rounded-full font-black text-[9px] lg:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'active' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
              >
                <Briefcase className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Aktív</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-3 rounded-full font-black text-[9px] lg:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'completed' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Kész</span>
              </button>
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`flex-1 py-3 rounded-full font-black text-[9px] lg:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'affiliate' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
              >
                <Gift className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Ajánló</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-bold">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 italic text-sm">
                  <RefreshCw className="w-8 h-8 animate-spin mb-4 text-vvm-blue-600 opacity-20" />
                  <p>Frissítés...</p>
                </div>
              ) : (
                <div className="pb-12 lg:pb-8">
                  {activeTab === 'map' && (
                    <div className="space-y-4">
                      {!selectedJob && openJobs.length === 0 ? (
                        <div className="py-12 text-center">
                          <MapPin className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                          <p className="text-slate-500 font-bold text-sm">Jelenleg nincs új munka.</p>
                        </div>
                      ) : (
                        openJobs.map((job: any) => (
                          <div key={job.id} onClick={() => handleJobCardClick(job)} className="cursor-pointer group">
                            <JobCard job={job} onUnlock={handleUnlock} />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'active' && (
                    <div className="space-y-4">
                      {activeJobs.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <Briefcase className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                          <p className="font-bold text-sm">Nincs aktív munkád.</p>
                        </div>
                      ) : (
                        activeJobs.map((job: any) => (
                          <div key={job.id} className="space-y-0">
                            {/* Standard Job Card */}
                            <div onClick={() => handleJobCardClick(job)} className="cursor-pointer group">
                              <JobCard
                                job={job}
                                assignment={job.assignment}
                                showActions={false}
                              />
                            </div>

                            {/* Congratulation Banner — only for accepted interests */}
                            {job.assignment?.status === 'accepted' && (
                              <div className="mx-1 -mt-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-b-2xl p-5 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>

                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                      <p className="font-black text-sm">Gratulálunk!</p>
                                      <p className="text-emerald-100 text-xs font-bold">Az ügyfél elfogadta az ajánlatod!</p>
                                    </div>
                                  </div>

                                  {/* Customer contact */}
                                  {job.customer && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-3">
                                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200 mb-1.5">Vedd fel a kapcsolatot:</p>
                                      <p className="font-black text-base">{job.customer.full_name}</p>
                                      {job.customer.phone && (
                                        <a href={`tel:${job.customer.phone}`} className="flex items-center gap-2 mt-2 bg-white text-emerald-700 font-black py-2.5 px-4 rounded-xl text-sm hover:bg-emerald-50 transition-all active:scale-95 shadow-sm w-full justify-center">
                                          📞 {job.customer.phone}
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {/* Navigation buttons */}
                                  {job.latitude && job.longitude && (
                                    <div className="flex gap-2">
                                      <a
                                        href={`https://waze.com/ul?ll=${job.latitude},${job.longitude}&navigate=yes`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-[#33ccff] hover:bg-[#28b8e8] text-white font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                                      >
                                        <Navigation className="w-4 h-4" />
                                        Waze
                                      </a>
                                      <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                                      >
                                        <MapPin className="w-4 h-4" />
                                        Google Maps
                                      </a>
                                    </div>
                                  )}

                                  {/* Complete job button */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleComplete(job.id); }}
                                    disabled={actionLoading === job.id}
                                    className="w-full mt-3 bg-white hover:bg-emerald-50 text-emerald-700 font-black py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border border-white/30 disabled:opacity-50"
                                  >
                                    {actionLoading === job.id ? (
                                      <><span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span> Feldolgozás...</>
                                    ) : (
                                      <>✅ Elvégeztem a munkát</>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Pending state info */}
                            {job.assignment?.status === 'pending' && (
                              <div className="mx-1 -mt-1 bg-sky-50 border border-sky-200 border-t-0 rounded-b-2xl p-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                                <p className="text-xs font-bold text-sky-700">Várakozás az ügyfél döntésére...</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <div className="space-y-4">
                      {completedJobs.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-bold text-sm">Nincs kész munkád.</div>
                      ) : (
                        completedJobs.map((job: any) => (
                          <div key={job.id} onClick={() => handleJobCardClick(job)} className="cursor-pointer group">
                            <JobCard job={job} assignment={job.assignment} showActions={false} />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'affiliate' && (
                    <div className="space-y-6 px-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Meghívottak</p>
                          <p className="text-2xl font-black text-slate-800">{affiliateStats.total_referrals}</p>
                        </div>
                        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                          <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-wider mb-1">Bónusz</p>
                          <p className="text-xl font-black text-emerald-600">+{affiliateStats.total_earned.toLocaleString()} Ft</p>
                        </div>
                      </div>

                      <div className="bg-vvm-blue-50/30 rounded-3xl p-6 border border-vvm-blue-100/50 text-center shadow-sm">
                        <Gift className="w-10 h-10 text-vvm-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900 mb-2">Hívj meg kollégákat!</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                          Minden elfogadott szakember után <strong className="text-emerald-600 font-black">+5.000 Ft</strong> kreditet kapsz!
                        </p>

                        {referralCode && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://vizvillanyfutes.hu/csatlakozz-partnerkent?ref=${referralCode}`);
                              setNotification({ type: 'success', message: 'Link másolva!' });
                            }}
                            className="w-full py-4 bg-white border-2 border-dashed border-vvm-blue-200 rounded-2xl flex items-center justify-center gap-3 text-vvm-blue-700 font-black text-xs hover:border-vvm-blue-600 transition-all active:scale-95 shadow-sm"
                          >
                            <Copy className="w-4 h-4" /> LINK MÁSOLÁSA
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div >
      </div >

      {/* Job Details Modal */}
      {
        isDetailModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setIsDetailModalOpen(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getTradeColor(selectedJob.trade)}`}>
                    {getTradeIcon(selectedJob.trade)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Munka Részletei</h2>
                    <p className="text-xs font-semibold text-slate-400">
                      {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString('hu-HU') : 'Ma'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="mb-8">
                  <h3 className="font-bold text-xl text-slate-900 mb-2">{selectedJob.title}</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedJob.description || 'Nincs leírás megadva.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <JobCard
                    job={selectedJob}
                    assignment={selectedJob.assignment}
                    onUnlock={handleUnlock}
                    onStart={handleStart}
                    onComplete={handleComplete}
                    showActions={true}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 z-10">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition-colors"
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default function ContractorDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['contractor']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
