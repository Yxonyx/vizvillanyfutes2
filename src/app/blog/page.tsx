'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Calendar, Clock, User, ArrowRight, Tag,
  Droplets, Zap, Flame, Award, TrendingUp, BookOpen
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

// Blog categories
const categories = [
  { id: 'all', name: 'Összes', icon: BookOpen },
  { id: 'viz', name: 'Vízszerelés', icon: Droplets },
  { id: 'villany', name: 'Villanyszerelés', icon: Zap },
  { id: 'futes', name: 'Fűtés', icon: Flame },
  { id: 'palyazat', name: 'Pályázatok', icon: Award },
  { id: 'tippek', name: 'Tippek', icon: TrendingUp },
];

// Blog posts
const blogPosts = [
  {
    id: 1,
    title: 'Hogyan előzze meg a téli csőtörést? 7 praktikus tipp',
    excerpt: 'A téli fagyok komoly veszélyt jelentenek a vízvezetékekre. Mutatjuk, hogyan védheti meg otthonát a csőtöréstől.',
    category: 'viz',
    categoryLabel: 'Vízszerelés',
    author: 'Kovács István',
    date: '2025. január 10.',
    readTime: '5 perc',
    featured: true,
    image: null,
  },
  {
    id: 2,
    title: 'Mi az a Fi-relé és miért életmentő?',
    excerpt: 'A Fi-relé (életvédelmi kapcsoló) alapvető biztonsági berendezés minden otthonban. Tudjon meg mindent róla!',
    category: 'villany',
    categoryLabel: 'Villanyszerelés',
    author: 'Nagy Péter',
    date: '2025. január 8.',
    readTime: '4 perc',
    featured: true,
    image: null,
  },
  {
    id: 3,
    title: 'Otthonfelújítási Program 2025: Amit tudni kell',
    excerpt: 'Összefoglaltuk a legfontosabb tudnivalókat a 2025-ös pályázati lehetőségekről és a jogosultsági feltételekről.',
    category: 'palyazat',
    categoryLabel: 'Pályázatok',
    author: 'Szabó Anna',
    date: '2025. január 5.',
    readTime: '8 perc',
    featured: true,
    image: null,
  },
  {
    id: 4,
    title: 'Miért nem melegszik a radiátor? 5 lehetséges ok',
    excerpt: 'Ha a radiátor csak részben vagy egyáltalán nem melegszik, több oka is lehet. Mutatjuk a leggyakoribb problémákat.',
    category: 'futes',
    categoryLabel: 'Fűtés',
    author: 'Tóth Gábor',
    date: '2025. január 3.',
    readTime: '6 perc',
    featured: false,
    image: null,
  },
  {
    id: 5,
    title: 'Leveri a Fi-relét – mit tegyek?',
    excerpt: 'Ha gyakran "kivág" a Fi-relé, az nem normális. Mutatjuk, mi lehet az ok és mikor kell szakembert hívni.',
    category: 'villany',
    categoryLabel: 'Villanyszerelés',
    author: 'Nagy Péter',
    date: '2024. december 28.',
    readTime: '4 perc',
    featured: false,
    image: null,
  },
  {
    id: 6,
    title: 'Dugulásmegelőzés: egyszerű módszerek',
    excerpt: 'A legtöbb dugulás megelőzhető néhány egyszerű szokás betartásával. Íme a legjobb tippek.',
    category: 'viz',
    categoryLabel: 'Vízszerelés',
    author: 'Kovács István',
    date: '2024. december 20.',
    readTime: '3 perc',
    featured: false,
    image: null,
  },
  {
    id: 7,
    title: 'Energiatakarékos fűtési megoldások',
    excerpt: 'Hogyan csökkentheti a fűtésszámlát anélkül, hogy fázna? Mutatjuk a legjobb megoldásokat.',
    category: 'futes',
    categoryLabel: 'Fűtés',
    author: 'Tóth Gábor',
    date: '2024. december 15.',
    readTime: '7 perc',
    featured: false,
    image: null,
  },
  {
    id: 8,
    title: 'LED világítás: előnyök és telepítés',
    excerpt: 'A LED világítás energiatakarékos és hosszú élettartamú. Tudjon meg mindent a telepítésről.',
    category: 'villany',
    categoryLabel: 'Villanyszerelés',
    author: 'Nagy Péter',
    date: '2024. december 10.',
    readTime: '5 perc',
    featured: false,
    image: null,
  },
];

const categoryColors: Record<string, string> = {
  viz: 'bg-sky-100 text-sky-700',
  villany: 'bg-amber-100 text-amber-700',
  futes: 'bg-orange-100 text-orange-700',
  palyazat: 'bg-emerald-100 text-emerald-700',
  tippek: 'bg-purple-100 text-purple-700',
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterStatus('loading');
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newsletter',
          data: { email: newsletterEmail },
        }),
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('idle');
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vvm-blue-600 to-vvm-blue-800 text-white pt-28 lg:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Breadcrumbs className="mb-6 justify-center text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300" />
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Tudástár
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Hasznos cikkek, tippek és útmutatók víz–villany–fűtés témában. 
              Segítünk megelőzni a problémákat és spórolni az energián.
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Keresés a cikkekben..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 bg-white shadow-lg focus:ring-2 focus:ring-vvm-yellow-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 sm:py-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-vvm-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {activeCategory === 'all' && searchQuery === '' && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Kiemelt cikkek</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-vvm-blue-100 to-vvm-blue-200 flex items-center justify-center">
                    {post.category === 'viz' && <Droplets className="w-16 h-16 text-vvm-blue-400" />}
                    {post.category === 'villany' && <Zap className="w-16 h-16 text-amber-400" />}
                    {post.category === 'futes' && <Flame className="w-16 h-16 text-orange-400" />}
                    {post.category === 'palyazat' && <Award className="w-16 h-16 text-emerald-400" />}
                  </div>
                  <div className="p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                      {post.categoryLabel}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-vvm-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.date}</span>
                      <span>{post.readTime} olvasás</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {activeCategory === 'all' ? 'Összes cikk' : categories.find(c => c.id === activeCategory)?.name}
            {searchQuery && ` – Keresés: "${searchQuery}"`}
          </h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {post.category === 'viz' && <Droplets className="w-12 h-12 text-sky-400" />}
                    {post.category === 'villany' && <Zap className="w-12 h-12 text-amber-400" />}
                    {post.category === 'futes' && <Flame className="w-12 h-12 text-orange-400" />}
                    {post.category === 'palyazat' && <Award className="w-12 h-12 text-emerald-400" />}
                    {post.category === 'tippek' && <TrendingUp className="w-12 h-12 text-purple-400" />}
                  </div>
                  <div className="p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryColors[post.category]}`}>
                      {post.categoryLabel}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-vvm-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nincs találat a keresésre.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 text-vvm-blue-600 font-medium hover:underline"
              >
                Összes cikk megtekintése
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-vvm-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Ne maradjon le a hasznos tippekről!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Iratkozzon fel hírlevelünkre és kapjon értesítést az új cikkekről, 
            energiatakarékossági tippekről és pályázati lehetőségekről.
          </p>
          
          {newsletterStatus === 'success' ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-lg mx-auto">
              <p className="text-xl font-semibold">✅ Köszönjük a feliratkozást!</p>
              <p className="text-blue-100 mt-2">Hamarosan kapni fog értesítéseket az új cikkekről.</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Az Ön email címe"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-vvm-yellow-400 outline-none"
                required
              />
              <button 
                type="submit" 
                disabled={newsletterStatus === 'loading'}
                className="btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {newsletterStatus === 'loading' ? 'Küldés...' : 'Feliratkozás'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

