'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, ArrowLeft, Clock, CheckCircle, User, Mail, MessageSquare, Send } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatHungarianPhone, isValidHungarianPhone } from '@/utils/phoneFormat';

const callTimeLabels: Record<string, string> = {
  asap: 'Amilyen hamar lehet',
  morning: 'Délelőtt (8:00-12:00)',
  afternoon: 'Délután (12:00-16:00)',
  evening: 'Este (16:00-20:00)',
};

export default function VisszahivasPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    preferredTime: 'asap',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'callback',
          data: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            message: formData.message,
            callTime: callTimeLabels[formData.preferredTime] || formData.preferredTime,
          },
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Hiba történt a küldés során. Kérjük próbálja újra vagy hívjon minket telefonon.');
      }
    } catch {
      alert('Hiba történt a küldés során. Kérjük próbálja újra vagy hívjon minket telefonon.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Köszönjük!</h1>
          <p className="text-gray-600 mb-8">
            Visszahívási kérését rögzítettük. Munkatársunk hamarosan felveszi Önnel a kapcsolatot
            a megadott telefonszámon.
          </p>
          <div className="bg-vvm-blue-50 rounded-xl p-4 mb-8">
            <p className="text-vvm-blue-800 font-medium">
              Várható visszahívás: {formData.preferredTime === 'asap' ? '15 percen belül' : 'a választott időpontban'}
            </p>
          </div>
          <Link href="/" className="btn-primary inline-flex">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHungarianPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const isPhoneValid = formData.phone === '' || isValidHungarianPhone(formData.phone);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs className="mb-6 text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Visszahívást kérek
              </h1>
              <p className="text-blue-200 mt-1">Hívjuk mi Önt!</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md">
            <Clock className="w-6 h-6 text-vvm-yellow-400" />
            <p className="text-blue-100">
              <strong className="text-white">15 percen belül</strong> visszahívjuk munkanapokon 8:00-20:00 között
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Teljes név *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="Kovács János"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonszám *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    className={`input-field pl-10 ${!isPhoneValid ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="+36 30 123 4567"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
                {!isPhoneValid && (
                  <p className="mt-1 text-sm text-red-600">Kérjük, adjon meg érvényes magyar telefonszámot</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail (opcionális)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    className="input-field pl-10"
                    placeholder="pelda@email.hu"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Mikor hívhatjuk?
                </label>
                <select
                  id="preferredTime"
                  className="input-field"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                >
                  <option value="asap">Amilyen hamar lehet</option>
                  <option value="morning">Délelőtt (8:00-12:00)</option>
                  <option value="afternoon">Délután (12:00-16:00)</option>
                  <option value="evening">Este (16:00-20:00)</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Rövid leírás a problémáról (opcionális)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="message"
                    rows={4}
                    className="input-field pl-10"
                    placeholder="Pl.: Csöpög a konyhai csap, szeretném kicseréltetni..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Küldés...
                  </span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Visszahívás kérése</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Az elküldéssel elfogadja az{' '}
              <Link href="/adatkezeles" className="text-vvm-blue-600 hover:underline">
                adatkezelési tájékoztatót
              </Link>.
            </p>
          </div>

          {/* Alternative */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Vagy írjon nekünk e-mailben:</p>
            <a
              href="mailto:info@vizvillanyfutes.hu"
              className="inline-flex items-center gap-2 text-2xl font-bold text-vvm-blue-600 hover:text-vvm-blue-700"
            >
              <Mail className="w-6 h-6" />
              info@vizvillanyfutes.hu
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
