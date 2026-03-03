'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Droplets, Zap, Flame, Wrench, Clock, Search, Shield, ArrowRight, Maximize2, Plus, LogOut, Trash2, Award, AlertTriangle, FileCheck, Sparkles, LogIn, MapPin } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
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
        if (!user) return mockLeads;
        if (role === 'contractor') return leads;

        // Customer: only their own leads (jobs)
        const ownRealLeads = leads.filter(l => l.user_id === user.id);
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
                    // Fetch customer's own jobs
                    const { data, error } = await supabase
                        .from('jobs')
                        .select('id, title, description, trade, status, created_at, latitude, longitude, district_or_city')
                        .order('created_at', { ascending: false });

                    if (data && !error) {
                        tempLeads = data.map((j: any) => ({
                            id: j.id,
                            user_id: user.id, // Mark as own lead
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

    const handleMapClick = (e: any) => {
        // If they click the map (not a marker), we either clear selection or ask to add a pin
        if (e.originalEvent.target.closest('.mapboxgl-marker')) return;

        setSelectedLead(null);

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
            await supabase.from('leads').delete().match({ id });
            setSelectedLead(null);
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
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!user) setAuthModalOpen(true);
                    }}
                    className={`w-full bg-white/90 backdrop-blur-md px-4 py-2 border-t border-white/50 flex flex-row items-center justify-center gap-3 transition-colors ${!user
                        ? 'cursor-pointer hover:bg-white active:bg-slate-50'
                        : 'pointer-events-none'
                        }`}
                >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${user ? 'bg-vvm-blue-500/80' : 'bg-slate-600/90'}`}>
                        {user ? <MapPin className="w-3 h-3 text-white" /> : <LogIn className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[11px] sm:text-[13px] font-bold text-slate-700">
                        {user ? 'Kattints a térképre egy új hiba bejelentéséhez' : 'Jelentkezz be, hogy hibát jelenthess'}
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
                    box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3) !important;
                    background: #1e293b !important;
                    color: white !important;
                    width: 260px !important;
                }
                .mapboxgl-popup-content button,
                .mapboxgl-popup-content a {
                    pointer-events: auto !important;
                }
                .mapboxgl-popup-tip {
                    border-top-color: #1e293b !important;
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
                    color: white !important;
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
                                    center: [lead.lng, lead.lat + 0.025], // Offset latitude to center the popup vertically
                                    zoom: 12.5,
                                    duration: 800
                                });
                            }}
                        >
                            <div className={`relative group cursor-pointer transition-transform duration-300 ${selectedLead?.id === lead.id ? 'scale-125 z-30' : 'hover:scale-110 z-10'} ${isOwnLead ? 'opacity-100' : 'opacity-90'}`}>
                                {/* Outer pulsing ring */}
                                <div className="absolute -inset-2 lg:-inset-3 bg-slate-500/20 rounded-full animate-ping"></div>
                                {/* Inner pin */}
                                <div className={`relative w-10 h-10 lg:w-14 lg:h-14 rounded-full ${getColor(lead.type)} shadow-xl flex items-center justify-center border-2 ${isOwnLead ? 'border-amber-300' : 'border-white/20'} ${selectedLead?.id === lead.id ? 'ring-4 lg:ring-6 ring-white/40' : ''}`}>
                                    {getIcon(lead.type)}
                                </div>

                                {/* Own lead indicator star */}
                                {isOwnLead && (
                                    <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full w-3.5 h-3.5 border-2 border-slate-800 shadow-sm"></div>
                                )}

                                {/* Simple Label (hidden when popup is open) */}
                                {selectedLead?.id !== lead.id && (
                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 rounded-lg shadow-xl w-max pointer-events-none border border-gray-200 z-50">
                                        <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{lead.title}</div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Sürgős (SOS)</div>
                                            {isOwnLead && <div className="text-[10px] text-amber-600 font-bold ml-1">(Saját bejelentés)</div>}
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-white border-l border-b border-gray-200 rotate-45 transform"></div>
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
                            mapRef.current?.flyTo({
                                center: [DEFAULT_VIEWPORT.longitude, DEFAULT_VIEWPORT.latitude],
                                zoom: DEFAULT_VIEWPORT.zoom,
                                duration: 800
                            });
                        }}
                        closeOnClick={false}
                        className="z-50 min-w-[300px]"
                        maxWidth="340px"
                    >
                        <div className="p-0.5">
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getColor(selectedLead.type)} flex flex-shrink-0 items-center justify-center text-white shadow-md *:w-4 *:h-4 sm:*:w-5 sm:*:h-5`}>
                                    {getIcon(selectedLead.type)}
                                </div>
                                <div className="flex-1 pr-1 border-gray-600">
                                    <h3 className="font-bold text-white text-[13px] sm:text-base leading-tight mb-0.5">{selectedLead.title}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                        {selectedLead.district}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4 text-[11px] sm:text-sm text-slate-300 border border-slate-600 leading-snug italic shadow-inner">
                                &quot;{selectedLead.description}&quot;
                            </div>

                            <div className="flex items-center justify-between mb-2 sm:mb-4 px-0.5">
                                <div className="flex items-center gap-1 sm:gap-1.5 text-red-400 font-bold bg-red-950/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-red-500/30 text-[10px] sm:text-xs">
                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Azonnali SOS
                                </div>
                                <div className="flex items-center gap-1 sm:gap-1.5 text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-blue-500/30 text-[10px] sm:text-xs">
                                    <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Szakit keres
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                {role === 'contractor' ? (
                                    <Link
                                        href="/contractor/dashboard"
                                        className="w-full bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-bold py-1.5 sm:py-2.5 rounded-xl text-[11px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-md"
                                    >
                                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Megtekintés az Irányítópulton
                                    </Link>
                                ) : (
                                    <Link
                                        href={user ? '/ugyfel/dashboard' : '/login'}
                                        onClick={() => setSelectedLead(null)}
                                        className="w-full bg-vvm-yellow-500 hover:bg-vvm-yellow-400 text-slate-900 font-bold py-1.5 sm:py-2.5 rounded-xl text-[11px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-md"
                                    >
                                        <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Megtekintés az Irányítópulton
                                    </Link>
                                )}

                                {user && user.id === selectedLead.user_id && (
                                    <button
                                        onClick={(e) => handleDelete(selectedLead.id, e)}
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Saját bejelentés törlése
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
