import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Általános Szerződési Feltételek (ÁSZF) | VízVillanyFűtés',
  description: 'VízVillanyFűtés Általános Szerződési Feltételei. Tudjon meg mindent szolgáltatásainkról, fizetési feltételeinkről és garanciáinkról.',
};

export default function ASZFPage() {
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
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Általános Szerződési Feltételek
              </h1>
              <p className="text-blue-200 mt-1">Hatályos: 2025. január 1-től</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Table of Contents */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="font-bold text-gray-900 mb-4">Tartalomjegyzék</h2>
              <ol className="space-y-2 text-vvm-blue-600">
                <li><a href="#szolgaltato" className="hover:underline">1. A szolgáltató adatai</a></li>
                <li><a href="#ertelmezesek" className="hover:underline">2. Értelmező rendelkezések</a></li>
                <li><a href="#szolgaltatasok" className="hover:underline">3. A szolgáltatások köre</a></li>
                <li><a href="#megrendeles" className="hover:underline">4. Megrendelés és szerződéskötés</a></li>
                <li><a href="#arak" className="hover:underline">5. Árak és fizetési feltételek</a></li>
                <li><a href="#garancia" className="hover:underline">6. Garancia és szavatosság</a></li>
                <li><a href="#felmondas" className="hover:underline">7. Elállás és felmondás</a></li>
                <li><a href="#felelosseg" className="hover:underline">8. Felelősségkorlátozás</a></li>
                <li><a href="#panasz" className="hover:underline">9. Panaszkezelés</a></li>
                <li><a href="#zarorendelkezesek" className="hover:underline">10. Záró rendelkezések</a></li>
              </ol>
            </div>

            {/* Sections */}
            <div className="prose prose-lg max-w-none">
              <section id="szolgaltato" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. A szolgáltató adatai</h2>
                <div className="bg-vvm-blue-50 rounded-xl p-6">
                  <p className="mb-2"><strong>Név:</strong> VízVillanyFűtés</p>
                  <p className="mb-2"><strong>Székhely:</strong> Budapest</p>
                  <p className="mb-2"><strong>E-mail:</strong> info@vizvillanyfutes.hu</p>
                  <p><strong>Weboldal:</strong> www.vizvillanyfutes.hu</p>
                </div>
              </section>

              <section id="ertelmezesek" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Értelmező rendelkezések</h2>
                <p className="text-gray-600 mb-4">Jelen ÁSZF alkalmazásában:</p>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Szolgáltató:</strong> VízVillanyFűtés</li>
                  <li><strong>Megrendelő:</strong> A szolgáltatást igénybe vevő természetes vagy jogi személy.</li>
                  <li><strong>Szakember:</strong> A Szolgáltató által kiközvetített, minősített vízszerelő, villanyszerelő vagy fűtésszerelő.</li>
                  <li><strong>Platform:</strong> A www.vizvillanyfutes.hu weboldal.</li>
                </ul>
              </section>

              <section id="szolgaltatasok" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. A szolgáltatások köre</h2>
                <p className="text-gray-600 mb-4">A Szolgáltató az alábbi szolgáltatásokat nyújtja:</p>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-sky-50 rounded-lg p-4">
                    <h4 className="font-bold text-sky-700 mb-2">Vízszerelés</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Csőtörés elhárítás</li>
                      <li>• Duguláselhárítás</li>
                      <li>• Csaptelep csere</li>
                      <li>• Bojler szerelés</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-bold text-amber-700 mb-2">Villanyszerelés</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Hibaelhárítás</li>
                      <li>• Biztosítéktábla</li>
                      <li>• Átvezetékelés</li>
                      <li>• EV töltő telepítés</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-bold text-orange-700 mb-2">Fűtés</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Radiátor csere</li>
                      <li>• Kazán csere</li>
                      <li>• Padlófűtés</li>
                      <li>• Hőszivattyú</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="megrendeles" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Megrendelés és szerződéskötés</h2>
                <p className="text-gray-600 mb-4">
                  A megrendelés leadható a Platformon keresztül online, telefonon, vagy e-mailben.
                  A szerződés a megrendelés Szolgáltató általi visszaigazolásával jön létre.
                </p>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    A pontos munkadíjat a helyszíni felmérés után, a munka megkezdése előtt közöljük.
                    A munka csak a Megrendelő jóváhagyása után kezdődik meg.
                  </p>
                </div>
              </section>

              <section id="arak" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Árak és fizetési feltételek</h2>
                <p className="text-gray-600 mb-4">
                  Az árak bruttó árak, az ÁFÁ-t tartalmazzák. A kiszállási díj Budapest teljes területén egységes.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>SOS felár:</strong> Éjszakai (20:00-08:00), hétvégi, ünnepnapi és sürgős (2 órán belüli)
                  kiszállás esetén a munkadíj +50%-a kerül felszámolásra.
                </p>
                <p className="text-gray-600">
                  <strong>Fizetési módok:</strong> Készpénz vagy bankkártya a helyszínen,
                  céges ügyfeleknek átutalás előzetes egyeztetés alapján.
                </p>
              </section>

              <section id="garancia" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Garancia és szavatosság</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Az elvégzett munkákra <strong>a munkát végző Szakember</strong> vállal garanciát, a jogszabályokban előírtak szerint.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>A beépített anyagokra a gyártói garancia érvényes (általában 2-5 év).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>A Szolgáltató a szakembereket ellenőrzi, panasz esetén közvetíthet a felek között, azonban <strong>közvetlen garanciális kötelezettsége nincs.</strong></span>
                  </li>
                </ul>
              </section>

              <section id="felmondas" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Elállás és felmondás</h2>
                <p className="text-gray-600 mb-4">
                  A Megrendelő a foglalást a munka megkezdése előtt 24 órával díjmentesen lemondhatja.
                  24 órán belüli lemondás esetén a kiszállási díj felszámolásra kerülhet.
                </p>
                <p className="text-gray-600">
                  A munka megkezdése után történő elállás esetén az addig elvégzett munkák és felhasznált
                  anyagok díja felszámolásra kerül.
                </p>
              </section>

              <section id="felelosseg" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Felelősségkorlátozás</h2>
                <p className="text-gray-600 mb-4">
                  A Szolgáltató, mint platform üzemeltetője, kizárólag a közvetítői és kiajánlási szolgáltatásáért vállal felelősséget. A munkavégzés során okozott károkért, garanciális és szavatossági igényekért a kivitelezési szerződés és a kiállított számla alapján <strong>közvetlenül a Szakember tartozik felelősséggel.</strong> Közvetett károkért, elmaradt haszonért a Szolgáltató nem vállal felelősséget.
                </p>
              </section>

              <section id="panasz" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Panaszkezelés</h2>
                <p className="text-gray-600 mb-4">
                  Panaszát az alábbi módokon jelezheti:
                </p>
                <ul className="space-y-2 text-gray-600 mb-4">
                  <li>• E-mail: info@vizvillanyfutes.hu</li>
                  <li>• Visszahívás kérése: <a href="/visszahivas" className="text-vvm-blue-600 hover:underline">weboldalunkon</a></li>
                </ul>
                <p className="text-gray-600">
                  A panaszokat 30 napon belül kivizsgáljuk és írásban válaszolunk.
                </p>
              </section>

              <section id="zarorendelkezesek" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Záró rendelkezések</h2>
                <p className="text-gray-600 mb-4">
                  Jelen ÁSZF 2025. január 1-jétől hatályos. A Szolgáltató fenntartja a jogot az ÁSZF
                  egyoldalú módosítására, a módosításról a Megrendelőket a weboldalon keresztül értesíti.
                </p>
                <p className="text-gray-600">
                  A jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog, különösen a Polgári
                  Törvénykönyv rendelkezései az irányadóak.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>Utolsó módosítás: 2025. január 1.</p>
              <p className="mt-2">
                Kérdése van? Írjon nekünk: <a href="mailto:info@vizvillanyfutes.hu" className="text-vvm-blue-600 hover:underline">info@vizvillanyfutes.hu</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
