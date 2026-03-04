import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.vizvillanyfutes.hu';
    const lastModified = new Date();

    const routes = [
        '',
        '/vizszerelo-budapest',
        '/villanyszerelo-budapest',
        '/futeskorszerusites',
        '/dugulaselharitas-budapest',
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
        '/blog',
        '/login',
        '/elfelejtett-jelszo',
        '/blog/1',
        '/blog/2',
        '/blog/4',
        '/blog/5',
        '/blog/6',
        '/blog/7',
        '/blog/8',
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
        } else if (route === '/szolgaltatasi-teruletek') {
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
