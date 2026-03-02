'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error || 'Hiba történt a kérés során.');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('Hálózati hiba történt. Kérjük próbálja újra később.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative pt-16 sm:pt-20 lg:pt-20 pb-4 sm:pb-6 flex flex-col justify-center">
            {/* Blurred background image */}
            <div className="fixed inset-0 -z-10 bg-slate-900 leading-none">
                <Image
                    src="/login_bg.webp"
                    alt="Háttér"
                    fill
                    className="object-cover blur-[8px] opacity-50"
                    quality={80}
                    priority
                />
            </div>

            <div className="max-w-md mx-auto px-3 sm:px-4 relative z-10 w-full">
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-vvm-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-6 h-6 text-vvm-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 font-heading">Elfelejtett jelszó</h1>
                        <p className="text-sm text-gray-600 mt-2">
                            Adja meg regisztrált email címét, és küldünk egy linket a jelszava visszaállításához.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-4 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email elküldve!</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Ha az email cím szerepel a rendszerünkben, hamarosan kapni fog egy levelet a jelszó visszaállításához szükséges linkkel.
                                <br /><br />
                                Kérjük, ellenőrizze a levélszemét (Spam) mappát is!
                            </p>
                            <Link
                                href="/login"
                                className="btn-primary w-full justify-center"
                            >
                                Vissza a bejelentkezéshez
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    E-mail cím
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="input-field pl-10"
                                        placeholder="pelda@email.hu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Küldés folyamatban...</span>
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-5 h-5" />
                                        <span>Visszaállító link küldése</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-500 hover:text-vvm-blue-600 transition-colors inline-flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Vissza a bejelentkezéshez
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
