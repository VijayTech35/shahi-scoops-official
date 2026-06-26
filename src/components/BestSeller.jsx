import { useState, useEffect } from "react"
import { Star, ShoppingBag, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { flavours } from "../data/flavours"
import { waUrl } from "../data/config"
import RevealText from "./RevealText"
import TiltCard from "./TiltCard"
import MagneticButton from "./MagneticButton"

const topFlavours = flavours.filter(f => f.rating >= 4.8)

export default function BestSeller() {
  const [index, setIndex] = useState(0)
  const cur = topFlavours[index]

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % topFlavours.length)
    }, 5500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="section-pad bg-white dark:bg-[#1A120B] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Crown Jewel</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white" delay={0.1}>
            Our Most Loved Scoop
          </RevealText>
        </motion.div>

        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-choco/20">
          <AnimatePresence mode="wait">
            <motion.div key={`bg-${index}`}
              initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0">
              <img src={cur.heroBg} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C1A0E]/95 via-[#2C1A0E]/80 to-[#2C1A0E]/30" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 items-center min-h-[520px]">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="p-10 md:p-14 lg:p-16">
              <AnimatePresence mode="wait">
                <motion.span key={`badge-${index}`}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold font-bold border border-gold/40 rounded-full px-4 py-1.5 mb-6">
                  ✦ #1 Best Seller
                </motion.span>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.h2 key={`title-${index}`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="font-heading text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-4">
                  {cur.name}<br />
                  <span className="text-gradient">Royal</span>
                </motion.h2>
              </AnimatePresence>

              <div className="flex items-center gap-2 mb-5">
                {[...Array(5)].map((_,i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
                <span className="text-cream/50 text-xs ml-1">{cur.rating} · {cur.reviews} reviews</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p key={`desc-${index}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-cream/60 leading-relaxed mb-8 max-w-sm">
                  {cur.desc}
                </motion.p>
              </AnimatePresence>

              <div className="flex flex-wrap gap-2 mb-8">
                {["Organic Milk", "No Preservatives", "Handcrafted Daily"].map(f => (
                  <span key={f} className="text-xs text-gold border border-gold/30 rounded-full px-3 py-1.5">{f}</span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <span className="font-heading text-4xl font-bold text-gold">{cur.price}</span>
                <span className="text-cream/40 text-sm">per scoop</span>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <MagneticButton as="a" strength={0.2}
                  href={waUrl(`Hi! I'd like to order ${cur.name} from Shahi Scoops`)}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 no-underline rounded-full px-8 py-4 text-sm font-bold text-choco hover:scale-105 transition-transform shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${cur.accent}, #F0D080)` }}>
                  <ShoppingBag size={16} />
                  Order Now
                </MagneticButton>
                <MagneticButton as="a" strength={0.2}
                  href="#flavours"
                  className="inline-flex items-center gap-2 no-underline border border-cream/20 text-cream rounded-full px-8 py-4 text-sm font-medium hover:border-cream/50 transition-all">
                  All Flavours <ArrowRight size={14} />
                </MagneticButton>
              </div>

              <div className="flex gap-2 mt-8">
                {topFlavours.map((_, i) => (
                  <button key={i} onClick={() => setIndex(i)}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={i === index
                      ? { width: "28px", height: "6px", background: cur.accent }
                      : { width: "6px", height: "6px", background: "rgba(255,248,240,0.2)" }} />
                ))}
              </div>
            </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 }}
                className="hidden md:flex items-center justify-center p-10 lg:p-14">
                <div className="relative float">
                  <AnimatePresence mode="wait">
                    <motion.div key={`glow-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-full blur-3xl opacity-30"
                      style={{ background: cur.glow }} />
                  </AnimatePresence>
                  <TiltCard maxTilt={10} glare={false}>
                    <AnimatePresence mode="wait">
                      <motion.div key={`img-${index}`}
                        initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.6 }}
                        className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 shadow-2xl"
                        style={{ borderColor: `${cur.accent}40` }}>
                        <img src={cur.image} alt={cur.name} className="w-full h-full object-cover" loading="lazy" />
                      </motion.div>
                    </AnimatePresence>
                  </TiltCard>
                </div>
              </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
