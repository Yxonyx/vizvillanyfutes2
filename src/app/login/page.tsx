'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, User, Wrench, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Breadcrumbs from '@/components/Breadcrumbs';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, role, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirect = searchParams.get('redirect');
  const expired = searchParams.get('expired');
  const roleParam = searchParams.get('role');

  const [loginMode, setLoginMode] = useState<'contractor' | 'customer'>(roleParam === 'customer' ? 'customer' : 'contractor');
  const [customerEmail, setCustomerEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (redirect) {
        router.push(redirect);
      } else if (role === 'contractor') {
        router.push('/contractor/dashboard');
      } else if (role === 'admin' || role === 'dispatcher') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, role, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || 'Bejelentkezés sikertelen');
      setIsSubmitting(false);
    }
    // Redirect happens in useEffect when isAuthenticated changes
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: customerEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/ugyfel/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Hiba történt a link küldésekor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Átirányítás...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-16 sm:pt-24 lg:pt-28 pb-6 sm:pb-12 flex flex-col justify-center">
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

      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 relative z-10 w-full">
        <Breadcrumbs className="mb-4 sm:mb-6" />

        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading">Bejelentkezés</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Válassza ki a fiókja típusát</p>
          </div>

          <div className="flex bg-gray-50/80 border border-gray-200 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 w-full">
            <button
              onClick={() => setLoginMode('contractor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-[15px] transition-all font-semibold ${loginMode === 'contractor'
                ? 'bg-white text-vvm-blue-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-vvm-blue-600 hover:bg-gray-100/80 border border-transparent'
                }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Szakember</span>
            </button>
            <button
              onClick={() => setLoginMode('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-[15px] transition-all font-semibold ${loginMode === 'customer'
                ? 'bg-white text-vvm-blue-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-vvm-blue-600 hover:bg-gray-100/80 border border-transparent'
                }`}
            >
              <User className="w-4 h-4" />
              <span>Ügyfél</span>
            </button>
          </div>

          {loginMode === 'contractor' && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 text-center">
                🔧 Ez a felület a regisztrált <strong>vízszerelők, villanyszerelők és fűtésszerelők</strong> számára készült,
                ahol a munkáikat kezelhetik.
              </p>
            </div>
          )}

          {loginMode === 'customer' && !magicLinkSent && (
            <div className="bg-vvm-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-vvm-blue-800 text-center">
                👋 Üdvözöljük! Adja meg az email címét, és egy biztonságos (jelszó nélküli) belépő linket küldünk, amivel elérheti a bejelentéseit.
              </p>
            </div>
          )}

          {expired && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                A munkamenet lejárt. Kérjük jelentkezz be újra.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loginMode === 'contractor' ? (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jelszó
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Bejelentkezés...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Bejelentkezés</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            magicLinkSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ellenőrizze az email fiókját!</h3>
                <p className="text-gray-600 mb-6">
                  Elküldtük a belépési linket a(z) <strong>{customerEmail}</strong> címre.
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="btn-outline w-full justify-center"
                >
                  Másik email címet próbálok
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomerSubmit} className="space-y-6">
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
                      placeholder="az-on-email-cime@pelda.hu"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !customerEmail}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Link küldése...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Belépési link kérése</span>
                    </>
                  )}
                </button>
              </form>
            )
          )}

          {loginMode === 'contractor' && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Még nincs fiókod?{' '}
                <Link href="/csatlakozz-partnerkent" className="text-vvm-blue-600 hover:underline font-medium">
                  Jelentkezz partnerként
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
