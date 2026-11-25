import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteConfig'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/keep-alive', '/api/send-email', '/api/resend-inbound'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
