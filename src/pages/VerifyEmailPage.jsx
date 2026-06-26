import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail, Crown } from 'lucide-react'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function VerifyEmailPage() {
  useDocumentTitle('Verify Email')
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setState('error'); setMessage('No verification token provided.'); return }
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => { setState('success'); setMessage(r.data.message) })
      .catch((e) => { setState('error'); setMessage(e.response?.data?.error || 'Verification failed') })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 40% 30%, rgba(201,168,76,0.12) 0%, #1C0D06 60%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 no-underline">
          <Crown size={28} className="text-gold" />
          <span className="font-heading text-2xl font-bold text-gold">Shahi Scoops</span>
        </Link>
        <div className="rounded-3xl p-8 border border-gold/15 bg-cream/5 backdrop-blur-xl">
          {state === 'loading' && (
            <>
              <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h1 className="font-heading text-2xl text-cream">Verifying your email...</h1>
            </>
          )}
          {state === 'success' && (
            <>
              <CheckCircle size={56} className="text-mint mx-auto mb-4" />
              <h1 className="font-heading text-2xl text-cream mb-2">Email Verified! 🎉</h1>
              <p className="text-cream/60 mb-6">{message}</p>
              <Link to="/login"
                className="inline-block py-3 px-8 rounded-2xl text-sm font-bold text-choco no-underline"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                Sign In Now
              </Link>
            </>
          )}
          {state === 'error' && (
            <>
              <XCircle size={56} className="text-red-400 mx-auto mb-4" />
              <h1 className="font-heading text-2xl text-cream mb-2">Verification Failed</h1>
              <p className="text-cream/60 mb-6">{message}</p>
              <div className="flex flex-col gap-2">
                <Link to="/login"
                  className="inline-block py-3 px-8 rounded-2xl text-sm font-bold text-choco no-underline"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                  Back to Sign In
                </Link>
                <Link to="/resend-verification"
                  className="inline-flex items-center justify-center gap-2 text-gold/70 hover:text-gold text-sm no-underline">
                  <Mail size={14} /> Resend verification email
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
