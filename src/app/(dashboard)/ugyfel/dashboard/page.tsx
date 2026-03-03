'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { AlertCircle, Clock, MapPin, Search, CheckCircle, Shield, ArrowRight, User, Droplets, Zap, Flame, Briefcase, Trash2, Plus, ArrowLeft, X, Edit3, Loader2, Settings, FileText, Navigation } from 'lucide-react';
import Link from 'next/link';
import Map, { Marker, NavigationControl, GeolocateControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import AddLeadModal from '@/components/AddLeadModal';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEFAULT_VIEWPORT = {
    latitude: 47.4979,
    longitude: 19.0402,
    zoom: 11
};

// Simple types for the dashboard
type JobAssignment = {
    status: string;
    contractor_profiles: {
        display_name: string;
        phone: string;
    };
};

type Address = {
    city: string;
    district: string;
    street: string;
};

type Job = {
    id: string;
    title: string;
    description: string;
    trade: string;
    status: string;
    created_at: string;
    latitude: number | null;
    longitude: number | null;
    addresses: Address;
    job_assignments: JobAssignment[];
};

// Mobile bottom sheet snap positions (as % of viewport height from top)
type SheetPosition = 'collapsed' | 'half' | 'full';
const SHEET_POSITIONS: Record<SheetPosition, number> = {
    collapsed: 70, // 70% from top = only ~30vh visible
    half: 38,      // 38% from top = ~62vh visible
    full: 5,       // 5% from top = ~95vh visible
};

export default function CustomerDashboard() {
    const { user, isCustomer, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [savingEdit, setSavingEdit] = useState(false);
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

    // Mobile bottom sheet state
    const [sheetPosition, setSheetPosition] = useState<SheetPosition>('half');
    const [sheetTranslateY, setSheetTranslateY] = useState<number | null>(null);
    const [mobileTab, setMobileTab] = useState<'map' | 'reports' | 'account'>('reports');
    const [desktopTab, setDesktopTab] = useState<'map' | 'reports' | 'account'>('reports');
    const [mapPopupJob, setMapPopupJob] = useState<Job | null>(null);
    const touchStartY = useRef(0);
    const touchStartSheetTop = useRef(0);
    const isDragging = useRef(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Touch handlers for mobile bottom sheet
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Only initiate drag from the grab handle area (first 48px)
        const touch = e.touches[0];
        touchStartY.current = touch.clientY;
        touchStartSheetTop.current = SHEET_POSITIONS[sheetPosition];
        isDragging.current = false;
    }, [sheetPosition]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const deltaY = touch.clientY - touchStartY.current;
        const deltaVh = (deltaY / window.innerHeight) * 100;

        // Only start dragging after 8px threshold
        if (!isDragging.current && Math.abs(deltaY) < 8) return;
        isDragging.current = true;

        const newTop = Math.max(3, Math.min(75, touchStartSheetTop.current + deltaVh));
        setSheetTranslateY(newTop);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging.current) {
            setSheetTranslateY(null);
            return;
        }
        isDragging.current = false;

        if (sheetTranslateY === null) return;

        // Snap to nearest position
        const positions = Object.entries(SHEET_POSITIONS) as [SheetPosition, number][];
        let closest: SheetPosition = 'half';
        let minDist = Infinity;
        for (const [pos, val] of positions) {
            const dist = Math.abs(sheetTranslateY - val);
            if (dist < minDist) {
                minDist = dist;
                closest = pos;
            }
        }
        setSheetPosition(closest);
        setSheetTranslateY(null);
    }, [sheetTranslateY]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (!isLoading && !isCustomer) {
            router.push('/');
        }
    }, [user, isCustomer, isLoading, router]);

    // Handle initial action from URL
    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            setIsAddLeadModalOpen(true);
            // Clear the param to avoid re-opening on refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user && isCustomer) {
            fetchJobs();
        }
    }, [user, isCustomer]);

    async function fetchJobs() {
        if (!user) return;

        try {
            setLoadingJobs(true);
            const { data, error } = await supabase
                .from('jobs')
                .select(`
        id, title, description, trade, status, created_at, latitude, longitude,
        addresses ( city, district, street ),
        job_assignments (
          status,
          contractor_profiles ( display_name, phone )
        )
      `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // The cast is needed because the supabase nested select typings can be complex
            setJobs(data as unknown as Job[]);
        } catch (err) {
            console.error('Error fetching customer jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    }

    const handleCancelJob = async (jobId: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a bejelentést?')) return;
        setCancellingId(jobId);
        try {
            const res = await fetch(`/api/customer/jobs/${jobId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            });
            const data = await res.json();
            if (data.success) {
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'cancelled_by_customer' } : j));
                if (selectedJob?.id === jobId) {
                    setSelectedJob(prev => prev ? { ...prev, status: 'cancelled_by_customer' } : null);
                }
            } else {
                alert(data.error || 'Hiba történt a törlés során.');
            }
        } catch {
            alert('Hiba történt a törlés során.');
        } finally {
            setCancellingId(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedJob) return;
        setSavingEdit(true);
        try {
            const { error } = await supabase
                .from('jobs')
                .update({ title: editForm.title, description: editForm.description })
                .eq('id', selectedJob.id);

            if (error) throw error;

            // Update local state
            setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, title: editForm.title, description: editForm.description } : j));
            setSelectedJob(prev => prev ? { ...prev, title: editForm.title, description: editForm.description } : null);
            setIsEditing(false);
        } catch (err: any) {
            alert('Hiba történt a mentés során: ' + err.message);
        } finally {
            setSavingEdit(false);
        }
    };

    const openJobDetails = (job: Job) => {
        setSelectedJob(job);
        setIsEditing(false);
        setEditForm({ title: job.title, description: job.description });
    };

    if (isLoading || !user || !isCustomer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const activeJobs = jobs.filter(j => !['completed', 'cancelled', 'cancelled_by_customer'].includes(j.status));
    const pastJobs = jobs.filter(j => ['completed', 'cancelled', 'cancelled_by_customer'].includes(j.status));

    const getStatusBadge = (status: string, assignments: JobAssignment[]) => {
        // If we have an accepted assignment, the pro is on their way or assigned
        const acceptedAssignment = assignments?.find(a => a.status === 'accepted');

        if (acceptedAssignment) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    Szakember úton
                </span>
            );
        }

        switch (status) {
            case 'new':
            case 'unassigned':
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 animate-pulse">
                        <Search className="w-4 h-4" />
                        Szakember keresése...
                    </span>
                );
            case 'unlocked':
            case 'assigned':
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Clock className="w-4 h-4" />
                        Egyeztetés alatt
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Befejezve
                    </span>
                );
            case 'cancelled':
            case 'cancelled_by_customer':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Törölve
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Folyamatban
                    </span>
                );
        }
    };

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

    // Shared map rendering function
    const renderMap = () => (
        MAPBOX_TOKEN ? (
            <Map
                initialViewState={{
                    ...DEFAULT_VIEWPORT,
                    latitude: activeJobs.find(j => j.latitude)?.latitude || DEFAULT_VIEWPORT.latitude,
                    longitude: activeJobs.find(j => j.longitude)?.longitude || DEFAULT_VIEWPORT.longitude,
                    zoom: 12
                }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                onClick={() => setMapPopupJob(null)}
            >
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <NavigationControl showCompass={false} />
                    <GeolocateControl />
                </div>

                {activeJobs.filter(j => j.latitude && j.longitude).map(job => (
                    <Marker
                        key={'map-job-' + job.id}
                        latitude={job.latitude!}
                        longitude={job.longitude!}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setMapPopupJob(job);
                        }}
                    >
                        <div className="relative group cursor-pointer hover:scale-110 transition-transform z-10 hover:z-20">
                            <div className={`absolute -inset-2 rounded-full animate-ping opacity-20 ${getTradeColor(job.trade)}`}></div>
                            <div className={`relative w-10 h-10 lg:w-12 lg:h-12 rounded-full ${getTradeColor(job.trade)} shadow-xl flex items-center justify-center border-4 border-white`}>
                                <div className="scale-75 lg:scale-100 font-white text-white drop-shadow-md">
                                    {getTradeIcon(job.trade)}
                                </div>
                            </div>
                        </div>
                    </Marker>
                ))}

                {/* Map Popup Card */}
                {mapPopupJob && mapPopupJob.latitude && mapPopupJob.longitude && (
                    <Popup
                        latitude={mapPopupJob.latitude}
                        longitude={mapPopupJob.longitude}
                        anchor="bottom"
                        onClose={() => setMapPopupJob(null)}
                        closeOnClick={false}
                        className="map-popup-card"
                        maxWidth="320px"
                        offset={20}
                    >
                        <div className="p-1">
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white ${getTradeColor(mapPopupJob.trade)}`}>
                                    <div className="text-white brightness-200 scale-90">
                                        {getTradeIcon(mapPopupJob.trade)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{mapPopupJob.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{mapPopupJob.addresses?.city}, {mapPopupJob.addresses?.district}. ker</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                {getStatusBadge(mapPopupJob.status, mapPopupJob.job_assignments)}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{mapPopupJob.description}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { openJobDetails(mapPopupJob); setMapPopupJob(null); }}
                                    className="flex-1 bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                                >
                                    Részletek
                                </button>
                                {['open', 'new', 'unassigned'].includes(mapPopupJob.status) && (
                                    <button
                                        onClick={() => { setIsEditing(true); openJobDetails(mapPopupJob); setMapPopupJob(null); }}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
                <MapPin className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium text-lg">Térkép nézet nem elérhető</p>
            </div>
        )
    );

    // Shared job list rendering
    const renderJobList = () => (
        loadingJobs ? (
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-12 text-center">
                <div className="w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 mt-4 font-medium">Bejelentések betöltése...</p>
            </div>
        ) : jobs.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Még nincsenek bejelentései</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    Kattintson az új probléma bejelentése gombra a kezdéshez.
                </p>
            </div>
        ) : (
            <div className="space-y-8">
                {/* Active Jobs */}
                {activeJobs.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Aktív ügyek
                        </h2>
                        {activeJobs.map(job => {
                            const contractor = job.job_assignments?.find(a => a.status === 'accepted')?.contractor_profiles;

                            return (
                                <div
                                    key={job.id}
                                    onClick={() => openJobDetails(job)}
                                    className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all border border-slate-100 relative group overflow-hidden cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-110 transition-transform pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        {getStatusBadge(job.status, job.job_assignments)}
                                        <span className="text-xs text-slate-400 font-black">
                                            {new Date(job.created_at).toLocaleDateString('hu-HU')}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 items-start relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-lg ${getTradeColor(job.trade)} group-hover:rotate-6 transition-transform`}>
                                            <div className="text-white brightness-200">
                                                {getTradeIcon(job.trade)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-vvm-blue-600 transition-colors truncate">{job.title}</h3>
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 font-medium">
                                                <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                                <span className="truncate">{job.addresses?.city}, {job.addresses?.district}. ker</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-[15px] line-clamp-2 mt-4 relative z-10 font-medium leading-relaxed">
                                        {job.description}
                                    </p>

                                    {contractor ? (
                                        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black flex-shrink-0 shadow-sm">
                                                    {contractor.display_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate">{contractor.display_name}</p>
                                                    <p className="text-sm text-emerald-600 font-bold truncate">{contractor.phone}</p>
                                                </div>
                                            </div>
                                            <a href={`tel:${contractor.phone}`} className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center shadow-sm">
                                                <AlertCircle className="w-5 h-5" />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3 text-amber-700 bg-amber-50/50 p-3.5 rounded-2xl relative z-10 border border-amber-100/50">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></div>
                                            <p className="text-[11px] font-black uppercase tracking-tight">
                                                Szakemberek értesítve. Kis türelmet...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Past Jobs */}
                {pastJobs.length > 0 && (
                    <div className="space-y-3 mt-8">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                            Korábbi ügyek
                        </h2>
                        {pastJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => openJobDetails(job)}
                                className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-4 cursor-pointer active:scale-95"
                            >
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white ${getTradeColor(job.trade)} opacity-80`}>
                                    <div className="scale-75 brightness-200">
                                        {getTradeIcon(job.trade)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-slate-800 text-sm truncate">{job.title}</h3>
                                        <span className="text-[10px] text-slate-400 font-black ml-2 flex-shrink-0">
                                            {new Date(job.created_at).toLocaleDateString('hu-HU')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                                            <MapPin className="w-3 h-3 flex-shrink-0 text-slate-300" />
                                            <span className="truncate">{job.addresses?.street}</span>
                                        </div>
                                        <div className="scale-75 origin-right brightness-90">
                                            {getStatusBadge(job.status, job.job_assignments)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    );

    // Calculate mobile sheet top position
    const mobileSheetTop = sheetTranslateY !== null ? `${sheetTranslateY}vh` : `${SHEET_POSITIONS[sheetPosition]}vh`;
    const isSheetExpanded = sheetPosition === 'full';

    return (
        <div className="relative h-full w-full overflow-hidden bg-white lg:bg-slate-50">

            {/* ====== DESKTOP LAYOUT (lg+) ====== */}
            <div className="hidden lg:flex flex-col h-full w-full">
                <div className="flex flex-1 min-h-0">
                    {/* Left Sidebar */}
                    <div className="w-[340px] xl:w-[380px] flex-shrink-0 h-full flex flex-col bg-white border-r border-slate-100 shadow-sm z-10">
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-4 pb-8">
                            {/* Profile Header */}
                            <div className="px-5 pb-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h1 className="text-base font-black text-slate-900">Ügyfél Fiók</h1>
                                        <div className="flex items-center gap-1 text-vvm-blue-600 text-xs font-bold">
                                            <Shield className="w-3 h-3" />
                                            <span>AKTÍV</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            <nav className="py-2">
                                <button
                                    onClick={() => setDesktopTab('map')}
                                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${desktopTab === 'map'
                                        ? 'text-vvm-blue-600 bg-vvm-blue-600/5'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Navigation className="w-4 h-4 flex-shrink-0" />
                                    <span>Élő Térkép</span>
                                </button>
                                <button
                                    onClick={() => setDesktopTab('reports')}
                                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${desktopTab === 'reports'
                                        ? 'text-vvm-blue-600 bg-vvm-blue-600/5 border-l-2 border-vvm-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                    <span>Saját bejelentéseim</span>
                                    <ArrowRight className="w-4 h-4 ml-auto text-slate-300" />
                                </button>
                                <button
                                    onClick={() => setDesktopTab('account')}
                                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${desktopTab === 'account'
                                        ? 'text-vvm-blue-600 bg-vvm-blue-600/5 border-l-2 border-vvm-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Settings className="w-4 h-4 flex-shrink-0" />
                                    <span>Saját fiókom</span>
                                    <ArrowRight className="w-4 h-4 ml-auto text-slate-300" />
                                </button>
                            </nav>

                            {/* Section Content */}
                            {desktopTab === 'reports' && (
                                <div className="px-4 py-4 border-t border-slate-100">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 px-1">
                                        Saját bejelentéseim ({activeJobs.length})
                                    </h2>

                                    {/* CTA */}
                                    <button
                                        onClick={() => setIsAddLeadModalOpen(true)}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 active:scale-95 mb-4 text-sm"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Új probléma bejelentése</span>
                                    </button>

                                    {/* Job cards - compact */}
                                    {loadingJobs ? (
                                        <div className="p-8 text-center">
                                            <div className="w-6 h-6 border-3 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        </div>
                                    ) : jobs.length === 0 ? (
                                        <div className="p-6 text-center text-slate-400 text-sm">
                                            Még nincsenek bejelentéseid.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {activeJobs.map(job => (
                                                <div
                                                    key={job.id}
                                                    onClick={() => openJobDetails(job)}
                                                    className="bg-slate-50 hover:bg-slate-100 rounded-xl p-3 cursor-pointer transition-colors active:scale-[0.98] border border-slate-100"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${getTradeColor(job.trade)}`}>
                                                            <div className="text-white brightness-200 scale-75">
                                                                {getTradeIcon(job.trade)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-[13px] text-slate-900 truncate">{job.title}</h3>
                                                            <p className="text-[11px] text-slate-500 truncate">{job.addresses?.city}, {job.addresses?.district}. ker</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="scale-[0.85] origin-left">
                                                            {getStatusBadge(job.status, job.job_assignments)}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-semibold">
                                                            {new Date(job.created_at).toLocaleDateString('hu-HU')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Past jobs in sidebar */}
                                            {pastJobs.length > 0 && (
                                                <>
                                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-4 mb-2 px-1">
                                                        Korábbi ({pastJobs.length})
                                                    </h3>
                                                    {pastJobs.map(job => (
                                                        <div
                                                            key={job.id}
                                                            onClick={() => openJobDetails(job)}
                                                            className="bg-slate-50/50 hover:bg-slate-100 rounded-xl p-3 cursor-pointer transition-colors active:scale-[0.98] opacity-50 hover:opacity-100 border border-transparent hover:border-slate-100"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${getTradeColor(job.trade)} opacity-70`}>
                                                                    <div className="brightness-200 scale-75">
                                                                        {getTradeIcon(job.trade)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-[13px] text-slate-700 truncate">{job.title}</h3>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {desktopTab === 'account' && (
                                <div className="px-4 py-4 border-t border-slate-100">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 px-1">
                                        Fiók kezelése
                                    </h2>
                                    <Link
                                        href="/fiok"
                                        className="bg-slate-50 hover:bg-slate-100 rounded-xl p-3 flex items-center justify-between transition-colors border border-slate-100"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                                                <Settings className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">Fiók beállítások</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Map Area */}
                    <div className="flex-1 h-full relative">
                        {/* Top bar overlay shadow */}
                        <div className="absolute top-0 left-0 right-0 z-10 h-12 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                        {/* Floating Navigation Pill */}
                        <div className="absolute top-4 left-4 z-20">
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
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-slate-600 font-bold text-sm">Ügyfél Portál</span>
                                </div>
                            </div>
                        </div>

                        {renderMap()}
                    </div>
                </div>
            </div>

            {/* ====== MOBILE LAYOUT (<lg) ====== */}
            <div className="lg:hidden h-dvh w-full relative pb-safe">
                {/* Full-screen Map Background */}
                <div className="absolute inset-0 z-0">
                    {renderMap()}
                </div>

                {/* Back button overlay */}
                <div className="absolute top-4 left-4 z-10">
                    <Link href="/" className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>

                {/* Draggable Bottom Sheet */}
                <div
                    ref={sheetRef}
                    className="absolute left-0 right-0 bottom-0 z-20 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-100 flex flex-col"
                    style={{
                        top: mobileSheetTop,
                        transition: sheetTranslateY !== null ? 'none' : 'top 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                >
                    {/* Grab Handle */}
                    <div
                        className="flex-shrink-0 py-3 cursor-grab active:cursor-grabbing touch-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto"></div>
                    </div>

                    {/* Compact Header + Tabs */}
                    <div className="flex-shrink-0 px-4 pb-3">
                        {/* Compact profile row */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-base font-black text-slate-900 leading-tight">Ügyfél Fiók</h1>
                                <div className="flex items-center gap-1 text-vvm-blue-600 text-xs font-bold">
                                    <Shield className="w-3 h-3" />
                                    <span>AKTÍV</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                            <button
                                onClick={() => setMobileTab('map')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${mobileTab === 'map'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Élő Térkép</span>
                            </button>
                            <button
                                onClick={() => setMobileTab('reports')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${mobileTab === 'reports'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Bejelentéseim</span>
                            </button>
                            <button
                                onClick={() => setMobileTab('account')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${mobileTab === 'account'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Fiókom</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div
                        ref={contentRef}
                        className={`flex-1 min-h-0 px-4 pb-20 custom-scrollbar ${isSheetExpanded ? 'overflow-y-auto' : 'overflow-y-auto'
                            }`}
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {mobileTab === 'map' && (
                            <div className="space-y-4 pt-2">
                                <p className="text-sm text-slate-500 font-medium text-center">
                                    Húzd le ezt a panelt a térkép megtekintéséhez
                                </p>
                                <button
                                    onClick={() => setSheetPosition('collapsed')}
                                    className="w-full bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Térkép megnyitása
                                </button>
                            </div>
                        )}

                        {mobileTab === 'reports' && (
                            <div className="space-y-4 pt-2">
                                {/* CTA */}
                                <button
                                    onClick={() => setIsAddLeadModalOpen(true)}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="text-base">Új probléma bejelentése</span>
                                </button>

                                {renderJobList()}
                            </div>
                        )}

                        {mobileTab === 'account' && (
                            <div className="space-y-4 pt-2">
                                <Link
                                    href="/fiok"
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Fiók beállítások</p>
                                            <p className="text-xs text-slate-500">Email, jelszó, értesítések</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => setSelectedJob(null)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getTradeColor(selectedJob.trade)} shadow-lg`}>
                                    <div className="text-white brightness-200">
                                        {getTradeIcon(selectedJob.trade)}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Bejelentés Részletei</h2>
                                    <p className="text-xs font-semibold text-slate-400">
                                        {new Date(selectedJob.created_at).toLocaleDateString('hu-HU')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-6">
                                {getStatusBadge(selectedJob.status, selectedJob.job_assignments)}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase tracking-wider">Megnevezés</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all font-bold text-sm bg-slate-50"
                                            placeholder="Pl: Csöpögő csap javítása"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-slate-700 mb-1.5 uppercase tracking-wider">Részletes leírás</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-vvm-blue-500 focus:ring-2 focus:ring-vvm-blue-500/20 outline-none transition-all resize-none text-sm font-medium bg-slate-50 leading-relaxed"
                                            placeholder="Kérjük írja le pontosan a hibát..."
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 text-sm font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                                        >
                                            Mégse
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={savingEdit}
                                            className="px-8 py-3 text-sm font-black text-white bg-vvm-blue-600 hover:bg-vvm-blue-700 rounded-xl shadow-lg shadow-vvm-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Mentés
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8">
                                    <h3 className="font-black text-2xl text-slate-900 mb-2 leading-tight">{selectedJob.title}</h3>
                                    <p className="text-slate-600 text-[15px] leading-relaxed mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium">
                                        {selectedJob.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 font-bold bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span>{selectedJob.addresses?.city}, {selectedJob.addresses?.district}. kerület, {selectedJob.addresses?.street}</span>
                                    </div>
                                </div>
                            )}

                            {/* Job Assignments / Specialists */}
                            {!isEditing && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Kapcsolódó szakemberek</h4>
                                    {selectedJob.job_assignments?.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedJob.job_assignments.map((assignment, idx) => (
                                                <div key={idx} className={`p-4 rounded-[1.5rem] border flex items-center justify-between transition-all ${assignment.status === 'accepted' ? 'bg-emerald-50 border-emerald-100 ring-1 ring-emerald-200/50' : 'bg-white border-slate-100 shadow-sm'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${assignment.status === 'accepted' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {assignment.contractor_profiles?.display_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900">{assignment.contractor_profiles?.display_name}</p>
                                                            {assignment.status === 'accepted' && (
                                                                <p className="text-sm font-bold text-emerald-600 mt-0.5">{assignment.contractor_profiles?.phone}</p>
                                                            )}
                                                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider mt-1">
                                                                {assignment.status === 'accepted' ? '✅ Elfogadta' : '⏳ Érdeklődik'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {assignment.status === 'accepted' && (
                                                        <a href={`tel:${assignment.contractor_profiles?.phone}`} className="w-10 h-10 bg-white text-emerald-600 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center hover:bg-emerald-50 transition-colors">
                                                            <Briefcase className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs font-black text-amber-700 bg-amber-50/50 p-5 rounded-2xl flex items-center gap-4 border border-amber-100/50">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></div>
                                            Még nincs szakember hozzárendelve. Automatikusan értesítettük a környékbeli mestereket.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Commands */}
                        {!isEditing && (['open', 'new', 'unassigned'].includes(selectedJob.status)) && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 z-10 backdrop-blur-sm">
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                    }}
                                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-black py-4 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 shadow-sm active:scale-95"
                                >
                                    <Edit3 className="w-4 h-4" /> Módosítás
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleCancelJob(selectedJob.id);
                                        setSelectedJob(null);
                                    }}
                                    disabled={cancellingId === selectedJob.id}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-black py-4 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-red-200 disabled:opacity-50 active:scale-95 shadow-sm shadow-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {cancellingId === selectedJob.id ? 'Törlés...' : 'Bejelentés törlése'}
                                </button>
                            </div>
                        )}

                        <div className="p-4 lg:hidden bg-white border-t border-slate-50">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="w-full py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Bezárás
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            {isAddLeadModalOpen && user && (
                <AddLeadModal
                    lat={DEFAULT_VIEWPORT.latitude}
                    lng={DEFAULT_VIEWPORT.longitude}
                    userId={user.id}
                    onClose={() => setIsAddLeadModalOpen(false)}
                    onSuccess={() => {
                        setIsAddLeadModalOpen(false);
                        fetchJobs(); // Refresh jobs list
                    }}
                />
            )}
        </div>
    );
}
