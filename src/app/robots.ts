import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/ugyfel/', '/contractor/', '/api/'],
        },
        sitemap: 'https://www.vizvillanyfutes.hu/sitemap.xml',
    };
}
