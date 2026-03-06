'use client';

import Link from 'next/link';
import {
  Mail, MapPin,
  Shield, Award, Clock, CheckCircle,
  Facebook, Linkedin, Instagram, Phone,
  ThumbsUp, Star, Users
} from 'lucide-react';
import Logo from './Logo';

const footerLinks = {
  szolgaltatasok: [
    { name: 'Vízszerelés Budapest', href: '/vizszerelo-budapest' },
    { name: 'Villanyszerelés Budapest', href: '/villanyszerelo-budapest' },
    { name: 'Duguláselhárítás', href: '/dugulaselharitas-budapest' },
    { name: 'Fűtéskorszerűsítés', href: '/futeskorszerusites' },
    { name: 'SOS Hibaelhárítás', href: '/login?role=customer' },
  ],
  informacio: [

    { name: 'Blog / Tudástár', href: '/blog' },
    { name: 'Gyakori kérdések', href: '/gyik' },
    { name: 'Szolgáltatási területek', href: '/szolgaltatasi-teruletek' },
  ],
  ceginfo: [
    { name: 'Rólunk', href: '/rolunk' },
    { name: 'Generálkivitelezőknek', href: '/general-kivitelezo-partner' },
    { name: 'Partnerprogram', href: '/csatlakozz-partnerkent' },
    { name: 'Kapcsolat', href: '/kapcsolat' },
  ],
  jogi: [
    { name: 'ÁSZF', href: '/aszf' },
    { name: 'Adatkezelési tájékoztató', href: '/adatkezeles' },
    { name: 'Cookie tájékoztató', href: '/cookie' },
    { name: 'Impresszum', href: '/impresszum' },
  ],
};


export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white pb-20 lg:pb-0">
      {/* Trust Badges */}
      <div className="border-b border-slate-800 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-vvm-blue-600/[0.07] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
              Minden, amire a zavartalan otthonhoz szükséged van
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Szakmai felkészültség és ügyfélközpontú hozzáállás — garantált minőség, tartós eredmények.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              { icon: <ThumbsUp className="w-6 h-6" />, color: 'text-emerald-400', glow: 'shadow-emerald-500/10', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', title: 'Ingyenes ajánlatkérés', desc: 'Rejtett költségek nélkül, kötelezettségmentesen' },
              { icon: <CheckCircle className="w-6 h-6" />, color: 'text-vvm-blue-400', glow: 'shadow-blue-500/10', border: 'border-blue-500/20', bg: 'bg-vvm-blue-500/10', title: 'Ellenőrzött szakemberek', desc: 'Kézzel válogatott, minősített mesterek' },
              { icon: <Star className="w-6 h-6" />, color: 'text-amber-400', glow: 'shadow-amber-500/10', border: 'border-amber-500/20', bg: 'bg-amber-500/10', title: 'Valós értékelések', desc: 'Korábbi ügyfelek hiteles véleményei' },
              { icon: <Users className="w-6 h-6" />, color: 'text-indigo-400', glow: 'shadow-indigo-500/10', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', title: 'Több szakember', desc: 'A legjobb ajánlatot választhatod ki' },
            ].map((item, i) => (
              <div
                key={i}
                className={`group relative flex flex-col items-center text-center gap-3 p-5 md:p-6 rounded-2xl bg-white/[0.04] backdrop-blur-sm border ${item.border} hover:bg-white/[0.07] transition-all duration-300 shadow-lg ${item.glow}`}
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-sm md:text-[15px] leading-tight mb-1">{item.title}</div>
                  <div className="text-xs text-slate-400 leading-snug">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo size="md" showTagline={false} />
            </Link>

            <p className="text-slate-400 mb-6 leading-relaxed">
              Professzionális víz–villany–fűtés szolgáltatások Budapesten és Pest megyében.
              Gyors, megbízható, garanciális munkavégzés.
            </p>

            <div className="space-y-3">
              <a href="mailto:info@vizvillanyfutes.hu" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-vvm-blue-400" />
                <span>info@vizvillanyfutes.hu</span>
              </a>
              <a href="tel:+36302696406" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-vvm-blue-400" />
                <span>+36 30 269 6406</span>
              </a>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-vvm-blue-400 flex-shrink-0 mt-0.5" />
                <span>Budapest és Pest megye</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.facebook.com/vizvillanyfutes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-[#1877F2] rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/vizvillanyfutes/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-[#0A66C2] rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/vizvillanyfutes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 hover:bg-[#E4405F] rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-white mb-4">Szolgáltatások</h4>
            <ul className="space-y-2">
              {footerLinks.szolgaltatasok.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Információ</h4>
            <ul className="space-y-2">
              {footerLinks.informacio.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Céginfo</h4>
            <ul className="space-y-2">
              {footerLinks.ceginfo.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Jogi</h4>
            <ul className="space-y-2">
              {footerLinks.jogi.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500 w-full md:w-auto text-center md:text-left mb-2 md:mb-0">
              A VízVillanyFűtés.hu információs piactérként működik, a kivitelezési szerződés és a fizetési/garanciális feltételek a Megrendelő és a választott Szakember között jönnek létre.
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} VízVillanyFűtés. Minden jog fenntartva.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Lefedettség:</span>
              <Link href="/szolgaltatasi-teruletek" className="text-sm text-slate-400 hover:text-white transition-colors">
                Budapest I–XXIII. kerület + Pest megye
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
