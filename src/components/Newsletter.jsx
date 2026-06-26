import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Send, CheckCircle, Sparkles } from "lucide-react"
import api from "../hooks/useApi"
import RevealText from "./RevealText"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setErr("Enter a valid email address"); return }
    setErr("")
    setLoading(true)
    try {
      await api.post("/newsletter/subscribe", { email })
      setDone(true)
    } catch (err) {
      setErr(err.response?.data?.error || "Subscription failed. Try again.")
    } finally { setLoading(false) }
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-24"
      style={{ background: "#2C1A0E" }}>
      {/* Glow decorations */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#C9A84C" }} />
      <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "#E8637A" }} />
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C9A84C44, transparent)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>

          {/* Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <Crown size={24} className="text-gold" />
          </div>

          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold/70 font-semibold">Royal Insider</span>
          </div>

          <RevealText as="h2" className="font-heading text-3xl md:text-4xl text-cream mb-3" delay={0.1}>
            Get Royal Deals In Your Inbox
          </RevealText>

          <p className="text-cream/45 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Be the first to know about new flavours, seasonal specials, exclusive offers and royal events
          </p>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["New Flavour Alerts", "Exclusive Offers", "Royal Events", "No Spam Ever"].map(p => (
              <span key={p} className="inline-flex items-center gap-1.5 text-[11px] text-gold/60 border border-gold/15 rounded-full px-3 py-1.5">
                <Sparkles size={9} className="text-gold/50" />
                {p}
              </span>
            ))}
          </div>

          {!done ? (
            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
              <div className="flex items-center gap-0 overflow-hidden rounded-2xl border border-gold/20 bg-cream/5 backdrop-blur-sm hover:border-gold/40 transition-colors focus-within:border-gold/50">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-transparent px-5 py-4 text-sm text-cream placeholder-cream/25 outline-none font-body"
                />
                <button type="submit"
                  className="flex-shrink-0 flex items-center gap-2 text-choco text-xs font-bold rounded-xl px-5 py-3 m-1 cursor-pointer transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                  <Send size={13} />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </div>
              {err && <p className="text-pink text-xs mt-2">{err}</p>}
              <p className="text-cream/20 text-[10px] mt-3">No spam. Unsubscribe anytime. We respect your privacy.</p>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)" }}>
                <CheckCircle size={28} className="text-gold" />
              </div>
              <p className="font-heading text-xl text-cream">You're In The Royal Club!</p>
              <p className="text-cream/45 text-sm">Welcome aboard — expect something royal in your inbox soon.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
