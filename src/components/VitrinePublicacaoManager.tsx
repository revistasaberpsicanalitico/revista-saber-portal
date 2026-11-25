'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { slugify, getPublicFileUrl, PublicAuthor, SECTION_ORDER } from '@/lib/journalPublic'
import {
  Globe, Plus, Edit3, Trash2, Upload, ExternalLink, CheckCircle2,
  BookOpen, FileText, ChevronDown, ChevronUp, X, Sparkles, Download
} from 'lucide-react'

interface VitrinePublicacaoManagerProps {
  articles: any[]
  profiles: any[]
  getAuthorName: (authorId: string, art?: any) => string
  getAuthorEmail: (authorId: string, art?: any) => string
  getAuthorInst: (authorId: string, art?: any) => string
}

const AXES_LIST = [
  'Fundamentos, História e Epistemologia da Psicanálise',
  'Metapsicologia e Teoria das Pulsões',
  'Clínica Psicanalítica, Técnica e Transferência',
  'Psicopatologia, Sofrimento Psíquico e Sintoma',
  'Infância, Parentalidade e Adolescência',
  'Corpo, Psicossomática e Manifestações Contemporâneas',
  'Sexualidade, Gênero e Relações Familiares',
  'Saúde Mental, Atenção Psicossocial e Instituições',
  'Psicanálise, Relações Étnico-Raciais e Decolonialidade',
  'Psicanálise e Educação',
  'Psicanálise, Filosofia e Ciências Humanas',
  'Psicanálise, Arte, Literatura e Política',
]

export default function VitrinePublicacaoManager({
  articles,
  profiles,
  getAuthorName,
  getAuthorEmail,
  getAuthorInst,
}: VitrinePublicacaoManagerProps) {
  const [expanded, setExpanded] = useState(true)
  const [issues, setIssues] = useState<any[]>([])
  const [pubArticles, setPubArticles] = useState<any[]>([])
  const [selectedIssueId, setSelectedIssueId] = useState<string>('')
  const [loadingData, setLoadingData] = useState(false)

  // Modal / Form Edição
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null)
  const [issVolume, setIssVolume] = useState('1')
  const [issNumber, setIssNumber] = useState('1')
  const [issYear, setIssYear] = useState(String(new Date().getFullYear()))
  const [issTitle, setIssTitle] = useState('')
  const [issSubtitle, setIssSubtitle] = useState('Publicação Semestral • Acesso Aberto')
  const [issSlug, setIssSlug] = useState('')
  const [issEdTitle, setIssEdTitle] = useState('Editorial')
  const [issEdAuthor, setIssEdAuthor] = useState('Dr. Edson Leandro de Almeida')
  const [issPublished, setIssPublished] = useState(true)
  const [issCurrent, setIssCurrent] = useState(true)
  const [issCoverFile, setIssCoverFile] = useState<File | null>(null)
  const [issFullPdfFile, setIssFullPdfFile] = useState<File | null>(null)
  const [issEdPdfFile, setIssEdPdfFile] = useState<File | null>(null)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null)
  const [existingFullPdfUrl, setExistingFullPdfUrl] = useState<string | null>(null)
  const [existingEdPdfUrl, setExistingEdPdfUrl] = useState<string | null>(null)
  const [savingIssue, setSavingIssue] = useState(false)

  // Modal / Form Artigo Publicado
  const [showArtForm, setShowArtForm] = useState(false)
  const [editingArtId, setEditingArtId] = useState<string | null>(null)
  const [sourceArticleId, setSourceArticleId] = useState<string>('')
  const [artSection, setArtSection] = useState('Artigos Científicos')
  const [artAxis, setArtAxis] = useState(AXES_LIST[0])
  const [artTitle, setArtTitle] = useState('')
  const [artTitleEn, setArtTitleEn] = useState('')
  const [artSlug, setArtSlug] = useState('')
  const [artAbstract, setArtAbstract] = useState('')
  const [artAbstractEn, setArtAbstractEn] = useState('')
  const [artKeywords, setArtKeywords] = useState('')
  const [artKeywordsEn, setArtKeywordsEn] = useState('')
  const [artDoi, setArtDoi] = useState('')
  const [artPageStart, setArtPageStart] = useState('')
  const [artPageEnd, setArtPageEnd] = useState('')
  const [artOrder, setArtOrder] = useState('1')
  const [artReceivedAt, setArtReceivedAt] = useState('')
  const [artAcceptedAt, setArtAcceptedAt] = useState('')
  const [artPublishedAt, setArtPublishedAt] = useState(new Date().toISOString().split('T')[0])
  const [artIsPublished, setArtIsPublished] = useState(true)
  const [artAuthors, setArtAuthors] = useState<PublicAuthor[]>([
    { name: '', institution: '', email: '', orcid: '', lattes: '', bio: '' },
  ])
  const [artPdfFile, setArtPdfFile] = useState<File | null>(null)
  const [existingArtPdfUrl, setExistingArtPdfUrl] = useState<string | null>(null)
  const [savingArt, setSavingArt] = useState(false)

  const acceptedPortalArticles = articles.filter((a) => a.status === 'aceito')

  const fetchPublicVitrine = async () => {
    setLoadingData(true)
    try {
      const { data: issData } = await supabase
        .from('issues')
        .select('*')
        .order('year', { ascending: false })
        .order('volume', { ascending: false })
        .order('issue_number', { ascending: false })

      const list = issData || []
      setIssues(list)
      if (list.length > 0 && !list.some((i) => i.id === selectedIssueId)) {
        const cur = list.find((i) => i.is_current) || list[0]
        setSelectedIssueId(cur.id)
      }

      const { data: artData } = await supabase
        .from('published_articles')
        .select('*')
        .order('display_order', { ascending: true })
      setPubArticles(artData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchPublicVitrine()
  }, [])

  const uploadToPublicBucket = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop() || 'pdf'
    const safeName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`
    const { error } = await supabase.storage
      .from('publicados')
      .upload(safeName, file, { upsert: true })
    if (error) throw error
    return safeName
  }

  const openNewIssueForm = () => {
    setEditingIssueId(null)
    setIssVolume('1')
    setIssNumber('1')
    setIssYear(String(new Date().getFullYear()))
    setIssTitle('')
    setIssSubtitle('Publicação Semestral • Acesso Aberto')
    setIssSlug('')
    setIssEdTitle('Editorial')
    setIssEdAuthor('Dr. Edson Leandro de Almeida')
    setIssPublished(true)
    setIssCurrent(issues.length === 0)
    setIssCoverFile(null)
    setIssFullPdfFile(null)
    setIssEdPdfFile(null)
    setExistingCoverUrl(null)
    setExistingFullPdfUrl(null)
    setExistingEdPdfUrl(null)
    setShowIssueForm(true)
  }

  const openEditIssueForm = (iss: any) => {
    setEditingIssueId(iss.id)
    setIssVolume(String(iss.volume || 1))
    setIssNumber(String(iss.issue_number || 1))
    setIssYear(String(iss.year || new Date().getFullYear()))
    setIssTitle(iss.title || '')
    setIssSubtitle(iss.subtitle || '')
    setIssSlug(iss.slug || '')
    setIssEdTitle(iss.editorial_title || '')
    setIssEdAuthor(iss.editorial_author || '')
    setIssPublished(Boolean(iss.is_published))
    setIssCurrent(Boolean(iss.is_current))
    setIssCoverFile(null)
    setIssFullPdfFile(null)
    setIssEdPdfFile(null)
    setExistingCoverUrl(iss.cover_image_url || null)
    setExistingFullPdfUrl(iss.full_issue_pdf_url || null)
    setExistingEdPdfUrl(iss.editorial_pdf_url || null)
    setShowIssueForm(true)
  }

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issTitle.trim()) return alert('Informe o título da edição.')
    setSavingIssue(true)
    try {
      let coverUrl = existingCoverUrl
      let fullPdfUrl = existingFullPdfUrl
      let edPdfUrl = existingEdPdfUrl

      if (issCoverFile) coverUrl = await uploadToPublicBucket(issCoverFile, 'capas')
      if (issFullPdfFile) fullPdfUrl = await uploadToPublicBucket(issFullPdfFile, 'fasciculos')
      if (issEdPdfFile) edPdfUrl = await uploadToPublicBucket(issEdPdfFile, 'editoriais')

      let finalSlug = slugify(issSlug.trim() || issTitle)
      if (!finalSlug) finalSlug = `edicao-${Date.now()}`
      if (!editingIssueId && issues.some((i) => i.slug === finalSlug)) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`
      }

      if (issCurrent) {
        await supabase.from('issues').update({ is_current: false }).neq('id', editingIssueId || '00000000-0000-0000-0000-000000000000')
      }

      const payload = {
        volume: Number(issVolume) || 1,
        issue_number: Number(issNumber) || 1,
        year: Number(issYear) || new Date().getFullYear(),
        title: issTitle.trim(),
        subtitle: issSubtitle.trim() || null,
        slug: finalSlug,
        cover_image_url: coverUrl,
        full_issue_pdf_url: fullPdfUrl,
        editorial_title: issEdTitle.trim() || null,
        editorial_author: issEdAuthor.trim() || null,
        editorial_pdf_url: edPdfUrl,
        is_published: issPublished,
        is_current: issCurrent,
      }

      if (editingIssueId) {
        const { error } = await supabase.from('issues').update(payload).eq('id', editingIssueId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('issues').insert(payload).select().single()
        if (error) throw error
        if (data?.id) setSelectedIssueId(data.id)
      }

      alert('Edição salva com sucesso!')
      setShowIssueForm(false)
      fetchPublicVitrine()
    } catch (err: any) {
      alert(`Erro ao salvar edição: ${err.message}`)
    } finally {
      setSavingIssue(false)
    }
  }

  const handleDeleteIssue = async (iss: any) => {
    if (!window.confirm(`Excluir a edição "${iss.title}" e todos os artigos publicados vinculados a ela na vitrine?\n\n(Os manuscritos internos de submissão não serão afetados.)`)) {
      return
    }
    try {
      const { error } = await supabase.from('issues').delete().eq('id', iss.id)
      if (error) throw error
      alert('Edição removida da vitrine.')
      fetchPublicVitrine()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const openNewArtForm = () => {
    if (!selectedIssueId) return alert('Crie ou selecione uma edição primeiro.')
    const currentCount = pubArticles.filter((a) => a.issue_id === selectedIssueId).length
    setEditingArtId(null)
    setSourceArticleId('')
    setArtSection('Artigos Científicos')
    setArtAxis(AXES_LIST[0])
    setArtTitle('')
    setArtTitleEn('')
    setArtSlug('')
    setArtAbstract('')
    setArtAbstractEn('')
    setArtKeywords('')
    setArtKeywordsEn('')
    setArtDoi('')
    setArtPageStart('')
    setArtPageEnd('')
    setArtOrder(String(currentCount + 1))
    setArtReceivedAt('')
    setArtAcceptedAt('')
    setArtPublishedAt(new Date().toISOString().split('T')[0])
    setArtIsPublished(true)
    setArtAuthors([{ name: '', institution: '', email: '', orcid: '', lattes: '', bio: '' }])
    setArtPdfFile(null)
    setExistingArtPdfUrl(null)
    setShowArtForm(true)
  }

  const openEditArtForm = (art: any) => {
    setEditingArtId(art.id)
    setSourceArticleId(art.source_article_id || '')
    setArtSection(art.section || 'Artigos Científicos')
    setArtAxis(art.thematic_axis || AXES_LIST[0])
    setArtTitle(art.title || '')
    setArtTitleEn(art.title_en || '')
    setArtSlug(art.slug || '')
    setArtAbstract(art.abstract || '')
    setArtAbstractEn(art.abstract_en || '')
    setArtKeywords(art.keywords || '')
    setArtKeywordsEn(art.keywords_en || '')
    setArtDoi(art.doi || '')
    setArtPageStart(art.page_start || '')
    setArtPageEnd(art.page_end || '')
    setArtOrder(String(art.display_order || 1))
    setArtReceivedAt(art.received_at ? art.received_at.split('T')[0] : '')
    setArtAcceptedAt(art.accepted_at ? art.accepted_at.split('T')[0] : '')
    setArtPublishedAt(art.published_at ? art.published_at.split('T')[0] : new Date().toISOString().split('T')[0])
    setArtIsPublished(Boolean(art.is_published))
    setArtAuthors(
      Array.isArray(art.authors_json) && art.authors_json.length > 0
        ? art.authors_json
        : [{ name: '', institution: '', email: '', orcid: '', lattes: '', bio: '' }]
    )
    setArtPdfFile(null)
    setExistingArtPdfUrl(art.pdf_url || null)
    setShowArtForm(true)
  }

  const handleImportAcceptedArticle = (portalId: string) => {
    setSourceArticleId(portalId)
    const found = acceptedPortalArticles.find((a) => a.id === portalId)
    if (!found) return

    const mainProf = profiles.find((p) => p.id === found.author_id)
    const mainAuthor: PublicAuthor = {
      name: getAuthorName(found.author_id, found),
      institution: found.author_institution || getAuthorInst(found.author_id, found),
      email: getAuthorEmail(found.author_id, found),
      orcid: found.author_orcid || mainProf?.orcid || '',
      lattes: found.author_lattes || mainProf?.lattes_url || '',
      bio: found.author_bio || mainProf?.mini_bio || '',
    }

    const coList: PublicAuthor[] = Array.isArray(found.coauthors)
      ? found.coauthors.map((c: any) => ({
          name: c.name || '',
          institution: c.institution || '',
          email: c.email || '',
          orcid: c.orcid || '',
          lattes: c.lattes || '',
          bio: c.bio || '',
        }))
      : []

    setArtSection(found.section || 'Artigos Científicos')
    setArtAxis(found.thematic_axis || AXES_LIST[0])
    setArtTitle(found.title || '')
    setArtTitleEn(found.title_en || '')
    setArtSlug(slugify(found.title || ''))
    setArtAbstract(found.abstract || '')
    setArtAbstractEn(found.abstract_en || '')
    setArtKeywords(found.keywords || '')
    setArtKeywordsEn(found.keywords_en || '')
    setArtDoi(found.doi || '')
    setArtReceivedAt(found.created_at ? found.created_at.split('T')[0] : '')
    setArtAcceptedAt(found.updated_at ? found.updated_at.split('T')[0] : '')
    setArtAuthors([mainAuthor, ...coList])
  }

  const handleSavePublishedArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIssueId) return alert('Selecione uma edição.')
    if (!artTitle.trim()) return alert('Informe o título do artigo.')
    const validAuthors = artAuthors.filter((a) => a.name.trim())
    if (validAuthors.length === 0) return alert('Informe ao menos 1 autor.')

    setSavingArt(true)
    try {
      let pdfUrl = existingArtPdfUrl
      if (artPdfFile) {
        pdfUrl = await uploadToPublicBucket(artPdfFile, 'artigos')
      }

      let finalSlug = slugify(artSlug.trim() || artTitle)
      if (!finalSlug) finalSlug = `artigo-${Date.now()}`
      if (!editingArtId && pubArticles.some((a) => a.slug === finalSlug)) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`
      }

      const payload = {
        issue_id: selectedIssueId,
        source_article_id: sourceArticleId || null,
        section: artSection,
        thematic_axis: artAxis || null,
        title: artTitle.trim(),
        title_en: artTitleEn.trim() || null,
        slug: finalSlug,
        abstract: artAbstract.trim() || null,
        abstract_en: artAbstractEn.trim() || null,
        keywords: artKeywords.trim() || null,
        keywords_en: artKeywordsEn.trim() || null,
        authors_json: validAuthors,
        doi: artDoi.trim() || null,
        pdf_url: pdfUrl,
        page_start: artPageStart.trim() || null,
        page_end: artPageEnd.trim() || null,
        display_order: Number(artOrder) || 1,
        received_at: artReceivedAt ? new Date(`${artReceivedAt}T12:00:00`).toISOString() : null,
        accepted_at: artAcceptedAt ? new Date(`${artAcceptedAt}T12:00:00`).toISOString() : null,
        published_at: artPublishedAt ? new Date(`${artPublishedAt}T12:00:00`).toISOString() : new Date().toISOString(),
        is_published: artIsPublished,
      }

      if (editingArtId) {
        const { error } = await supabase.from('published_articles').update(payload).eq('id', editingArtId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('published_articles').insert(payload)
        if (error) throw error
      }

      alert('Artigo publicado/atualizado na vitrine pública com sucesso!')
      setShowArtForm(false)
      fetchPublicVitrine()
    } catch (err: any) {
      alert(`Erro ao salvar artigo: ${err.message}`)
    } finally {
      setSavingArt(false)
    }
  }

  const handleDeletePublishedArticle = async (art: any) => {
    if (!window.confirm(`Remover "${art.title}" da vitrine pública?`)) return
    try {
      const { error } = await supabase.from('published_articles').delete().eq('id', art.id)
      if (error) throw error
      fetchPublicVitrine()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const articlesOfSelectedIssue = pubArticles.filter((a) => a.issue_id === selectedIssueId)
  const selectedIssueObj = issues.find((i) => i.id === selectedIssueId)

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 shadow-sm overflow-hidden">
      {/* Cabeçalho retrátil */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Vitrine Pública & Indexadores (Google Acadêmico / OAI-PMH)
          </span>
          <h3 className="text-base sm:text-lg font-bold mt-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-300" />
            Publicador Oficial de Edições e Artigos no Site
          </h3>
          <p className="text-xs text-slate-300">
            Cadastre as edições anteriores ou publique os artigos aceitos diretamente nas páginas abertas da revista.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-center"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Minimizar Painel
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Abrir Publicador
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-5 sm:p-6 space-y-6 bg-slate-50/50">
          {/* BLOCO 1: EDIÇÕES */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  1. Edições / Fascículos ({issues.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Suba a capa e o PDF completo do fascículo, ou clique em uma edição para gerenciar seus artigos individuais.
                </p>
              </div>
              <button
                type="button"
                onClick={openNewIssueForm}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Nova Edição / Fascículo
              </button>
            </div>

            {loadingData ? (
              <p className="text-xs text-slate-400 py-4 text-center">Carregando edições...</p>
            ) : issues.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-xl text-xs text-slate-500">
                Nenhuma edição cadastrada na vitrine ainda. Clique em <strong>&ldquo;Nova Edição / Fascículo&rdquo;</strong> para cadastrar seus fascículos publicados!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {issues.map((iss) => {
                  const isSelected = iss.id === selectedIssueId
                  const count = pubArticles.filter((a) => a.issue_id === iss.id).length

                  return (
                    <div
                      key={iss.id}
                      onClick={() => setSelectedIssueId(iss.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {iss.cover_image_url ? (
                          <img
                            src={getPublicFileUrl(iss.cover_image_url)}
                            alt={iss.title}
                            className="w-14 h-20 object-cover rounded border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-20 bg-slate-100 rounded border flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                            v.{iss.volume} n.{iss.issue_number}
                          </div>
                        )}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {iss.is_current && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Edição Atual
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                iss.is_published
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {iss.is_published ? 'Publicada' : 'Rascunho'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold">
                              {count} {count === 1 ? 'artigo' : 'artigos'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 truncate">{iss.title}</p>
                          <p className="text-[11px] text-slate-500">
                            v. {iss.volume}, n. {iss.issue_number} ({iss.year})
                            {iss.full_issue_pdf_url ? ' • PDF Completo anexado' : ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/70 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {iss.is_published && (
                          <a
                            href={`/edicoes/${iss.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1"
                          >
                            Ver no Site <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditIssueForm(iss)}
                          className="px-2.5 py-1 text-[11px] font-semibold border rounded-lg bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIssue(iss)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 bg-white"
                          title="Excluir edição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* BLOCO 2: ARTIGOS DA EDIÇÃO SELECIONADA */}
          {selectedIssueObj && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    2. Artigos Publicados em: <span className="text-indigo-700">{selectedIssueObj.title}</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cada artigo aqui ganha URL exclusiva, citação ABNT e meta tags para o Google Acadêmico.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewArtForm}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Publicar Artigo nesta Edição
                </button>
              </div>

              {articlesOfSelectedIssue.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl text-xs text-slate-500">
                  Nenhum artigo individual publicado nesta edição ainda. Clique em <strong>&ldquo;Publicar Artigo nesta Edição&rdquo;</strong> para importar um artigo aceito ou cadastrar um artigo de edição anterior.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {articlesOfSelectedIssue.map((art) => {
                    const authors: PublicAuthor[] = Array.isArray(art.authors_json) ? art.authors_json : []
                    return (
                      <div
                        key={art.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="font-bold text-slate-700">#{art.display_order}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100 font-semibold">
                              {art.section}
                            </span>
                            {art.page_start && (
                              <span className="text-slate-500">
                                p. {art.page_start}{art.page_end ? `-${art.page_end}` : ''}
                              </span>
                            )}
                            {art.pdf_url ? (
                              <span className="text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> PDF individual OK
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold">Sem PDF individual</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900">{art.title}</p>
                          <p className="text-xs text-slate-600">{authors.map((a) => a.name).join(' • ')}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {art.is_published && (
                            <a
                              href={`/artigos/${art.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 inline-flex items-center gap-1"
                            >
                              Ver Página <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {art.pdf_url && (
                            <a
                              href={getPublicFileUrl(art.pdf_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border rounded-lg hover:bg-slate-50 inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditArtForm(art)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border rounded-lg hover:bg-slate-50 inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePublishedArticle(art)}
                            className="p-1.5 text-rose-500 bg-white border border-rose-200 rounded-lg hover:bg-rose-50"
                            title="Remover da vitrine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL FORM EDIÇÃO */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[95] overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border space-y-4 max-h-[92vh] overflow-y-auto my-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">
                {editingIssueId ? 'Editar Edição / Fascículo' : 'Nova Edição / Fascículo'}
              </h3>
              <button type="button" onClick={() => setShowIssueForm(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveIssue} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Volume *</label>
                  <input type="number" min="1" required value={issVolume} onChange={(e) => setIssVolume(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número *</label>
                  <input type="number" min="1" required value={issNumber} onChange={(e) => setIssNumber(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ano *</label>
                  <input type="number" min="2020" required value={issYear} onChange={(e) => setIssYear(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título da Edição * (Ex: v. 1, n. 1 — Dezembro de 2025)</label>
                <input
                  type="text"
                  required
                  value={issTitle}
                  onChange={(e) => {
                    setIssTitle(e.target.value)
                    if (!editingIssueId) setIssSlug(slugify(e.target.value))
                  }}
                  placeholder="v. 1, n. 1 — Dezembro de 2025"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtítulo / Descrição</label>
                  <input type="text" value={issSubtitle} onChange={(e) => setIssSubtitle(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Amigável (Slug)</label>
                  <input type="text" value={issSlug} onChange={(e) => setIssSlug(e.target.value)} placeholder="v1-n1-dez-2025" className="w-full px-3 py-1.5 border rounded-lg font-mono" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título do Editorial</label>
                  <input type="text" value={issEdTitle} onChange={(e) => setIssEdTitle(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Autor(a) do Editorial</label>
                  <input type="text" value={issEdAuthor} onChange={(e) => setIssEdAuthor(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Imagem de Capa (Opcional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setIssCoverFile(e.target.files?.[0] || null)} className="w-full text-[11px]" />
                  {existingCoverUrl && !issCoverFile && <span className="text-[10px] text-emerald-700 font-semibold">Capa atual salva ✓</span>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PDF Fascículo Completo</label>
                  <input type="file" accept=".pdf" onChange={(e) => setIssFullPdfFile(e.target.files?.[0] || null)} className="w-full text-[11px]" />
                  {existingFullPdfUrl && !issFullPdfFile && <span className="text-[10px] text-emerald-700 font-semibold">PDF atual salvo ✓</span>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PDF do Editorial (Opcional)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setIssEdPdfFile(e.target.files?.[0] || null)} className="w-full text-[11px]" />
                  {existingEdPdfUrl && !issEdPdfFile && <span className="text-[10px] text-emerald-700 font-semibold">Editorial salvo ✓</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input type="checkbox" checked={issPublished} onChange={(e) => setIssPublished(e.target.checked)} className="rounded text-indigo-600" />
                  Publicada no site (visível ao público)
                </label>
                <label className="flex items-center gap-2 font-semibold text-emerald-800 cursor-pointer">
                  <input type="checkbox" checked={issCurrent} onChange={(e) => setIssCurrent(e.target.checked)} className="rounded text-emerald-600" />
                  Definir como Edição Atual
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowIssueForm(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                <button type="submit" disabled={savingIssue} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg">
                  {savingIssue ? 'Salvando...' : 'Salvar Edição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM ARTIGO PUBLICADO */}
      {showArtForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[95] overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border space-y-4 max-h-[92vh] overflow-y-auto my-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingArtId ? 'Editar Artigo na Vitrine' : 'Publicar Artigo na Vitrine'}
                </h3>
                <p className="text-xs text-slate-500">Edição: {selectedIssueObj?.title}</p>
              </div>
              <button type="button" onClick={() => setShowArtForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {!editingArtId && acceptedPortalArticles.length > 0 && (
              <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200 space-y-1.5 text-xs">
                <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Importar automaticamente de um artigo ACEITO no portal (opcional):
                </label>
                <select
                  value={sourceArticleId}
                  onChange={(e) => handleImportAcceptedArticle(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white font-medium"
                >
                  <option value="">-- Preencher manualmente (ex: artigo de edição anterior do Wix) --</option>
                  {acceptedPortalArticles.map((pa) => {
                    const alreadyPub = pubArticles.some((p) => p.source_article_id === pa.id)
                    return (
                      <option key={pa.id} value={pa.id}>
                        {alreadyPub ? '✅ [Já publicado] ' : '🆕 '}
                        {pa.title} ({getAuthorName(pa.author_id, pa)})
                      </option>
                    )
                  })}
                </select>
              </div>
            )}

            <form onSubmit={handleSavePublishedArticle} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seção Editorial *</label>
                  <select value={artSection} onChange={(e) => setArtSection(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg bg-white">
                    {SECTION_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eixo Temático</label>
                  <select value={artAxis} onChange={(e) => setArtAxis(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg bg-white">
                    {AXES_LIST.map((ax) => <option key={ax} value={ax}>{ax}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título (Português) *</label>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => {
                    setArtTitle(e.target.value)
                    if (!editingArtId) setArtSlug(slugify(e.target.value))
                  }}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title (Inglês)</label>
                  <input type="text" value={artTitleEn} onChange={(e) => setArtTitleEn(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Amigável (Slug)</label>
                  <input type="text" value={artSlug} onChange={(e) => setArtSlug(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-mono" />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Autores ({artAuthors.length}) *</span>
                  <button
                    type="button"
                    onClick={() => setArtAuthors([...artAuthors, { name: '', institution: '', email: '', orcid: '', lattes: '', bio: '' }])}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-semibold"
                  >
                    + Adicionar Autor
                  </button>
                </div>
                {artAuthors.map((au, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border space-y-2 relative">
                    {artAuthors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setArtAuthors(artAuthors.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="grid sm:grid-cols-3 gap-2 pr-5">
                      <input type="text" required value={au.name} onChange={(e) => { const c = [...artAuthors]; c[idx] = { ...c[idx], name: e.target.value }; setArtAuthors(c) }} placeholder="Nome completo *" className="px-2 py-1 border rounded" />
                      <input type="text" value={au.institution || ''} onChange={(e) => { const c = [...artAuthors]; c[idx] = { ...c[idx], institution: e.target.value }; setArtAuthors(c) }} placeholder="Instituição" className="px-2 py-1 border rounded" />
                      <input type="text" value={au.orcid || ''} onChange={(e) => { const c = [...artAuthors]; c[idx] = { ...c[idx], orcid: e.target.value }; setArtAuthors(c) }} placeholder="ORCID (0000-...)" className="px-2 py-1 border rounded" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input type="url" value={au.lattes || ''} onChange={(e) => { const c = [...artAuthors]; c[idx] = { ...c[idx], lattes: e.target.value }; setArtAuthors(c) }} placeholder="Link Lattes" className="px-2 py-1 border rounded" />
                      <input type="text" value={au.bio || ''} onChange={(e) => { const c = [...artAuthors]; c[idx] = { ...c[idx], bio: e.target.value }; setArtAuthors(c) }} placeholder="Mini-bio curta" className="px-2 py-1 border rounded" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resumo (PT)</label>
                  <textarea rows={3} value={artAbstract} onChange={(e) => setArtAbstract(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Abstract (EN)</label>
                  <textarea rows={3} value={artAbstractEn} onChange={(e) => setArtAbstractEn(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Palavras-chave (separadas por ;)</label>
                  <input type="text" value={artKeywords} onChange={(e) => setArtKeywords(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keywords (EN)</label>
                  <input type="text" value={artKeywordsEn} onChange={(e) => setArtKeywordsEn(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pág. Inicial</label>
                  <input type="text" value={artPageStart} onChange={(e) => setArtPageStart(e.target.value)} placeholder="ex: 10" className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pág. Final</label>
                  <input type="text" value={artPageEnd} onChange={(e) => setArtPageEnd(e.target.value)} placeholder="ex: 24" className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ordem Sumário</label>
                  <input type="number" min="1" value={artOrder} onChange={(e) => setArtOrder(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DOI (Opcional)</label>
                  <input type="text" value={artDoi} onChange={(e) => setArtDoi(e.target.value)} placeholder="10.xxxx/..." className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recebido em</label>
                  <input type="date" value={artReceivedAt} onChange={(e) => setArtReceivedAt(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aceito em</label>
                  <input type="date" value={artAcceptedAt} onChange={(e) => setArtAcceptedAt(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publicado em</label>
                  <input type="date" value={artPublishedAt} onChange={(e) => setArtPublishedAt(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
                </div>
              </div>

              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 space-y-1.5">
                <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  PDF Individual do Artigo (Essencial para Google Acadêmico e DOAJ)
                </label>
                <input type="file" accept=".pdf" onChange={(e) => setArtPdfFile(e.target.files?.[0] || null)} className="w-full text-xs" />
                {existingArtPdfUrl && !artPdfFile && (
                  <p className="text-[11px] text-emerald-700 font-semibold">PDF individual já anexado ✓ (envie outro apenas se quiser substituir)</p>
                )}
              </div>

              <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={artIsPublished} onChange={(e) => setArtIsPublished(e.target.checked)} className="rounded text-indigo-600" />
                Publicado no site (visível ao público)
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowArtForm(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                <button type="submit" disabled={savingArt} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg">
                  {savingArt ? 'Publicando...' : 'Salvar e Publicar Artigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
