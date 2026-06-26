import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' }
    if (password.length < 6) return { level: 1, label: 'Weak', color: '#ef4444' }
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password))
      return password.length >= 8 && /[^A-Za-z0-9]/.test(password)
        ? { level: 3, label: 'Strong', color: '#22c55e' }
        : { level: 2, label: 'Medium', color: '#f59e0b' }
    return { level: 1, label: 'Weak', color: '#ef4444' }
  }
  const { level, label, color } = getStrength()
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1,2,3].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= level ? color : 'rgba(255,248,240,0.1)' }} />
        ))}
      </div>
      <p className="text-[11px] mt-1" style={{ color }}>{label}</p>
    </div>
  )
}

export default function RegisterPage() {
  useDocumentTitle('Create account')
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  const inputClass = "w-full bg-transparent border border-cream/10 focus:border-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-cream placeholder-cream/20 outline-none transition-colors duration-200"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(232,99,122,0.08) 0%, #1C0D06 60%)' }}>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline">
            <Crown size={28} className="text-gold" />
            <span className="font-heading text-2xl font-bold text-gold">Shahi Scoops</span>
          </Link>
        </div>

        <div className="rounded-3xl p-8 border border-gold/15 bg-cream/5 dark:bg-[#2A1D15] backdrop-blur-xl">

          <div className="mb-7">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold">New Here?</span>
            <h1 className="font-heading text-3xl text-cream mt-1">Join the Royal Club</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type="text" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type="email" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Create a password"
                  className={inputClass.replace('pr-4', 'pr-11')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/70 cursor-pointer">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type="password" required value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm your password" className={inputClass} />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-red-400 text-[11px] mt-1">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide text-choco transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
              {loading ? 'Creating your account...' : 'Join the Royal Club'}
            </button>
          </form>

          <p className="text-center text-cream/30 text-sm mt-6">
            Already a member?{' '}
            <Link to="/login" className="text-gold font-medium no-underline hover:text-gold/80">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
