import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import api from "../hooks/useApi"
import useDocumentTitle from "../hooks/useDocumentTitle"

export default function ResetPasswordPage() {
  useDocumentTitle('Reset Password')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("Passwords do not match"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    setLoading(true)
    try {
      await api.post("/auth/reset-password", { token, email, password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. The link may have expired.")
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "radial-gradient(ellipse at 40% 30%, rgba(201,168,76,0.12) 0%, #1C0D06 60%)" }}>
        <div className="text-center">
          <p className="font-heading text-6xl text-gold mb-4">Invalid Link</p>
          <p className="text-cream/50 mb-6">This reset link is invalid or missing parameters.</p>
          <Link to="/forgot-password" className="text-gold no-underline hover:underline text-sm">Request a new link</Link>
        </div>
      </div>
    )
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
        </div>

        <div className="rounded-3xl p-8 border border-gold/15"
          style={{ background: "rgba(255,248,240,0.04)", backdropFilter: "blur(20px)" }}>

          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-gold mx-auto mb-4" />
              <h2 className="font-heading text-xl text-cream mb-2">Password Reset!</h2>
              <p className="text-cream/50 text-sm mb-6">Your password has been updated successfully.</p>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-choco no-underline transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold block">New Password</span>
                <h1 className="font-heading text-3xl text-cream mt-1">Set New Password</h1>
                <p className="text-cream/40 text-sm mt-2">Choose a strong password for your account.</p>
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
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                    <input type={showPass ? "text" : "password"} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-transparent border border-cream/10 focus:border-gold rounded-xl pl-11 pr-11 py-3.5 text-sm text-cream placeholder-cream/20 outline-none transition-colors"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/70 cursor-pointer">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-cream/35 font-semibold mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                    <input type={showPass ? "text" : "password"} required value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-transparent border border-cream/10 focus:border-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-cream placeholder-cream/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide text-choco transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}