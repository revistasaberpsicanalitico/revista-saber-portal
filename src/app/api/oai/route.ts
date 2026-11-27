import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SITE_URL, JOURNAL_INFO } from '@/lib/siteConfig'
import { getPublicFileUrl, PublicAuthor, slugify } from '@/lib/journalPublic'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function escapeXml(str: string): string {
  return (str || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function oaiWrap(verbTag: string, innerXml: string, baseUrl: string, params: Record<string, string>) {
  const attrs = Object.entries(params)
    .map(([k, v]) => `${k}="${escapeXml(v)}"`)
    .join(' ')
  const resDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${resDate}</responseDate>
  <request${attrs ? ' ' + attrs : ''}>${escapeXml(baseUrl)}</request>
  ${verbTag ? `<${verbTag}>${innerXml}</${verbTag}>` : innerXml}
</OAI-PMH>`
}

function oaiError(code: string, message: string, baseUrl: string) {
  return oaiWrap('', `<error code="${escapeXml(code)}">${escapeXml(message)}</error>`, baseUrl, {})
}

function xmlResponse(xml: string) {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

function buildRecordHeader(art: any) {
  const datestamp = new Date(art.published_at || art.created_at || Date.now())
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
  const setSpec = slugify(art.section || 'artigos-cientificos')

  return `<header>
      <identifier>oai:saberpsicanalitico:article/${escapeXml(art.id)}</identifier>
      <datestamp>${datestamp}</datestamp>
      <setSpec>${escapeXml(setSpec)}</setSpec>
    </header>`
}

function buildRecordMetadata(art: any, cleanSiteUrl: string) {
  const issue = art.issue as any
  const authors: PublicAuthor[] = Array.isArray(art.authors_json) ? art.authors_json : []
  const articleUrl = `${cleanSiteUrl}/artigos/${art.slug}`
  const pdfUrl = getPublicFileUrl(art.pdf_url)
  const dateStr = new Date(art.published_at || art.created_at || Date.now()).toISOString().split('T')[0]
  const sourceStr = issue
    ? `${JOURNAL_INFO.name}; v. ${issue.volume}, n. ${issue.issue_number} (${issue.year}); ISSN ${JOURNAL_INFO.issn}`
    : `${JOURNAL_INFO.name}; ISSN ${JOURNAL_INFO.issn}`

  const creatorsXml = authors
    .filter((a) => a.name && a.name.trim())
    .map((a) => `        <dc:creator>${escapeXml(a.name)}</dc:creator>`)
    .join('\n')

  const keywordsXml = (art.keywords || '')
    .split(/[;,]/)
    .map((k: string) => k.trim())
    .filter(Boolean)
    .map((k: string) => `        <dc:subject>${escapeXml(k)}</dc:subject>`)
    .join('\n')

  return `<metadata>
      <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                 xmlns:dc="http://purl.org/dc/elements/1.1/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
        <dc:title>${escapeXml(art.title)}</dc:title>
        ${art.title_en ? `<dc:title>${escapeXml(art.title_en)}</dc:title>` : ''}
${creatorsXml}
${keywordsXml}
        ${art.abstract ? `<dc:description>${escapeXml(art.abstract)}</dc:description>` : ''}
        <dc:publisher>${escapeXml(JOURNAL_INFO.maintainer)}</dc:publisher>
        <dc:date>${dateStr}</dc:date>
        <dc:type>info:eu-repo/semantics/article</dc:type>
        <dc:format>application/pdf</dc:format>
        <dc:identifier>${escapeXml(articleUrl)}</dc:identifier>
        ${pdfUrl ? `<dc:identifier>${escapeXml(pdfUrl)}</dc:identifier>` : ''}
        ${art.doi ? `<dc:identifier>https://doi.org/${escapeXml(art.doi.replace(/^https?:\/\/doi\.org\//, ''))}</dc:identifier>` : ''}
        <dc:source>${escapeXml(sourceStr)}</dc:source>
        <dc:language>por</dc:language>
        <dc:rights>${escapeXml(JOURNAL_INFO.licenseUrl)}</dc:rights>
      </oai_dc:dc>
    </metadata>`
}

async function handleOai(searchParams: URLSearchParams) {
  const cleanSiteUrl = SITE_URL.replace(/\/+$/, '')
  const baseUrl = `${cleanSiteUrl}/api/oai`
  const verb = searchParams.get('verb') || ''
  const metadataPrefix = searchParams.get('metadataPrefix') || ''
  const identifier = searchParams.get('identifier') || ''
  const setParam = searchParams.get('set') || ''
  const fromParam = searchParams.get('from') || ''
  const untilParam = searchParams.get('until') || ''
  const resumptionToken = searchParams.get('resumptionToken') || ''

  const paramsUsed: Record<string, string> = {}
  if (verb) paramsUsed.verb = verb
  if (metadataPrefix) paramsUsed.metadataPrefix = metadataPrefix
  if (identifier) paramsUsed.identifier = identifier
  if (setParam) paramsUsed.set = setParam
  if (fromParam) paramsUsed.from = fromParam
  if (untilParam) paramsUsed.until = untilParam

  if (verb === 'Identify') {
    return xmlResponse(
      oaiWrap(
        'Identify',
        `<repositoryName>${escapeXml(JOURNAL_INFO.name)}</repositoryName>
    <baseURL>${escapeXml(baseUrl)}</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>${escapeXml(JOURNAL_INFO.email)}</adminEmail>
    <earliestDatestamp>2025-01-01T00:00:00Z</earliestDatestamp>
    <deletedRecord>no</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>`,
        baseUrl,
        paramsUsed
      )
    )
  }

  if (verb === 'ListMetadataFormats') {
    return xmlResponse(
      oaiWrap(
        'ListMetadataFormats',
        `<metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>`,
        baseUrl,
        paramsUsed
      )
    )
  }

  if (verb === 'ListSets') {
    if (resumptionToken) {
      return xmlResponse(oaiError('badResumptionToken', 'Token de continuação inválido.', baseUrl))
    }
    const sets = [
      { spec: 'artigos-cientificos', name: 'Artigos Científicos' },
      { spec: 'ensaios-teoricos', name: 'Ensaios Teóricos' },
      { spec: 'relatos-de-experiencia-clinica', name: 'Relatos de Experiência Clínica' },
      { spec: 'resenhas', name: 'Resenhas' },
    ]
    const setsXml = sets
      .map((s) => `<set><setSpec>${s.spec}</setSpec><setName>${escapeXml(s.name)}</setName></set>`)
      .join('\n    ')
    return xmlResponse(oaiWrap('ListSets', setsXml, baseUrl, paramsUsed))
  }

  if (verb === 'ListIdentifiers' || verb === 'ListRecords') {
    if (resumptionToken) {
      return xmlResponse(oaiError('badResumptionToken', 'Token de continuação inválido.', baseUrl))
    }
    if (!metadataPrefix) {
      return xmlResponse(oaiError('badArgument', 'Parâmetro metadataPrefix é obrigatório.', baseUrl))
    }
    if (metadataPrefix !== 'oai_dc') {
      return xmlResponse(oaiError('cannotDisseminateFormat', 'Formato suportado: oai_dc.', baseUrl))
    }

    const { data } = await supabase
      .from('published_articles')
      .select('*, issue:issue_id(title, volume, issue_number, year, slug)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    let rows = data || []
    if (setParam) {
      rows = rows.filter((r) => slugify(r.section || 'artigos-cientificos') === setParam)
    }
    if (fromParam) {
      const trimmedFrom = fromParam.trim()
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmedFrom)
      const fromTime = new Date(isDateOnly ? `${trimmedFrom}T00:00:00.000Z` : trimmedFrom).getTime()
      if (isNaN(fromTime)) {
        return xmlResponse(oaiError('badArgument', 'Formato de data inválido em from.', baseUrl))
      }
      rows = rows.filter((r) => new Date(r.published_at || r.created_at).getTime() >= fromTime)
    }
    if (untilParam) {
      const trimmedUntil = untilParam.trim()
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmedUntil)
      const untilTime = new Date(isDateOnly ? `${trimmedUntil}T23:59:59.999Z` : trimmedUntil).getTime()
      if (isNaN(untilTime)) {
        return xmlResponse(oaiError('badArgument', 'Formato de data inválido em until.', baseUrl))
      }
      rows = rows.filter((r) => new Date(r.published_at || r.created_at).getTime() <= untilTime)
    }

    if (rows.length === 0) {
      return xmlResponse(oaiError('noRecordsMatch', 'Nenhum registro publicado encontrado para os filtros.', baseUrl))
    }

    if (verb === 'ListIdentifiers') {
      const headersXml = rows.map((art) => buildRecordHeader(art)).join('\n    ')
      return xmlResponse(oaiWrap('ListIdentifiers', headersXml, baseUrl, paramsUsed))
    }

    const recordsXml = rows
      .map((art) => `<record>\n    ${buildRecordHeader(art)}\n    ${buildRecordMetadata(art, cleanSiteUrl)}\n  </record>`)
      .join('\n  ')
    return xmlResponse(oaiWrap('ListRecords', recordsXml, baseUrl, paramsUsed))
  }

  if (verb === 'GetRecord') {
    if (!identifier || !metadataPrefix) {
      return xmlResponse(oaiError('badArgument', 'Parâmetros identifier e metadataPrefix são obrigatórios.', baseUrl))
    }
    if (metadataPrefix !== 'oai_dc') {
      return xmlResponse(oaiError('cannotDisseminateFormat', 'Formato suportado: oai_dc.', baseUrl))
    }

    const cleanId = identifier.replace('oai:saberpsicanalitico:article/', '').trim()
    const { data: art } = await supabase
      .from('published_articles')
      .select('*, issue:issue_id(title, volume, issue_number, year, slug)')
      .eq('id', cleanId)
      .eq('is_published', true)
      .maybeSingle()

    if (!art) {
      return xmlResponse(oaiError('idDoesNotExist', 'Identificador não localizado.', baseUrl))
    }

    const recXml = `<record>\n    ${buildRecordHeader(art)}\n    ${buildRecordMetadata(art, cleanSiteUrl)}\n  </record>`
    return xmlResponse(oaiWrap('GetRecord', recXml, baseUrl, paramsUsed))
  }

  return xmlResponse(
    oaiError(
      'badVerb',
      'Informe um verb OAI-PMH válido (Identify, ListMetadataFormats, ListSets, ListIdentifiers, ListRecords, GetRecord).',
      baseUrl
    )
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  return handleOai(searchParams)
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const merged = new URLSearchParams(searchParams)
  try {
    const bodyText = await req.text()
    if (bodyText) {
      const formParams = new URLSearchParams(bodyText)
      formParams.forEach((v, k) => merged.set(k, v))
    }
  } catch {
    // ignore empty body
  }
  return handleOai(merged)
}
