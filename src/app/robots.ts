import type { MetadataRoute } from 'next';

/**
 * Next.js 14 App Router Robots Generator
 * Configured for Search Engine Optimization (SEO) and Answer Engine Optimization (AEO).
 * Explicitly welcomes AI search agents (Perplexity, ChatGPT, Claude) to crawl public content.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://chipng.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/settings/',
          '/login',
          '/signup',
          '/checkout/processing',
          '/*?*sort=',
          '/*?*filter='
        ]
      },
      // Dedicated AEO rules welcoming AI Answer Bots
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot',
          'cohere-ai'
        ],
        allow: [
          '/',
          '/buy-card',
          '/shop',
          '/pricing',
          '/faq',
          '/blog/',
          '/company',
          '/contact',
          '/nfc-*',
          '/digital-*'
        ],
        disallow: ['/admin/', '/dashboard/', '/api/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
