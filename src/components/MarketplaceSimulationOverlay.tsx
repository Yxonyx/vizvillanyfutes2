'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import { X, User, ChevronRight, Briefcase, Wallet, Settings, Menu, Shield, MapPin, Clock, ArrowRight, ArrowLeft, AlertTriangle, Plus, Check, XCircle, Phone, Mail, UserCheck } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import AuthModal from './AuthModal';
import AddLeadModal from './AddLeadModal';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEFAULT_VIEWPORT = {
    latitude: 47.4979,
    longitude: 19.0402,
    zoom: 11
};

interface MarketplaceSimulationOverlayProps {
    onClose?: () => void;
    mockLeads: any[];
    getIcon: (type: string) => React.ReactNode;
    getColor: (type: string, bgType?: 'bg' | 'text' | 'border') => string;
    viewMode?: 'contractor' | 'customer';
    user?: any;
    autoAddOnOpen?: boolean;
    initialTab?: 'all' | 'own' | 'account';
}

export default function MarketplaceSimulationOverlay({ onClose, mockLeads, getIcon, getColor, viewMode = 'contractor', user, autoAddOnOpen = false, initialTab = 'all' }: MarketplaceSimulationOverlayProps) {
    const { logout, isAuthenticated } = useAuth();
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'own' | 'account'>(initialTab);
    const [showAuthOverlay, setShowAuthOverlay] = useState(!isAuthenticated);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addLocation, setAddLocation] = useState<{ lat: number, lng: number }>({ lat: 47.4979, lng: 19.0402 });
    const mapRef = useRef<MapRef>(null);

    // Touch drag state for sidebar
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const EXPANDED_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.6 : 480;
    const COLLAPSED_HEIGHT = 100; // Increased to 100 to prevent iPhone home indicator interference

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - touchStartY.current;
        // Only allow dragging down when open, up when closed
        if (isMobileMenuOpen) {
            setDragOffset(Math.max(0, delta)); // drag down only
        } else {
            setDragOffset(Math.min(0, delta)); // drag up only
        }
    }, [isDragging, isMobileMenuOpen]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        const elapsed = Date.now() - touchStartTime.current;
        const velocity = Math.abs(dragOffset) / elapsed; // px/ms
        const threshold = EXPANDED_HEIGHT * 0.15;

        if (isMobileMenuOpen) {
            // If dragged down enough or fast flick → collapse
            if (dragOffset > threshold || (velocity > 0.3 && dragOffset > 20)) {
                setIsMobileMenuOpen(false);
            }
        } else {
            // If dragged up enough or fast flick → expand
            if (Math.abs(dragOffset) > threshold || (velocity > 0.3 && Math.abs(dragOffset) > 20)) {
                setIsMobileMenuOpen(true);
            }
        }
        setDragOffset(0);
    }, [dragOffset, isMobileMenuOpen, EXPANDED_HEIGHT]);

    // Calculate sidebar style for smooth drag
    const getSidebarStyle = (): React.CSSProperties => {
        if (typeof window === 'undefined' || window.innerWidth >= 1024) return {};
        const baseHeight = isMobileMenuOpen ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
        const currentHeight = isDragging
            ? Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, baseHeight - dragOffset))
            : baseHeight;
        return {
            height: currentHeight,
            transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        };
    };

    // Lead interests state
    const [myInterests, setMyInterests] = useState<any[]>([]);
    const [leadInterestCounts, setLeadInterestCounts] = useState<Record<string, number>>({});
    const [leadInterestDetails, setLeadInterestDetails] = useState<Record<string, any[]>>({});
    const [interestSubmitting, setInterestSubmitting] = useState(false);
    const [interestSuccess, setInterestSuccess] = useState<string | null>(null);
    const [creditBalance, setCreditBalance] = useState<number | null>(null);
    const [acceptedLeads, setAcceptedLeads] = useState<any[]>([]);

    // Lock body scroll when overlay is open (prevents background sliding on mobile)
    useEffect(() => {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    // Auto-open add modal if requested (from 'Probléma bejelentése' button)
    useEffect(() => {
        if (autoAddOnOpen && isAuthenticated && !showAuthOverlay) {
            setAddModalOpen(true);
        }
    }, [autoAddOnOpen, isAuthenticated, showAuthOverlay]);

    // Fetch real credit balance for contractors
    useEffect(() => {
        if (!user || viewMode !== 'contractor') return;
        supabase.from('contractor_profiles').select('credit_balance').eq('user_id', user.id).single()
            .then(({ data }) => {
                if (data) setCreditBalance(data.credit_balance);
            });
    }, [user, viewMode]);

    // Fetch my interests (contractor) or interest counts (customer)
    useEffect(() => {
        if (!user) return;
        if (viewMode === 'contractor') {
            // Fetch leads I've shown interest in
            supabase.from('lead_interests').select('*').eq('contractor_id', user.id)
                .then(({ data }) => {
                    if (data) {
                        setMyInterests(data);
                        // For accepted ones, fetch the lead details
                        const accepted = data.filter(i => i.status === 'accepted');
                        if (accepted.length > 0) {
                            const leadIds = accepted.map(i => i.lead_id);
                            supabase.from('leads').select('*').in('id', leadIds)
                                .then(({ data: leads }) => {
                                    if (leads) setAcceptedLeads(leads);
                                });
                        }
                    }
                });
        } else {
            // Customer: fetch interest counts for my leads
            const myLeadIds = mockLeads.filter(l => l.user_id === user.id).map(l => l.id);
            if (myLeadIds.length > 0) {
                supabase.from('lead_interests').select('*').in('lead_id', myLeadIds)
                    .then(({ data }) => {
                        if (data) {
                            const counts: Record<string, number> = {};
                            const details: Record<string, any[]> = {};
                            data.forEach(i => {
                                if (i.status !== 'withdrawn' && i.status !== 'rejected') {
                                    counts[i.lead_id] = (counts[i.lead_id] || 0) + 1;
                                    if (!details[i.lead_id]) details[i.lead_id] = [];
                                    details[i.lead_id].push(i);
                                }
                            });
                            setLeadInterestCounts(counts);
                            setLeadInterestDetails(details);
                        }
                    });
            }
        }
    }, [user, viewMode, mockLeads]);

    // Handle contractor interest submission
    const handleInterest = useCallback(async (leadId: string) => {
        if (!user || interestSubmitting) return;
        setInterestSubmitting(true);
        try {
            const { error } = await supabase.from('lead_interests').insert({
                lead_id: leadId,
                contractor_id: user.id,
                contractor_name: user.email?.split('@')[0] || 'Szakember',
                price_at_interest: 2000,
            });
            if (error) {
                if (error.code === '23505') {
                    alert('Már jeleztél érdeklődést ennél a bejelentésnél!');
                } else {
                    alert('Hiba: ' + error.message);
                }
            } else {
                setInterestSuccess(leadId);
                setMyInterests(prev => [...prev, { lead_id: leadId, contractor_id: user.id, status: 'pending' }]);
                setTimeout(() => setInterestSuccess(null), 3000);
            }
        } finally {
            setInterestSubmitting(false);
        }
    }, [user, interestSubmitting]);

    // Handle customer accepting a contractor interest
    const handleAcceptInterest = useCallback(async (interestId: string, leadId: string) => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('accept_contractor_interest', {
                p_interest_id: interestId
            });
            if (error) {
                alert('Hiba: ' + error.message);
            } else {
                alert(`✅ Szakember elfogadva! A kredit levonásra került.\n\nSzakember neve: ${data?.contractor?.name || 'N/A'}\nTelefonszáma: ${data?.contractor?.phone || 'N/A'}`);
                // Refresh interest details
                setLeadInterestDetails(prev => {
                    const updated = { ...prev };
                    if (updated[leadId]) {
                        updated[leadId] = updated[leadId].map(i =>
                            i.id === interestId ? { ...i, status: 'accepted' } : i
                        );
                    }
                    return updated;
                });
            }
        } catch (err: any) {
            alert('Hiba: ' + (err.message || 'Ismeretlen hiba'));
        }
    }, [user]);

    // Handle customer rejecting a contractor interest
    const handleRejectInterest = useCallback(async (interestId: string, leadId: string) => {
        if (!user) return;
        const { error } = await supabase.from('lead_interests').update({ status: 'rejected' }).eq('id', interestId);
        if (!error) {
            setLeadInterestDetails(prev => {
                const updated = { ...prev };
                if (updated[leadId]) {
                    updated[leadId] = updated[leadId].map(i =>
                        i.id === interestId ? { ...i, status: 'rejected' } : i
                    );
                }
                return updated;
            });
        }
    }, [user]);

    const displayLeads = activeTab === 'own' && user ? mockLeads.filter(l => l.user_id === user.id) : mockLeads;
    const alreadyInterested = (leadId: string) => myInterests.some(i => i.lead_id === leadId);
    const getInterestStatus = (leadId: string) => myInterests.find(i => i.lead_id === leadId)?.status;

    const handleSelectLead = (lead: any) => {
        setSelectedLead(lead);
        if (window.innerWidth < 1024) {
            setIsMobileMenuOpen(false);
        }
        mapRef.current?.flyTo({
            center: [lead.lng, lead.lat - 0.01], // Offset slightly so pin is visible above bottom sheet
            zoom: 13,
            duration: 800
        });
    };

    return (
        <div className={`fixed inset-0 z-[100] flex animate-in fade-in duration-300 ${isAuthenticated ? 'bg-slate-100' : 'bg-slate-900'}`}>

            {/* Sidebar / Menu — persistent bottom sheet on mobile, left panel on desktop */}
            <div
                ref={sidebarRef}
                className={`
                    fixed lg:relative z-20 bg-white shadow-2xl flex flex-col
                    inset-x-0 bottom-0 rounded-t-2xl
                    lg:inset-y-0 lg:left-0 lg:h-auto lg:w-80 lg:max-w-none lg:rounded-none
                    lg:h-auto lg:translate-y-0
                `}
                style={getSidebarStyle()}
            >
                {/* Drag handle and Profile Widget combined — touch to drag anywhere here */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-5 pb-4 border-b border-slate-100 bg-slate-50 cursor-grab active:cursor-grabbing select-none touch-none lg:cursor-default lg:pointer-events-none"
                >
                    <div className="lg:hidden w-full flex flex-col items-center mb-4 touch-none">
                        <div className={`w-12 h-1.5 rounded-full transition-colors ${isDragging ? 'bg-vvm-blue-400' : 'bg-slate-300'}`} />
                        {!isMobileMenuOpen && !isDragging && (
                            <span className="text-xs text-slate-500 font-medium mt-2">
                                {viewMode === 'contractor' ? 'Szakember Portál' : 'Ügyfél Portál'} ▲
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 lg:pointer-events-auto">
                        <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 leading-tight truncate">
                                {viewMode === 'contractor' ? 'Minta Szakember' : 'Ügyfél Fiók'}
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] font-bold ${viewMode === 'contractor' ? 'text-emerald-600' : 'text-blue-600'} uppercase tracking-widest mt-0.5`}>
                                <Shield className="w-3 h-3" /> {viewMode === 'contractor' ? 'Partner' : 'Aktív'}
                            </div>
                        </div>
                        {/* Only show balance on desktop or when expanded on mobile to save space when collapsed */}
                        {viewMode === 'contractor' && (isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                            <div className="bg-slate-800 text-white rounded-xl p-2 px-3 shadow-inner ml-auto text-right flex-shrink-0">
                                <div className="text-[10px] text-slate-400 font-medium mb-0.5">Egyenleg</div>
                                <div className="text-sm font-black font-mono">
                                    {creditBalance !== null ? `${creditBalance.toLocaleString('hu-HU')} Ft` : '...'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="p-3 border-b border-slate-100 space-y-1">
                    <div
                        className={`flex items-center justify-between p-3 rounded-xl font-bold cursor-pointer transition-colors ${activeTab === 'all' ? 'bg-vvm-blue-50 text-vvm-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        onClick={() => {
                            setActiveTab('all');
                            if (window.innerWidth < 1024) {
                                setIsMobileMenuOpen(false);
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5" /> Élő Térkép
                        </div>
                        {activeTab === 'all' && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </div>
                    <div
                        className={`flex items-center justify-between p-3 rounded-xl font-medium cursor-pointer transition-colors ${activeTab === 'own' ? 'bg-vvm-blue-50 text-vvm-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        onClick={() => {
                            setActiveTab('own');
                            // On mobile, keep sidebar open and scroll to content
                            const contentEl = document.getElementById('sidebar-content');
                            if (contentEl) contentEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Briefcase className="w-5 h-5" /> {viewMode === 'contractor' ? 'Munkáim' : 'Saját bejelentéseim'}
                        </div>
                        {activeTab === 'own' && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </div>
                    {viewMode === 'contractor' && (
                        <div className="flex items-center justify-between p-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5" /> Pénzügyek
                            </div>
                        </div>
                    )}
                    <a
                        href="/fiok"
                        className="flex items-center justify-between p-3 rounded-xl font-medium cursor-pointer transition-colors text-slate-600 hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5" /> Saját fiókom
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </a>
                </div>

                {/* Content Area (Job List or Account) */}
                <div id="sidebar-content" className="flex-1 overflow-y-auto p-3 bg-slate-50">

                    {activeTab !== 'account' ? (
                        <>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                {activeTab === 'own' && viewMode === 'customer'
                                    ? `Saját Bejelentéseim (${displayLeads.length})`
                                    : viewMode === 'contractor'
                                        ? `Elérhető munkák (${displayLeads.length})`
                                        : `Jelentések a közeledben`}
                            </h3>
                            {/* Add problem button for customers */}
                            {viewMode === 'customer' && (
                                <button
                                    onClick={() => setAddModalOpen(true)}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] mb-3"
                                >
                                    <Plus className="w-5 h-5" />
                                    Új probléma bejelentése
                                </button>
                            )}

                            <div className="space-y-2">
                                {displayLeads.length === 0 && (
                                    <div className="text-center py-8 text-sm text-slate-500 font-medium opacity-70">
                                        Még nincs megjeleníthető bejelentés.
                                        {viewMode === 'customer' && (
                                            <p className="mt-2 text-xs">Kattints a térképre vagy a fenti gombra egy új probléma bejelentéséhez.</p>
                                        )}
                                    </div>
                                )}
                                {displayLeads.map((lead) => {
                                    const interestCount = leadInterestCounts[lead.id] || 0;
                                    const interested = alreadyInterested(lead.id);
                                    const iStatus = getInterestStatus(lead.id);
                                    return (
                                        <div
                                            key={`list-${lead.id}`}
                                            onClick={() => handleSelectLead(lead)}
                                            className={`bg-white border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${selectedLead?.id === lead.id ? 'border-vvm-blue-500 shadow-sm ring-1 ring-vvm-blue-500' : 'border-slate-200'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full ${getColor(lead.type)} flex flex-shrink-0 items-center justify-center text-white shadow-sm mt-0.5`}>
                                                    {React.cloneElement(getIcon(lead.type) as React.ReactElement, { className: 'w-4 h-4' })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-sm truncate">{lead.title}</div>
                                                    <div className="text-xs text-slate-500 truncate">{lead.district}</div>
                                                    {/* Customer: show interest count */}
                                                    {viewMode === 'customer' && lead.user_id === user?.id && interestCount > 0 && (
                                                        <div className="mt-1 text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                            <UserCheck className="w-3 h-3" /> {interestCount} szakember érdeklődik
                                                        </div>
                                                    )}
                                                    {/* Contractor: show my interest status */}
                                                    {viewMode === 'contractor' && interested && (
                                                        <div className={`mt-1 text-xs font-bold flex items-center gap-1 ${iStatus === 'accepted' ? 'text-emerald-600' : iStatus === 'rejected' ? 'text-red-500' : 'text-amber-600'
                                                            }`}>
                                                            {iStatus === 'accepted' ? <><Check className="w-3 h-3" /> Elfogadva</>
                                                                : iStatus === 'rejected' ? <><XCircle className="w-3 h-3" /> Elutasítva</>
                                                                    : <><Clock className="w-3 h-3" /> Érdeklődés elküldve</>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="p-2 space-y-4 fade-in">
                            <h3 className="text-lg font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-vvm-blue-600" />
                                Fiók Adataim
                            </h3>

                            {/* User info card */}
                            <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden mb-4">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-vvm-blue-500/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <User className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-base truncate mb-1">
                                            {user?.email || 'Nincs email megadva'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-700/50 w-fit px-2.5 py-1 rounded-md border border-slate-600/50">
                                            {viewMode === 'contractor' ? (
                                                <><Shield className="w-3.5 h-3.5 text-emerald-400" /> Szakember Partner</>
                                            ) : (
                                                <><User className="w-3.5 h-3.5 text-blue-400" /> Regisztrált Ügyfél</>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        <Mail className="w-3.5 h-3.5" /> Email cím
                                    </label>
                                    <div className="text-slate-800 font-medium text-15px">{user?.email || 'Nincs email'}</div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        <Briefcase className="w-3.5 h-3.5" /> Szerepkör
                                    </label>
                                    <div className="text-slate-800 font-medium text-15px">
                                        {viewMode === 'contractor' ? 'Regisztrált Szakember' : 'Regisztrált Ügyfél'}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Jelszó módosítása</label>
                                    <button className="text-sm font-bold text-vvm-blue-600 hover:text-vvm-blue-800 transition-colors flex items-center gap-1">
                                        Jelszócsere e-mail küldése <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Contractor-specific: Credit & Stats */}
                            {viewMode === 'contractor' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 relative z-10">
                                            <Wallet className="w-3.5 h-3.5" /> Kredit egyenleg
                                        </div>
                                        <div className="flex items-end gap-3 mb-1">
                                            <div className="text-3xl font-black font-mono tracking-tight relative z-10">
                                                {creditBalance !== null ? creditBalance.toLocaleString('hu-HU') : '...'}
                                            </div>
                                            <div className="text-xl font-bold text-slate-300 pb-0.5">Ft</div>
                                        </div>

                                        <button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 relative z-10 w-fit">
                                            + Kredit feltöltés
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-vvm-blue-600 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div className="text-2xl font-black text-slate-800 leading-none">{mockLeads.length}</div>
                                            <div className="text-xs text-slate-500 font-medium">Elérhető munka</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <div className="text-2xl font-black text-emerald-600 leading-none">{myInterests.filter(i => i.status === 'accepted').length}</div>
                                            <div className="text-xs text-slate-500 font-medium">Megnyert munka</div>
                                        </div>
                                    </div>
                                    {/* Accepted leads — negotiation list */}
                                    {acceptedLeads.length > 0 && (
                                        <div className="mt-3">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tárgyalólista</div>
                                            <div className="space-y-2">
                                                {acceptedLeads.map(lead => (
                                                    <div key={lead.id} className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                                                        <div className="font-bold text-slate-800 text-sm">{lead.title}</div>
                                                        <div className="text-xs text-slate-500">{lead.district}</div>
                                                        {lead.contact_name && (
                                                            <div className="mt-2 space-y-1 bg-emerald-50 p-2 rounded-lg">
                                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                    <User className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span className="font-medium">{lead.contact_name}</span>
                                                                </div>
                                                                {lead.contact_phone && (
                                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <a href={`tel:${lead.contact_phone}`} className="font-medium text-vvm-blue-600 hover:underline">{lead.contact_phone}</a>
                                                                    </div>
                                                                )}
                                                                {lead.contact_email && (
                                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <a href={`mailto:${lead.contact_email}`} className="font-medium text-vvm-blue-600 hover:underline">{lead.contact_email}</a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="mt-1 text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Elfogadva — kapcsolatfelvétel lehetséges
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customer-specific: Report stats */}
                            {viewMode === 'customer' && (
                                <div className="space-y-3">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl p-4 shadow-lg">
                                        <div className="text-xs text-emerald-100 font-medium mb-1">Bejelentéseim</div>
                                        <div className="text-2xl font-black font-mono">
                                            {user ? mockLeads.filter(l => l.user_id === user.id).length : 0} db
                                        </div>
                                        <div className="text-xs text-emerald-200 mt-1">Aktív probléma bejelentés</div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications toggle (contractor only) */}
                            {viewMode === 'contractor' && (
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Értesítések</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">Új SOS munkák pittyegése</span>
                                        <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    try {
                                        await logout();
                                        await supabase.auth.signOut();
                                    } catch (e) {
                                        console.error('Logout error:', e);
                                    } finally {
                                        alert('Sikeresen kijelentkezve');
                                        window.location.href = '/';
                                    }
                                }}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors border border-red-200 mt-4"
                            >
                                Kijelentkezés
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Map Area */}
            <div className={`flex-1 relative flex flex-col h-full overflow-hidden ${isAuthenticated ? 'bg-slate-200' : 'bg-slate-800'}`}>

                {/* Header (Top Bar) */}
                <div className="absolute top-0 inset-x-0 z-10 h-16 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-b ${isAuthenticated ? 'from-white/60' : 'from-slate-900/80'} to-transparent`}></div>
                    <div className="relative h-full px-4 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-3">
                            {/* Back button — left side */}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className={`p-2 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md transition-all shadow-lg flex items-center gap-2 font-bold text-sm ${isAuthenticated
                                        ? 'text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200'
                                        : 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20'
                                        }`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Vissza</span>
                                </button>
                            )}
                            <div className={`backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium hidden sm:flex items-center gap-2 shadow-lg ${isAuthenticated
                                ? 'bg-white/80 text-slate-700 border border-slate-200'
                                : 'bg-slate-800/80 text-white border border-slate-700 animate-pulse'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
                                {isAuthenticated
                                    ? (viewMode === 'contractor' ? 'Szakember Portál' : 'Ügyfél Portál')
                                    : (viewMode === 'contractor' ? 'Szimulált Szakember Applikáció' : 'Teljes Képernyős Térkép Nézet')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Instance */}
                <Map
                    ref={mapRef}
                    initialViewState={DEFAULT_VIEWPORT}
                    mapStyle={isAuthenticated ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/dark-v11'}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    interactive={true}
                    onClick={() => setSelectedLead(null)}
                >
                    <NavigationControl position="top-right" style={{ marginTop: '140px', marginRight: '16px' }} />

                    {mockLeads.map((lead) => (
                        <Marker
                            key={'map-' + lead.id}
                            longitude={lead.lng}
                            latitude={lead.lat}
                            anchor="bottom"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                handleSelectLead(lead);
                            }}
                        >
                            <div className={`relative group cursor-pointer transition-transform duration-300 ${selectedLead?.id === lead.id ? 'scale-125 z-30' : 'hover:scale-110 z-10'}`}>
                                <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping"></div>
                                <div className={`relative w-10 h-10 rounded-full ${getColor(lead.type)} shadow-xl flex items-center justify-center border-2 border-white/20 ${selectedLead?.id === lead.id ? 'ring-4 ring-white/40' : ''}`}>
                                    {getIcon(lead.type)}
                                </div>
                            </div>
                        </Marker>
                    ))}
                </Map>

                {/* Selected Lead Bottom UI overlay (replaces Mapbox Popup) */}
                {selectedLead && (
                    <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none p-4 sm:p-6 lg:p-8 flex justify-center pb-8 sm:pb-8">
                        <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] pointer-events-auto animate-in slide-in-from-bottom-12 duration-500 overflow-hidden border border-slate-200">
                            <div className="p-5 sm:p-6 border-b border-slate-100 relative">
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${getColor(selectedLead.type)} flex flex-shrink-0 items-center justify-center text-white shadow-lg`}>
                                        {React.cloneElement(getIcon(selectedLead.type) as React.ReactElement, { className: 'w-7 h-7' })}
                                    </div>
                                    <div className="pr-8">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide rounded-md flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> SOS
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {selectedLead.district}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-black text-slate-800 leading-tight">
                                            {selectedLead.title}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 bg-slate-50">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Hibaleírás</div>
                                <div className="text-slate-700 text-[15px] leading-relaxed bg-white p-4 rounded-xl border border-slate-200 italic shadow-sm mb-5">
                                    &quot;{selectedLead.description}&quot;
                                </div>

                                {viewMode === 'contractor' && (
                                    <>
                                        <div className="flex items-center justify-between text-sm text-slate-500 font-medium mb-2">
                                            <span>Lead ára:</span>
                                            <span className="font-bold text-slate-800 text-lg">2 000 Ft</span>
                                        </div>

                                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                            💡 A kredit csak akkor kerül levonásra, ha az ügyfél elfogadja a jelentkezésedet — addig semmit nem fizetsz.
                                        </p>

                                        {alreadyInterested(selectedLead.id) ? (
                                            <div className={`w-full py-3.5 px-6 rounded-xl text-base font-bold text-center ${getInterestStatus(selectedLead.id) === 'accepted'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : getInterestStatus(selectedLead.id) === 'rejected'
                                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                {getInterestStatus(selectedLead.id) === 'accepted'
                                                    ? '✅ Elfogadva — hamarosan megkapod az elérhetőségeket!'
                                                    : getInterestStatus(selectedLead.id) === 'rejected'
                                                        ? '❌ Elutasítva'
                                                        : '⏳ Érdeklődés elküldve — várakozás az ügyfél válaszára...'}
                                            </div>
                                        ) : interestSuccess === selectedLead.id ? (
                                            <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3.5 px-6 rounded-xl text-base text-center">
                                                ✅ Érdeklődés rögzítve! Amint az ügyfél elfogadja, megkapod az elérhetőségeit.
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleInterest(selectedLead.id)}
                                                disabled={interestSubmitting}
                                                className="w-full bg-gradient-to-r from-vvm-blue-600 to-vvm-blue-700 hover:from-vvm-blue-700 hover:to-vvm-blue-800 text-white font-bold py-3.5 px-6 rounded-xl text-base flex items-center justify-center gap-2 transition-transform transform hover:scale-[1.02] shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Shield className="w-5 h-5" />
                                                {interestSubmitting ? 'Küldés...' : 'Érdeklődés jelzése'}
                                                <ArrowRight className="w-5 h-5 ml-1" />
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Customer: view interested contractors */}
                                {viewMode === 'customer' && user && selectedLead.user_id === user.id && leadInterestDetails[selectedLead.id]?.length > 0 && (
                                    <div className="mt-4 border-t border-slate-200 pt-4">
                                        <div className="text-sm font-bold text-slate-700 mb-3">Érdeklődő szakemberek:</div>
                                        <div className="space-y-2">
                                            {leadInterestDetails[selectedLead.id].map((interest: any) => (
                                                <div key={interest.id} className={`p-3 rounded-xl border ${interest.status === 'accepted' ? 'bg-emerald-50 border-emerald-200'
                                                    : interest.status === 'rejected' ? 'bg-red-50 border-red-200 opacity-50'
                                                        : 'bg-white border-slate-200'
                                                    }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-vvm-blue-100 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-vvm-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-800">{interest.contractor_name || 'Szakember'}</div>
                                                                <div className="text-xs text-slate-500">
                                                                    {interest.status === 'accepted' ? '✅ Elfogadva'
                                                                        : interest.status === 'rejected' ? '❌ Elutasítva'
                                                                            : '⏳ Várakozik'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {interest.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleAcceptInterest(interest.id, selectedLead.id)}
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
                                                                    title="Elfogadás"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectInterest(interest.id, selectedLead.id)}
                                                                    className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors border border-red-200"
                                                                    title="Elutasítás"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Customer: edit/delete own leads */}
                                {viewMode === 'customer' && user && selectedLead.user_id === user.id && (
                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={() => {
                                                setAddLocation({ lat: selectedLead.lat, lng: selectedLead.lng });
                                                setAddModalOpen(true);
                                                setSelectedLead(null);
                                            }}
                                            className="flex-1 bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            ✏️ Módosítás
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Biztosan törölni szeretnéd ezt a bejelentést?')) {
                                                    const { supabase } = await import('@/lib/supabase/client');
                                                    await supabase.from('leads').delete().match({ id: selectedLead.id });
                                                    setSelectedLead(null);
                                                }
                                            }}
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors border border-red-200"
                                        >
                                            🗑️ Törlés
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Frosted glass auth overlay — shown when not logged in */}
            {showAuthOverlay && (
                <div className="absolute inset-0 z-[150] flex items-center justify-center">
                    {/* Glass background */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                    {/* Auth modal centered */}
                    <div className="relative z-10">
                        <AuthModal
                            onClose={() => onClose?.()}
                            onSuccess={() => {
                                setShowAuthOverlay(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Add Lead Modal for customers */}
            {addModalOpen && user && (
                <div className="absolute inset-0 z-[160] flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAddModalOpen(false)} />
                    <div className="relative z-10">
                        <AddLeadModal
                            lat={addLocation.lat}
                            lng={addLocation.lng}
                            userId={user.id}
                            onClose={() => setAddModalOpen(false)}
                            onSuccess={() => setAddModalOpen(false)}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}
