import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Eye, Trash2, Download, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Adatkezelési Tájékoztató | VízVillanyFűtés',
  description: 'Tudja meg, hogyan kezeljük személyes adatait. GDPR megfelelő adatkezelés, adatbiztonsági intézkedések.',
};

export default function AdatkezelesPage() {
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
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Adatkezelési Tájékoztató
              </h1>
              <p className="text-blue-200 mt-1">GDPR megfelelő adatkezelés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Key Rights */}
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Hozzáférés joga</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Adathordozhatóság</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <Lock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Helyesbítés joga</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Törlés joga</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Adatkezelő adatai</h2>
                <div className="bg-vvm-blue-50 rounded-xl p-6">
                  <p className="mb-2"><strong>Adatkezelő:</strong> VízVillanyFűtés</p>
                  <p className="mb-2"><strong>Működési terület:</strong> Budapest és Pest megye</p>
                  <p><strong>Email:</strong> info@vizvillanyfutes.hu</p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Kezelt adatok köre</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Regisztráció és bejelentkezés</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left">Adat típusa</th>
                      <th className="border border-gray-200 p-3 text-left">Jogalap</th>
                      <th className="border border-gray-200 p-3 text-left">Megőrzési idő</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Teljes név</td>
                      <td className="border border-gray-200 p-3">Szerződés teljesítése</td>
                      <td className="border border-gray-200 p-3">Fiók törléséig</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">E-mail cím</td>
                      <td className="border border-gray-200 p-3">Szerződés teljesítése</td>
                      <td className="border border-gray-200 p-3">Fiók törléséig</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Telefonszám</td>
                      <td className="border border-gray-200 p-3">Szerződés teljesítése</td>
                      <td className="border border-gray-200 p-3">Fiók törléséig</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Lakcím</td>
                      <td className="border border-gray-200 p-3">Szerződés teljesítése</td>
                      <td className="border border-gray-200 p-3">8 év (számlázás miatt)</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Szolgáltatás igénybevétele</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Foglalási adatok (időpont, szolgáltatás típusa)</li>
                  <li>• Probléma leírása és feltöltött fotók</li>
                  <li>• Ingatlan adatai (cím, típus)</li>
                  <li>• Fizetési adatok (kártyaszám tokenje)</li>
                  <li>• Kommunikáció a szakemberrel</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Adatkezelés célja</h2>
                <ul className="space-y-3 text-gray-600">
                  <li><strong>Szolgáltatásnyújtás:</strong> Foglalások kezelése, szakember kiközvetítése, számlázás</li>
                  <li><strong>Kommunikáció:</strong> Értesítések, emlékeztetők, ügyfélszolgálat</li>
                  <li><strong>Jogszabályi kötelezettség:</strong> Számviteli bizonylatok megőrzése (8 év)</li>
                  <li><strong>Jogos érdek:</strong> Szolgáltatás fejlesztése, statisztikák készítése</li>
                  <li><strong>Hozzájárulás alapján:</strong> Marketing célú megkeresések, hírlevél</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Adattovábbítás</h2>
                <p className="text-gray-600 mb-4">
                  Személyes adatait az alábbi harmadik feleknek továbbíthatjuk:
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li><strong>Szakemberek:</strong> A szolgáltatás teljesítéséhez szükséges adatok (név, cím, telefon)</li>
                  <li><strong>E-mail szolgáltató:</strong> Gmail (Google LLC)</li>
                  <li><strong>Könyvelés:</strong> Számviteli szolgáltató a számlázási adatokhoz</li>
                  <li><strong>Felhőszolgáltató:</strong> Vercel Inc. (szerverüzemeltetés, EU adatközpont)</li>
                  <li><strong>E-mail szolgáltató:</strong> Mailgun / SendGrid (tranzakciós e-mailek)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Az Ön jogai (GDPR)</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Hozzáférés joga</h4>
                    <p className="text-gray-600 text-sm">Kérheti, hogy tájékoztassuk, milyen adatokat kezelünk Önről.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Helyesbítés joga</h4>
                    <p className="text-gray-600 text-sm">Kérheti a pontatlan adatok javítását.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Törlés joga ("elfeledtetéshez való jog")</h4>
                    <p className="text-gray-600 text-sm">Kérheti adatai törlését, ha nincs jogszabályi kötelezettség a megőrzésre.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Adathordozhatóság joga</h4>
                    <p className="text-gray-600 text-sm">Kérheti adatai géppel olvasható formátumban történő kiadását.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Tiltakozás joga</h4>
                    <p className="text-gray-600 text-sm">Tiltakozhat az adatkezelés ellen jogos érdek esetén.</p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Adatbiztonság</h2>
                <p className="text-gray-600 mb-4">
                  Adatait megfelelő technikai és szervezési intézkedésekkel védjük:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ SSL titkosítás minden adatátvitelnél</li>
                  <li>✓ Jelszavak hash-elve tárolva (bcrypt)</li>
                  <li>✓ Hozzáférés korlátozása (need-to-know elv)</li>
                  <li>✓ Rendszeres biztonsági mentések</li>
                  <li>✓ Adatvédelmi incidenskezelési protokoll</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Kapcsolat, panasz</h2>
                <div className="bg-vvm-blue-50 rounded-xl p-6">
                  <p className="text-gray-700 mb-4">
                    Adatvédelmi kérdéseivel, kéréseivel forduljon hozzánk:
                  </p>
                  <p className="flex items-center gap-2 text-vvm-blue-700 font-medium">
                    <Mail className="w-5 h-5" />
                    info@vizvillanyfutes.hu
                  </p>
                  <p className="text-gray-600 mt-4 text-sm">
                    Ha nem elégedett válaszunkkal, panasszal fordulhat a Nemzeti Adatvédelmi és
                    Információszabadság Hatósághoz (NAIH): <a href="https://naih.hu" className="text-vvm-blue-600 hover:underline">naih.hu</a>
                  </p>
                </div>
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

