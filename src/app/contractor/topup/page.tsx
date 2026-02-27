'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Zap, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { api, handleApiError } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const CREDIT_PACKAGES = [
    {
        id: 'starter',
        amount: 10000,
        bonus: 0,
        title: 'Kezdő Csomag',
        description: 'Tökéletes kezdéshez, elég 3-4 munka feloldására.',
        popular: false,
    },
    {
        id: 'pro',
        amount: 25000,
        bonus: 2500, // +10% bónusz a UI-n
        title: 'Pro Csomag',
        description: 'A legnépszerűbb választás aktív szakembereknek.',
        popular: true,
    },
    {
        id: 'premium',
        amount: 50000,
        bonus: 10000, // +20% bónusz a UI-n
        title: 'Prémium Csomag',
        description: 'Nagyüzemi munkavállaláshoz, extra bónusszal.',
        popular: false,
    }
];

function TopupContent() {
    const { contractorProfile } = useAuth();
    const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async (pkg: typeof CREDIT_PACKAGES[0]) => {
        setLoadingPkg(pkg.id);
        setError(null);
        try {
            const response = await api.post<any>('/api/stripe/create-checkout-session', {
                amount: pkg.amount,
                bonus: pkg.bonus,
            });

            if (response.success && (response as any).sessionId) {
                const stripe = await stripePromise;
                const { error: stripeError } = await (stripe as any).redirectToCheckout({
                    sessionId: (response as any).sessionId,
                });

                if (stripeError) {
                    setError(stripeError.message || 'Stripe hiba történt.');
                }
            } else {
                setError(response.error || 'Nem sikerült elindítani a fizetést.');
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoadingPkg(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb & Header */}
                <div className="mb-8">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link href="/contractor/dashboard" className="hover:text-vvm-blue-600 transition-colors">Irányítópult</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-900 font-medium">Egyenleg feltöltése</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">Egyenleg feltöltése</h1>
                            <p className="text-gray-600 max-w-2xl">
                                Vásárolj előrefizetett lead-hozzáférési keretet (kreditet), hogy azonnal feloldhasd a számodra szimpatikus munkák kapcsolati adatait. A befizetésről a tranzakciót követően elektronikus számlát állítunk ki (közvetítői díjelőleg). A fizetés a Stripe biztonságos rendszerén keresztül történik.
                            </p>
                        </div>
                        {contractorProfile && (
                            <div className="bg-vvm-blue-50 border border-vvm-blue-100 px-6 py-4 rounded-xl text-center min-w-[200px]">
                                <p className="text-xs text-vvm-blue-800 uppercase tracking-wide font-bold mb-1">Jelenlegi Egyenleg</p>
                                <p className="text-2xl font-bold text-vvm-blue-900">{(contractorProfile.credit_balance || 0).toLocaleString('hu-HU')} Ft</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {CREDIT_PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col ${pkg.popular ? 'border-vvm-blue-500 shadow-xl scale-105 md:-translate-y-4' : 'border-gray-100 shadow-md hover:border-vvm-blue-300 hover:shadow-lg'
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <span className="bg-vvm-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-sm">
                                        Legnépszerűbb
                                    </span>
                                </div>
                            )}

                            <div className="p-8 flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                                <p className="text-gray-500 text-sm h-10 mb-6">{pkg.description}</p>

                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-gray-900">{pkg.amount.toLocaleString('hu-HU')}</span>
                                    <span className="text-gray-500 font-medium"> Ft</span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <Zap className="w-5 h-5 text-vvm-yellow-500 flex-shrink-0" />
                                        <span>Azonnali jóváírás</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700">
                                        <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span>Biztonságos fizetés (Stripe)</span>
                                    </li>
                                    {pkg.bonus > 0 && (
                                        <li className="flex items-center gap-3 text-vvm-blue-700 font-semibold bg-vvm-blue-50 p-2 rounded-lg -ml-2">
                                            <CreditCard className="w-5 h-5 text-vvm-blue-600 flex-shrink-0" />
                                            <span>+{pkg.bonus.toLocaleString('hu-HU')} Ft ajándék bónusz!</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <button
                                    onClick={() => handleCheckout(pkg)}
                                    disabled={loadingPkg !== null}
                                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${pkg.popular
                                        ? 'bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white shadow-lg focus:ring-4 focus:ring-vvm-blue-200'
                                        : 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-4 focus:ring-gray-200'
                                        } ${loadingPkg === pkg.id ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loadingPkg === pkg.id ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Vásárlás
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Security / FAQ Banner */}
                <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">100% Biztonságos Fizetés</h3>
                        <p className="text-gray-600">
                            A fizetési tranzakciókat a világ egyik legmegbízhatóbb rendszere, a <strong>Stripe</strong> dolgozza fel.
                            A bankkártya adataidat mi nem tároljuk és nem is látjuk. A sikeres fizetés után a kreditek
                            automatikusan és azonnal jóváírásra kerülnek az egyenlegeden.
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
