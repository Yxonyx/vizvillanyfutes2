'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building, CheckCircle, ArrowRight, Phone, Calendar,
  Shield, Star, FileCheck, Users, Clock, Wrench,
  Award, Briefcase, TrendingUp, Send, ChevronDown, HelpCircle
} from 'lucide-react';

// Features
const features = [
  {
    icon: Users,
    title: 'Dedikált projektmenedzser',
    description: 'Egy kapcsolattartó pont, aki koordinálja a víz–villany–fűtés szakágakat.',
  },
  {
    icon: FileCheck,
    title: 'E-napló és dokumentáció',
    description: 'Mi töltjük fel a napi jelentéseket, fotókat, jegyzőkönyveket.',
  },
  {
    icon: Clock,
    title: 'SLA-alapú szolgáltatás',
    description: 'Garantált reakcióidő és kiszállás, szerződésben rögzítve.',
  },
  {
    icon: Shield,
    title: 'Minőségbiztosítási háttér',
    description: 'A platformunkon lévő szakemberek megfelelő garanciával végzik a munkát.',
  },
  {
    icon: Wrench,
    title: 'Auditált szakemberek',
    description: 'Minden mester ellenőrzött, képzett, referenciákkal rendelkezik.',
  },
  {
    icon: Award,
    title: 'Minőségbiztosítás',
    description: 'Egységes minőségi sztenderdek, utóellenőrzés, ügyfélértékelés.',
  },
];

// Services for B2B
const b2bServices = [
  {
    category: 'Vízszerelés',
    services: ['Strang felújítás', 'Fővezeték javítás', 'Szivárgás-keresés', 'Csőrendszer korszerűsítés'],
  },
  {
    category: 'Villanyszerelés',
    services: ['Lakás átvezetékelés', 'Biztosítéktábla korszerűsítés', 'Elektromos hálózat bővítés', 'EV töltő előkészítés'],
  },
  {
    category: 'Fűtés-víz',
    services: ['Radiátor csere', 'Padlófűtés szerelés', 'Kazán bekötés előkészítése', 'Hidraulikai munkák'],
  },
];

// FAQ
const faqs = [
  {
    q: 'Milyen projektméretekre vállalkoznak?',
    a: 'Egylakásos felújítástól társasházi strang-felújításig, irodaház korszerűsítésig minden méretű projektet vállalunk. Generálkivitelezőknek és társasházkezelőknek egyaránt dolgozunk.'
  },
  {
    q: 'Hogyan működik az E-napló adminisztráció?',
    a: 'A szakemberek a helyszínen fotókat és jegyzeteket készítenek, ezek alapján az irodai asszisztensünk tölti fel a napi jelentéseket az állami E-napló rendszerbe. Önnek csak jóvá kell hagynia.'
  },
  {
    q: 'Milyen SLA-t biztosítanak?',
    a: 'Normál munka esetén 48 óra reakcióidő, SOS esetén 4 óra. Ezeket szerződésben rögzítjük és kötbérrel garantáljuk.'
  },
  {
    q: 'Hogyan történik a számlázás?',
    a: 'Projektalapú számlázás, részszámlázás is lehetséges nagyobb munkáknál. Keretszerződés esetén havi összesített számla is kérhető.'
  },
  {
    q: 'Tudnak alvállalkozói szerződést kötni?',
    a: 'Igen, teljes körű alvállalkozói szerződést kötünk, ami tartalmazza az SLA-t, a biztosítást, a garanciavállalást és az adminisztrációs kötelezettségeket is.'
  },
];

export default function B2BPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'b2b',
          data: formData,
        }),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Köszönjük ajánlatkérését!</h2>
          <p className="text-gray-600 mb-6">
            Kollégánk 24 órán belül felveszi Önnel a kapcsolatot a megadott elérhetőségeken.
          </p>
          <Link href="/" className="btn-primary inline-flex">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEg0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-vvm-blue-500/20 rounded-full px-4 py-2 text-sm text-vvm-blue-300 mb-6">
                <Building className="w-4 h-4" />
                <span>B2B Partnerprogram</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Víz–villany–fűtés <br />
                <span className="text-vvm-yellow-400">szakági partner</span> <br />
                generálkivitelezőknek
              </h1>

              <p className="text-xl text-slate-300 mb-8">
                Egy szerződés, egy kapcsolattartó, egy minőség.
                Komplett víz–villany–fűtés szakági brigádok bérlése
                E-napló adminisztrációval és SLA-val.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Egy szerződés</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>E-napló kezelve</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Megbízható szakemberek</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#ajanlatkeres" className="btn-primary py-4 px-8 text-lg">
                  <Briefcase className="w-5 h-5" />
                  <span>B2B ajánlatkérés</span>
                </a>
                <Link href="/visszahivas" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center gap-2 border border-white/20">
                  <Phone className="w-5 h-5" />
                  <span>Visszahívást kérek</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                  <div className="text-4xl font-bold text-white mb-2">1</div>
                  <div className="text-lg font-semibold text-white mb-1">Szerződés</div>
                  <p className="text-slate-400 text-sm">Mindhárom szakág lefedve</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                  <div className="text-4xl font-bold text-vvm-yellow-400 mb-2">4h</div>
                  <div className="text-lg font-semibold text-white mb-1">SOS reakcióidő</div>
                  <p className="text-slate-400 text-sm">Szerződésben garantálva</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                  <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
                  <div className="text-lg font-semibold text-white mb-1">Megbízhatóság</div>
                  <p className="text-slate-400 text-sm">Cégek részére is</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                  <div className="text-4xl font-bold text-vvm-blue-400 mb-2">100%</div>
                  <div className="text-lg font-semibold text-white mb-1">Dokumentált</div>
                  <p className="text-slate-400 text-sm">E-napló, fotók, jegyzék</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Miért válasszanak minket?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Komplett alvállalkozói szolgáltatás, ami leveszi a válláról az adminisztrációt és a koordinációt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-vvm-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-vvm-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Szolgáltatási körünk
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {b2bServices.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h3>
                <ul className="space-y-3">
                  {category.services.map((service, sIndex) => (
                    <li key={sIndex} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <section id="ajanlatkeres" className="py-16 bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                B2B ajánlatkérés
              </h2>
              <p className="text-gray-600">
                Töltse ki az alábbi űrlapot és 24 órán belül személyre szabott ajánlattal keressük.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cégnév *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Példa Építő Kft."
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapcsolattartó neve *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Kovács János"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email cím *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="info@peldaepito.hu"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonszám *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+36 30 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projekt típusa
                </label>
                <select
                  className="input-field"
                  value={formData.projectType}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                >
                  <option value="">Válasszon...</option>
                  <option value="lakasfelujitas">Lakásfelújítás</option>
                  <option value="tarsashaz">Társasház felújítás</option>
                  <option value="irodahaz">Irodaház projekt</option>
                  <option value="keretszerzodes">Keretszerződés (folyamatos együttműködés)</option>
                  <option value="egyeb">Egyéb</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projekt leírása
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="Írja le röviden a projektet: helyszín, méret, várt időpont, speciális igények..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.companyName || !formData.email || !formData.phone}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Küldés...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Ajánlatkérés küldése</span>
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                24 órán belül felvesszük Önnel a kapcsolatot.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Gyakran ismételt kérdések
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-vvm-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="pl-8 text-gray-600 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Beszéljük meg a részleteket!
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Hívjon minket vagy írjon – személyre szabott ajánlattal jelentkezünk.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+36302696406" className="btn-primary py-4 px-10 text-lg">
              <Phone className="w-6 h-6" />
              <span>+36 30 269 6406</span>
            </a>
            <a href="mailto:info@vizvillanyfutes.hu" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-10 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-lg border border-white/20">
              <Send className="w-6 h-6" />
              <span>info@vizvillanyfutes.hu</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

