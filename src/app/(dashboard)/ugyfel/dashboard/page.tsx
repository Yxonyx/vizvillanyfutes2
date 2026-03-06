'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { AlertCircle, Clock, MapPin, Search, CheckCircle, Shield, ArrowRight, User, Droplets, Zap, Flame, Briefcase, Trash2, Plus, ArrowLeft, X, Edit3, Loader2, Settings, FileText, Navigation, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';
import Map, { Marker, NavigationControl, GeolocateControl, Popup, MapRef } from 'react-map-gl/mapbox';
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

type JobInterest = {
    id: string;
    status: string;
    created_at: string;
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
    job_interests?: JobInterest[];
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
    const [interestActionLoading, setInterestActionLoading] = useState<string | null>(null);

    // Rating modal state
    const [ratingModal, setRatingModal] = useState<{ jobId: string; contractorName: string; contractorId: string } | null>(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingHover, setRatingHover] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState(false);

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
    const mapRef = useRef<MapRef>(null);

    // Track desktop vs mobile view for conditional rendering
    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize(); // Set initial value safely on client
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

            // On mobile, if coming from reports tab, switch to map view
            if (window.innerWidth < 1024 && mobileTab === 'reports') {
                setMobileTab('map');
                setSheetPosition('collapsed');
            }
        }
    }, [selectedJob, mobileTab]);



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

            // 1. Fetch standard jobs (including interests for accept/reject flow)
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select(`
        id, title, description, trade, status, created_at, latitude, longitude,
        addresses ( city, district, street ),
        job_assignments (
          status,
          contractor_profiles ( display_name, phone )
        ),
        job_interests (
          id, status, created_at, contractor_id,
          contractor_profiles ( display_name, phone )
        )
      `)
                .eq('created_by_user_id', user.id)
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            // 2. Fetch raw leads (waiting status)
            const { data: leadsData, error: leadsError } = await supabase
                .from('leads')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'waiting')
                .order('created_at', { ascending: false });

            if (leadsError) throw leadsError;

            let allJobs: Job[] = [];

            // Map jobs
            if (jobsData) {
                allJobs = [...allJobs, ...(jobsData as unknown as Job[])];
            }

            // Map leads to Job format
            if (leadsData) {
                const mappedLeads = leadsData.map((l: any): Job => ({
                    id: l.id,
                    title: l.title,
                    description: l.description || '',
                    trade: l.type === 'egyeb' ? 'viz' : (l.type || 'viz'),
                    status: l.status, // "waiting", which we'll treat as "new" conceptually
                    created_at: l.created_at,
                    latitude: l.lat,
                    longitude: l.lng,
                    addresses: {
                        city: 'Budapest', // Default or parse from address if needed
                        district: l.district ? l.district.replace('. kerület', '') : '',
                        street: l.address || ''
                    },
                    job_assignments: [] // Raw leads have no assignments yet
                }));
                allJobs = [...allJobs, ...mappedLeads];
            }

            // Sort all descending by date
            allJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setJobs(allJobs);
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
            // Try both token sources: Supabase session (AuthModal login) and localStorage (API login)
            const { data: { session: sbSession } } = await supabase.auth.getSession();
            const storedSession = getSession();
            const token = sbSession?.access_token || storedSession?.session?.access_token;
            if (!token) {
                alert('Nincs érvényes munkamenet. Kérjük jelentkezzen be újra.');
                setCancellingId(null);
                return;
            }
            const res = await fetch(`/api/customer/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                const jobObj = jobs.find(j => j.id === jobId);
                if (jobObj && jobObj.status === 'waiting') {
                    // Lead deleted — remove from list
                    setJobs(prev => prev.filter(j => j.id !== jobId));
                } else {
                    // Job cancelled — update status
                    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'cancelled_by_customer' } : j));
                }
                if (selectedJob?.id === jobId) setSelectedJob(null);
            } else {
                alert(data.error || 'Hiba történt a törlés során.');
            }
        } catch {
            alert('Hiba történt a törlés során.');
        } finally {
            setCancellingId(null);
        }
    };

    const [completingId, setCompletingId] = useState<string | null>(null);
    const handleCompleteJob = async (jobId: string) => {
        if (!confirm('Megerősíted, hogy a szakember elvégezte a munkát?')) return;
        setCompletingId(jobId);
        try {
            const { data: { session: sbSession } } = await supabase.auth.getSession();
            const storedSession = getSession();
            const token = sbSession?.access_token || storedSession?.session?.access_token;
            const res = await fetch(`/api/customer/jobs/${jobId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ action: 'complete' }),
            });
            const data = await res.json();
            if (data.success) {
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'completed' } : j));
                if (selectedJob?.id === jobId) {
                    setSelectedJob(prev => prev ? { ...prev, status: 'completed' } : null);
                }
                // Find the contractor to open rating modal
                const completedJob = jobs.find(j => j.id === jobId);
                if (completedJob) {
                    const acceptedAssignment = completedJob.job_assignments?.find(a => a.status === 'accepted');
                    const acceptedInterest = completedJob.job_interests?.find(i => i.status === 'accepted');
                    const contractor = acceptedAssignment?.contractor_profiles || acceptedInterest?.contractor_profiles;
                    if (contractor) {
                        setRatingModal({
                            jobId,
                            contractorName: contractor.display_name || 'Szakember',
                            contractorId: (acceptedInterest as any)?.id || 'unknown',
                        });
                        setRatingValue(0);
                        setRatingHover(0);
                        setRatingComment('');
                        setRatingSuccess(false);
                    }
                }
            } else {
                alert(data.error || 'Hiba történt.');
            }
        } catch {
            alert('Hiba történt.');
        } finally {
            setCompletingId(null);
        }
    };

    const handleSubmitRating = async () => {
        if (!ratingModal || ratingValue === 0) return;
        setRatingSubmitting(true);
        try {
            const { data: { session: sbSession } } = await supabase.auth.getSession();
            const storedSession = getSession();
            const token = sbSession?.access_token || storedSession?.session?.access_token;

            // Find contractor_id properly
            const completedJob = jobs.find(j => j.id === ratingModal.jobId);
            const acceptedInterest = completedJob?.job_interests?.find(i => i.status === 'accepted');
            const contractorId = (acceptedInterest as any)?.contractor_id || ratingModal.contractorId;

            const res = await fetch('/api/customer/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    job_id: ratingModal.jobId,
                    contractor_id: contractorId,
                    rating: ratingValue,
                    comment: ratingComment.trim() || undefined,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setRatingSuccess(true);
                setTimeout(() => {
                    setRatingModal(null);
                    setRatingSuccess(false);
                }, 2000);
            } else {
                alert(result.error || 'Hiba történt az értékelés küldésekor.');
            }
        } catch {
            alert('Hiba történt.');
        } finally {
            setRatingSubmitting(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedJob) return;
        setSavingEdit(true);
        try {
            let updateError = null;

            if (selectedJob.status === 'waiting') {
                // Update raw lead
                const { error } = await supabase
                    .from('leads')
                    .update({ title: editForm.title, description: editForm.description })
                    .eq('id', selectedJob.id);
                updateError = error;
            } else {
                // Update real job
                const { error } = await supabase
                    .from('jobs')
                    .update({ title: editForm.title, description: editForm.description })
                    .eq('id', selectedJob.id);
                updateError = error;
            }

            if (updateError) throw updateError;

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

    const activeJobs = jobs.filter(j => !['completed', 'cancelled', 'cancelled_by_customer'].includes(j.status));
    const pastJobs = jobs.filter(j => ['completed', 'cancelled', 'cancelled_by_customer'].includes(j.status));

    // Fit bounds to all jobs ONCE on initial load (not on every selection change)
    const hasInitiallyFitted = useRef(false);
    useEffect(() => {
        // Only run on initial load, skip if we already fitted or a job is selected
        if (hasInitiallyFitted.current || selectedJob) return;
        const validJobs = activeJobs.filter(j => j?.latitude && j?.longitude);
        if (validJobs.length === 0) return;

        const doCenter = () => {
            if (!mapRef.current) {
                setTimeout(doCenter, 500);
                return;
            }
            hasInitiallyFitted.current = true;
            if (validJobs.length === 1) {
                mapRef.current.flyTo({
                    center: [validJobs[0].longitude!, validJobs[0].latitude!],
                    zoom: 14,
                    duration: 1000
                });
            } else {
                let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                validJobs.forEach(j => {
                    const lat = Number(j.latitude);
                    const lng = Number(j.longitude);
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                    if (lng < minLng) minLng = lng;
                    if (lng > maxLng) maxLng = lng;
                });
                mapRef.current.fitBounds(
                    [[minLng, minLat], [maxLng, maxLat]],
                    { padding: 80, duration: 1000, maxZoom: 14 }
                );
            }
        };
        setTimeout(doCenter, 500);
    }, [activeJobs, selectedJob]);


    if (isLoading || !user || !isCustomer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleAcceptInterest = async (interestId: string) => {
        setInterestActionLoading(interestId);
        try {
            const session = getSession();
            const token = session?.session?.access_token;
            const res = await fetch('/api/customer/interests/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ interest_id: interestId }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Hiba történt');
            setSelectedJob(null);
            await fetchJobs();
        } catch (err) {
            console.error('Error accepting interest:', err);
            alert('Hiba történt az elfogadás során: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setInterestActionLoading(null);
        }
    };

    const handleRejectInterest = async (interestId: string) => {
        if (!confirm('Biztosan elutasítod ezt a szakembert?')) return;
        setInterestActionLoading(interestId);
        try {
            const session = getSession();
            const token = session?.session?.access_token;
            const res = await fetch('/api/customer/interests/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ interest_id: interestId }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Hiba történt');
            setSelectedJob(null);
            await fetchJobs();
        } catch (err) {
            console.error('Error rejecting interest:', err);
            alert('Hiba történt az elutasítás során: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setInterestActionLoading(null);
        }
    };

    const getStatusBadge = (status: string, assignments: JobAssignment[], interests?: JobInterest[]) => {
        // If we have an accepted assignment OR accepted interest → contractor assigned
        const acceptedAssignment = assignments?.find(a => a.status === 'accepted');
        const acceptedInterest = interests?.find(i => i.status === 'accepted');

        if (acceptedAssignment || acceptedInterest) {
            const contractorName = acceptedAssignment?.contractor_profiles?.display_name
                || acceptedInterest?.contractor_profiles?.display_name || '';
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    {contractorName ? `${contractorName} hozzárendelve` : 'Szakember kiválasztva'}
                </span>
            );
        }

        // Check for pending interests (contractor expressed interest)
        const pendingInterests = interests?.filter(i => i.status === 'pending') || [];
        if (pendingInterests.length > 0) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 animate-pulse">
                    <User className="w-4 h-4" />
                    {pendingInterests.length} szakember jelentkezett!
                </span>
            );
        }

        switch (status) {
            case 'new':
            case 'unassigned':
            case 'open':
            case 'waiting':
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-4 h-4" />
                        Szakember kijelölve
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
                ref={mapRef}
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
                onLoad={() => {
                    // Once map is loaded, fit bounds to show all jobs
                    const validJobs = jobs.filter(j => j.latitude && j.longitude);
                    if (validJobs.length === 0 || !mapRef.current) return;
                    if (validJobs.length === 1) {
                        mapRef.current.flyTo({
                            center: [validJobs[0].longitude!, validJobs[0].latitude!],
                            zoom: 14,
                            duration: 800
                        });
                    } else {
                        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                        validJobs.forEach(j => {
                            const lat = Number(j.latitude);
                            const lng = Number(j.longitude);
                            if (lat < minLat) minLat = lat;
                            if (lat > maxLat) maxLat = lat;
                            if (lng < minLng) minLng = lng;
                            if (lng > maxLng) maxLng = lng;
                        });
                        mapRef.current.fitBounds(
                            [[minLng, minLat], [maxLng, maxLat]],
                            { padding: 80, duration: 800, maxZoom: 14 }
                        );
                    }
                }}
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
                            mapRef.current?.flyTo({
                                center: [job.longitude!, window.innerWidth >= 1024 ? job.latitude! : job.latitude! - 0.08],
                                zoom: 10,
                                duration: 800
                            });
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
                        maxWidth="300px"
                        offset={20}
                    >
                        <div className="overflow-hidden rounded-xl">
                            {/* Colored header strip */}
                            <div className={`px-4 py-2.5 ${mapPopupJob.trade === 'viz' ? 'bg-gradient-to-r from-sky-500 to-sky-400' :
                                mapPopupJob.trade === 'villany' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                    mapPopupJob.trade === 'futes' ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                                        'bg-gradient-to-r from-blue-600 to-blue-500'
                                }`}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <div className="text-white scale-75">
                                            {getTradeIcon(mapPopupJob.trade)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-white leading-tight truncate">{mapPopupJob.title}</h3>
                                        <div className="flex items-center gap-1 text-[11px] text-white/80 mt-0.5">
                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{mapPopupJob.addresses?.city}, {mapPopupJob.addresses?.district}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content body */}
                            <div className="px-4 py-3 bg-white">
                                {/* Status badge */}
                                <div className="mb-2">
                                    {getStatusBadge(mapPopupJob.status, mapPopupJob.job_assignments, mapPopupJob.job_interests)}
                                </div>

                                {/* Description */}
                                {mapPopupJob.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed italic border-l-2 border-slate-200 pl-2.5">
                                        {mapPopupJob.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { openJobDetails(mapPopupJob); setMapPopupJob(null); }}
                                        className="flex-1 bg-vvm-yellow-400 hover:bg-vvm-yellow-500 text-vvm-blue-800 text-xs font-bold py-2 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-1.5"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Részletek
                                    </button>
                                    {['open', 'new', 'unassigned', 'waiting'].includes(mapPopupJob.status) && (
                                        <button
                                            onClick={() => { setIsEditing(true); openJobDetails(mapPopupJob); setMapPopupJob(null); }}
                                            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
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
                                        {getStatusBadge(job.status, job.job_assignments, job.job_interests)}
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

                                    {(() => {
                                        // Check both assignments and accepted interests
                                        const assignedContractor = contractor;
                                        const acceptedInterest = !assignedContractor && job.job_interests?.find(i => i.status === 'accepted');
                                        const displayContractor = assignedContractor || (acceptedInterest ? acceptedInterest.contractor_profiles : null);

                                        return displayContractor ? (
                                            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black flex-shrink-0 shadow-sm">
                                                        {displayContractor.display_name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate">{displayContractor.display_name}</p>
                                                        <p className="text-sm text-emerald-600 font-bold truncate">{displayContractor.phone}</p>
                                                    </div>
                                                </div>
                                                <a href={`tel:${displayContractor.phone}`} className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center shadow-sm">
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
                                        );
                                    })()}
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
                                            {getStatusBadge(job.status, job.job_assignments, job.job_interests)}
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
            {isDesktop && (
                <div className="flex flex-col h-full w-full">
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
                                                                {getStatusBadge(job.status, job.job_assignments, job.job_interests)}
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
            )}

            {/* ====== MOBILE LAYOUT (<lg) ====== */}
            {!isDesktop && (
                <div className="h-dvh w-full relative pb-safe">
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
            )}

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
                                {getStatusBadge(selectedJob.status, selectedJob.job_assignments, selectedJob.job_interests)}
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

                            {/* Job Interests / Pending Contractors */}
                            {!isEditing && selectedJob.job_interests && selectedJob.job_interests.filter(i => i.status === 'pending').length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        Jelentkezett szakemberek
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedJob.job_interests.filter(i => i.status === 'pending').map(interest => (
                                            <div key={interest.id} className="p-4 rounded-[1.5rem] border border-blue-200 bg-blue-50/50 ring-1 ring-blue-100 transition-all">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-blue-500 text-white shadow-md">
                                                        {interest.contractor_profiles?.display_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-black text-slate-900">{interest.contractor_profiles?.display_name || 'Szakember'}</p>
                                                        <p className="text-[11px] text-blue-600 font-black uppercase tracking-wider mt-1">
                                                            🔔 Jelentkezett a munkádra!
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAcceptInterest(interest.id)}
                                                        disabled={interestActionLoading === interest.id}
                                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
                                                    >
                                                        {interestActionLoading === interest.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                        Elfogadom
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectInterest(interest.id)}
                                                        disabled={interestActionLoading === interest.id}
                                                        className="flex-1 bg-white hover:bg-red-50 text-red-600 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-red-200 active:scale-95 disabled:opacity-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Elutasítom
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Job Assignments / Specialists */}
                            {!isEditing && (() => {
                                // Collect all assigned contractors from both assignments AND accepted interests
                                const assignedFromAssignments = (selectedJob.job_assignments || []).map((a, idx) => ({
                                    key: `assignment-${idx}`,
                                    name: a.contractor_profiles?.display_name || 'Szakember',
                                    phone: a.contractor_profiles?.phone || '',
                                    isAccepted: a.status === 'accepted',
                                    label: a.status === 'accepted' ? '✅ Elfogadva' : '⏳ Folyamatban',
                                }));
                                const assignedFromInterests = (selectedJob.job_interests || [])
                                    .filter(i => i.status === 'accepted')
                                    .map((i, idx) => ({
                                        key: `interest-${idx}`,
                                        name: i.contractor_profiles?.display_name || 'Szakember',
                                        phone: i.contractor_profiles?.phone || '',
                                        isAccepted: true,
                                        label: '✅ Elfogadva',
                                    }));
                                // Merge both, deduplicate by name
                                const allAssigned = [...assignedFromAssignments, ...assignedFromInterests];
                                const seen = new Set<string>();
                                const uniqueAssigned = allAssigned.filter(a => {
                                    if (seen.has(a.name)) return false;
                                    seen.add(a.name);
                                    return true;
                                });
                                const hasPendingInterests = (selectedJob.job_interests || []).some(i => i.status === 'pending');

                                return (
                                    <div className="mb-4">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Kapcsolódó szakemberek</h4>
                                        {uniqueAssigned.length > 0 ? (
                                            <div className="space-y-3">
                                                {uniqueAssigned.map(contractor => (
                                                    <div key={contractor.key} className={`p-4 rounded-[1.5rem] border flex items-center justify-between transition-all ${contractor.isAccepted ? 'bg-emerald-50 border-emerald-100 ring-1 ring-emerald-200/50' : 'bg-white border-slate-100 shadow-sm'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${contractor.isAccepted ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                                                                {contractor.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900">{contractor.name}</p>
                                                                {contractor.isAccepted && contractor.phone && (
                                                                    <p className="text-sm font-bold text-emerald-600 mt-0.5">{contractor.phone}</p>
                                                                )}
                                                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider mt-1">
                                                                    {contractor.label}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {contractor.isAccepted && contractor.phone && (
                                                            <a href={`tel:${contractor.phone}`} className="w-10 h-10 bg-white text-emerald-600 rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center hover:bg-emerald-50 transition-colors">
                                                                <Briefcase className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !hasPendingInterests ? (
                                            <div className="text-xs font-black text-amber-700 bg-amber-50/50 p-5 rounded-2xl flex items-center gap-4 border border-amber-100/50">
                                                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></div>
                                                {['assigned', 'in_progress', 'scheduled'].includes(selectedJob.status)
                                                    ? 'A szakember adatai hamarosan megjelennek.'
                                                    : 'Még nincs jelentkező szakember. Automatikusan értesítettük a környékbeli mestereket.'
                                                }
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer Commands — Status-based */}
                        {!isEditing && (() => {
                            const hasAcceptedContractor = selectedJob.job_assignments?.some(a => a.status === 'accepted') || selectedJob.job_interests?.some(i => i.status === 'accepted');
                            const isDeletable = ['waiting', 'open', 'new', 'unassigned'].includes(selectedJob.status) && !hasAcceptedContractor;
                            const isInProgress = ['assigned', 'in_progress', 'scheduled'].includes(selectedJob.status) || hasAcceptedContractor;
                            const isFinished = ['completed', 'cancelled_by_customer', 'cancelled'].includes(selectedJob.status);

                            if (isFinished) return null;

                            if (isInProgress) {
                                return (
                                    <div className="p-6 border-t border-emerald-100 bg-emerald-50/50 z-10">
                                        <div className="flex items-center gap-3 mb-4 px-1">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <p className="text-sm font-black text-emerald-700">Folyamatban lévő munka</p>
                                        </div>
                                        <button
                                            onClick={() => handleCompleteJob(selectedJob.id)}
                                            disabled={completingId === selectedJob.id}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200 disabled:opacity-50 active:scale-95"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            {completingId === selectedJob.id ? 'Feldolgozás...' : '✅ Munka befejezve'}
                                        </button>
                                    </div>
                                );
                            }

                            if (isDeletable) {
                                return (
                                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 z-10 backdrop-blur-sm">
                                        <button
                                            onClick={() => setIsEditing(true)}
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
                                );
                            }

                            return null;
                        })()}

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

            {/* Rating Modal */}
            {ratingModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header — site brand blue */}
                        <div className="bg-gradient-to-r from-vvm-blue-600 to-vvm-blue-500 p-5 text-center relative">
                            <button onClick={() => setRatingModal(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                            <Star className="w-8 h-8 text-white mx-auto mb-1 fill-white/30" />
                            <h2 className="text-lg font-black text-white">Értékeld a szakembert</h2>
                            <p className="text-white/70 text-sm mt-0.5">{ratingModal.contractorName}</p>
                        </div>

                        {ratingSuccess ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">Köszönjük az értékelést!</h3>
                                <p className="text-sm text-slate-500">Az értékelésed segíti a többi ügyfelet.</p>
                            </div>
                        ) : (
                            <div className="p-5">
                                {/* Stars */}
                                <div className="flex justify-center gap-3 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRatingValue(star)}
                                            onMouseEnter={() => setRatingHover(star)}
                                            onMouseLeave={() => setRatingHover(0)}
                                            className="transition-all duration-200 hover:scale-110"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors duration-200 ${star <= (ratingHover || ratingValue)
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-slate-200 fill-slate-100'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Rating label — text only, no emojis */}
                                <div className="text-center mb-4">
                                    <span className="text-sm font-bold text-slate-500">
                                        {ratingValue === 0 && 'Válassz csillagot'}
                                        {ratingValue === 1 && 'Gyenge'}
                                        {ratingValue === 2 && 'Elfogadható'}
                                        {ratingValue === 3 && 'Jó'}
                                        {ratingValue === 4 && 'Nagyon jó'}
                                        {ratingValue === 5 && 'Kiváló!'}
                                    </span>
                                </div>

                                {/* Comment */}
                                <textarea
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-vvm-blue-400/50 focus:border-vvm-blue-400 transition-all"
                                    placeholder="Írd le a tapasztalataidat... (opcionális)"
                                    rows={3}
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                />

                                {/* Submit */}
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={ratingValue === 0 || ratingSubmitting}
                                    className={`w-full mt-3 py-3.5 rounded-xl font-black text-white text-sm transition-all flex items-center justify-center gap-2 ${ratingValue === 0
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : ratingSubmitting
                                            ? 'bg-vvm-blue-300 cursor-wait'
                                            : 'bg-vvm-blue-600 hover:bg-vvm-blue-700 active:scale-[0.98] shadow-md'
                                        }`}
                                >
                                    {ratingSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Küldés...
                                        </>
                                    ) : (
                                        <>
                                            <Star className="w-4 h-4 fill-white" />
                                            {`Értékelés küldése (${ratingValue}/5)`}
                                        </>
                                    )}
                                </button>

                                {/* Skip */}
                                <button
                                    onClick={() => setRatingModal(null)}
                                    className="w-full mt-2 py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium"
                                >
                                    Most nem értékelek
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
