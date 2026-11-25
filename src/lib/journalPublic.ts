import { supabase } from './supabase'
import { SITE_URL, JOURNAL_INFO } from './siteConfig'

export interface PublicAuthor {
  name: string
  institution?: string
  email?: string
  orcid?: string
  lattes?: string
  bio?: string
}

export function slugify(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

export function getPublicFileUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return ''
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const { data } = supabase.storage.from('publicados').getPublicUrl(pathOrUrl)
  return data?.publicUrl || ''
}

export function formatAuthorAbnt(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/)
  if (parts.length <= 1) return (parts[0] || '').toUpperCase()
  const particles = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])
  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(' ')
  if (particles.has(last.toLowerCase()) && parts.length > 2) {
    const penultimate = parts[parts.length - 2]
    return `${penultimate.toUpperCase()} ${last.toUpperCase()}, ${parts.slice(0, -2).join(' ')}`
  }
  return `${last.toUpperCase()}, ${rest}`
}

export function formatAbntCitation(article: any, issue: any): string {
  const authors: PublicAuthor[] = Array.isArray(article?.authors_json)
    ? article.authors_json
    : []

  let authorsStr = 'AUTOR NÃO INFORMADO'
  if (authors.length === 1) {
    authorsStr = formatAuthorAbnt(authors[0].name)
  } else if (authors.length >= 2 && authors.length <= 3) {
    authorsStr = authors.map((a) => formatAuthorAbnt(a.name)).join('; ')
  } else if (authors.length > 3) {
    authorsStr = `${formatAuthorAbnt(authors[0].name)} et al.`
  }

  const vol = issue?.volume ? `, v. ${issue.volume}` : ''
  const num = issue?.issue_number ? `, n. ${issue.issue_number}` : ''
  const pages =
    article?.page_start && article?.page_end
      ? `, p. ${article.page_start}-${article.page_end}`
      : article?.page_start
        ? `, p. ${article.page_start}`
        : ''
  const year = issue?.year || new Date(article?.published_at || Date.now()).getFullYear()
  const doiPart = article?.doi ? ` DOI: ${article.doi}.` : ''
  const url = `${SITE_URL}/artigos/${article?.slug}`

  return `${authorsStr}. ${article?.title}. ${JOURNAL_INFO.name}, Caruaru${vol}${num}${pages}, ${year}. ISSN ${JOURNAL_INFO.issn}.${doiPart} Disponível em: ${url}.`
}

export const SECTION_ORDER = [
  'Artigos Científicos',
  'Ensaios Teóricos',
  'Relatos de Experiência Clínica',
  'Resenhas',
]
