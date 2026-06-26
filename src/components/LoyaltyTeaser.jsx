import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Crown, Gift, Star, Zap } from "lucide-react"
import { waUrl } from "../data/config"
import { useAuth } from "../context/AuthContext"
import api from "../hooks/useApi"
import RevealText from "./RevealText"

const perks = [
  { icon: Star, title: "Earn Royal Points", desc: "1 point for every 10 spent on your favourite scoops" },
  { icon: Gift, title: "Free Scoop Rewards", desc: "Redeem 500 points for a complimentary scoop of your choice" },
  { icon: Crown, title: "Royal Member Perks", desc: "Early access to new flavours, events & birthday surprises" },
  { icon: Zap, title: "Double Points Days", desc: "Every weekend — earn 2x points on all orders placed" },
]

export default function LoyaltyTeaser() {
  const { isLoggedIn } = useAuth()
  const [loyalty, setLoyalty] = useState(null)

  useEffect(() => {
    if (isLoggedIn) {
      api.get("/loyalty").then(r => setLoyalty(r.data)).catch(() => {})
    }
  }, [isLoggedIn])

  return (
    <section className="section-pad bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 65%)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="ornament mb-5" style={{ justifyContent: "flex-start" }}>
              <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                {loyalty ? "You're A Member" : "Join The Club"}
              </span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-choco dark:text-white leading-tight mb-4">
              <RevealText as="span" className="block" delay={0.1}>
                The Royal
              </RevealText>
              <span className="block shimmer">Loyalty Club</span>
            </h2>

            {loyalty ? (
              <div className="bg-choco rounded-2xl p-6 mb-6 max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-cream/50 text-xs uppercase tracking-wider">Your Level</p>
                    <p className="font-heading text-xl text-gold font-bold mt-0.5">{loyalty.level}</p>
                  </div>
                  <Crown size={28} className="text-gold/50" />
                </div>
                <p className="font-heading text-3xl text-gold font-bold">{loyalty.points}</p>
                <p className="text-cream/50 text-xs mt-0.5">Royal Points</p>
                {loyalty.nextLevel && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-cream/40 mb-1">
                      <span>{loyalty.points} pts</span>
                      <span>{loyalty.nextThreshold} pts for {loyalty.nextLevel}</span>
                    </div>
                    <div className="h-2 bg-cream/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${loyalty.progress}%`, background: 'linear-gradient(90deg, #C9A84C, #F0D080)' }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-choco/55 dark:text-gray-300 leading-relaxed mb-6 max-w-md">
                Every scoop you enjoy earns you royal points. Redeem them for free flavours, exclusive perks, and members-only privileges — because our most loyal customers deserve to be treated like royalty.
              </p>
            )}

            <div className="flex flex-wrap gap-3 mb-8">
              {["Free Scoops", "Birthday Treats", "Early Access", "VIP Events"].map(t => (
                <span key={t} className="text-xs text-choco/65 dark:text-gray-300 border border-gold/25 rounded-full px-4 py-2 bg-gold/5 font-medium">
                  {t}
                </span>
              ))}
            </div>
            {isLoggedIn ? (
              <a href="/profile" className="inline-flex items-center gap-3 no-underline group">
                <span className="w-11 h-11 rounded-full bg-choco flex items-center justify-center text-cream group-hover:bg-gold group-hover:text-choco transition-all shadow-lg">
                  →
                </span>
                <span className="text-sm font-semibold text-choco group-hover:text-gold transition-colors border-b border-transparent group-hover:border-gold pb-0.5">
                  View Loyalty Dashboard
                </span>
              </a>
            ) : (
              <a href={waUrl("Hi! I'd like to know more about the Shahi Scoops Loyalty Club")}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 no-underline group">
                <span className="w-11 h-11 rounded-full bg-choco flex items-center justify-center text-cream group-hover:bg-gold group-hover:text-choco transition-all shadow-lg">
                  →
                </span>
                <span className="text-sm font-semibold text-choco group-hover:text-gold transition-colors border-b border-transparent group-hover:border-gold pb-0.5">
                  Join the Waitlist
                </span>
              </a>
            )}
          </motion.div>

          {/* Right — perk cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {perks.map((perk, i) => (
              <motion.div key={perk.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#FDF5EC] dark:bg-[#2A1D15] rounded-2xl p-5 border border-gold/15 hover:border-gold/35 hover:shadow-md transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(201,168,76,0.12)" }}>
                  <perk.icon size={18} className="text-gold group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-heading text-sm font-semibold text-choco dark:text-white mb-1.5">{perk.title}</h4>
                <p className="text-xs text-choco/55 dark:text-gray-300 leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}