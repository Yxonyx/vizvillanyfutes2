'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get tokens from URL (Supabase sends these in the email link)
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === passwordConfirm;

  // Check if we have valid reset tokens
  useEffect(() => {
    if (type !== 'recovery' || !accessToken) {
      setError('Érvénytelen vagy lejárt jelszó-visszaállító link. Kérj új linket.');
    }
  }, [type, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('A két jelszó nem egyezik.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 3000);
      } else {
        setError(data.error || 'Hiba történt. Kérjük próbáld újra.');
      }
    } catch {
      setError('Hiba történt. Kérjük próbáld újra később.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading mb-4">Jelszó megváltoztatva!</h1>
            <p className="text-gray-600 mb-6">
              A jelszavad sikeresen megváltozott. Átirányítunk a bejelentkezési oldalra...
            </p>
            <div className="w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Link href="/login" className="text-vvm-blue-600 hover:underline text-sm">
              Vagy kattints ide a bejelentkezéshez
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (error && (!accessToken || type !== 'recovery')) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading mb-4">Érvénytelen link</h1>
            <p className="text-gray-600 mb-6">
              Ez a jelszó-visszaállító link érvénytelen vagy lejárt. 
              Kérj új linket az elfelejtett jelszó oldalon.
            </p>
            <div className="space-y-3">
              <Link href="/forgot-password" className="btn-primary w-full justify-center">
                Új link kérése
              </Link>
              <Link href="/login" className="btn-outline w-full justify-center">
                Vissza a bejelentkezéshez
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-vvm-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-vvm-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Új jelszó megadása</h1>
            <p className="text-gray-600 mt-2">
              Add meg az új jelszavadat a bejelentkezéshez.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Új jelszó
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`input-field pl-10 pr-10 ${password && !isPasswordValid ? 'border-red-500' : ''}`}
                  placeholder="Minimum 8 karakter"
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
              {password && !isPasswordValid && (
                <p className="mt-1 text-sm text-red-600">Minimum 8 karakter szükséges</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Új jelszó megerősítése
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`input-field pl-10 ${passwordConfirm && !doPasswordsMatch ? 'border-red-500' : ''}`}
                  placeholder="Jelszó újra"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              {passwordConfirm && !doPasswordsMatch && (
                <p className="mt-1 text-sm text-red-600">A két jelszó nem egyezik</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mentés...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Jelszó megváltoztatása</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
