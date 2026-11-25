import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/edicao-atual`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/edicoes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/normas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/politicas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/busca`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  const { data: issues } = await supabase
    .from('issues')
    .select('slug, published_at')
    .eq('is_published', true)

  const { data: articles } = await supabase
    .from('published_articles')
    .select('slug, published_at')
    .eq('is_published', true)

  const issueEntries: MetadataRoute.Sitemap = (issues || []).map((iss) => ({
    url: `${SITE_URL}/edicoes/${iss.slug}`,
    lastModified: iss.published_at ? new Date(iss.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const articleEntries: MetadataRoute.Sitemap = (articles || []).map((art) => ({
    url: `${SITE_URL}/artigos/${art.slug}`,
    lastModified: art.published_at ? new Date(art.published_at) : new Date(),
    changeFrequency: 'yearly',
    priority: 0.9,
  }))

  return [...staticRoutes, ...issueEntries, ...articleEntries]
}
