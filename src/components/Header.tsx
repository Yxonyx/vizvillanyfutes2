'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar, ChevronDown, Users, LogIn, LayoutDashboard, LogOut, Shield, AlertTriangle, User } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

interface SubMenuItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  submenu?: SubMenuItem[];
}

// Main navigation - cleaner structure
const mainNav: NavItem[] = [
  {
    name: 'Szolgáltatások',
    href: '/vizszerelo-budapest',
    submenu: [
      { name: 'Vízszerelés', href: '/vizszerelo-budapest' },
      { name: 'Villanyszerelés', href: '/villanyszerelo-budapest' },
      { name: 'Duguláselhárítás', href: '/dugulaselharitas-budapest' },
      { name: 'Fűtéskorszerűsítés', href: '/futeskorszerusites' },
    ]
  },
  { name: 'Árak', href: '/arak' },
  { name: 'Pályázatok', href: '/palyazat-kalkulator' },
];

// Secondary nav - for B2B partners (no dropdown needed)
const secondaryNav: NavItem[] = [
  { name: 'Generálkivitelezőknek', href: '/general-kivitelezo-partner' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const { isAuthenticated, user, role, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
    setIsOpen(false);
    window.location.href = '/';
  };

  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (role === 'admin' || role === 'dispatcher') return '/admin';
    if (role === 'contractor') return '/contractor/dashboard';
    if (role === 'customer') return '/ugyfel/dashboard';
    return '/login';
  };

  // Open the fullscreen map portal overlay
  const openPortal = (mode?: 'contractor' | 'customer', autoAdd?: boolean, initialTab?: 'all' | 'own' | 'account') => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('openPortal', { detail: { mode, autoAdd, initialTab } }));
  };

  const allNavItems = [...mainNav, ...secondaryNav];

  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    if (isMobile) {
      if (item.submenu) {
        return (
          <div key={item.name}>
            <button
              onClick={() => setMobileSubmenu(mobileSubmenu === item.name ? null : item.name)}
              className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <span>{item.name}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${mobileSubmenu === item.name ? 'rotate-180' : ''}`} />
            </button>
            {mobileSubmenu === item.name && (
              <div className="ml-4 space-y-1 pb-2 animate-fade-in">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className="block py-2.5 px-4 text-gray-600 hover:text-vvm-blue-600 text-sm transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }
      return (
        <Link
          key={item.name}
          href={item.href}
          className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          onClick={() => setIsOpen(false)}
        >
          {item.name}
        </Link>
      );
    }

    // Desktop
    return (
      <div
        key={item.name}
        className="relative group"
        onMouseEnter={() => item.submenu && setActiveDropdown(item.name)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <Link
          href={item.href}
          className="px-3 py-2 flex items-center gap-1 text-gray-700 hover:text-vvm-blue-600 font-medium text-sm transition-colors"
        >
          {item.name}
          {item.submenu && (
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
          )}
        </Link>

        {item.submenu && activeDropdown === item.name && (
          <>
            {/* Invisible bridge to prevent gap issues */}
            <div className="absolute top-full left-0 h-2 w-full" />
            <div className="absolute top-full left-0 pt-2 w-52 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className="block px-4 py-2.5 text-gray-600 hover:bg-vvm-blue-50 hover:text-vvm-blue-600 text-sm transition-colors"
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-white py-2.5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0"
              onClick={() => {
                window.dispatchEvent(new Event('closeMarketplaceSimulation'));
              }}
            >
              <Logo size="md" showTagline={!scrolled} />
            </Link>

            {/* Desktop Navigation - Takes remaining space */}
            <nav className="hidden lg:flex items-center justify-between flex-1">
              {/* Left Nav Items */}
              <div className="flex items-center gap-1">
                {mainNav.map((item) => renderNavItem(item))}
                <div className="h-5 w-px bg-gray-200 mx-2"></div>
                {secondaryNav.map((item) => renderNavItem(item))}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <>
                        {/* Role-specific portal link */}
                        <button
                          onClick={() => openPortal(role === 'contractor' ? 'contractor' : 'customer')}
                          className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-vvm-blue-600 transition-colors flex items-center gap-1.5"
                        >
                          {(role === 'contractor') ? (
                            <>
                              <LogIn className="w-4 h-4" />
                              <span>Szakember portál</span>
                            </>
                          ) : (role === 'admin' || role === 'dispatcher') ? (
                            <>
                              <Shield className="w-4 h-4" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4" />
                              <span>Ügyfél portál</span>
                            </>
                          )}
                        </button>

                        {/* Saját fiókom dropdown */}
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveDropdown('account')}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          <button
                            className="px-4 py-2 text-sm font-bold text-vvm-blue-700 bg-vvm-blue-50 hover:bg-vvm-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <User className="w-4 h-4" />
                            <span>Saját fiókom</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'account' ? 'rotate-180' : ''}`} />
                          </button>

                          {activeDropdown === 'account' && (
                            <>
                              <div className="absolute top-full left-0 h-2 w-full" />
                              <div className="absolute top-full right-0 pt-2 w-56 z-50">
                                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                                  <div className="px-4 py-2 border-b border-gray-100">
                                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bejelentkezve mint</div>
                                    <div className="text-sm font-bold text-slate-800 truncate mt-0.5">{user?.email}</div>
                                    <div className="text-xs text-vvm-blue-600 font-medium mt-0.5">
                                      {role === 'contractor' ? 'Szakember' : role === 'admin' ? 'Admin' : role === 'dispatcher' ? 'Diszpécser' : 'Ügyfél'}
                                    </div>
                                  </div>
                                  <Link
                                    href="/fiok"
                                    className="block w-full text-left px-4 py-2.5 text-gray-600 hover:bg-vvm-blue-50 hover:text-vvm-blue-600 text-sm transition-colors flex items-center gap-2"
                                  >
                                    <User className="w-4 h-4" />
                                    Fiók adataim
                                  </Link>
                                  <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm transition-colors flex items-center gap-2"
                                  >
                                    <LogOut className="w-4 h-4" />
                                    Kijelentkezés
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openPortal('contractor')}
                          className="px-2 py-2 text-sm font-medium text-slate-600 hover:text-vvm-blue-600 transition-colors flex items-center gap-1.5"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Szakember portál</span>
                        </button>
                        <button
                          onClick={() => openPortal('customer')}
                          className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <User className="w-4 h-4" />
                          <span>Ügyfél portál</span>
                        </button>
                      </>
                    )}
                  </>
                )}
                {/* Hide CTA when logged in as contractor */}
                {role !== 'contractor' && (
                  <button
                    onClick={() => openPortal('customer', true)}
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Probléma bejelentése</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {allNavItems.map((item) => renderNavItem(item, true))}

              {/* Auth Section - Mobile */}
              {!isLoading && (
                <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                  {isAuthenticated ? (
                    <>
                      {/* User info */}
                      <div className="px-4 py-2 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bejelentkezve mint</div>
                        <div className="text-sm font-bold text-slate-800 truncate mt-0.5">{user?.email}</div>
                        <div className="text-xs text-vvm-blue-600 font-medium mt-0.5">
                          {role === 'contractor' ? 'Szakember' : role === 'admin' ? 'Admin' : role === 'dispatcher' ? 'Diszpécser' : 'Ügyfél'}
                        </div>
                      </div>
                      {/* Role-specific portal link */}
                      <button
                        className="flex items-center gap-2 py-3 px-4 text-slate-700 hover:bg-gray-50 rounded-lg font-medium w-full"
                        onClick={() => openPortal(role === 'contractor' ? 'contractor' : 'customer')}
                      >
                        {role === 'contractor' ? (
                          <><LogIn className="w-5 h-5" /><span>Szakember portál</span></>
                        ) : (role === 'admin' || role === 'dispatcher') ? (
                          <><Shield className="w-5 h-5" /><span>Admin</span></>
                        ) : (
                          <><User className="w-5 h-5" /><span>Ügyfél portál</span></>
                        )}
                      </button>
                      {/* Saját fiókom */}
                      <Link
                        href="/fiok"
                        className="flex items-center gap-2 py-3 px-4 bg-vvm-blue-50 text-vvm-blue-700 rounded-lg font-bold w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Saját fiókom</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Kijelentkezés</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="flex items-center gap-2 py-3 px-4 text-slate-600 hover:bg-gray-50 rounded-lg font-medium w-full"
                        onClick={() => openPortal('contractor')}
                      >
                        <LogIn className="w-5 h-5" />
                        <span>Szakember portál</span>
                      </button>
                      <button
                        className="flex items-center gap-2 py-3 px-4 bg-emerald-50 text-emerald-700 rounded-lg font-bold w-full"
                        onClick={() => openPortal('customer')}
                      >
                        <User className="w-5 h-5" />
                        <span>Ügyfél portál</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Main CTA - Mobile (hide for contractors) */}
              {role !== 'contractor' && (
                <div className="pt-3">
                  <button
                    className="btn-primary w-full justify-center"
                    onClick={() => openPortal('customer', true)}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>Probléma bejelentése</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom CTA Bar - hidden when authenticated (app mode) */}
      {!isAuthenticated && role !== 'contractor' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={() => openPortal('customer', true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-vvm-yellow-400 text-vvm-blue-800 font-bold"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Probléma bejelentése</span>
          </button>
        </div>
      )}
    </>
  );
}
