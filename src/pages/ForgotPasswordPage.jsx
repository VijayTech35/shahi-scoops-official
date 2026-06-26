import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../hooks/useApi"
import useDocumentTitle from "../hooks/useDocumentTitle"

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot Password')
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/forgot-password", { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 40% 30%, rgba(201,168,76,0.12) 0%, #1C0D06 60%)" }}>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline">
            <Crown size={28} className="text-gold" />
            <span className="font-heading text-2xl font-bold text-gold">Shahi Scoops</span>
          </Link>
          <p className="text-cream/40 text-sm mt-2">Royal Flavours, Crafted With Love</p>
        </div>

        <div className="rounded-3xl p-8 border border-gold/15"
          style={{ background: "rgba(255,248,240,0.04)", backdropFilter: "blur(20px)" }}>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-gold mx-auto mb-4" />
              <h2 className="font-heading text-xl text-cream mb-2">Check Your Inbox</h2>
              <p className="text-cream/50 text-sm leading-relaxed">
                If an account with <strong className="text-gold">{email}</strong> exists, we've sent a password reset link.
              </p>
              <p className="text-cream/30 text-xs mt-4">Didn't receive it? Check your spam folder.</p>
              <Link to="/login"
                className="inline-flex items-center gap-2 mt-6 text-sm text-gold/70 hover:text-gold no-underline transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-[11px] text-gold/60 hover:text-gold no-underline mb-4 transition-colors">
                  <ArrowLeft size={12} /> Back to Sign In
                </Link>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold block">Forgot Password</span>
                <h1 className="font-heading text-3xl text-cream mt-1">Reset Your Password</h1>
                <p className="text-cream/40 text-sm mt-2">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                    <input type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent border border-cream/10 focus:border-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-cream placeholder-cream/20 outline-none transition-colors duration-200"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide text-choco transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-cream/30 text-sm mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-gold hover:text-gold/80 font-medium no-underline transition-colors">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}