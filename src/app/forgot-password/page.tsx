'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Hiba történt. Kérjük próbáld újra később.');
      }
    } catch {
      setError('Hiba történt. Kérjük próbáld újra később.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading mb-4">Email elküldve!</h1>
            <p className="text-gray-600 mb-6">
              Ha a megadott email cím ({email}) regisztrálva van a rendszerben, 
              küldtünk egy linket a jelszó visszaállításához.
            </p>
            <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                <strong>Fontos:</strong> Ellenőrizd a spam/levélszemét mappát is, 
                ha nem találod az emailt a beérkezett üzenetek között.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/login" className="btn-primary w-full justify-center">
                Vissza a bejelentkezéshez
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="btn-outline w-full justify-center"
              >
                Másik email cím megadása
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
      <div className="max-w-md mx-auto px-4">
        <Breadcrumbs className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-vvm-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-vvm-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Elfelejtett jelszó</h1>
            <p className="text-gray-600 mt-2">
              Add meg az email címedet és küldünk egy linket a jelszó visszaállításához.
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
                  <span>Küldés...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Visszaállító link küldése</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-vvm-blue-600 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Vissza a bejelentkezéshez</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
