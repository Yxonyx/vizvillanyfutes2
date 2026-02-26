'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// Page name mappings for Hungarian
const pageNames: Record<string, string> = {
  'vizszerelo-budapest': 'Vízszerelés',
  'villanyszerelo-budapest': 'Villanyszerelés',
  'dugulaselharitas-budapest': 'Duguláselhárítás',
  'futeskorszerusites': 'Fűtéskorszerűsítés',
  'visszahivas': 'Visszahívás',
  'arak': 'Árak',
  'blog': 'Tudástár',
  'gyik': 'GYIK',
  'rolunk': 'Rólunk',
  'kapcsolat': 'Kapcsolat',
  'szolgaltatasi-teruletek': 'Szolgáltatási területek',
  'palyazat-kalkulator': 'Pályázat kalkulátor',
  'general-kivitelezo-partner': 'Generálkivitelezőknek',
  'aszf': 'ÁSZF',
  'adatkezeles': 'Adatkezelés',
  'cookie': 'Cookie tájékoztató',
  'impresszum': 'Impresszum',
};

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
  className?: string;
}

export default function Breadcrumbs({ items, currentPage, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip numeric segments (like blog post IDs)
      if (/^\d+$/.test(segment)) {
        breadcrumbs.push({
          label: `Cikk #${segment}`,
          href: currentPath,
        });
      } else {
        breadcrumbs.push({
          label: pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          href: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();
  const lastItem = currentPage || breadcrumbItems[breadcrumbItems.length - 1]?.label;

  // Don't show breadcrumbs on homepage
  if (pathname === '/') return null;

  // Schema.org structured data for breadcrumbs
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Főoldal',
        'item': 'https://www.vizvillanyfutes.hu',
      },
      ...breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': item.label,
        'item': `https://www.vizvillanyfutes.hu${item.href}`,
      })),
    ],
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Visible breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`text-sm ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          {/* Home */}
          <li className="flex items-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-vvm-blue-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Főoldal</span>
            </Link>
          </li>

          {/* Separator */}
          <li className="text-gray-300">
            <ChevronRight className="w-4 h-4" />
          </li>

          {/* Path segments */}
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index === breadcrumbItems.length - 1 ? (
                // Current page (not a link)
                <span className="text-gray-900 font-medium" aria-current="page">
                  {lastItem}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-vvm-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

