'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Settings, CheckCircle } from 'lucide-react';

type ConsentSettings = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('vvm-cookie-consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('vvm-cookie-consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...settings,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('vvm-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('vvm-cookie-consent', JSON.stringify(onlyNecessary));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 pointer-events-auto"
        onClick={() => {}}
      />
      
      {/* Cookie Banner */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl pointer-events-auto animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-vvm-blue-600 to-vvm-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Cookie beállítások</h3>
              <p className="text-sm text-blue-100">Tiszteletben tartjuk az adatvédelmet</p>
            </div>
          </div>
          <button 
            onClick={handleRejectAll}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!showSettings ? (
            <>
              <p className="text-gray-600 mb-6">
                Weboldalunk sütiket (cookie-kat) használ a felhasználói élmény javítása, 
                a látogatottsági statisztikák elemzése és marketing célok érdekében. 
                Az „Összes elfogadása" gombra kattintva hozzájárul az összes süti használatához, 
                vagy testreszabhatja a beállításokat.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="btn-primary flex-1 py-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Összes elfogadása</span>
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="btn-outline flex-1 py-3"
                >
                  <Settings className="w-5 h-5" />
                  <span>Testreszabás</span>
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 py-3 text-gray-600 hover:text-gray-800 font-medium border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Csak a szükségesek
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Szükséges sütik</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Mindig aktív</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    Ezek a sütik elengedhetetlenek a weboldal működéséhez. Tartalmazzák a munkamenet-azonosítót, 
                    a cookie-beállításokat és az alapvető biztonsági funkciókat.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-900">Analitikai sütik</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.analytics}
                        onChange={(e) => setSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vvm-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vvm-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    Segítenek megérteni, hogyan használják a látogatók weboldalunkat. 
                    Az adatok névtelenítettek és statisztikai célokra használjuk (Google Analytics).
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-gray-900">Marketing sütik</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.marketing}
                        onChange={(e) => setSettings(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vvm-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vvm-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">
                    Személyre szabott hirdetéseket és tartalmakat jelenítenek meg 
                    (Facebook Pixel, Google Ads remarketing).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptSelected}
                  className="btn-primary flex-1 py-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Kiválasztottak mentése</span>
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-outline flex-1 py-3"
                >
                  Vissza
                </button>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              További információ az{' '}
              <Link href="/adatkezeles" className="text-vvm-blue-600 hover:underline">
                Adatkezelési tájékoztatóban
              </Link>
              {' '}és a{' '}
              <Link href="/cookie" className="text-vvm-blue-600 hover:underline">
                Cookie tájékoztatóban
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


