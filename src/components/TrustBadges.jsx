import { motion } from "framer-motion"
import { Shield, Award, Leaf, BadgeCheck } from "lucide-react"
import RevealText from "./RevealText"

const badges = [
  { icon: Shield, label: "FSSAI Certified", sub: "Licensed & regulated", color: "#C9A84C" },
  { icon: Leaf, label: "100% Natural", sub: "No artificial additives", color: "#7EC8A4" },
  { icon: Award, label: "Award Winning", sub: "Best Ice Cream 2024", color: "#E8901A" },
  { icon: BadgeCheck, label: "50,000+ Happy", sub: "Trusted across India", color: "#E8637A" },
]

export default function TrustBadges() {
  return (
    <section className="section-pad bg-[#FDF5EC] dark:bg-[#1A120B]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Why Trust Us</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white" delay={0.1}>
            Our Credentials
          </RevealText>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, i) => (
            <motion.div key={badge.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white dark:bg-[#2A1D15] rounded-2xl p-6 text-center border border-gold/10 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}30` }}>
                <badge.icon size={24} style={{ color: badge.color }} />
              </div>
              <p className="text-sm font-bold text-choco dark:text-white">{badge.label}</p>
              <p className="text-xs text-choco/45 dark:text-gray-400 mt-1">{badge.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
