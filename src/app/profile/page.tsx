'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'
import { Camera, X, Plus } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles').select('*').eq('user_id', user.id).single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name ?? '')
        setBio(data.bio ?? '')
        setPhone(data.phone ?? '')
        setLocation(data.location ?? '')
        setSkills(data.skills ?? [])
        setHourlyRate(data.hourly_rate?.toString() ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSuccess(false)

    const { error } = await supabase.from('profiles').update({
      full_name: fullName, bio, phone, location, skills,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
    }).eq('id', profile.id)

    if (!error) setSuccess(true)
    setSaving(false)
  }

  const addSkill = () => {
    const s = newSkill.trim()
    if (s && !skills.includes(s) && skills.length < 15) {
      setSkills([...skills, s])
      setNewSkill('')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">A carregar...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Meu Perfil</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Foto de perfil</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-700 font-bold text-2xl">{fullName?.[0] ?? 'P'}</span>
                )}
              </div>
              <button type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700">@{profile?.username}</p>
              <Badge variant={profile?.role === 'professional' ? 'green' : 'blue'} className="mt-1">
                {profile?.role === 'professional' ? 'Profissional' : 'Cliente'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Informações básicas</h2>
          <Input id="fullName" label="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Textarea id="bio" label="Bio / Sobre mim"
            placeholder="Conta-nos um pouco sobre ti, a tua experiência e os teus serviços..."
            value={bio} onChange={e => setBio(e.target.value)} rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="phone" label="Telemóvel" placeholder="+258 8X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input id="location" label="Localização" placeholder="Ex: Maputo" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
        </div>

        {/* Competências */}
        {profile?.role === 'professional' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Competências</h2>
            <div className="flex gap-2">
              <Input id="newSkill" placeholder="Ex: Figma, React, SEO..."
                value={newSkill} onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                className="flex-1" />
              <Button type="button" onClick={addSkill} variant="secondary" size="md">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full">
                  {skill}
                  <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && <p className="text-sm text-slate-400">Nenhuma competência adicionada.</p>}
            </div>
            <Input id="hourlyRate" type="number" label="Taxa por hora (MZN)" placeholder="Ex: 1500"
              value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
              hint="Opcional — para projectos à hora" />
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-200">
            ✓ Perfil actualizado com sucesso!
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">Guardar alterações</Button>
        </div>
      </form>
    </div>
  )
}
