import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, CheckCircle, Clock, Phone, Calendar, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Szolgáltatási Területek | VízVillanyFűtés Budapest és Pest megye',
  description: 'VízVillanyFűtés szolgáltatási területei: Budapest összes kerülete és Pest megye települései. SOS kiszállás 2 órán belül!',
};

const budapestDistricts = [
  { num: 'I.', name: 'Budavár', sosTime: '45 perc' },
  { num: 'II.', name: 'Rózsadomb, Hűvösvölgy', sosTime: '45 perc' },
  { num: 'III.', name: 'Óbuda, Békásmegyer', sosTime: '60 perc' },
  { num: 'IV.', name: 'Újpest', sosTime: '50 perc' },
  { num: 'V.', name: 'Belváros', sosTime: '40 perc' },
  { num: 'VI.', name: 'Terézváros', sosTime: '40 perc' },
  { num: 'VII.', name: 'Erzsébetváros', sosTime: '40 perc' },
  { num: 'VIII.', name: 'Józsefváros', sosTime: '45 perc' },
  { num: 'IX.', name: 'Ferencváros', sosTime: '45 perc' },
  { num: 'X.', name: 'Kőbánya', sosTime: '50 perc' },
  { num: 'XI.', name: 'Újbuda', sosTime: '50 perc' },
  { num: 'XII.', name: 'Hegyvidék', sosTime: '55 perc' },
  { num: 'XIII.', name: 'Angyalföld', sosTime: '45 perc' },
  { num: 'XIV.', name: 'Zugló', sosTime: '50 perc' },
  { num: 'XV.', name: 'Rákospalota', sosTime: '55 perc' },
  { num: 'XVI.', name: 'Árpádföld', sosTime: '60 perc' },
  { num: 'XVII.', name: 'Rákosmente', sosTime: '65 perc' },
  { num: 'XVIII.', name: 'Pestszentlőrinc', sosTime: '60 perc' },
  { num: 'XIX.', name: 'Kispest', sosTime: '55 perc' },
  { num: 'XX.', name: 'Pesterzsébet', sosTime: '55 perc' },
  { num: 'XXI.', name: 'Csepel', sosTime: '60 perc' },
  { num: 'XXII.', name: 'Budafok-Tétény', sosTime: '65 perc' },
  { num: 'XXIII.', name: 'Soroksár', sosTime: '65 perc' },
];

const pestCounty = [
  { name: 'Budaörs', sosTime: '50 perc' },
  { name: 'Budakeszi', sosTime: '55 perc' },
  { name: 'Szentendre', sosTime: '60 perc' },
  { name: 'Dunakeszi', sosTime: '55 perc' },
  { name: 'Fót', sosTime: '55 perc' },
  { name: 'Gödöllő', sosTime: '70 perc' },
  { name: 'Vecsés', sosTime: '55 perc' },
  { name: 'Gyál', sosTime: '60 perc' },
  { name: 'Szigetszentmiklós', sosTime: '55 perc' },
  { name: 'Érd', sosTime: '55 perc' },
  { name: 'Törökbálint', sosTime: '50 perc' },
  { name: 'Százhalombatta', sosTime: '70 perc' },
];

export default function SzolgaltatasiTeruletekPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Szolgáltatási Területek
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Budapest teljes területén és Pest megye kiemelt településein vállalunk
            víz-, villany- és fűtésszerelést.
          </p>

          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Clock className="w-6 h-6 text-vvm-yellow-400" />
            <p className="text-lg">
              <strong>SOS hibaelhárítás:</strong> átlagosan 60 percen belül a helyszínen
            </p>
          </div>
        </div>
      </section>

      {/* Budapest */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Budapest
            </h2>
            <p className="text-gray-600">
              Minden kerületben vállalunk munkát – SOS kiszállás átlagosan 1 órán belül
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {budapestDistricts.map((district) => (
              <div
                key={district.num}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl font-bold text-vvm-blue-600">{district.num}</span>
                    <p className="text-gray-700 font-medium">{district.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>SOS: ~{district.sosTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pest County */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Pest megye
            </h2>
            <p className="text-gray-600">
              Budapest agglomerációjában és kiemelt településeken is elérhetőek vagyunk
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pestCounty.map((city) => (
              <div
                key={city.name}
                className="bg-gray-50 rounded-xl p-4 hover:bg-vvm-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-vvm-blue-600" />
                    <span className="font-semibold text-gray-800">{city.name}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 ml-7">
                  <Clock className="w-3 h-3" />
                  <span>SOS: ~{city.sosTime}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-xl flex items-start gap-3 max-w-2xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Megjegyzés:</strong> Pest megye távolabbi településeire +2.000-5.000 Ft kiszállási pótdíj
              számolható fel a távolságtól függően.
            </p>
          </div>
        </div>
      </section>

      {/* Not Listed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Nem találja a települését?
          </h2>
          <p className="text-gray-600 mb-8">
            Egyedi megkeresés esetén Pest megye egyéb településeire is tudunk kiszállni.
            Kérjük, érdeklődjön telefonon vagy online!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+36302696406" className="btn-primary py-4 px-8">
              <Phone className="w-5 h-5" />
              <span>+36 30 269 6406</span>
            </a>
            <Link href="/foglalas" className="btn-outline py-4 px-8">
              <Calendar className="w-5 h-5" />
              <span>Időpontfoglalás</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


