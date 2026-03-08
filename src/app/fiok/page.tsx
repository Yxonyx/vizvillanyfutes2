'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Mail, LogOut, ArrowLeft, KeyRound, ChevronRight, User, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function FiokPage() {
    const { user, role, logout, isAuthenticated, isLoading, contractorProfile, refreshSession } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            refreshSession();
        }
    }, [isAuthenticated, refreshSession]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-6 h-6 border-2 border-vvm-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Bejelentkezés szükséges</h1>
                    <p className="text-slate-500 text-sm mb-4">A fiók adatainak megtekintéséhez be kell jelentkezned.</p>
                    <Link href="/" className="text-vvm-blue-600 font-semibold text-sm hover:underline">
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

    const handlePasswordReset = async () => {
        if (!user.email) return;
        try {
            await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/fiok`,
            });
            alert('Jelszócsere e-mail elküldve!');
        } catch (e) {
            console.error('Password reset error:', e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 mt-16">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href={isContractor ? '/contractor/dashboard' : '/ugyfel/dashboard'} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="text-base font-bold text-slate-800">Fiók beállítások</h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-5">

                {/* Profile summary */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-vvm-blue-50 border border-vvm-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-vvm-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-[15px] truncate">{user.email}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                                {isContractor ? 'Szakember partner' : 'Regisztrált ügyfél'}
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${isContractor ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-vvm-blue-600 border border-blue-100'}`}>
                            {isContractor ? 'Szakember' : 'Ügyfél'}
                        </span>
                    </div>
                </div>

                {/* Account details */}
                <div>
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-1">Fiók adatok</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                        {/* Email */}
                        <div className="px-4 py-3.5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">E-mail cím</div>
                                <div className="text-sm font-semibold text-slate-700 mt-0.5">{user.email}</div>
                            </div>
                        </div>

                        {/* Password change */}
                        <button
                            onClick={handlePasswordReset}
                            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-700">Jelszó módosítása</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">Jelszócsere e-mail küldése</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* Contractor: Credit Balance */}
                {isContractor && (
                    <div>
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-1">Egyenleg</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Kredit egyenleg</div>
                                        <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">
                                            {contractorProfile ? (contractorProfile.credit_balance || 0).toLocaleString('hu-HU') : 0} <span className="text-xs font-semibold text-slate-400">Ft</span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/contractor/topup"
                                    className="bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-colors"
                                >
                                    Feltöltés
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <div className="pt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Kijelentkezés
                    </button>
                </div>

            </div>
        </div>
    );
}
