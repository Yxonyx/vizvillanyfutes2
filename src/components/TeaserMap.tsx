'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Droplets, Zap, Flame, Wrench, Clock, Search, Shield, ArrowRight, Maximize2, Plus, LogOut, Trash2, Award, AlertTriangle, FileCheck, Sparkles, LogIn, MapPin } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import AddLeadModal from './AddLeadModal';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEFAULT_VIEWPORT = {
    latitude: 47.4979,
    longitude: 19.0402,
    zoom: 11.5
};

// Interface for database rows
interface Lead {
    id: string;
    user_id: string;
    lat: number;
    lng: number;
    type: string;
    title: string;
    description: string;
    district: string;
    status: string;
    created_at: string;
    has_pending?: boolean;
    has_accepted?: boolean;
}

// Fake active leads for unauthenticated users, carefully spread out across Budapest to prevent overlapping
const mockLeads: any[] = [
    { id: 'm1', user_id: 'fake', lat: 47.510, lng: 19.035, type: 'viz', title: 'Csőtörés a fürdőben', status: 'waiting', description: 'Ömlik a víz a mosdó alól, elzártam a főcsapot de sürgős lenne!', district: 'II. kerület' },
    { id: 'm2', user_id: 'fake', lat: 47.485, lng: 19.060, type: 'villany', title: 'VBO Érintésvédelem', status: 'waiting', description: 'Villamos biztonsági felülvizsgálat lakásfelújítás után (ÉVÉ)', district: 'IX. kerület' },
    { id: 'm3', user_id: 'fake', lat: 47.505, lng: 19.065, type: 'futes', title: 'Radiátor csere', status: 'waiting', description: 'A gyerekszobában vizesedik a radiátor szelepe, cserélni kéne.', district: 'VII. kerület' },
    { id: 'm4', user_id: 'fake', lat: 47.475, lng: 19.040, type: 'viz', title: 'Duguláselhárítás', status: 'waiting', description: 'Eldugult a WC, már mindent próbáltunk, de nem folyik le.', district: 'XI. kerület' },
    { id: 'm5', user_id: 'fake', lat: 47.520, lng: 19.055, type: 'villany', title: 'Szabványosítás EON', status: 'waiting', description: 'Mérőhely szabványosítás és villamos biztonságtechnikai felülvizsgálat', district: 'XIII. kerület' },
    { id: 'm6', user_id: 'fake', lat: 47.495, lng: 19.020, type: 'viz', title: 'Csöpögő csap', status: 'waiting', description: 'Folyamatosan csöpög a konyhai csaptelep, kérik a cseréjét.', district: 'I. kerület' },
    { id: 'm7', user_id: 'fake', lat: 47.490, lng: 19.080, type: 'futes', title: 'Kazán hiba (F28)', status: 'waiting', description: 'A gázkazán kiállt F28-as hibára és nincs melegvíz.', district: 'VIII. kerület' },
    { id: 'm8', user_id: 'fake', lat: 47.530, lng: 19.030, type: 'villany', title: 'EPH Kiépítés', status: 'waiting', description: 'EPH hálózat kiépítése és villamos biztonsági felülvizsgálat jegyzőkönyvvel', district: 'III. kerület' },
    { id: 'm9', user_id: 'fake', lat: 47.460, lng: 19.025, type: 'futes', title: 'Padlófűtés szivárog', status: 'waiting', description: 'Vizesedik a padló a fürdőszoba előtt, nyomásesés a rendszerben.', district: 'XI. kerület' },
    { id: 'm10', user_id: 'fake', lat: 47.480, lng: 19.010, type: 'villany', title: 'Hálózatbővítés', status: 'waiting', description: 'Hálózatbővítéshez szükséges villamos biztonsági felülvizsgálat (EON/MVM)', district: 'XI. kerület' },
    { id: 'm11', user_id: 'fake', lat: 47.515, lng: 19.085, type: 'viz', title: 'Bojler nem melegít', status: 'waiting', description: 'A villanybojler be van kapcsolva, de jéghideg a víz tegnap óta.', district: 'XIV. kerület' },
    { id: 'm12', user_id: 'fake', lat: 47.500, lng: 19.005, type: 'futes', title: 'Termosztát csere', status: 'waiting', description: 'Okostermosztát beszerelése és beállítása a meglévő kazánhoz.', district: 'XII. kerület' },
    { id: 'm13', user_id: 'fake', lat: 47.465, lng: 19.065, type: 'villany', title: 'Sütő bekötés', status: 'waiting', description: 'Új kerámialapos sütőt vettünk, szakember kell a szakszerű bekötéshez.', district: 'IX. kerület' },
    { id: 'm14', user_id: 'fake', lat: 47.540, lng: 19.065, type: 'viz', title: 'Ázott fal', status: 'waiting', description: 'A szomszéd felől nedvesedik a fal, sürgős bejárás szükséges.', district: 'XIII. kerület' },
    { id: 'm15', user_id: 'fake', lat: 47.498, lng: 19.050, type: 'villany', title: 'FI relé teszt', status: 'waiting', description: 'Érintésvédelmi felülvizsgálat és FI relé (ÁVK) tesztelése irodában', district: 'VI. kerület' },
];

export default function TeaserMap() {
    const [mounted, setMounted] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Auth from global context (supports both real and fake logins)
    const { isAuthenticated, user: authUser, role } = useAuth();

    // Auth and Interaction State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [interactionLocation, setInteractionLocation] = useState<{ lat: number, lng: number } | null>(null);

    const mapRef = useRef<MapRef>(null);

    // Build a user-like object for components that need it
    const user = isAuthenticated && authUser ? { id: authUser.id, email: authUser.email } : null;

    // Determine which leads to display based on auth state
    // Contractor: sees real open leads
    // Customer: sees ONLY their own real leads, plus mock leads for simulation
    // Guest: sees mock leads
    const displayLeads = useMemo(() => {
        const hiddenStatuses = ['completed', 'cancelled', 'cancelled_by_customer'];
        if (!user) return mockLeads;
        if (role === 'contractor') return leads.filter(l => !hiddenStatuses.includes(l.status));

        // Customer: only their own leads (jobs), excluding finished ones
        const ownRealLeads = leads.filter(l => l.user_id === user.id && !hiddenStatuses.includes(l.status));
        return ownRealLeads;
    }, [user, role, leads]);

    // Initial load and subscriptions
    useEffect(() => {
        setMounted(true);

        const fetchLeads = async () => {
            if (!user) {
                // Guests just use mockLeads anyway
                return;
            }

            try {
                let tempLeads: Lead[] = [];

                if (role === 'contractor') {
                    // Fetch open jobs map
                    const { data, error } = await supabase
                        .from('open_jobs_map')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (data && !error) {
                        tempLeads = data.map((j: any) => ({
                            id: j.id,
                            user_id: 'contractor_view',
                            lat: j.latitude,
                            lng: j.longitude,
                            type: j.trade === 'egyeb' ? 'viz' : (j.trade || 'viz'),
                            title: j.title,
                            description: j.description || '',
                            district: j.district_or_city || null,
                            status: j.status,
                            created_at: j.created_at
                        }));
                    }
                } else if (role === 'customer') {
                    // Fetch customer's own jobs (use created_by_user_id)
                    const { data: jobsData, error: jobsError } = await supabase
                        .from('jobs')
                        .select('id, title, description, trade, status, created_at, latitude, longitude, district_or_city, lead_id, job_interests(id, status)')
                        .eq('created_by_user_id', user.id)
                        .order('created_at', { ascending: false });

                    // Also fetch customer's leads (waiting AND converted)
                    const { data: leadsData, error: leadsError } = await supabase
                        .from('leads')
                        .select('*')
                        .eq('user_id', user.id)
                        .in('status', ['waiting', 'converted'])
                        .order('created_at', { ascending: false });

                    let combinedLeads: Lead[] = [];

                    // Collect lead IDs from jobs to deduplicate
                    const jobLeadIds = new Set(
                        (jobsData || []).map((j: any) => j.lead_id).filter(Boolean)
                    );

                    if (jobsData && !jobsError) {
                        combinedLeads = [...combinedLeads, ...jobsData.map((j: any) => {
                            const interests = j.job_interests || [];
                            const hasPending = interests.some((i: any) => i.status === 'pending');
                            const hasAccepted = interests.some((i: any) => i.status === 'accepted');
                            return {
                                id: j.id,
                                user_id: user.id,
                                lat: j.latitude,
                                lng: j.longitude,
                                type: j.trade === 'egyeb' ? 'viz' : (j.trade || 'viz'),
                                title: j.title,
                                description: j.description || '',
                                district: j.district_or_city || null,
                                status: j.status,
                                created_at: j.created_at,
                                has_pending: hasPending,
                                has_accepted: hasAccepted,
                            };
                        })];
                    }

                    if (leadsData && !leadsError) {
                        // Only add leads that DON'T have a corresponding job
                        const filteredLeads = leadsData.filter((l: any) => !jobLeadIds.has(l.id));
                        combinedLeads = [...combinedLeads, ...filteredLeads.map((l: any) => ({
                            id: l.id,
                            user_id: user.id,
                            lat: l.lat,
                            lng: l.lng,
                            type: l.type === 'egyeb' ? 'viz' : (l.type || 'viz'),
                            title: l.title,
                            description: l.description || '',
                            district: l.district || null,
                            status: l.status,
                            created_at: l.created_at
                        }))];
                    }

                    // Sort combined by created_at descending
                    combinedLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    tempLeads = combinedLeads;
                }

                // Append any unassigned legacy leads just in case
                const { data: legacyLeads } = await supabase
                    .from('leads')
                    .select('*')
                    .in('status', ['waiting', 'new'])
                    .order('created_at', { ascending: false });

                const finalData = legacyLeads ? [...tempLeads, ...(legacyLeads as Lead[])] : tempLeads;
                setLeads(finalData.filter((l: Lead) => l.lat && l.lng));
            } catch (err) {
                console.error("Error fetching map data:", err);
            }
        };
        fetchLeads();

        // 4. Setup Realtime subscription
        const subscription = supabase
            .channel('public:leads')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leads' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLeads(prev => [payload.new as Lead, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        setLeads(prev => prev.filter(l => l.id !== payload.old.id));
                        setSelectedLead(prev => prev?.id === payload.old.id ? null : prev);
                    } else if (payload.eventType === 'UPDATE') {
                        setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
                        setSelectedLead(prev => prev?.id === payload.new.id ? payload.new as Lead : prev);
                    }
                }
            )
            .subscribe();


        const updatePadding = () => {
            if (mapRef.current && window.innerWidth >= 1024) {
                // If the screen is completely resized to desktop, snap the default viewport over to the right.
                mapRef.current.flyTo({
                    center: [DEFAULT_VIEWPORT.longitude - 0.14, DEFAULT_VIEWPORT.latitude],
                    duration: 0
                });
            }
        };

        updatePadding();
        window.addEventListener('resize', updatePadding);

        return () => {
            supabase.removeChannel(subscription);
            window.removeEventListener('resize', updatePadding);
        };
    }, [role]);

    // Fit bounds to displayLeads on load or when selection clears
    useEffect(() => {
        if (selectedLead) return;

        const validLeads = displayLeads.filter(l => l && l.lat != null && l.lng != null);
        if (validLeads.length > 0 && mapRef.current) {
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            validLeads.forEach(l => {
                const lat = Number(l.lat);
                const lng = Number(l.lng);
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
            });

            mapRef.current.fitBounds(
                [
                    [minLng, minLat],
                    [maxLng, maxLat]
                ],
                { padding: window.innerWidth >= 1024 ? { top: 50, bottom: 50, left: window.innerWidth * 0.3 + 50, right: 50 } : 50, duration: 1500, maxZoom: 11.5 }
            );
        }
    }, [displayLeads, selectedLead]);

    const handleMapClick = (e: any) => {
        // If they click the map (not a marker), we either clear selection or ask to add a pin
        if (e.originalEvent.target.closest('.mapboxgl-marker')) return;

        setSelectedLead(null);

        // Contractors should not be adding leads — redirect to dashboard
        if (role === 'contractor') {
            window.location.href = '/contractor/dashboard';
            return;
        }

        if (user) {
            setInteractionLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            setAddModalOpen(true);
        } else {
            // Unauthenticated user clicked map to add - show auth modal
            setInteractionLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            setAuthModalOpen(true);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Biztosan törlöd ezt a bejelentést?')) {
            try {
                const { data: { session: sbSession } } = await supabase.auth.getSession();
                const storedSession = getSession();
                const token = sbSession?.access_token || storedSession?.session?.access_token;
                if (!token) {
                    alert('Nincs érvényes munkamenet. Kérjük jelentkezzen be újra.');
                    return;
                }
                const res = await fetch(`/api/customer/jobs/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                    setSelectedLead(null);
                    // Remove the lead from the local state
                    setLeads(prev => prev.filter(l => l.id !== id));
                } else {
                    alert(data.error || 'Hiba történt a törlés során.');
                }
            } catch {
                alert('Hiba történt a törlés során.');
            }
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    // Cleanup empty space where the old useEffect was

    if (!mounted || !MAPBOX_TOKEN) {
        return (
            <div className="w-full h-full min-h-[400px] bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-2xl">
                <div className="text-slate-400 font-medium flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-slate-400 border-t-vvm-blue-500 rounded-full animate-spin"></span>
                    Élő problématérkép betöltése...
                </div>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'viz': return <Droplets className="w-4 h-4 lg:w-6 lg:h-6 text-white" />;
            case 'villany': return <Zap className="w-4 h-4 lg:w-6 lg:h-6 text-white" />;
            case 'futes': return <Flame className="w-4 h-4 lg:w-6 lg:h-6 text-white" />;
            default: return <Wrench className="w-4 h-4 lg:w-6 lg:h-6 text-white" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'viz': return 'bg-sky-500 shadow-sky-500/50';
            case 'villany': return 'bg-amber-500 shadow-amber-500/50';
            case 'futes': return 'bg-orange-500 shadow-orange-500/50';
            default: return 'bg-slate-500 shadow-slate-500/50';
        }
    };

    const mapPadding = typeof window !== 'undefined'
        ? (window.innerWidth >= 1024
            ? { top: 0, bottom: 0, left: window.innerWidth * 0.30, right: 0 }
            : { top: 0, bottom: window.innerHeight * 0.6, left: 0, right: 0 })
        : { top: 0, bottom: 0, left: 0, right: 0 };

    return (
        <div className="absolute inset-0 w-full h-full lg:rounded-none group overflow-hidden bg-slate-900 pointer-events-auto" style={{ touchAction: 'none' }}>

            {/* Hint overlay that disappears on hover/interaction */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-900/60 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-vvm-blue-900/80 to-transparent z-10 pointer-events-none transition-opacity duration-500 lg:hidden"></div>

            {/* Instruction Badge - Full width bottom bar */}
            <div className="absolute bottom-0 left-0 w-full z-20">
                <button
                    onClick={() => {
                        if (role === 'contractor') return; // No action for contractors
                        if (!user) setAuthModalOpen(true);
                    }}
                    className={`w-full bg-white/90 backdrop-blur-md px-4 py-2 border-t border-white/50 flex flex-row items-center justify-center gap-3 transition-colors ${
                        role === 'contractor' 
                            ? 'pointer-events-none'
                            : !user
                            ? 'cursor-pointer hover:bg-white active:bg-slate-50'
                            : 'pointer-events-none'
                    }`}
                >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        role === 'contractor' ? 'bg-vvm-yellow-500/80' : user ? 'bg-vvm-blue-500/80' : 'bg-slate-600/90'
                    }`}>
                        {role === 'contractor' ? <Search className="w-3 h-3 text-white" /> : user ? <MapPin className="w-3 h-3 text-white" /> : <LogIn className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[11px] sm:text-[13px] font-bold text-slate-700">
                        {role === 'contractor' ? 'Elérhető munkák a környékeden' : user ? 'Kattints a térképre egy új hiba bejelentéséhez' : 'Jelentkezz be, hogy hibát jelenthess'}
                    </span>
                </button>
            </div>

            <style>{`
                .mapboxgl-canvas {
                    touch-action: none !important;
                }
                .mapboxgl-map {
                    touch-action: none !important;
                }
                .mapboxgl-popup, .mapboxgl-marker {
                    touch-action: none !important;
                }
                .mapboxgl-popup {
                    pointer-events: none !important;
                }
                .mapboxgl-popup-content {
                    pointer-events: none !important;
                    touch-action: none !important;
                    padding: 8px 10px !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                    box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    background: white !important;
                    color: #1e293b !important;
                    width: 260px !important;
                }
                .mapboxgl-popup-content button,
                .mapboxgl-popup-content a {
                    pointer-events: auto !important;
                }
                .mapboxgl-popup-tip {
                    border-top-color: white !important;
                }
                .mapboxgl-popup-close-button {
                    pointer-events: auto !important;
                    font-size: 24px !important;
                    padding: 8px 12px !important;
                    color: #94a3b8 !important;
                    outline: none !important;
                    right: 4px !important;
                    top: 4px !important;
                    transition: color 0.2s !important;
                }
                .mapboxgl-popup-close-button:hover {
                    background-color: transparent !important;
                    color: #0f172a !important;
                }
                @media (max-width: 1023px) {
                    .mapboxgl-ctrl-bottom-right {
                        display: none !important;
                    }
                }
            `}</style>

            <Map
                ref={mapRef}
                initialViewState={DEFAULT_VIEWPORT}
                padding={mapPadding}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                interactive={true}
                scrollZoom={false}
                cooperativeGestures={false}
                onClick={handleMapClick}
                cursor="crosshair"
                maxBounds={[
                    [18.85, 47.35],  // Southwest corner
                    [19.25, 47.65]   // Northeast corner
                ]}
            >
                {/* Render Leads */}
                {displayLeads.map((lead: any) => {
                    const isOwnLead = user && user.id === lead.user_id;

                    return (
                        <Marker
                            key={'lead-' + lead.id}
                            longitude={lead.lng}
                            latitude={lead.lat}
                            anchor="bottom"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedLead(lead);
                                mapRef.current?.flyTo({
                                    center: [lead.lng, window.innerWidth >= 1024 ? lead.lat + 0.015 : lead.lat + 0.015],
                                    zoom: window.innerWidth >= 1024 ? 10 : 12,
                                    duration: 800
                                });
                            }}
                        >
                            <div className={`relative group cursor-pointer transition-transform duration-300 ${selectedLead?.id === lead.id ? 'scale-125 z-30' : 'hover:scale-110 z-10'} ${isOwnLead ? 'opacity-100' : 'opacity-90'}`}>
                                {/* Outer pulsing ring */}
                                <div className={`absolute -inset-2 lg:-inset-3 rounded-full animate-ping ${(lead as any).has_accepted ? 'bg-vvm-blue-400/30' : (lead as any).has_pending ? 'bg-emerald-400/30' : 'bg-slate-500/20'}`}></div>
                                {/* Inner pin */}
                                <div className={`relative w-10 h-10 lg:w-14 lg:h-14 rounded-full ${getColor(lead.type)} shadow-xl flex items-center justify-center border-2 ${isOwnLead ? 'border-amber-300' : 'border-white/20'} ${selectedLead?.id === lead.id ? 'ring-4 lg:ring-6 ring-white/40' : ''}`}>
                                    {getIcon(lead.type)}
                                </div>

                                {/* Always-visible status pill — thought bubble top-right (hidden when popup open) */}
                                {isOwnLead && selectedLead?.id !== lead.id && (
                                    <div className="absolute -top-7 left-full -ml-3 whitespace-nowrap">
                                        {(lead as any).has_accepted ? (
                                            <div className="relative px-2.5 py-1 bg-vvm-blue-600 text-white text-[8px] lg:text-[9px] font-black uppercase tracking-wide rounded-full shadow-lg border border-vvm-blue-500">
                                                Folyamatban
                                                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-vvm-blue-600 border-r border-b border-vvm-blue-500 rotate-45"></div>
                                            </div>
                                        ) : (lead as any).has_pending ? (
                                            <div className="relative px-2.5 py-1 bg-emerald-500 text-white text-[8px] lg:text-[9px] font-black uppercase tracking-wide rounded-full shadow-lg border border-emerald-400 animate-pulse">
                                                Szakember jelentkezett
                                                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-emerald-500 border-r border-b border-emerald-400 rotate-45"></div>
                                            </div>
                                        ) : lead.status === 'in_progress' ? (
                                            <div className="relative px-2.5 py-1 bg-vvm-blue-600 text-white text-[8px] lg:text-[9px] font-black uppercase tracking-wide rounded-full shadow-lg border border-vvm-blue-500">
                                                Folyamatban
                                                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-vvm-blue-600 border-r border-b border-vvm-blue-500 rotate-45"></div>
                                            </div>
                                        ) : (
                                            <div className="relative px-2.5 py-1 bg-slate-700 text-slate-200 text-[8px] lg:text-[9px] font-bold uppercase tracking-wide rounded-full shadow-lg border border-slate-600">
                                                Keresés...
                                                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-700 border-r border-b border-slate-600 rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hover tooltip (desktop only, non-own leads — own leads have the pill) */}
                                {selectedLead?.id !== lead.id && !isOwnLead && (
                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-2xl w-max pointer-events-none border border-slate-200/80 z-50">
                                        <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{lead.title}</div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {(lead as any).has_accepted ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-vvm-blue-500"></div>
                                                    <span className="text-[10px] text-vvm-blue-600 font-bold tracking-wide">Folyamatban</span>
                                                </>
                                            ) : (lead as any).has_pending ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-[10px] text-emerald-600 font-bold tracking-wide">Szakember jelentkezett</span>
                                                </>
                                            ) : lead.status === 'in_progress' ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-vvm-blue-500"></div>
                                                    <span className="text-[10px] text-vvm-blue-600 font-bold tracking-wide">Folyamatban</span>
                                                </>
                                            ) : lead.status === 'completed' ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <span className="text-[10px] text-emerald-600 font-bold tracking-wide">Befejezve</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                    <span className="text-[10px] text-slate-500 font-medium tracking-wide">Szakembert keresünk</span>
                                                </>
                                            )}
                                            {isOwnLead && <span className="text-[9px] text-amber-500 font-bold ml-1">• Saját</span>}
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-white/95 border-l border-b border-slate-200/80 rotate-45 transform"></div>
                                    </div>
                                )}
                            </div>
                        </Marker>
                    );
                })}

                {/* Detail Overlay (Replaces Popup) */}
                {selectedLead && (
                    <Popup
                        longitude={selectedLead.lng}
                        latitude={selectedLead.lat}
                        anchor="bottom"
                        offset={45} // Offset to clear the glowing marker
                        onClose={() => {
                            setSelectedLead(null);
                        }}
                        closeOnClick={false}
                        className="z-50 min-w-[300px]"
                        maxWidth="340px"
                    >
                        <div className="p-0">
                            {/* Compact header — matching dashboard style */}
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className={`w-9 h-9 rounded-xl ${getColor(selectedLead.type)} flex flex-shrink-0 items-center justify-center text-white shadow-md *:w-4 *:h-4`}>
                                    {getIcon(selectedLead.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{selectedLead.title}</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                        <span className="truncate">Budapest, {selectedLead.district}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status badge — compact inline pill */}
                            <div className="mb-2">
                                {(selectedLead as any).has_accepted ? (
                                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-vvm-blue-600 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-blue-100">
                                        <Clock className="w-3 h-3" />
                                        Folyamatban
                                    </div>
                                ) : (selectedLead as any).has_pending ? (
                                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-vvm-blue-600 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-blue-100">
                                        <Search className="w-3 h-3" />
                                        Szakember jelentkezett!
                                    </div>
                                ) : selectedLead.status === 'in_progress' ? (
                                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-vvm-blue-600 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-blue-100">
                                        <Clock className="w-3 h-3" />
                                        Folyamatban
                                    </div>
                                ) : selectedLead.status === 'completed' ? (
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-100">
                                        <Shield className="w-3 h-3" />
                                        Befejezve
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-amber-100">
                                        <Search className="w-3 h-3" />
                                        Szakembert keresünk
                                    </div>
                                )}
                            </div>

                            {/* Description — clean */}
                            <div className="text-slate-500 text-[11px] sm:text-xs leading-relaxed mb-3 pl-0.5">
                                {selectedLead.description}
                            </div>

                            {/* Action row — matching dashboard */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href={role === 'contractor' ? '/contractor/dashboard' : (user ? '/ugyfel/dashboard' : '/login')}
                                    onClick={() => setSelectedLead(null)}
                                    className="flex-1 bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    Részletek
                                </Link>
                                {user && user.id === selectedLead.user_id && (
                                    <button
                                        onClick={(e) => handleDelete(selectedLead.id, e)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                        </div>
                    </Popup>
                )}
            </Map>

            {/* Enlarge Button moved to top wrapper */}

            {/* Modals Portaled to Body */}
            {authModalOpen && mounted && document.body && createPortal(
                <AuthModal
                    onClose={() => setAuthModalOpen(false)}
                    onSuccess={() => {
                        setAuthModalOpen(false);
                        // If they clicked the map before logging in, immediately open the add modal
                        if (interactionLocation) {
                            setAddModalOpen(true);
                        }
                    }}
                />,
                document.body
            )}

            {addModalOpen && interactionLocation && user && mounted && document.body && createPortal(
                <AddLeadModal
                    lat={interactionLocation.lat}
                    lng={interactionLocation.lng}
                    userId={user.id}
                    onClose={() => {
                        setAddModalOpen(false);
                        setInteractionLocation(null);
                    }}
                />,
                document.body
            )}
        </div>
    );
}
