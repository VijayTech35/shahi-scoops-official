import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Crown, RefreshCw, Star, Share2, Check, Copy, ArrowRight, BadgeCheck } from "lucide-react"
import { flavours } from "../data/flavours"
import { waUrl } from "../data/config"

const questions = [
  {
    q: "What flavour profile do you love most?",
    key: "profile",
    options: [
      { label: "Rich & Chocolatey", value: "chocolatey", flavor: "Belgian Chocolate", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=95&fit=crop", emoji: "🍫" },
      { label: "Fruity & Refreshing", value: "fruity", flavor: "Alphonso Mango", image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&q=95&fit=crop", emoji: "🥭" },
      { label: "Traditional Indian", value: "traditional", flavor: "Gulab Jamun Swirl", image: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800&q=95&fit=crop", emoji: "🍡" },
      { label: "Light & Elegant", value: "light", flavor: "Rose & Cardamom", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=95&fit=crop", emoji: "🌹" },
    ],
  },
  {
    q: "What's your perfect dessert mood?",
    key: "mood",
    options: [
      { label: "Royal Celebration", value: "celebration", flavor: "Shahi Tukda", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=95&fit=crop", emoji: "👑" },
      { label: "Everyday Treat", value: "everyday", flavor: "Kesar Pista", image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&q=95&fit=crop", emoji: "🍦" },
      { label: "Family Gathering", value: "family", flavor: "Alphonso Mango", image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800&q=95&fit=crop", emoji: "👨‍👩‍👧‍👧" },
      { label: "Date Night", value: "romance", flavor: "Belgian Chocolate", image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=95&fit=crop", emoji: "💕" },
    ],
  },
  {
    q: "Choose your favourite ingredient.",
    key: "ingredient",
    options: [
      { label: "Kashmiri Saffron", value: "saffron", flavor: "Kesar Pista", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=95&fit=crop", emoji: "✨" },
      { label: "Pistachios", value: "pistachio", flavor: "Kesar Pista", image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&q=95&fit=crop", emoji: "🥜" },
      { label: "Rose Petals", value: "rose", flavor: "Rose & Cardamom", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=95&fit=crop", emoji: "🌹" },
      { label: "Belgian Chocolate", value: "chocolate", flavor: "Belgian Chocolate", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=95&fit=crop", emoji: "🍫" },
      { label: "Alphonso Mango", value: "mango", flavor: "Alphonso Mango", image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=800&q=95&fit=crop", emoji: "🥭" },
    ],
  },
  {
    q: "How adventurous are your taste buds?",
    key: "adventure",
    options: [
      { label: "Classic Lover", value: "classic", flavor: "Kesar Pista", image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&q=95&fit=crop", emoji: "🌟" },
      { label: "Traditional Enthusiast", value: "traditional", flavor: "Gulab Jamun Swirl", image: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800&q=95&fit=crop", emoji: "🏛️" },
      { label: "Flavor Explorer", value: "explorer", flavor: "Rose & Cardamom", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=95&fit=crop", emoji: "🧭" },
      { label: "Ultimate Foodie", value: "foodie", flavor: "Belgian Chocolate", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=95&fit=crop", emoji: "👨‍🍳" },
    ],
  },
]

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#C9A84C", "#F0D080", "#E8637A", "#7EC8A4", "#FFF8F0"][Math.floor(Math.random() * 5)],
    delay: Math.random() * 0.6,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div key={p.id}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ left: `${p.x}%`, top: -10, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "100vh", opacity: 0, rotate: p.rotation }}
          transition={{ duration: 2 + Math.random() * 2, delay: p.delay, ease: "easeIn" }} />
      ))}
    </div>
  )
}

function countOptions(arr) {
  const map = {}
  arr.forEach(v => { map[v] = (map[v] || 0) + 1 })
  return map
}

const optionAccents = {
  "Belgian Chocolate": "#6B3A2A",
  "Alphonso Mango": "#E8901A",
  "Gulab Jamun Swirl": "#E8637A",
  "Rose & Cardamom": "#C06070",
  "Kesar Pista": "#C9A84C",
  "Shahi Tukda": "#A0784C",
}

export default function FlavorQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState(false)
  const [welcomeBack, setWelcomeBack] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("shahi-favourite")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWelcomeBack(parsed)
      } catch { /* ignore */ }
    }
  }, [])

  const handleAnswer = useCallback((qKey, value, flavor) => {
    setAnswers(p => ({ ...p, [qKey]: value }))
    if (step < questions.length - 1) {
      setStep(s => s + 1)
    } else {
      const allAnswers = [...Object.values({ ...answers, [qKey]: value }), flavor]
      const counts = countOptions(allAnswers)
      const matchedName = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      const matched = flavours.find(f => f.name === matchedName) || flavours[0]
      setResult(matched)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      localStorage.setItem("shahi-favourite", JSON.stringify({ name: matched.name, image: matched.image, accent: matched.accent }))
    }
  }, [step, answers])

  const reset = () => {
    setStep(0)
    setAnswers({})
    setResult(null)
    setShowConfetti(false)
  }

  const shareResult = () => {
    if (!result) return
    const text = `My Royal Flavor Match is ${result.name} 👑🍨 — Shahi Scoops`
    if (navigator.share) {
      navigator.share({ title: "My Royal Flavor Match", text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const cur = questions[step]
  const progress = ((step) / questions.length) * 100

  return (
    <section className="section-pad bg-gradient-to-b from-[#FDF5EC] to-white relative overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(-50%, -50%)" }} />

      <div className="max-w-5xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Discover Your Taste</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-choco">Find Your Perfect Royal Flavor</h2>
          <p className="text-choco/50 text-sm mt-3 max-w-lg mx-auto">
            Answer four quick questions and we'll recommend the perfect scoop for you
          </p>
        </motion.div>

        {welcomeBack && !result && step === 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 bg-gold/10 backdrop-blur-sm border border-gold/30 rounded-2xl px-5 py-3 max-w-md mx-auto">
            <p className="text-xs text-choco/70">
              Welcome back! Your favourite royal flavor is{" "}
              <span className="font-bold text-gold">{welcomeBack.name}</span> 👑
            </p>
          </motion.div>
        )}

        {!result ? (
          <div className="relative">
            {/* Step progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {questions.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.div
                    className="rounded-full flex items-center justify-center text-[10px] font-bold"
                    animate={i === step
                      ? { width: 32, height: 32, background: "#C9A84C", color: "#2C1A0E" }
                      : i < step
                      ? { width: 26, height: 26, background: "rgba(201,168,76,0.2)", color: "#C9A84C" }
                      : { width: 26, height: 26, background: "rgba(201,168,76,0.08)", color: "rgba(201,168,76,0.3)" }}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </motion.div>
                  {i < questions.length - 1 && (
                    <div className="w-6 md:w-10 h-px bg-gold/20" />
                  )}
                </div>
              ))}
            </div>

            <div className="w-full h-1 bg-gold/10 rounded-full mb-8 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #C9A84C, #F0D080)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress + 25}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}>
                <div className="text-center mb-8">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold/50 font-semibold">Question {step + 1}</span>
                  <h3 className="font-heading text-2xl md:text-3xl text-choco mt-2 leading-tight">{cur.q}</h3>
                </div>

                <div className={`grid gap-4 ${cur.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} max-w-3xl mx-auto`}>
                  {cur.options.map((opt) => {
                    const accent = optionAccents[opt.flavor] || "#C9A84C"
                    const isSelected = answers[cur.key] === opt.value

                    return (
                      <motion.button key={opt.value}
                        onClick={() => handleAnswer(cur.key, opt.value, opt.flavor)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className={"group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer text-left " + (isSelected ? "" : "bg-white")}
                        style={isSelected ? {
                          background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                          boxShadow: `0 8px 32px ${accent}30, inset 0 0 0 2px ${accent}`,
                          border: "none",
                        } : {
                          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                          border: "2px solid rgba(201,168,76,0.1)",
                        }}>
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FFF8F0] to-[#FDF5EC]">
                          <img src={opt.image} alt={opt.label}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <span className="text-base">{opt.emoji}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                              style={{ background: accent }}>
                              <Check size={13} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <span className="text-sm font-semibold text-choco block leading-snug">{opt.label}</span>
                        </div>
                        {isSelected && (
                          <motion.div className="absolute bottom-0 left-0 right-0 h-0.5"
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            style={{ background: accent }} />
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
                  <span className="text-xs text-choco/30 font-medium">
                    Tap an option to continue
                  </span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-gold/20 shadow-xl shadow-gold/5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none"
              style={{ background: `radial-gradient(circle, ${result.accent}, transparent)`, transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.03] pointer-events-none"
              style={{ background: `radial-gradient(circle, #C9A84C, transparent)`, transform: "translate(-30%, 30%)" }} />

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ background: `linear-gradient(135deg, ${result.accent}20, #C9A84C15)`, border: "2px solid rgba(201,168,76,0.2)" }}>
              <Crown size={32} className="text-gold" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-semibold border border-gold/30 rounded-full px-4 py-1.5 mb-4">
                <Sparkles size={10} /> Your Royal Match
              </span>
              <h3 className="font-heading text-3xl md:text-4xl text-choco mb-2">{result.name}</h3>
              <p className="text-choco/55 text-sm max-w-md mx-auto mb-6">{result.desc}</p>
            </motion.div>

            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg mb-6"
              style={{ border: "3px solid rgba(255,248,240,0.6)", boxShadow: "0 8px 40px rgba(201,168,76,0.2)" }}>
              <img src={result.image} alt={result.name} className="w-full h-full object-cover" loading="lazy" />
              {result.badge && (
                <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md ${result.badgeStyle}`}>
                  {result.badge}
                </span>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_,i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
              <span className="text-xs text-choco/50 ml-1">{result.rating} · {result.reviews} reviews</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="flex flex-wrap justify-center gap-3 mb-6">
              <a href={waUrl(`Hi! I'd like to order ${result.name} (${result.price}) from Shahi Scoops`)}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-choco hover:scale-105 transition-all no-underline shadow-lg btn-glow"
                style={{ background: `linear-gradient(135deg, ${result.accent}, #F0D080)` }}>
                <Sparkles size={14} />
                Order This Flavor
              </a>
              <a href="#flavours"
                className="inline-flex items-center gap-2 border border-choco/15 text-choco/60 rounded-full px-8 py-3.5 text-sm font-medium hover:border-choco/30 hover:text-choco transition-all no-underline">
                Explore All Flavours
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3">
              <button onClick={shareResult}
                className="inline-flex items-center gap-2 text-xs text-choco/40 border border-choco/10 rounded-full px-5 py-2.5 hover:border-gold/30 hover:text-gold transition-all cursor-pointer">
                {copied ? <><Copy size={12} /> Link Copied!</> : <><Share2 size={12} /> Share Result</>}
              </button>
              <button onClick={reset}
                className="inline-flex items-center gap-2 text-xs text-choco/40 border border-choco/10 rounded-full px-5 py-2.5 hover:border-choco/30 hover:text-choco transition-all cursor-pointer">
                <RefreshCw size={12} />
                Retake Quiz
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="mt-10 pt-8 border-t border-gold/10">
              <p className="text-[10px] uppercase tracking-wider text-choco/40 font-semibold mb-4">You May Also Love</p>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                {flavours.filter(f => f.name !== result.name).slice(0, 3).map((f) => (
                  <a key={f.name}
                    href={waUrl(`Hi! I'd like to order ${f.name} (${f.price}) from Shahi Scoops`)}
                    target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all no-underline">
                    <div className="w-14 h-14 rounded-full overflow-hidden mb-2">
                      <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                    <span className="text-[11px] font-semibold text-choco text-center leading-tight">{f.name}</span>
                    <span className="text-[10px] text-gold font-bold mt-0.5">{f.price}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-6">
              <a href={`https://wa.me/?text=${encodeURIComponent(`My Royal Flavor Match is ${result.name} 👑🍨 — Shahi Scoops`)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] text-green-600 border border-green-200 rounded-full px-4 py-2 hover:bg-green-50 transition-all no-underline">
                Share on WhatsApp
              </a>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
