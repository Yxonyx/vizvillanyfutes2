'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Send, CheckCircle,
  MessageSquare, User
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatHungarianPhone, isValidHungarianPhone } from '@/utils/phoneFormat';

export default function KapcsolatPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
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
          type: 'contact',
          data: formData,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Hiba történt a küldés során. Kérjük próbálja újra később.');
      }
    } catch {
      alert('Hiba történt a küldés során. Kérjük próbálja újra később.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHungarianPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const isPhoneValid = formData.phone === '' || isValidHungarianPhone(formData.phone);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Breadcrumbs className="mb-6 justify-center text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Kapcsolat
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Kérdése van? Segítségre van szüksége? Lépjen kapcsolatba velünk!
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-vvm-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-vvm-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Visszahívás</h3>
                    <Link href="/visszahivas" className="text-vvm-blue-600 font-semibold hover:underline">
                      Visszahívást kérek →
                    </Link>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Hétfő-Péntek: 8:00-20:00<br />
                  Szombat: 9:00-14:00<br />
                  <span className="text-amber-600 font-medium">SOS: 0-24</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-vvm-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-vvm-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">E-mail</h3>
                    <a href="mailto:info@vizvillanyfutes.hu" className="text-vvm-blue-600 font-semibold hover:underline">
                      info@vizvillanyfutes.hu
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Válaszidő: általában 24 órán belül
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-vvm-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-vvm-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Szolgáltatási terület</h3>
                    <p className="text-gray-700">
                      Budapest és<br />
                      Pest megye
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-vvm-blue-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-3">Gyors segítség</h3>
                <div className="space-y-3">
                  <Link href="/gyik" className="flex items-center gap-2 text-blue-100 hover:text-white">
                    → Gyakran Ismételt Kérdések
                  </Link>
                  <Link href="/arak" className="flex items-center gap-2 text-blue-100 hover:text-white">
                    → Áraink
                  </Link>
                  <Link href="/szolgaltatasi-teruletek" className="flex items-center gap-2 text-blue-100 hover:text-white">
                    → Szolgáltatási területek
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                {!isSubmitted ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Írjon nekünk</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
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
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            E-mail cím *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              id="email"
                              type="email"
                              required
                              className="input-field pl-10"
                              placeholder="pelda@email.hu"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Telefonszám
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              id="phone"
                              type="tel"
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
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Tárgy *
                          </label>
                          <select
                            id="subject"
                            required
                            className="input-field"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          >
                            <option value="">Válasszon...</option>
                            <option value="Általános kérdés">Általános kérdés</option>
                            <option value="Árajánlat kérés">Árajánlat kérés</option>
                            <option value="Panasz">Panasz</option>
                            <option value="Partneri együttműködés">Partneri együttműködés</option>
                            <option value="Egyéb">Egyéb</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Üzenet *
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            id="message"
                            rows={6}
                            required
                            className="input-field pl-10"
                            placeholder="Írja le részletesen a kérdését vagy kérését..."
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="privacy"
                          required
                          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-vvm-blue-600"
                        />
                        <label htmlFor="privacy" className="text-sm text-gray-600">
                          Elfogadom az{' '}
                          <Link href="/adatkezeles" className="text-vvm-blue-600 hover:underline">
                            adatkezelési tájékoztatót
                          </Link>
                          . *
                        </label>
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
                            <span>Üzenet küldése</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Köszönjük üzenetét!</h2>
                    <p className="text-gray-600 mb-8">
                      Munkatársunk hamarosan felveszi Önnel a kapcsolatot.
                    </p>
                    <Link href="/" className="btn-primary inline-flex">
                      Vissza a főoldalra
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Irodánk</h3>
            <p className="text-gray-600">1033 Budapest, Bódani út 2.</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2694.0!2d19.0412!3d47.5562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741d94c5a5c0001%3A0x1!2zQsOzZGFuaSDDunQgMiwgQnVkYXBlc3QsIDEwMzM!5e0!3m2!1shu!2shu!4v1700000000000!5m2!1shu!2shu"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="VízVillanyFűtés iroda - Budapest, Bódani út 2."
            ></iframe>
          </div>
        </div>
      </section>

      {/* Coverage Area Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-vvm-blue-50 to-vvm-blue-100 rounded-2xl p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto">
              <MapPin className="w-12 h-12 text-vvm-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Szolgáltatási területünk</h3>
              <p className="text-gray-600 mb-6">
                Budapest teljes területe (I–XXIII. kerület) és Pest megye településein vállalunk munkát.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Budaörs', 'Érd', 'Szentendre', 'Dunakeszi', 'Gödöllő', 'Vecsés', 'Szigetszentmiklós'].map((city) => (
                  <span key={city} className="px-4 py-2 bg-white rounded-full text-gray-700 text-sm font-medium shadow-sm">
                    {city}
                  </span>
                ))}
                <span className="px-4 py-2 bg-vvm-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
                  + további települések
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
