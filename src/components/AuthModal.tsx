import React, { useState } from 'react';
import { setSession, UserSession } from '@/lib/auth';
import { X, Mail, Loader2, AlertCircle, User, Briefcase } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialMode?: 'login' | 'register';
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
    const [loading, setLoading] = useState(false);
    const [contractorLoading, setContractorLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Instant fake login — no Supabase needed, just sets localStorage session
    const handleQuickLogin = (role: 'customer' | 'contractor') => {
        const isContractor = role === 'contractor';
        if (isContractor) setContractorLoading(true); else setLoading(true);
        setError(null);

        const fakeId = `demo-${role}-${Date.now()}`;
        const fakeEmail = isContractor
            ? 'demo.szakember@vizvillanyfutes.hu'
            : 'demo.ugyfel@vizvillanyfutes.hu';

        const sessionData: UserSession = {
            user: {
                id: fakeId,
                email: fakeEmail,
                role: role,
                status: 'active',
            },
            session: {
                access_token: `fake-token-${fakeId}`,
                expires_at: Math.floor(Date.now() / 1000) + 86400, // 24h
            },
        };

        // Set the local session directly
        setSession(sessionData);

        // Force a full page state refresh so AuthContext picks it up
        if (onSuccess) onSuccess();

        // Small delay for visual feedback, then reload to sync AuthContext
        setTimeout(() => {
            window.location.reload();
        }, 200);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Próbáld Ki A Rendszert
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Válassz egy szerepkört és azonnal kipróbálhatod a rendszert — bejelentkezés nélkül.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('customer')}
                            disabled={loading || contractorLoading}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-4 rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <User className="w-5 h-5" />
                                    Belépés Ügyfélként
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickLogin('contractor')}
                            disabled={loading || contractorLoading}
                            className="w-full bg-vvm-blue-50 hover:bg-vvm-blue-100 text-vvm-blue-700 font-bold py-4 rounded-xl border border-vvm-blue-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {contractorLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Briefcase className="w-5 h-5" />
                                    Belépés Szakemberként
                                </>
                            )}
                        </button>

                        <div className="relative mt-8 mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500 font-medium">RENDES BEJELENTKEZÉS</span>
                            </div>
                        </div>

                        <a
                            href="/login"
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            Tovább a Bejelentkezéshez
                        </a>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-400">
                    A teszt fiókok átmeneti demo célokra szolgálnak.
                </div>
            </div>
        </div>
    );
}
