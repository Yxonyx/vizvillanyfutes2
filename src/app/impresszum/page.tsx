import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowLeft, Phone, Mail, MapPin, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impresszum | VízVillanyFűtés',
  description: 'VízVillanyFűtés Szolgáltató Kft. céginformációi, elérhetőségei és jogi adatai.',
};

export default function ImpresszumPage() {
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
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Impresszum
              </h1>
              <p className="text-blue-200 mt-1">Céginformációk és jogi adatok</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-vvm-blue-600" />
                Szolgáltató adatai
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Szolgáltató neve</p>
                  <p className="font-semibold text-gray-900">VízVillanyFűtés</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Működési terület</p>
                  <p className="font-semibold text-gray-900">Budapest és Pest megye</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Szolgáltatások</p>
                  <p className="font-semibold text-gray-900">Víz-, villany- és fűtésszerelés</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Megjegyzés</p>
                  <p className="text-gray-600 text-sm">A részletes céges adatok a szerződéskötéskor kerülnek megadásra.</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Phone className="w-6 h-6 text-vvm-blue-600" />
                Elérhetőségek
              </h2>

              <div className="space-y-4">
                <Link href="/visszahivas" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-vvm-blue-50 transition-colors">
                  <Phone className="w-5 h-5 text-vvm-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Kapcsolat</p>
                    <p className="font-semibold text-gray-900">Visszahívást kérek →</p>
                  </div>
                </Link>

                <a href="mailto:info@vizvillanyfutes.hu" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-vvm-blue-50 transition-colors">
                  <Mail className="w-5 h-5 text-vvm-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-semibold text-gray-900">info@vizvillanyfutes.hu</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-vvm-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Működési terület</p>
                    <p className="font-semibold text-gray-900">Budapest és Pest megye</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Ügyfélszolgálat nyitvatartása</p>
                  <p className="text-gray-700">Hétfő - Péntek: 8:00 - 18:00</p>
                  <p className="text-gray-700">Szombat: 9:00 - 14:00</p>
                  <p className="text-gray-700">Vasárnap: Zárva</p>
                  <p className="text-amber-600 font-medium mt-2">SOS hibaelhárítás: 0-24</p>
                </div>
              </div>
            </div>

            {/* Legal Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-vvm-blue-600" />
                Jogi dokumentumok
              </h2>

              <div className="space-y-3">
                <Link href="/aszf" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-vvm-blue-50 transition-colors group">
                  <span className="text-gray-700 group-hover:text-vvm-blue-600">Általános Szerződési Feltételek</span>
                  <span className="text-vvm-blue-600">→</span>
                </Link>
                <Link href="/adatkezeles" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-vvm-blue-50 transition-colors group">
                  <span className="text-gray-700 group-hover:text-vvm-blue-600">Adatkezelési Tájékoztató</span>
                  <span className="text-vvm-blue-600">→</span>
                </Link>
                <Link href="/cookie" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-vvm-blue-50 transition-colors group">
                  <span className="text-gray-700 group-hover:text-vvm-blue-600">Cookie Tájékoztató</span>
                  <span className="text-vvm-blue-600">→</span>
                </Link>
              </div>
            </div>

            {/* Insurance & Hosting */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-vvm-blue-600" />
                Biztosítás és tárhelyszolgáltató
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Garancia</p>
                  <p className="text-green-600 font-medium">Minimum 1 év garancia</p>
                  <p className="text-gray-600 text-sm">Minden elvégzett munkánkra.</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Tárhelyszolgáltató</p>
                  <p className="font-semibold text-gray-900">Vercel Inc.</p>
                  <p className="text-gray-600">Covina, CA, USA</p>
                </div>

              </div>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vitarendezés</h2>
            <p className="text-gray-600 mb-4">
              Panasza esetén először forduljon hozzánk közvetlenül. Ha nem sikerül megoldást találni,
              az alábbi szervekhez fordulhat:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Budapesti Békéltető Testület</h4>
                <p className="text-sm text-gray-600">1016 Budapest, Krisztina krt. 99.</p>
                <p className="text-sm text-gray-600">Telefon: 06-1-488-2131</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Nemzeti Fogyasztóvédelmi Hatóság</h4>
                <p className="text-sm text-gray-600">1088 Budapest, József krt. 6.</p>
                <p className="text-sm text-gray-600">fogyasztovedelem.kormany.hu</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Utolsó módosítás: 2025. január 1.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

