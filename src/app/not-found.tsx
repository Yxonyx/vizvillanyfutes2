import Link from 'next/link';
import { Home, Search, Phone, ArrowLeft, Droplets, Zap, Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vvm-blue-600 via-vvm-blue-700 to-vvm-blue-800 flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-vvm-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-vvm-water/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <div className="flex items-center gap-1">
                <Droplets className="w-6 h-6 text-vvm-blue-600" />
                <Zap className="w-6 h-6 text-vvm-yellow-500" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-vvm-yellow-400 rounded-full flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>

        {/* 404 */}
        <div className="text-[150px] font-bold text-white/20 leading-none mb-4 select-none">
          404
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 -mt-16">
          Hoppá! Ez az oldal nem található
        </h1>

        <p className="text-xl text-blue-100 mb-8">
          Úgy tűnik, ez a cső eltört... A keresett oldal nem létezik,
          vagy áthelyezésre került.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-vvm-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Vissza a főoldalra</span>
          </Link>
          <Link
            href="/login?role=customer"
            className="inline-flex items-center justify-center gap-2 bg-vvm-yellow-400 text-vvm-blue-800 font-bold py-4 px-8 rounded-xl hover:bg-vvm-yellow-300 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span>Időpontfoglalás</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <p className="text-white font-medium mb-4">Hasznos oldalak:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/vizszerelo-budapest" className="text-blue-200 hover:text-white transition-colors">
              Vízszerelés
            </Link>
            <span className="text-blue-400">•</span>
            <Link href="/villanyszerelo-budapest" className="text-blue-200 hover:text-white transition-colors">
              Villanyszerelés
            </Link>
            <span className="text-blue-400">•</span>
            <Link href="/arak" className="text-blue-200 hover:text-white transition-colors">
              Árak
            </Link>
            <span className="text-blue-400">•</span>
            <Link href="/gyik" className="text-blue-200 hover:text-white transition-colors">
              GYIK
            </Link>
            <span className="text-blue-400">•</span>
            <Link href="/kapcsolat" className="text-blue-200 hover:text-white transition-colors">
              Kapcsolat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


