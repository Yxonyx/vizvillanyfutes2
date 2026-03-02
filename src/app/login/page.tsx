'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, User, Wrench, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react';
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
  const modeParam = searchParams.get('mode');

  const [loginMode, setLoginMode] = useState<'contractor' | 'customer'>(roleParam === 'customer' ? 'customer' : 'contractor');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [isCustomerRegister, setIsCustomerRegister] = useState(modeParam === 'register');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const justRegistered = useRef(false);

  // OTP verification states
  const [regStep, setRegStep] = useState<'email' | 'code'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already authenticated (but NOT right after registration)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !justRegistered.current && !registerSuccess) {
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
  }, [isAuthenticated, isLoading, role, router, redirect, registerSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password, loginMode);

    if (!result.success) {
      setError(result.error || 'Bejelentkezés sikertelen');
      setIsSubmitting(false);
    }
    // Redirect happens in useEffect when isAuthenticated changes
  };

  // REGISTRATION Step 1: Validate email+password, then send OTP code
  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (customerPassword.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Nem sikerült elküldeni a kódot.');
        if (data.error?.includes('már regisztrálva')) {
          setIsCustomerRegister(false);
        }
      } else {
        setRegStep('code');
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {
      setError('Hiba történt. Kérjük próbálja újra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // REGISTRATION Step 2: Verify OTP code, then create account
  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Verify the OTP code first
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, code: otpCode }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData.error || 'Érvénytelen vagy lejárt kód.');
        setIsSubmitting(false);
        return;
      }

      // Code verified! Now create the account
      justRegistered.current = true;

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: customerEmail,
        password: customerPassword,
        options: { data: { role: 'customer' } },
      });
      if (signUpError) { justRegistered.current = false; throw signUpError; }
      if (!authData.user) { justRegistered.current = false; throw new Error('Nem sikerült létrehozni a fiókot.'); }

      const { error: metaError } = await supabase.from('user_meta').insert({
        user_id: authData.user.id,
        role: 'customer',
        status: 'active',
      });
      if (metaError && !metaError.message.includes('duplicate')) {
        console.warn('user_meta insert warning:', metaError);
      }

      await supabase.auth.signOut();
      setRegisterSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Ez az email cím már regisztrálva van. Jelentkezzen be.');
        setIsCustomerRegister(false);
        setRegStep('email');
      } else {
        setError(err.message || 'Hiba történt.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOGIN existing customer (classic email + password)
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(customerEmail, customerPassword, loginMode);
      if (!result.success) {
        setError(result.error || 'Bejelentkezés sikertelen.');
      }
    } catch {
      setError('Hiba történt.');
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

      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 relative z-10 w-full">
        <Breadcrumbs className="mb-2 sm:mb-4" />

        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
          <div className="text-center mb-4 sm:mb-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-heading">Bejelentkezés</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Válassza ki a fiókja típusát</p>
          </div>

          <div className="flex bg-gray-50/80 border border-gray-200 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl mb-4 sm:mb-5 w-full">
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

          {loginMode === 'customer' && !registerSuccess && (
            <div className="bg-vvm-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-vvm-blue-800 text-center">
                {isCustomerRegister
                  ? (regStep === 'code'
                    ? '📧 Ellenőrizze a postaládáját és írja be a 6 számjegyű megerősítő kódot!'
                    : '👋 Adja meg az email címét és válasszon jelszót – utána megerősítő kódot küldünk!')
                  : '👋 Üdvözöljük! Jelentkezzen be az email címével és jelszavával.'}
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
            registerSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sikeres regisztráció!</h3>
                <p className="text-gray-600 mb-6">
                  A fiók létrejött. Most már bejelentkezhet.
                </p>
                <button
                  onClick={() => { justRegistered.current = false; setRegisterSuccess(false); setIsCustomerRegister(false); setRegStep('email'); setOtpCode(''); }}
                  className="btn-primary w-full justify-center"
                >
                  <LogIn className="w-5 h-5" />
                  Bejelentkezés
                </button>
              </div>
            ) : isCustomerRegister && regStep === 'code' ? (
              /* ===== REGISTRATION Step 2: Enter OTP code ===== */
              <form onSubmit={handleRegisterStep2} className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Kód elküldve ide: <strong>{customerEmail}</strong></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">6 számjegyű megerősítő kód</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <button type="submit" disabled={isSubmitting || otpCode.length !== 6} className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Ellenőrzés és fiók létrehozása...</span></>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /><span>Megerősítés és regisztráció</span></>
                  )}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setRegStep('email'); setOtpCode(''); setError(null); }} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Vissza
                  </button>
                  <button type="button" disabled={resendCooldown > 0 || isSubmitting} onClick={(e) => handleRegisterStep1(e as any)} className="text-vvm-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline">
                    {resendCooldown > 0 ? `Újraküldés (${resendCooldown}s)` : 'Kód újraküldése'}
                  </button>
                </div>
              </form>
            ) : (
              /* ===== EMAIL + PASSWORD form (used for BOTH login and registration step 1) ===== */
              <form onSubmit={isCustomerRegister ? handleRegisterStep1 : handleCustomerLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail cím</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" required autoComplete="email" className="input-field pl-10" placeholder="az-on-email-cime@pelda.hu" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jelszó</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCustomerPassword ? 'text' : 'password'}
                      required
                      autoComplete={isCustomerRegister ? 'new-password' : 'current-password'}
                      className="input-field pl-10 pr-10"
                      placeholder={isCustomerRegister ? 'Legalább 6 karakter' : '••••••••'}
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCustomerPassword(!showCustomerPassword)}>
                      {showCustomerPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting || !customerEmail || !customerPassword} className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{isCustomerRegister ? 'Kód küldése...' : 'Bejelentkezés...'}</span></>
                  ) : (
                    <>
                      {isCustomerRegister ? <Mail className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                      <span>{isCustomerRegister ? 'Megerősítő kód küldése' : 'Bejelentkezés'}</span>
                    </>
                  )}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => { setIsCustomerRegister(!isCustomerRegister); setError(null); setRegStep('email'); setOtpCode(''); }} className="text-vvm-blue-600 hover:underline text-sm font-medium">
                    {isCustomerRegister ? 'Már van fiókom — Bejelentkezés' : 'Nincs még fiókom — Regisztráció'}
                  </button>
                </div>
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
