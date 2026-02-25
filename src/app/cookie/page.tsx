'use client';

import Link from 'next/link';
import { Cookie, ArrowLeft, Settings, BarChart, Target, Shield } from 'lucide-react';

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Vissza a főoldalra</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Cookie className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Cookie (Süti) Tájékoztató
              </h1>
              <p className="text-blue-200 mt-1">Weboldalunk sütihasználata</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Cookie Management CTA */}
            <div className="bg-vvm-blue-50 rounded-xl p-6 mb-10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cookie beállítások módosítása</h3>
                <p className="text-gray-600 text-sm">Bármikor megváltoztathatja a süti beállításait.</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('vvm-cookie-consent');
                  window.location.reload();
                }}
                className="btn-primary py-3 px-6"
              >
                <Settings className="w-5 h-5" />
                <span>Beállítások</span>
              </button>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi az a cookie (süti)?</h2>
                <p className="text-gray-600">
                  A cookie (süti) egy kis szöveges fájl, amelyet a weboldal az Ön böngészőjében tárol.
                  A sütik segítenek a weboldal működésében, megjegyzik a beállításait, és információt
                  gyűjtenek arról, hogyan használja az oldalt.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Milyen sütiket használunk?</h2>

                {/* Necessary Cookies */}
                <div className="border border-gray-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Szükséges sütik</h3>
                      <span className="text-sm text-green-600 font-medium">Mindig aktív</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Ezek a sütik elengedhetetlenek a weboldal alapvető funkcióinak működéséhez.
                    Nélkülük az oldal nem működik megfelelően.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 font-medium">Név</th>
                        <th className="text-left p-2 font-medium">Cél</th>
                        <th className="text-left p-2 font-medium">Lejárat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">vvm-cookie-consent</td>
                        <td className="p-2">Cookie beállítások tárolása</td>
                        <td className="p-2">1 év</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">__session</td>
                        <td className="p-2">Munkamenet azonosító</td>
                        <td className="p-2">Munkamenet</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">csrf_token</td>
                        <td className="p-2">Biztonsági token</td>
                        <td className="p-2">Munkamenet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Analitikai sütik</h3>
                      <span className="text-sm text-gray-500 font-medium">Opcionális</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Segítenek megérteni, hogyan használják a látogatók weboldalunkat.
                    Az adatok névtelenek és csak statisztikai célokra használjuk.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 font-medium">Név</th>
                        <th className="text-left p-2 font-medium">Szolgáltató</th>
                        <th className="text-left p-2 font-medium">Lejárat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">_ga</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">2 év</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">_ga_*</td>
                        <td className="p-2">Google Analytics 4</td>
                        <td className="p-2">2 év</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">_gid</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">24 óra</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Marketing sütik</h3>
                      <span className="text-sm text-gray-500 font-medium">Opcionális</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Személyre szabott hirdetések megjelenítéséhez használjuk.
                    Segítenek mérni hirdetéseink hatékonyságát.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 font-medium">Név</th>
                        <th className="text-left p-2 font-medium">Szolgáltató</th>
                        <th className="text-left p-2 font-medium">Lejárat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">_fbp</td>
                        <td className="p-2">Facebook Pixel</td>
                        <td className="p-2">3 hónap</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono text-xs">_gcl_au</td>
                        <td className="p-2">Google Ads</td>
                        <td className="p-2">3 hónap</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hogyan kezelheti a sütiket?</h2>
                <p className="text-gray-600 mb-4">
                  A legtöbb böngésző lehetővé teszi a sütik kezelését. Beállíthatja, hogy:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Blokkolja az összes sütit</li>
                  <li>• Csak bizonyos típusú sütiket engedélyezzen</li>
                  <li>• Értesítést kapjon, mielőtt egy süti tárolódna</li>
                  <li>• Törölje a már tárolt sütiket</li>
                </ul>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <strong>Figyelem:</strong> Ha letiltja a szükséges sütiket, a weboldal egyes funkciói
                    nem fognak megfelelően működni.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Böngésző beállítások</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:border-vvm-blue-300 transition-colors">
                    <h4 className="font-semibold text-gray-900">Google Chrome</h4>
                    <p className="text-sm text-gray-600">Sütik kezelése Chrome-ban</p>
                  </a>
                  <a href="https://support.mozilla.org/hu/kb/sutik-engedelyezese-es-tiltasa" target="_blank" rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:border-vvm-blue-300 transition-colors">
                    <h4 className="font-semibold text-gray-900">Mozilla Firefox</h4>
                    <p className="text-sm text-gray-600">Sütik kezelése Firefoxban</p>
                  </a>
                  <a href="https://support.apple.com/hu-hu/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:border-vvm-blue-300 transition-colors">
                    <h4 className="font-semibold text-gray-900">Safari</h4>
                    <p className="text-sm text-gray-600">Sütik kezelése Safariban</p>
                  </a>
                  <a href="https://support.microsoft.com/hu-hu/microsoft-edge/cookie-k-törlése-a-microsoft-edge-ben" target="_blank" rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:border-vvm-blue-300 transition-colors">
                    <h4 className="font-semibold text-gray-900">Microsoft Edge</h4>
                    <p className="text-sm text-gray-600">Sütik kezelése Edge-ben</p>
                  </a>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Kapcsolat</h2>
                <p className="text-gray-600">
                  Ha kérdése van a sütik használatával kapcsolatban, forduljon hozzánk:
                  <a href="mailto:info@vizvillanyfutes.hu" className="text-vvm-blue-600 hover:underline ml-1">
                    info@vizvillanyfutes.hu
                  </a>
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>Utolsó módosítás: 2025. január 1.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

