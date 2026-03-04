'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Zap, ShieldCheck, ChevronRight, AlertTriangle, ArrowLeft, Wallet, Star, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { api, handleApiError } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const CREDIT_PACKAGES = [
    {
        id: 'starter',
        amount: 10000,
        bonus: 0,
        title: 'Kezdő',
        subtitle: '3-4 munka',
        description: 'Tökéletes kezdéshez.',
        popular: false,
        icon: Zap,
        color: 'from-slate-600 to-slate-800',
        btnClass: 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950',
    },
    {
        id: 'pro',
        amount: 25000,
        bonus: 2500,
        title: 'Pro',
        subtitle: '10+ munka',
        description: 'Legnépszerűbb, +10% bónusz.',
        popular: true,
        icon: Star,
        color: 'from-blue-600 to-blue-800',
        btnClass: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    },
    {
        id: 'premium',
        amount: 50000,
        bonus: 10000,
        title: 'Prémium',
        subtitle: '25+ munka',
        description: 'Nagyüzemi, +20% bónusz.',
        popular: false,
        icon: Award,
        color: 'from-amber-500 to-orange-600',
        btnClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    }
];

function TopupContent() {
    const { contractorProfile, refreshSession } = useAuth();
    const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const handleCheckout = async (pkg: typeof CREDIT_PACKAGES[0]) => {
        setLoadingPkg(pkg.id);
        setError(null);
        try {
            const response = await api.post<any>('/api/stripe/create-checkout-session', {
                amount: pkg.amount,
                bonus: pkg.bonus,
            });

            if (response.success && (response as any).url) {
                window.location.href = (response as any).url;
            } else {
                setError(response.error || 'Nincs visszaadott fizetési hivatkozás.');
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoadingPkg(null);
        }
    };

    const balance = contractorProfile?.credit_balance || 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            {/* Mobile Header */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between">
                    <Link
                        href="/contractor/dashboard"
                        className="flex items-center gap-2 text-slate-600 active:text-slate-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Vissza</span>
                    </Link>
                    <span className="text-sm font-bold text-slate-900">Kredit Feltöltés</span>
                    <div className="w-16" />
                </div>
            </div>

            {/* Desktop Breadcrumb (hidden on mobile) */}
            <div className="hidden lg:block pt-28 max-w-5xl mx-auto px-8">
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/contractor/dashboard" className="hover:text-blue-600 transition-colors">Irányítópult</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-gray-900 font-medium">Egyenleg feltöltése</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-4 lg:pt-0 pb-8 lg:pb-16">

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl lg:rounded-3xl p-5 lg:p-8 mb-6 lg:mb-10 text-white overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-blue-300" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-300 uppercase tracking-wider font-semibold">Jelenlegi egyenleg</p>
                            </div>
                        </div>
                        <p className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                            {balance.toLocaleString('hu-HU')} <span className="text-xl lg:text-2xl text-blue-300 font-medium">Ft</span>
                        </p>
                        <p className="text-sm text-slate-400 mt-2 hidden lg:block">
                            Vásárolj kreditet, hogy feloldhasd a munkák kapcsolati adatait. A fizetés a Stripe biztonságos rendszerén keresztül történik.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Packages */}
                <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                    {CREDIT_PACKAGES.map((pkg) => {
                        const IconComponent = pkg.icon;
                        return (
                            <div
                                key={pkg.id}
                                className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${pkg.popular
                                        ? 'border-blue-500 shadow-lg shadow-blue-500/10 lg:scale-105 lg:-translate-y-3'
                                        : 'border-slate-100 shadow-sm hover:border-blue-200'
                                    }`}
                            >
                                {pkg.popular && (
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 text-center">
                                        ⭐ Legnépszerűbb
                                    </div>
                                )}

                                <div className="p-5 lg:p-6">
                                    {/* Title row */}
                                    <div className="flex items-center justify-between mb-3 lg:flex-col lg:items-start lg:gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center flex-shrink-0`}>
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
                                                <p className="text-xs text-slate-500">{pkg.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right lg:text-left lg:w-full">
                                            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">{pkg.amount.toLocaleString('hu-HU')}</span>
                                            <span className="text-slate-500 text-sm font-medium ml-1">Ft</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 mb-4 lg:flex-col lg:gap-2.5 lg:mb-6">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                                            Azonnali jóváírás
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                            Stripe biztonság
                                        </span>
                                        {pkg.bonus > 0 && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                                +{pkg.bonus.toLocaleString('hu-HU')} Ft bónusz!
                                            </span>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => handleCheckout(pkg)}
                                        disabled={loadingPkg !== null}
                                        className={`w-full py-3 lg:py-3.5 px-5 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 ${pkg.btnClass} ${loadingPkg === pkg.id ? 'opacity-70 cursor-wait' : ''
                                            }`}
                                    >
                                        {loadingPkg === pkg.id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                Vásárlás
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Banner */}
                <div className="mt-6 lg:mt-12 bg-white border border-slate-200 rounded-2xl p-4 lg:p-8 flex items-start lg:items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-sm lg:text-base font-bold text-slate-900 mb-1">100% Biztonságos Fizetés</h3>
                        <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">
                            A fizetést a <strong className="text-slate-700">Stripe</strong> dolgozza fel — bankkártya adataidat nem tároljuk. A kredit azonnal jóváírásra kerül.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function TopupPage() {
    return (
        <ProtectedRoute requiredRoles={['contractor']}>
            <TopupContent />
        </ProtectedRoute>
    );
}
