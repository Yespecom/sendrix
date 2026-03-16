import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/app/'], // Protect internal app and api routes
    },
    sitemap: 'https://sendrix.in/sitemap.xml',
  }
}
