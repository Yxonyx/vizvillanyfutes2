'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Droplets, Zap, Flame, Wrench, Clock, Search, Shield, ArrowRight, Maximize2, Plus, LogOut, Trash2, Award, AlertTriangle, FileCheck } from 'lucide-react';
import Link from 'next/link';
import MarketplaceSimulationOverlay from './MarketplaceSimulationOverlay';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import AddLeadModal from './AddLeadModal';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEFAULT_VIEWPORT = {
    latitude: 47.4979,
    longitude: 19.0402,
    zoom: 10.8
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

// Fake active leads for unauthenticated users
const mockLeads: any[] = [
    { id: 'm1', user_id: 'fake', lat: 47.515, lng: 19.025, type: 'viz', title: 'Csőtörés a fürdőben', status: 'waiting', description: 'Ömlik a víz a mosdó alól, elzártam a főcsapot de sürgős lenne!', district: 'II. kerület' },
    { id: 'm2', user_id: 'fake', lat: 47.478, lng: 19.065, type: 'villany', title: 'Nincs áram a lakásban', status: 'waiting', description: 'Reggel óta sehol nincs áram, a biztosítékot nem tudom visszakapcsolni.', district: 'IX. kerület' },
    { id: 'm3', user_id: 'fake', lat: 47.532, lng: 19.078, type: 'futes', title: 'Radiátor nem fűt', status: 'waiting', description: 'A gyerekszobában jéghideg a radiátor, pedig a kazán megy.', district: 'XIII. kerület' },
    { id: 'm4', user_id: 'fake', lat: 47.462, lng: 19.015, type: 'viz', title: 'Duguláselhárítás', status: 'waiting', description: 'Eldugult a WC, már mindent próbáltunk, de nem folyik le.', district: 'XI. kerület' },
    { id: 'm5', user_id: 'fake', lat: 47.502, lng: 19.122, type: 'villany', title: 'Sérült vezeték', status: 'waiting', description: 'Fúrás közben eltaláltam egy vezetéket, szikrázott egyet és elment az áram abban a szobában.', district: 'X. kerület' },
    { id: 'm6', user_id: 'fake', lat: 47.555, lng: 19.042, type: 'viz', title: 'Csöpögő csap', status: 'waiting', description: 'Folyamatosan csöpög a konyhai csaptelep, kérik a cseréjét.', district: 'III. kerület' },
    { id: 'm7', user_id: 'fake', lat: 47.445, lng: 19.145, type: 'futes', title: 'Kazán hiba (F28)', status: 'waiting', description: 'A gázkazán kiállt F28-as hibára és nincs melegvíz.', district: 'XIX. kerület' },
    { id: 'm8', user_id: 'fake', lat: 47.472, lng: 19.048, type: 'villany', title: 'Sercegő konnektor', status: 'waiting', description: 'A nappaliban az egyik konnektor sercegő hangot ad és túlmelegszik.', district: 'XI. kerület' },
    { id: 'm9', user_id: 'fake', lat: 47.495, lng: 18.995, type: 'futes', title: 'Padlófűtés szivárog', status: 'waiting', description: 'Vizesedik a padló a fürdőszoba előtt, nyomásesés a rendszerben.', district: 'XII. kerület' },
    { id: 'm10', user_id: 'fake', lat: 47.525, lng: 19.062, type: 'viz', title: 'Bojler nem melegít', status: 'waiting', description: 'A villanybojler be van kapcsolva, de jéghideg a víz tegnap óta.', district: 'XIII. kerület' },
    { id: 'm11', user_id: 'fake', lat: 47.455, lng: 19.108, type: 'villany', title: 'Sütő bekötés', status: 'waiting', description: 'Új kerámialapos sütőt vettünk, szakember kell a szakszerű bekötéshez.', district: 'XX. kerület' },
    { id: 'm12', user_id: 'fake', lat: 47.545, lng: 18.985, type: 'viz', title: 'Ázott fal', status: 'waiting', description: 'A szomszéd felől nedvesedik a fal, sürgős bejárás szükséges.', district: 'II. kerület' },
    { id: 'm13', user_id: 'fake', lat: 47.515, lng: 19.095, type: 'futes', title: 'Termosztát csere', status: 'waiting', description: 'Okostermosztát beszerelése és beállítása a meglévő kazánhoz.', district: 'XIV. kerület' },
    { id: 'm14', user_id: 'fake', lat: 47.492, lng: 19.035, type: 'viz', title: 'Zuhany szivárgás', status: 'waiting', description: 'Megrepedt a zuhanytálca és alatta folyik a víz a födémbe.', district: 'I. kerület' },
    { id: 'm15', user_id: 'fake', lat: 47.485, lng: 19.132, type: 'villany', title: 'FI relé lecsap', status: 'waiting', description: 'Amint bekapcsolom a mosógépet, rögtön lecsap a FI relé a lakásban.', district: 'X. kerület' },
];

export default function TeaserMap() {
    const [mounted, setMounted] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isSimulationOpen, setIsSimulationOpen] = useState(false);

    // Auth from global context (supports both real and fake logins)
    const { isAuthenticated, user: authUser, role } = useAuth();

    // Auth and Interaction State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [interactionLocation, setInteractionLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [autoAddOnOpen, setAutoAddOnOpen] = useState(false);
    const [pendingViewMode, setPendingViewMode] = useState<'contractor' | 'customer'>('customer');
    const [pendingInitialTab, setPendingInitialTab] = useState<'all' | 'own' | 'account'>('all');

    const mapRef = useRef<MapRef>(null);

    // Build a user-like object for components that need it
    const user = isAuthenticated && authUser ? { id: authUser.id, email: authUser.email } : null;

    // Determine which leads to display based on auth state
    const displayLeads = user ? leads : mockLeads;

    // Initial load and subscriptions
    useEffect(() => {
        setMounted(true);

        // Fetch initial leads
        const fetchLeads = async () => {
            const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                setLeads(data as Lead[]);
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

        const handleCloseSimulation = () => {
            setIsSimulationOpen(false);
            setAutoAddOnOpen(false);
        };

        // Listen for portal open events from Header
        const handleOpenPortal = (e: Event) => {
            const detail = (e as CustomEvent).detail || {};
            const mode = detail.mode || (role === 'contractor' ? 'contractor' : 'customer');
            setPendingViewMode(mode);
            setAutoAddOnOpen(!!detail.autoAdd);
            setPendingInitialTab(detail.initialTab || 'all');
            setIsSimulationOpen(true);
        };

        window.addEventListener('closeMarketplaceSimulation', handleCloseSimulation);
        window.addEventListener('openPortal', handleOpenPortal);

        return () => {
            supabase.removeChannel(subscription);
            window.removeEventListener('closeMarketplaceSimulation', handleCloseSimulation);
            window.removeEventListener('openPortal', handleOpenPortal);
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
            case 'viz': return <Droplets className="w-4 h-4 text-white" />;
            case 'villany': return <Zap className="w-4 h-4 text-white" />;
            case 'futes': return <Flame className="w-4 h-4 text-white" />;
            default: return <Wrench className="w-4 h-4 text-white" />;
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

    return (
        <div className="w-full h-full min-h-[450px] lg:min-h-[550px] rounded-2xl overflow-hidden relative shadow-2xl border-4 border-white/10 group">

            {/* Hint overlay that disappears on hover/interaction */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-900/60 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-vvm-blue-900/80 to-transparent z-10 pointer-events-none transition-opacity duration-500"></div>

            {/* Top floating controls */}
            <div className="absolute top-4 inset-x-2 sm:inset-x-4 z-20 flex justify-between items-start pointer-events-none">

                {/* Left side decorators (Stacked on very small screens, row on larger) */}
                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 pointer-events-none">
                    <div className="bg-white/95 text-slate-700 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-2 border border-slate-200/80 pointer-events-auto self-start transition-all hover:-translate-y-1">
                        <div className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
                        </div>
                        <span className="text-[10px] sm:text-[12px] font-bold whitespace-nowrap tracking-wide uppercase">Élő Munkák: {displayLeads.length}</span>
                    </div>

                    <div className="bg-white/95 text-slate-700 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-2 border border-slate-200/80 pointer-events-auto self-start transition-all hover:-translate-y-1">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] sm:text-[12px] font-bold whitespace-nowrap tracking-wide uppercase">Szakik: 42</span>
                    </div>
                </div>

                {/* Right side Enlarge Button */}
                <button
                    onClick={() => {
                        setPendingViewMode(role === 'contractor' ? 'contractor' : 'customer');
                        setIsSimulationOpen(true);
                    }}
                    className="bg-gradient-to-r from-vvm-blue-600 to-vvm-blue-700 hover:from-vvm-blue-700 hover:to-vvm-blue-800 text-white font-bold py-2 px-3 sm:py-2.5 sm:px-5 lg:px-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-500/20 flex items-center gap-1.5 sm:gap-2 transition-all transform hover:scale-105 pointer-events-auto shrink-0"
                >
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-100" />
                    <span className="text-[10px] sm:text-[13px] lg:text-[14px] whitespace-nowrap">Térkép Kinagyítása</span>
                </button>

                {/* Emptied Right label as it's merged above */}
            </div>

            {/* Instruction Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-vvm-blue-900/90 text-white backdrop-blur-md rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-2 border border-blue-500/30 pointer-events-none transition-opacity duration-500 group-hover:opacity-0 w-max max-w-[90%]">
                <span className="text-xs sm:text-sm font-medium text-center">
                    {user ? '✨ Mozgasd a térképet és kattints bárhova új hiba bejelentéséhez!' : '✨ Jelentkezz be a fenti menüben, hogy új hibát jelenthess be!'}
                </span>
            </div>

            <style>{`
                .mapboxgl-popup-close-button {
                    font-size: 24px !important;
                    padding: 8px 12px !important;
                    color: #64748b !important;
                    outline: none !important;
                    right: 4px !important;
                    top: 4px !important;
                    transition: color 0.2s !important;
                }
                .mapboxgl-popup-close-button:hover {
                    background-color: transparent !important;
                    color: #0f172a !important;
                }
            `}</style>

            <Map
                ref={mapRef}
                initialViewState={DEFAULT_VIEWPORT}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                interactive={true}
                scrollZoom={false}
                cooperativeGestures={true}
                onClick={handleMapClick}
                cursor="crosshair"
            >
                <NavigationControl position="bottom-right" />

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
                                    center: [lead.lng, lead.lat + 0.025], // Offset latitude to center the popup
                                    zoom: 12.5,
                                    duration: 800
                                });
                            }}
                        >
                            <div className={`relative group cursor-pointer transition-transform duration-300 ${selectedLead?.id === lead.id ? 'scale-125 z-30' : 'hover:scale-110 z-10'} ${isOwnLead ? 'opacity-100' : 'opacity-90'}`}>
                                {/* Outer pulsing ring */}
                                <div className="absolute -inset-2 bg-slate-500/20 rounded-full animate-ping"></div>
                                {/* Inner pin */}
                                <div className={`relative w-10 h-10 rounded-full ${getColor(lead.type)} shadow-xl flex items-center justify-center border-2 ${isOwnLead ? 'border-amber-300' : 'border-white/20'} ${selectedLead?.id === lead.id ? 'ring-4 ring-white/40' : ''}`}>
                                    {getIcon(lead.type)}
                                </div>

                                {/* Own lead indicator star */}
                                {isOwnLead && (
                                    <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full w-3.5 h-3.5 border-2 border-slate-800 shadow-sm"></div>
                                )}

                                {/* Simple Label (hidden when popup is open) */}
                                {selectedLead?.id !== lead.id && (
                                    <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 rounded-lg shadow-xl w-max pointer-events-none">
                                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{lead.title}</div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Sürgős (SOS)</div>
                                            {isOwnLead && <div className="text-[10px] text-amber-500 font-bold ml-1">(Saját bejelentés)</div>}
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-white rotate-45 transform"></div>
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
                        onClose={() => setSelectedLead(null)}
                        closeOnClick={false}
                        className="z-50 min-w-[300px]"
                        maxWidth="340px"
                    >
                        <div className="p-1">
                            <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                                <div className={`w-10 h-10 rounded-full ${getColor(selectedLead.type)} flex flex-shrink-0 items-center justify-center text-white shadow-md`}>
                                    {getIcon(selectedLead.type)}
                                </div>
                                <div className="flex-1 pr-4">
                                    <h3 className="font-bold text-slate-800 text-base leading-tight mb-0.5">{selectedLead.title}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        {selectedLead.district}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/80 rounded-lg p-3 mb-4 text-sm text-slate-600 border border-slate-100 leading-relaxed italic shadow-inner">
                                &quot;{selectedLead.description}&quot;
                            </div>

                            <div className="flex items-center justify-between text-xs mb-4 px-1">
                                <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                    <Clock className="w-3.5 h-3.5" />
                                    Azonnali SOS
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                    <Search className="w-3.5 h-3.5" />
                                    Szakit keres
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedLead(null);
                                        setIsSimulationOpen(true);
                                    }}
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    {user ? 'Teljes Képernyős Nézet' : 'Részletek a Szaki Appban'}
                                </button>

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

            {/* Fullscreen Simulation Overlay */}
            {isSimulationOpen && mounted && document.body && createPortal(
                <MarketplaceSimulationOverlay
                    onClose={() => { setIsSimulationOpen(false); setAutoAddOnOpen(false); }}
                    mockLeads={displayLeads}
                    getIcon={getIcon}
                    getColor={getColor}
                    viewMode={pendingViewMode}
                    user={user}
                    autoAddOnOpen={autoAddOnOpen}
                    initialTab={pendingInitialTab}
                />,
                document.body
            )}

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
