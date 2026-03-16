import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sendrix.in'
  
  // Base routes from specification
  const routes = [
    {
      url: '',
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: '/pricing',
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: '/features',
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: '/docs',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: '/blog',
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: '/login',
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: '/signup',
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: '/about',
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: '/contact',
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: '/privacy',
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: '/terms',
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic blog slugs from src/app/blog/page.tsx
  const blogSlugs = [
    'onboarding-email-guide',
    'reduce-activation-gap',
    'product-launch-strategy',
    'webhook-integration-guide',
  ]

  const blogRoutes = blogSlugs.map(slug => ({
    url: `/blog/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const allRoutes = [...routes, ...blogRoutes]

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
