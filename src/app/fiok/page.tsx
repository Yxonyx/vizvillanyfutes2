'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { User, Mail, Shield, CreditCard, Bell, LogOut, ArrowLeft, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';

export default function FiokPage() {
    const { user, role, logout, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Bejelentkezés szükséges</h1>
                    <p className="text-slate-500 mb-4">A fiók adatainak megtekintéséhez be kell jelentkezned.</p>
                    <Link href="/" className="text-vvm-blue-600 font-bold hover:underline">
                        Vissza a főoldalra
                    </Link>
                </div>
            </div>
        );
    }

    const isContractor = role === 'contractor';

    const handleLogout = async () => {
        try {
            await logout();
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            window.location.href = '/';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm mt-16">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Fiók Adataim</h1>
                </div>
            </div>



            <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-6">

                {/* Profile Card */}
                <div className="bg-slate-800 text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden mb-4 border border-slate-700">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-vvm-blue-500/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <User className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-base sm:text-lg truncate mb-1">
                                {user.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-700/50 w-fit px-2.5 py-1 rounded-md border border-slate-600/50">
                                {isContractor ? (
                                    <><Shield className="w-3.5 h-3.5 text-emerald-400" /> Szakember Partner</>
                                ) : (
                                    <><User className="w-3.5 h-3.5 text-blue-400" /> Regisztrált Ügyfél</>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            <Mail className="w-3.5 h-3.5" /> Email cím
                        </label>
                        <div className="text-slate-800 font-medium text-[15px]">{user.email}</div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            <Shield className="w-3.5 h-3.5" /> Szerepkör
                        </label>
                        <div className="text-slate-800 font-medium text-[15px]">
                            {isContractor ? 'Regisztrált Szakember' : 'Regisztrált Ügyfél'}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Jelszó módosítása</label>
                        <button className="text-sm font-bold text-vvm-blue-600 hover:text-vvm-blue-800 transition-colors flex items-center gap-1">
                            Jelszócsere e-mail küldése <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Contractor: Credit Balance */}
                {isContractor && (
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-slate-300" />
                            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Kredit egyenleg</span>
                        </div>
                        <div className="text-3xl font-black font-mono mt-1">42 500 Ft</div>
                        <Link href="/contractor/topup" className="mt-3 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2 px-4 rounded-xl transition-colors">
                            + Kredit feltöltés
                        </Link>
                    </div>
                )}

                {/* Contractor: Stats */}
                {isContractor && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                            <Briefcase className="w-6 h-6 text-vvm-blue-600 mx-auto mb-2" />
                            <div className="text-3xl font-black text-slate-800">0</div>
                            <div className="text-xs text-slate-500 font-medium mt-1">Elvállalt munka</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                            <FileText className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                            <div className="text-3xl font-black text-emerald-600">0</div>
                            <div className="text-xs text-slate-500 font-medium mt-1">Befejezett munka</div>
                        </div>
                    </div>
                )}

                {/* Customer: Report stats */}
                {!isContractor && (
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-emerald-100" />
                            <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Bejelentéseim</span>
                        </div>
                        <div className="text-3xl font-black font-mono mt-1">0 db</div>
                        <div className="text-sm text-emerald-200 mt-1">Aktív probléma bejelentés</div>
                    </div>
                )}

                {/* Notifications (contractor) */}
                {isContractor && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Bell className="w-4 h-4 text-slate-500" />
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Értesítések</label>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Új SOS munkák pittyegése</span>
                            <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer transition-colors">
                                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-transform" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-medium text-slate-700">Email értesítések</span>
                            <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer transition-colors">
                                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-transform" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-colors border border-red-200 flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Kijelentkezés
                </button>

            </div>
        </div>
    );
}
