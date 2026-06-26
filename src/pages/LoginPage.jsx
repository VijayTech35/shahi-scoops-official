import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedIn = await login(form.email, form.password)
      const target = from === '/' && loggedIn?.role === 'admin' ? '/admin' : from
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 40% 30%, rgba(201,168,76,0.12) 0%, #1C0D06 60%)' }}>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline">
            <Crown size={28} className="text-gold" />
            <span className="font-heading text-2xl font-bold text-gold">Shahi Scoops</span>
          </Link>
          <p className="text-cream/40 text-sm mt-2">Royal Flavours, Crafted With Love</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border border-gold/15 bg-cream/5 dark:bg-[#2A1D15] backdrop-blur-xl">

          <div className="mb-7">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold">Welcome Back</span>
            <h1 className="font-heading text-3xl text-cream mt-1">Sign In Royally</h1>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type="email" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border border-cream/10 focus:border-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-cream placeholder-cream/20 outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full bg-transparent border border-cream/10 focus:border-gold rounded-xl pl-11 pr-11 py-3.5 text-sm text-cream placeholder-cream/20 outline-none transition-colors duration-200"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/70 cursor-pointer transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-[11px] text-gold/60 hover:text-gold transition-colors no-underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide text-choco transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
              {loading ? 'Signing in...' : 'Sign In Royally'}
            </button>
          </form>

          <p className="text-center text-cream/30 text-sm mt-6">
            New to Shahi Scoops?{' '}
            <Link to="/register" className="text-gold hover:text-gold/80 font-medium no-underline transition-colors">
              Create your account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
