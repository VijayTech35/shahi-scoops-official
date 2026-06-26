import { useState, useEffect, useRef } from "react"
import { Crown, Users, MapPin, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  { value: 12, suffix: "+", label: "Premium Flavours", sub: "Handcrafted recipes", icon: Sparkles },
  { value: 50000, suffix: "+", label: "Happy Customers", sub: "Across India", icon: Users, format: true },
  { value: 10, suffix: "+", label: "Store Locations", sub: "And growing", icon: MapPin },
  { value: 2014, prefix: "Est. ", label: "Since", sub: "A decade of royalty", icon: Crown },
]

function useCountUp(target, shouldRun) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!shouldRun) return
    const duration = 2200
    const start = performance.now()
    const raf = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 4)
      setCount(Math.floor(target * e))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [shouldRun, target])
  return count
}

function StatCard({ item, delay }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const count = useCountUp(item.value, inView)
  const Icon = item.icon

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.7, delay }}
      className="premium-card relative bg-white dark:bg-[#2A1D15] rounded-3xl p-8 text-center border border-gold/15 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5"
        style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }} />
      <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(240,208,128,0.1))" }}>
        <Icon size={24} className="text-gold" />
      </div>
      <div className="font-heading text-4xl md:text-5xl font-bold text-choco dark:text-white">
        {item.prefix || ""}{item.format ? count.toLocaleString() : count}{item.suffix || ""}
      </div>
      <div className="text-sm font-semibold text-choco dark:text-white mt-2">{item.label}</div>
      <div className="text-xs text-choco/40 dark:text-gray-400 mt-1">{item.sub}</div>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className="section-pad bg-cream dark:bg-[#1A120B]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((item, i) => <StatCard key={item.label} item={item} delay={i * 0.1} />)}
        </div>
      </div>
    </section>
  )
}
