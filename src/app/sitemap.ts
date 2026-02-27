import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.vizvillanyfutes.hu';
    const lastModified = new Date('2025-01-01');

    const routes = [
        '',
        '/vizszerelo-budapest',
        '/villanyszerelo-budapest',
        '/futeskorszerusites',
        '/dugulaselharitas-budapest',
        '/arak',
        '/gyik',
        '/szolgaltatasi-teruletek',
        '/rolunk',
        '/kapcsolat',
        '/csatlakozz-partnerkent',
        '/ajanlo-program',
        '/general-kivitelezo-partner',
        '/impresszum',
        '/aszf',
        '/adatkezeles',
        '/cookie',
    ];

    return routes.map((route) => {
        let priority = 0.7;
        let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';

        if (route === '') {
            priority = 1.0;
            changeFrequency = 'weekly';
        } else if (
            route === '/vizszerelo-budapest' ||
            route === '/villanyszerelo-budapest' ||
            route === '/futeskorszerusites' ||
            route === '/dugulaselharitas-budapest'
        ) {
            priority = 0.9;
            changeFrequency = 'weekly';
        } else if (route === '/arak' || route === '/szolgaltatasi-teruletek') {
            priority = 0.8;
            changeFrequency = 'monthly';
        }

        return {
            url: `${baseUrl}${route}`,
            lastModified,
            changeFrequency,
            priority,
        };
    });
}
