'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Eye, EyeOff, Briefcase, User } from 'lucide-react'
import { cn } from '@/lib/utils'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const defaultRole = searchParams.get('role') === 'professional' ? 'professional' : 'client'

  const [role, setRole] = useState<'client' | 'professional'>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('O username só pode ter letras minúsculas, números e _')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase(),
          role,
        },
      },
    })

    if (error) {
      setError(
        error.message.includes('already registered')
          ? 'Este email já está registado.'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
          <p className="text-slate-500 mt-2 text-sm">Junta-te à comunidade MozWork</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          {/* Tipo de conta */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setRole('client')}
              className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition-all',
                role === 'client' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
              <User className="w-5 h-5" /> Sou Cliente
            </button>
            <button type="button" onClick={() => setRole('professional')}
              className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition-all',
                role === 'professional' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
              <Briefcase className="w-5 h-5" /> Sou Profissional
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input id="fullName" type="text" label="Nome completo" placeholder="Ex: Ana Machava"
              value={fullName} onChange={e => setFullName(e.target.value)} required />

            <Input id="username" type="text" label="Username" placeholder="ex: ana_machava"
              value={username} onChange={e => setUsername(e.target.value.toLowerCase())}
              hint="Apenas letras minúsculas, números e _" required />

            <Input id="email" type="email" label="Email" placeholder="exemplo@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Palavra-passe</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Criar conta {role === 'professional' ? 'profissional' : ''}
            </Button>

            <p className="text-center text-xs text-slate-400">
              Ao registares, aceitas os{' '}
              <Link href="#" className="text-emerald-600 hover:underline">Termos de Serviço</Link>{' '}
              e a{' '}
              <Link href="#" className="text-emerald-600 hover:underline">Política de Privacidade</Link>.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Já tens conta?{' '}
          <Link href="/auth/login" className="text-emerald-600 font-medium hover:text-emerald-700">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
