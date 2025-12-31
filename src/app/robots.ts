import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/newspapers/', '/magazines/', '/partnership/', '/categories/'],
            disallow: ['/dashboard/', '/cart/', '/faq/', '/reset-password/', '/forgot-password/', '/login/', '/register/', '/payment/', '/admin/', '/about/', '/organization/'],
        },
        sitemap: 'https://kioskfy.com/sitemap.xml',
    }
}