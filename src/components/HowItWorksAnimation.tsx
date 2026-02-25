'use client';

import React, { useEffect, useState } from 'react';

export default function HowItWorksAnimation() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Only mount animations on client to avoid hydration mismatch
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full text-center relative pointer-events-none min-h-[400px] flex items-center justify-center">
                {/* Placeholder while mounting */}
                <div className="w-8 h-8 border-4 border-vvm-blue-500 border-t-vvm-blue-200 rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="w-full text-center relative pointer-events-none mb-12">
            <style dangerouslySetInnerHTML={{
                __html: `
        /* Entry Animations */
        .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .stagger-1 { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards; opacity: 0; transform: scale(0.8); }
        .stagger-2 { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 3s forwards; opacity: 0; transform: scale(0.8); }
        .stagger-3 { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 5.5s forwards; opacity: 0; transform: scale(0.8); }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

        /* Problem House Animations */
        .house-shake { animation: shake 4s ease-in-out infinite alternate 1s; }
        @keyframes shake {
            0%, 90% { transform: translateX(0); }
            92%, 96% { transform: translateX(-2px); }
            94%, 98% { transform: translateX(2px); }
        }
        .spark { opacity: 0; animation: flash 0.2s linear infinite alternate 1.5s; transform-origin: center; color: #f59e0b; }
        @keyframes flash {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1.2); }
        }

        /* Wavy Arrow Connections (Full draw with pathLength 100) */
        .path-draw-1, .path-draw-2 { 
            stroke-dasharray: 100; 
            stroke-dashoffset: 100; 
        }
        .path-draw-1 { animation: drawLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards; }
        .path-draw-2 { animation: drawLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) 4s forwards; }
        
        @keyframes drawLine { to { stroke-dashoffset: 0; } }

        .arrow-head-1 { opacity: 0; animation: fadeIn 0.3s ease-out 2.8s forwards; }
        .arrow-head-2 { opacity: 0; animation: fadeIn 0.3s ease-out 5.3s forwards; }
        @keyframes fadeIn { to { opacity: 1; } }

        /* Lead Packets sliding along the exact waves */
        .packet-1 { offset-path: path('M 10 50 C 50 0, 90 100, 130 50'); animation: movePacket 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards; opacity: 0; }
        .packet-2 { offset-path: path('M 10 50 C 50 100, 90 0, 130 50'); animation: movePacket 1.5s cubic-bezier(0.4, 0, 0.2, 1) 4s forwards; opacity: 0; }
        @keyframes movePacket {
            0% { offset-distance: 0%; opacity: 0; transform: scale(0.5); }
            10% { opacity: 1; transform: scale(1.5); }
            90% { opacity: 1; transform: scale(1.5); }
            100% { offset-distance: 100%; opacity: 0; transform: scale(0.5); }
        }

        /* Platform Animations */
        .radar-sweep { transform-origin: center; animation: spin 2s linear infinite 3.5s; opacity: 0; animation-fill-mode: forwards; }
        @keyframes spin { 0% { transform: rotate(0deg); opacity: 0.6;} 100% { transform: rotate(360deg); opacity: 0.6;} }

        .lead-drop { opacity: 0; transform: translateY(-30px); animation: dropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 3.2s forwards; }
        @keyframes dropIn { to { opacity: 1; transform: translateY(0); } }

        .ping-circle { opacity: 0; animation: sonarPing 1.5s ease-out infinite 3.5s; }
        @keyframes sonarPing { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }

        /* Pro Animations */
        .pro-badge { opacity: 0; transform: scale(0); animation: popBadge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 6s forwards; }
        @keyframes popBadge { to { opacity: 1; transform: scale(1); } }
        
        /* Layout Grid */
        .anim-grid {
            display: grid;
            grid-template-columns: 200px 1fr 200px 1fr 200px;
            align-items: center;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
        }

        @media (max-width: 1024px) {
            .anim-grid {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            .mobile-arrow-container {
                display: flex;
                justify-content: center;
                height: 80px;
                width: 100%;
                margin: -20px 0;
                z-index: 0;
            }
            .desktop-arrow-container {
                display: none;
            }
        }
        @media (min-width: 1025px) {
            .mobile-arrow-container {
                display: none;
            }
        }
        
        /* Mobile Straight Arrows */
        .path-draw-mobile-1, .path-draw-mobile-2 {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
        }
        .path-draw-mobile-1 { animation: drawLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards; }
        .path-draw-mobile-2 { animation: drawLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) 4s forwards; }
        
        .packet-mobile-1 { offset-path: path('M 50 10 L 50 90'); animation: movePacket 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards; opacity: 0; }
        .packet-mobile-2 { offset-path: path('M 50 10 L 50 90'); animation: movePacket 1.5s cubic-bezier(0.4, 0, 0.2, 1) 4s forwards; opacity: 0; }
      `}} />

            <div className="text-center mb-16 fade-in-up">
                <h2 className="section-title">Hogyan működik a platform?</h2>
                <p className="section-subtitle max-w-2xl mx-auto">
                    Szupergyors és átlátható – kötjük össze az elromlott csapokat a leggyorsabban kiérkező szerelőkkel. Mint a taxirendelés, csak a lakásodhoz.
                </p>
            </div>

            <div className="anim-grid relative">
                <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[300px] bg-gradient-to-r from-blue-100/30 via-emerald-100/30 to-teal-100/30 blur-3xl -z-10 rounded-full opacity-50"></div>

                {/* ==============================================
             1. THE PROBLEM (Left)
             ============================================== */}
                <div className="stagger-1 flex flex-col items-center">
                    {/* House Card */}
                    <div className="house-shake bg-white w-32 h-36 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center relative">

                        {/* Windows with issues */}
                        <div className="flex gap-4 mb-2">
                            {/* Water leak */}
                            <div className="w-8 h-10 border-2 border-slate-200 rounded-md bg-blue-50 relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 bg-blue-300 w-full animate-pulse" style={{ height: '40%' }}></div>
                                <div className="absolute top-0 left-1/2 w-1 h-full bg-blue-400 -translate-x-1/2"></div>
                            </div>
                            {/* Electricity */}
                            <div className="w-8 h-10 border-2 border-amber-300 rounded-md bg-amber-50 relative flex items-center justify-center">
                                <svg className="w-5 h-5 spark" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            </div>
                        </div>

                        {/* Angry User in Door */}
                        <div className="w-10 h-14 border-t-2 border-x-2 border-slate-200 rounded-t-lg mt-auto flex flex-col items-center justify-end pb-1 bg-slate-50">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="8" r="4" fill="#fee2e2"></circle>
                                <path d="M20 21a8 8 0 0 0-16 0"></path>
                                <path d="M9 7L11 9 M15 7L13 9" stroke="#b91c1c" strokeWidth="2"></path>
                            </svg>
                        </div>

                        {/* Dark broken roof */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-36 h-8 bg-slate-700 rounded-t-lg -z-10 skew-x-[-10deg]"></div>
                    </div>

                    {/* Label */}
                    <div className="mt-6 bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-red-100 mb-2">
                        Katasztrófa
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mb-1">Váratlan Hiba</div>
                    <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                        Írd le 3 kattintással, mi a gond (pl. csöpög a csap, nincs áram), akár fényképpel.
                    </p>
                </div>

                {/* ==============================================
             ARROW 1 (Desktop: Curved RIGHT | Mobile: Straight DOWN)
             ============================================== */}
                <div className="relative w-full h-[100px] flex items-center justify-center -mx-4 z-0 desktop-arrow-container">
                    <svg width="140" height="100" viewBox="0 0 140 100" className="overflow-visible">
                        <path d="M 10 50 C 50 0, 90 100, 130 50" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 10 50 C 50 0, 90 100, 130 50" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" className="path-draw-1" pathLength="100" />
                        <path d="M 119 54 L 130 50 L 128 61" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="arrow-head-1" />
                        <circle cx="0" cy="0" r="5" fill="#3b82f6" className="packet-1 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]" />
                    </svg>
                </div>

                <div className="relative mobile-arrow-container">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                        <path d="M 50 10 L 50 90" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 50 10 L 50 90" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" className="path-draw-mobile-1" pathLength="100" />
                        <path d="M 45 80 L 50 90 L 55 80" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="arrow-head-1" />
                        <circle cx="0" cy="0" r="5" fill="#3b82f6" className="packet-mobile-1 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]" />
                    </svg>
                </div>

                {/* ==============================================
             2. THE PLATFORM (Middle)
             ============================================== */}
                <div className="stagger-2 flex flex-col items-center">
                    {/* App Interface Card */}
                    <div className="bg-slate-900 w-40 h-40 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.2)] border-2 border-slate-800 overflow-hidden relative">
                        {/* Top Bar */}
                        <div className="h-6 bg-slate-800 flex items-center px-3 gap-1.5 border-b border-slate-700/50 z-20 relative">
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        </div>

                        {/* Radar Map */}
                        <div className="absolute inset-x-0 bottom-0 top-6 flex items-center justify-center overflow-hidden bg-slate-800">
                            {/* Abstract Map Background */}
                            <svg className="absolute inset-0 w-full h-full opacity-25 filter blur-[0.5px]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                                <path d="M-10,30 Q30,40 50,20 T110,30" fill="none" stroke="#94a3b8" strokeWidth="2" />
                                <path d="M20,-10 Q30,40 20,110" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                                <path d="M60,-10 L50,50 L80,110" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                                <path d="M-10,70 Q40,60 110,80" fill="none" stroke="#94a3b8" strokeWidth="2" />

                                <rect x="15" y="15" width="8" height="6" fill="#64748b" rx="1" />
                                <rect x="35" y="25" width="10" height="8" fill="#64748b" rx="1" />
                                <rect x="60" y="30" width="12" height="12" fill="#64748b" rx="1.5" />
                                <rect x="75" y="15" width="6" height="10" fill="#64748b" rx="1" />
                                <rect x="25" y="75" width="14" height="10" fill="#64748b" rx="1" />
                                <rect x="65" y="65" width="8" height="8" fill="#64748b" rx="1" />
                            </svg>

                            {/* Subtle Grid Overlay */}
                            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                            {/* Radar Circles */}
                            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="35" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.4" />
                                <circle cx="50" cy="50" r="18" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.2" />
                                <circle cx="50" cy="50" r="35" fill="none" stroke="#0ea5e9" strokeWidth="2" className="ping-circle" />
                            </svg>

                            {/* Spinning Radar sweep */}
                            <svg className="absolute w-[90%] h-[90%] radar-sweep" viewBox="0 0 100 100">
                                <path d="M50 50 L50 0 A50 50 0 0 1 100 50 Z" fill="url(#radar-scan)" />
                                <defs>
                                    <linearGradient id="radar-scan" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Incoming Lead Marker */}
                            <div className="absolute top-[30%] left-[30%] text-sky-400 lead-drop z-10">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2" className="drop-shadow-md">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3" fill="white"></circle>
                                </svg>
                                <div className="absolute top-[8px] left-[8px] w-[8px] h-[8px] bg-sky-300 rounded-full animate-ping opacity-50"></div>
                            </div>
                        </div>

                        {/* Notification Label */}
                        <div className="absolute -top-3 -right-6 bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1 z-30">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            </svg>
                            Új Lead
                        </div>
                    </div>

                    {/* Label */}
                    <div className="mt-6 bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100 mb-2">
                        Rendszer
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mb-1">Okos Kiosztás</div>
                    <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                        A rendszerünk másodperceken belül kiküldi a kérésedet a közeledben lévő szakembereknek.
                    </p>
                </div>

                {/* ==============================================
             ARROW 2 (Desktop: Curved RIGHT | Mobile: Straight DOWN)
             ============================================== */}
                <div className="relative w-full h-[100px] flex items-center justify-center -mx-4 z-0 desktop-arrow-container">
                    <svg width="140" height="100" viewBox="0 0 140 100" className="overflow-visible">
                        <path d="M 10 50 C 50 100, 90 0, 130 50" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 10 50 C 50 100, 90 0, 130 50" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" className="path-draw-2" pathLength="100" />
                        <path d="M 119 46 L 130 50 L 128 39" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="arrow-head-2" />
                        <circle cx="0" cy="0" r="5" fill="#10b981" className="packet-2 drop-shadow-[0_0_5px_rgba(16,185,129,0.6)]" />
                    </svg>
                </div>

                <div className="relative mobile-arrow-container">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                        <path d="M 50 10 L 50 90" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 50 10 L 50 90" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" className="path-draw-mobile-2" pathLength="100" />
                        <path d="M 45 80 L 50 90 L 55 80" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="arrow-head-2" />
                        <circle cx="0" cy="0" r="5" fill="#10b981" className="packet-mobile-2 drop-shadow-[0_0_5px_rgba(16,185,129,0.6)]" />
                    </svg>
                </div>

                {/* ==============================================
             3. THE PROFESSIONAL (Right)
             ============================================== */}
                <div className="stagger-3 flex flex-col items-center">
                    {/* Pro Shield Avatar */}
                    <div className="relative w-32 h-32">
                        {/* Glowing aura */}
                        <div className="absolute inset-0 bg-emerald-400 rounded-3xl blur-xl opacity-30"></div>

                        {/* Solid Green Shape */}
                        <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow-xl border-[3px] border-white flex items-center justify-center overflow-hidden z-10">
                            {/* Internal shine */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 -skew-y-12"></div>

                            {/* Wrench Tool */}
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md z-10" style={{ animation: 'dropIn 0.5s ease-out 5.8s backwards' }}>
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                            </svg>

                            {/* Sparkle Star */}
                            <svg className="absolute top-4 right-4 w-5 h-5" style={{ animation: 'scaleIn 0.3s ease-out 6.5s backwards' }} viewBox="0 0 24 24" fill="#fbbf24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>

                        {/* Success Checkmark */}
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-[3px] border-white shadow-lg pro-badge z-20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>

                        {/* 5.0 Rating */}
                        <div className="absolute -top-3 -left-4 bg-white rounded-full px-2.5 py-1 shadow-md border border-slate-100 pro-badge z-20 flex items-center gap-1" style={{ animationDelay: '6.2s' }}>
                            <span className="text-slate-800 font-bold text-xs">5.0</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                    </div>

                    {/* Label */}
                    <div className="mt-6 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 mb-2">
                        Megoldás
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mb-1">Mester Úton!</div>
                    <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                        A munkát egy minősített szerelő vállalja el, és azonnal indul hozzád!
                    </p>
                </div>
            </div>
        </div>
    );
}
