import React from 'react';
import { useRouter } from 'next/navigation';
import { X, LogIn, User, Wrench } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialMode?: 'login' | 'register';
}

export default function AuthModal({ onClose }: AuthModalProps) {
    const router = useRouter();

    const handleLogin = (role: 'customer' | 'contractor') => {
        onClose();
        router.push(`/login?role=${role}`);
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
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Bejelentkezés szükséges
                        </h2>
                        <p className="text-slate-500 text-sm">
                            A térkép használatához és a bejelentések kezeléséhez kérjük, jelentkezzen be.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => handleLogin('customer')}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-4 rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <User className="w-5 h-5" />
                            Belépés Ügyfélként
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLogin('contractor')}
                            className="w-full bg-vvm-blue-50 hover:bg-vvm-blue-100 text-vvm-blue-700 font-bold py-4 rounded-xl border border-vvm-blue-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Wrench className="w-5 h-5" />
                            Belépés Szakemberként
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-400">
                    Biztonságos bejelentkezés a Supabase rendszerén keresztül.
                </div>
            </div>
        </div>
    );
}
