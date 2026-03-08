'use client';

import React, { useEffect, useState } from 'react';

export default function HowItWorksAnimation() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full text-center relative pointer-events-none min-h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-vvm-blue-500 border-t-vvm-blue-200 rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="w-full text-center relative pointer-events-none mb-12">
            <style dangerouslySetInnerHTML={{
                __html: `
        .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .stagger-1 { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards; opacity: 0; transform: scale(0.8); }
        .stagger-2 { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s forwards; opacity: 0; transform: scale(0.8); }
        .stagger-3 { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards; opacity: 0; transform: scale(0.8); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes subtlePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.15); } 50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); } }
        .icon-pulse-red { animation: subtlePulse 3s ease-in-out infinite; }
      `}} />

            <div className="text-center mb-10 fade-in-up">
                <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold font-heading text-vvm-blue-900 tracking-tight">Hogyan működik a platform?</h2>
                <p className="text-base md:text-lg font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed mt-3">
                    Szupergyors és átlátható: összekötjük az elromlott csapokat a leggyorsabban kiérkező szerelőkkel. Mint a taxirendelés, csak a lakásodhoz.
                </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden">

                {/* ===== MOBILE: Vertical Premium Timeline ===== */}
                <div className="lg:hidden bg-gradient-to-b from-white via-white to-slate-50/80 py-8 px-5 sm:px-8 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] border border-slate-100/80 max-w-[400px] mx-auto">
                    <div className="relative pl-8">
                        {/* Dotted Flowing Line */}
                        <div className="absolute left-[29px] top-8 bottom-6 w-px border-l-2 border-dashed border-slate-200/60"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex gap-5 mb-10 stagger-1">
                            <div className="relative shrink-0 -ml-1">
                                {/* Step Number Badge */}
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center z-20 shadow-sm ring-2 ring-white">1</div>
                                {/* Icon Circle */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/60 flex items-center justify-center text-red-500 shadow-[0_4px_12px_-2px_rgba(239,68,68,0.12)] icon-pulse-red">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-left pt-1.5">
                                <span className="inline-block text-[9px] font-extrabold text-red-500 uppercase tracking-[0.15em] mb-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100/80">Katasztrófa</span>
                                <h4 className="text-[18px] font-extrabold text-slate-900 mb-1 leading-tight tracking-tight">Váratlan hiba</h4>
                                <p className="text-[13px] text-slate-500 leading-relaxed">Írd le 3 kattintással a gondot, szükség esetén fotóval.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex gap-5 mb-10 stagger-2">
                            <div className="relative shrink-0 -ml-1">
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center z-20 shadow-sm ring-2 ring-white">2</div>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 flex items-center justify-center text-blue-500 shadow-[0_4px_12px_-2px_rgba(59,130,246,0.12)]">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        <line x1="11" y1="8" x2="11" y2="14" />
                                        <line x1="8" y1="11" x2="14" y2="11" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-left pt-1.5">
                                <span className="inline-block text-[9px] font-extrabold text-blue-500 uppercase tracking-[0.15em] mb-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/80">Rendszer</span>
                                <h4 className="text-[18px] font-extrabold text-slate-900 mb-1 leading-tight tracking-tight">Okos Kiosztás</h4>
                                <p className="text-[13px] text-slate-500 leading-relaxed">Rendszerünk másodperceken belül keresi a közelben lévő szakembereket.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex gap-5 stagger-3">
                            <div className="relative shrink-0 -ml-1">
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center z-20 shadow-sm ring-2 ring-white">3</div>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 flex items-center justify-center text-emerald-500 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.12)]">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-left pt-1.5">
                                <span className="inline-block text-[9px] font-extrabold text-emerald-500 uppercase tracking-[0.15em] mb-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80">Megoldás</span>
                                <h4 className="text-[18px] font-extrabold text-slate-900 mb-1 leading-tight tracking-tight">Mester Úton!</h4>
                                <p className="text-[13px] text-slate-500 leading-relaxed">A munkát a mester elvállalta, azonnal indul hozzád.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== DESKTOP: Card-based horizontal layout ===== */}
                <div className="hidden lg:flex items-stretch justify-center gap-0 relative max-w-6xl mx-auto">

                    {/* Step 1 Card */}
                    <div className="flex-1 flex flex-col items-center text-center stagger-1 bg-white rounded-2xl p-10 pb-8 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-shadow">
                        <div className="relative mb-6">
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center z-20 shadow-sm ring-2 ring-white">1</div>
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/60 flex items-center justify-center text-red-500">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                                </svg>
                            </div>
                        </div>
                        <span className="inline-block text-[10px] font-extrabold text-red-500 uppercase tracking-[0.15em] mb-2 bg-red-50 px-3 py-1 rounded-full border border-red-100/80">Katasztrófa</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Váratlan hiba</h4>
                        <p className="text-base text-slate-500 leading-relaxed">Írd le 3 kattintással, mi a gond (pl. csöpög a csap, nincs áram), akár fényképpel.</p>
                    </div>

                    {/* Arrow 1→2 */}
                    <div className="flex items-center px-5 shrink-0 text-slate-300 self-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>

                    {/* Step 2 Card */}
                    <div className="flex-1 flex flex-col items-center text-center stagger-2 bg-white rounded-2xl p-10 pb-8 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-shadow">
                        <div className="relative mb-6">
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center z-20 shadow-sm ring-2 ring-white">2</div>
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 flex items-center justify-center text-blue-500">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="11" y1="8" x2="11" y2="14" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                            </div>
                        </div>
                        <span className="inline-block text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.15em] mb-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">Rendszer</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Okos Kiosztás</h4>
                        <p className="text-base text-slate-500 leading-relaxed">Rendszerünk másodperceken belül kiküldi a kérésedet a közeledben lévő szakembereknek.</p>
                    </div>

                    {/* Arrow 2→3 */}
                    <div className="flex items-center px-5 shrink-0 text-slate-300 self-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>

                    {/* Step 3 Card */}
                    <div className="flex-1 flex flex-col items-center text-center stagger-3 bg-white rounded-2xl p-10 pb-8 border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-shadow">
                        <div className="relative mb-6">
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center z-20 shadow-sm ring-2 ring-white">3</div>
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 flex items-center justify-center text-emerald-500">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                        </div>
                        <span className="inline-block text-[10px] font-extrabold text-emerald-500 uppercase tracking-[0.15em] mb-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/80">Megoldás</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Mester Úton!</h4>
                        <p className="text-base text-slate-500 leading-relaxed">A munkát egy minősített szerelő vállalja el, és azonnal indul hozzád.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
