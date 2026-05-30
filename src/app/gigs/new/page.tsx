'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category, Profile } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { X, Plus, AlertCircle } from 'lucide-react'

export default function NewGigPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [deliveryDays, setDeliveryDays] = useState('')
  const [revisions, setRevisions] = useState('1')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: p }, { data: cats }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('categories').select('*').order('sort_order'),
      ])

      if (!p || p.role !== 'professional') { router.push('/dashboard'); return }

      setProfile(p)
      setCategories(cats ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addTag = () => {
    const t = newTag.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
      setNewTag('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setError('')

    if (!title.trim() || !description.trim() || !categoryId || !price || !deliveryDays) {
      setError('Preenche todos os campos obrigatórios.')
      return
    }
    if (description.trim().length < 100) {
      setError('A descrição deve ter pelo menos 100 caracteres.')
      return
    }

    setSubmitting(true)

    const { data, error: err } = await supabase.from('gigs').insert({
      professional_id: profile.id,
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      price: parseFloat(price),
      delivery_days: parseInt(deliveryDays),
      revisions: parseInt(revisions),
      tags,
      status: 'active',
    }).select('id').single()

    if (err) {
      setError('Erro ao criar gig. Tenta novamente.')
      setSubmitting(false)
      return
    }

    router.push(`/gigs/${data.id}`)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">A carregar...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Criar novo gig</h1>
        <p className="text-slate-500 mt-1 text-sm">Descreve o teu serviço com o máximo de detalhe.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sobre o serviço */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Sobre o serviço</h2>

          <Input id="title" label="Título do gig *"
            placeholder="Ex: Vou criar o teu logótipo profissional em 2 dias"
            value={title} onChange={e => setTitle(e.target.value)}
            hint={`${title.length}/80 caracteres`} maxLength={80} required />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-slate-700">Categoria *</label>
            <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required
              className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Seleccionar categoria...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <Textarea id="description" label="Descrição detalhada *"
            placeholder="Descreve o que inclui o teu serviço, o teu processo de trabalho, o que o cliente deve esperar..."
            value={description} onChange={e => setDescription(e.target.value)}
            rows={7} hint={`${description.length} caracteres (mínimo 100)`} />
        </div>

        {/* Preço e prazos */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Preço e prazos</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input id="price" type="number" label="Preço (MZN) *" placeholder="Ex: 2500"
                value={price} onChange={e => setPrice(e.target.value)} min="100" step="50" required />
            </div>
            <Input id="deliveryDays" type="number" label="Prazo (dias) *" placeholder="Ex: 3"
              value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} min="1" max="90" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="revisions" className="text-sm font-medium text-slate-700">Revisões incluídas</label>
            <select id="revisions" value={revisions} onChange={e => setRevisions(e.target.value)}
              className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="0">Sem revisões</option>
              <option value="1">1 revisão</option>
              <option value="2">2 revisões</option>
              <option value="3">3 revisões</option>
              <option value="5">5 revisões</option>
              <option value="99">Revisões ilimitadas</option>
            </select>
          </div>

          {/* Preview da comissão */}
          {price && parseFloat(price) > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 text-sm">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Preço do gig</span>
                <span>{parseFloat(price).toLocaleString('pt-MZ')} MZN</span>
              </div>
              <div className="flex justify-between text-slate-400 mb-2">
                <span>Comissão MozWork (10%)</span>
                <span>- {(parseFloat(price) * 0.1).toLocaleString('pt-MZ')} MZN</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2">
                <span>Tu recebes</span>
                <span className="text-emerald-600">{(parseFloat(price) * 0.9).toLocaleString('pt-MZ')} MZN</span>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Tags de pesquisa</h2>
          <p className="text-sm text-slate-500">Adiciona até 5 tags para facilitar a pesquisa.</p>

          <div className="flex gap-2">
            <Input id="newTag" placeholder="Ex: logotipo, branding, figma..."
              value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              className="flex-1" />
            <Button type="button" onClick={addTag} variant="secondary" disabled={tags.length >= 5}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm px-3 py-1.5 rounded-full">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-emerald-500 hover:text-emerald-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={submitting} size="lg">Publicar gig</Button>
        </div>
      </form>
    </div>
  )
}
