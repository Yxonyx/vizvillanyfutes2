'use client';

import Link from 'next/link';
import {
  Mail, MapPin,
  Shield, Award, Clock, CheckCircle,
  Facebook, Linkedin, Instagram, Phone
} from 'lucide-react';
import Logo from './Logo';

const footerLinks = {
  szolgaltatasok: [
    { name: 'Vízszerelés Budapest', href: '/vizszerelo-budapest' },
    { name: 'Villanyszerelés Budapest', href: '/villanyszerelo-budapest' },
    { name: 'Duguláselhárítás', href: '/dugulaselharitas-budapest' },
    { name: 'Fűtéskorszerűsítés', href: '/futeskorszerusites' },
    { name: 'SOS Hibaelhárítás', href: '/foglalas?sos=true' },
  ],
  informacio: [
    { name: 'Áraink', href: '/arak' },
    { name: 'Pályázat kalkulátor', href: '/palyazat-kalkulator' },
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
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pb-20 lg:pb-0">
      {/* Trust Badges */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Garanciális munka</div>
                <div className="text-sm text-slate-400">1 év garancia</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-vvm-blue-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-vvm-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Ellenőrzött szakemberek</div>
                <div className="text-sm text-slate-400">Minősített mesterek</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-vvm-yellow-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-vvm-yellow-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Garancia</div>
                <div className="text-sm text-slate-400">Minden elvégzett munkára</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="font-semibold text-white">SOS 0-24</div>
                <div className="text-sm text-slate-400">Expressz kiszállás</div>
              </div>
            </div>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
