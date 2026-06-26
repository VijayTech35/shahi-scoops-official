import { useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight, Crown, ShoppingBag, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { flavours } from "../data/flavours"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import RevealText from "./RevealText"
import MagneticButton from "./MagneticButton"
import ParticleBackground from "./ParticleBackground"

const flavors = flavours.map(f => ({
  id: f.id,
  name: f.name,
  tagline: f.tagline,
  desc: f.desc,
  price: f.price,
  cta: `Add ${f.name} to Cart`,
  image: f.image,
  bg: f.heroBg,
  accent: f.accent,
  glow: f.glow,
}))

const particles = [
  { emoji: "🌺", x: "15%", y: "30%", delay: 0, size: 12 },
  { emoji: "🌿", x: "75%", y: "20%", delay: 0.5, size: 14 },
  { emoji: "✨", x: "85%", y: "60%", delay: 1, size: 10 },
  { emoji: "🌸", x: "10%", y: "70%", delay: 1.5, size: 11 },
  { emoji: "⭐", x: "90%", y: "35%", delay: 2, size: 9 },
  { emoji: "🍃", x: "50%", y: "15%", delay: 2.5, size: 13 },
]

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [added, setAdded] = useState(false)
  const cur = flavors[index]
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const go = (d) => { setDir(d); setIndex((i) => (i + d + flavors.length) % flavors.length) }

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return }
    const ok = await addToCart(cur.id, 1)
    if (ok) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  useEffect(() => {
    const id = setInterval(() => go(1), 6000)
    return () => clearInterval(id)
  }, [index])

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video background with fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={cur.bg} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <video autoPlay muted loop playsInline
          poster={cur.bg}
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.target.style.display = "none" }}>
          <source src="https://videos.pexels.com/video-files/2887535/2887535-uhd_3840_2160_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(110deg, rgba(20,8,2,0.88) 0%, rgba(20,8,2,0.60) 55%, rgba(20,8,2,0.30) 100%)" }} />
        <ParticleBackground opacity={0.12} speed={0.2} />
      </div>

      {/* Golden spotlight behind product */}
      <AnimatePresence mode="wait">
        <motion.div key={`spotlight-${index}`}
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none z-0"
          style={{ background: cur.glow, right: "-200px", top: "50%", transform: "translateY(-50%)" }} />
      </AnimatePresence>

      {/* Decorative mandala pattern */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-[0.04] select-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          className="absolute top-0 left-0 w-full h-full">
          <defs>
            <pattern id="mandala" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
              <circle cx="120" cy="120" r="100" fill="none" stroke="#FFD700" strokeWidth="0.5" />
              <circle cx="120" cy="120" r="70" fill="none" stroke="#FFD700" strokeWidth="0.4" />
              <circle cx="120" cy="120" r="40" fill="none" stroke="#FFD700" strokeWidth="0.3" />
              <circle cx="120" cy="120" r="15" fill="none" stroke="#FFD700" strokeWidth="0.3" />
              <line x1="120" y1="20" x2="120" y2="220" stroke="#FFD700" strokeWidth="0.2" opacity="0.5" />
              <line x1="20" y1="120" x2="220" y2="120" stroke="#FFD700" strokeWidth="0.2" opacity="0.5" />
              <line x1="49" y1="49" x2="191" y2="191" stroke="#FFD700" strokeWidth="0.2" opacity="0.3" />
              <line x1="191" y1="49" x2="49" y2="191" stroke="#FFD700" strokeWidth="0.2" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mandala)" />
        </svg>
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div key={i}
          className="absolute pointer-events-none z-[1] select-none"
          style={{ left: p.x, top: p.y, fontSize: p.size }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 0.6, 0.3, 0.7, 0], y: [0, -30, -60, -90, -120] }}
          transition={{ duration: 8, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}>
          {p.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full"
        style={{ minHeight: "100vh", display: "flex", alignItems: "flex-end" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end w-full pb-16 md:pb-20 pt-36 md:pt-44">

          {/* LEFT */}
          <div className="relative">
            {/* Dark overlay behind text for readability */}
            <div className="absolute -inset-8 bg-gradient-to-r from-[#0A0301]/80 via-[#0A0301]/40 to-transparent rounded-3xl blur-xl -z-10" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }} className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gold/70" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold/90">
                Since 2014 · India's Royal Ice Cream Experience
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.p key={`tag-${index}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="font-heading italic text-2xl md:text-3xl mb-2"
                style={{ color: cur.accent }}>
                {cur.tagline}
              </motion.p>
            </AnimatePresence>

            <div className="mb-8">
              <RevealText as="h1" className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-cream leading-[1.05] tracking-tight" delay={0.1} stagger={0.04}>
                Royal Flavours, Crafted With Love
              </RevealText>
            </div>

            <AnimatePresence mode="wait">
              <motion.p key={`desc-${index}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-cream/70 text-base leading-relaxed max-w-md mb-8">
                {cur.desc}
              </motion.p>
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8">
              <MagneticButton as="button" strength={0.2} onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wide text-choco transition-all duration-300 hover:scale-105 hover:shadow-xl btn-glow border-0 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${cur.accent}, #F0D080)` }}>
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="inline-flex items-center gap-2">
                      <Check size={16} /> Added to Cart
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                      className="inline-flex items-center gap-2">
                      <ShoppingBag size={16} /> {cur.cta}
                    </motion.span>
                  )}
                </AnimatePresence>
              </MagneticButton>
              <MagneticButton as="a" strength={0.2}
                href="#flavours"
                className="no-underline inline-flex items-center gap-2 border border-cream/30 text-cream rounded-full px-8 py-4 text-sm font-medium hover:border-cream/70 hover:bg-cream/5 transition-all duration-300">
                See All Flavours
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-2 mb-8">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
              </div>
              <span className="text-xs text-cream/50">4.9 · 50,000+ Happy Customers</span>
            </motion.div>

            <div className="flex flex-wrap gap-2">
              {flavors.map((f, i) => (
                <button key={f.name}
                  onClick={() => { setDir(i > index ? 1 : -1); setIndex(i) }}
                  className="text-xs rounded-full px-4 py-1.5 font-medium transition-all duration-300 cursor-pointer border"
                  style={i === index
                    ? { background: cur.accent, color: "#2C1A0E", borderColor: cur.accent }
                    : { background: "transparent", color: "rgba(255,248,240,0.5)", borderColor: "rgba(255,248,240,0.2)" }}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - Brighter product */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div key={`glow2-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{ background: cur.glow, transform: "scale(0.85)" }} />
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div key={`img-${index}`}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative w-72 h-72 md:w-96 md:h-96 float">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 shadow-2xl brightness-110 contrast-105 backdrop-blur-sm"
                    style={{ borderColor: "rgba(255,248,240,0.6)", boxShadow: "0 8px 40px rgba(201,168,76,0.25), 0 0 80px rgba(201,168,76,0.08)" }}>
                    <img src={cur.image} alt={cur.name} className="w-full h-full object-cover" loading="eager" />
                  </div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div key={`price-${index}`}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-2 -right-2 md:bottom-4 md:-right-6 rounded-2xl px-5 py-3 shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${cur.accent}, #F0D080)` }}>
                  <p className="text-[10px] font-semibold text-choco/70 uppercase tracking-wide">Starting</p>
                  <p className="font-heading text-2xl font-bold text-choco">{cur.price}</p>
                </motion.div>
              </AnimatePresence>

              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-choco border-2 border-gold flex items-center justify-center shadow-lg float-delay">
                <Crown size={18} className="text-gold" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`name-${index}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }} className="text-center mt-8">
                <h2 className="font-heading text-3xl md:text-4xl text-cream font-bold">{cur.name}</h2>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-4 mt-6">
              <button onClick={() => go(-1)}
                className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold transition-all cursor-pointer">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {flavors.map((_, i) => (
                  <button key={i} onClick={() => setIndex(i)}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={i === index
                      ? { width: "24px", height: "6px", background: cur.accent }
                      : { width: "6px", height: "6px", background: "rgba(255,248,240,0.25)" }} />
                ))}
              </div>
              <button onClick={() => go(1)}
                className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold transition-all cursor-pointer">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
        <span className="text-[10px] uppercase tracking-widest text-cream/30">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cream/30 to-transparent" />
      </motion.div>
    </section>
  )
}
