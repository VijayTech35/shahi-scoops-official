import { useState, useEffect } from "react"
import { Star, ShoppingBag, Heart, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { flavours, isNew } from "../data/flavours"
import { waUrl } from "../data/config"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import api from "../hooks/useApi"
import RevealText from "./RevealText"
import TiltCard from "./TiltCard"
import MagneticButton from "./MagneticButton"

const categories = ["All", "Traditional", "Chocolate", "Fruit", "Special"]

export default function Flavours() {
  const { isLoggedIn } = useAuth()
  const { addToCart } = useCart()
  const [wishlist, setWishlist] = useState([])
  const [preview, setPreview] = useState(null)
  const [activeCat, setActiveCat] = useState("All")

  // Load wishlist from API if logged in
  useEffect(() => {
    if (!isLoggedIn) return
    api.get("/wishlist").then(r => {
      setWishlist(r.data.map(w => String(w.product_id)))
    }).catch(() => {})
  }, [isLoggedIn])

  const toggleWish = async (flavour) => {
    const key = flavour.id != null ? String(flavour.id) : flavour.name
    const isInWishlist = wishlist.includes(key)
    setWishlist(p => isInWishlist ? p.filter(x => x !== key) : [...p, key])
    if (isLoggedIn && flavour.id != null) {
      if (isInWishlist) {
        await api.delete(`/wishlist/${flavour.id}`).catch(() => {})
      } else {
        await api.post("/wishlist", { product_id: flavour.id }).catch(() => {})
      }
    }
  }

  useEffect(() => {
    if (!preview) return
    const fn = (e) => { if (e.key === "Escape") setPreview(null) }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [preview])

  const filtered = activeCat === "All" ? flavours : flavours.filter(f => f.category === activeCat)

  const bgGradients = [
    "from-[#C9A84C]/20 to-[#C9A84C]/5",
    "from-[#E8637A]/20 to-[#E8637A]/5",
    "from-[#A0784C]/15 to-[#A0784C]/5",
    "from-[#6B3A2A]/15 to-[#6B3A2A]/5",
    "from-orange-300/20 to-orange-100/5",
    "from-rose-300/20 to-rose-100/5",
    "from-[#7EC8A4]/20 to-[#7EC8A4]/5",
    "from-purple-300/20 to-purple-100/5",
  ]

  return (
    <section id="flavours" className="section-pad bg-[#FDF5EC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Handcrafted Daily</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white" delay={0.1}>
            Signature Flavours
          </RevealText>
          <p className="text-choco/50 dark:text-gray-400 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Every scoop tells a story of royal Indian heritage and the finest organic ingredients
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              aria-label={`Filter by ${cat}`}
              className={"text-xs rounded-full px-4 py-2 font-medium transition-all duration-300 cursor-pointer border " + (activeCat === cat
                ? "bg-gold text-choco border-gold"
                : "bg-transparent text-choco/50 border-gold/20")}>
              {cat === "All" ? "All Flavours" : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {filtered.map((item, i) => {
            const autoBadge = isNew(item.addedDate) ? "New" : null
            const displayBadge = autoBadge || item.badge
            const badgeStyle = autoBadge ? "bg-gold text-choco" : item.badgeStyle

            return (
              <motion.div key={item.name}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.07 }}
                className="premium-card bg-white rounded-3xl overflow-hidden shadow-sm group cursor-pointer"
                onClick={() => setPreview(item)}>

                <TiltCard className={`relative aspect-square overflow-hidden bg-gradient-to-br ${bgGradients[i % bgGradients.length]}`} maxTilt={8} glare={true}>
                  <img src={item.image} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {displayBadge && (
                    <div className="absolute top-0 left-0 z-10">
                      <div className={`relative px-4 py-1.5 text-[10px] font-bold shadow-lg ${badgeStyle}`}
                        style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}>
                        {displayBadge}
                      </div>
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); toggleWish(item) }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md"
                    aria-label="Wishlist">
                    <Heart size={14} className={wishlist.includes(String(item.id)) ? "fill-pink text-pink" : "text-choco/40"} />
                  </button>
                </TiltCard>

                <div className="p-4 md:p-5">
                  <h3 className="font-heading text-base md:text-lg text-choco dark:text-white font-semibold leading-tight">{item.name}</h3>
                  <p className="text-xs text-choco/50 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                  <div className="flex items-center gap-1 mt-2.5">
                    <Star size={11} className="fill-gold text-gold dark:fill-gold dark:text-gold" />
                    <span className="text-[11px] text-choco/55 dark:text-gray-300 font-medium">{item.rating} ({item.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-heading text-lg font-bold text-choco dark:text-white">{item.price}</span>
                    <MagneticButton as="button" strength={0.15} onClick={(e) => {
                      e.stopPropagation()
                      window.open(waUrl(`Hi! I'd like to order ${item.name} (${item.price}) from Shahi Scoops`), "_blank")
                    }}
                      aria-label={`Order ${item.name}`}
                      className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-md"
                      style={{ background: `linear-gradient(135deg, ${item.accent}, #F0D080)`, color: "#2C1A0E" }}>
                      <ShoppingBag size={12} />
                      Order
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-xs text-choco/30 dark:text-gray-500 mt-10 italic">
          New flavours added regularly — follow us for updates
        </motion.p>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreview(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#2A1D15] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gold/20">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={preview.image} alt={preview.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <button onClick={() => setPreview(null)}
                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-[#3B2A20] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
                    <X size={14} className="text-choco dark:text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-2xl md:text-3xl text-choco dark:text-white font-bold">{preview.name}</h3>
                  <span className="font-heading text-2xl font-bold text-choco dark:text-white">{preview.price}</span>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <Star size={13} className="fill-gold text-gold" />
                  <span className="text-xs text-choco/55 dark:text-gray-300 font-medium">{preview.rating} ({preview.reviews} reviews)</span>
                </div>
                <p className="text-choco/60 dark:text-gray-300 text-sm leading-relaxed mb-4">{preview.desc}</p>
                {preview.nutrition && (
                  <div className="flex gap-3 mb-6">
                    <span className="text-[10px] bg-amber-50 dark:bg-[#3B2A20] border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full">{preview.nutrition.cal}</span>
                    <span className="text-[10px] bg-amber-50 dark:bg-[#3B2A20] border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full">Sugar: {preview.nutrition.sugar}</span>
                    <span className="text-[10px] bg-green-50 dark:bg-[#2A1D15] border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 font-semibold px-2.5 py-1 rounded-full">No Preservatives</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <a href={waUrl(`Hi! I'd like to order ${preview.name} (${preview.price}) from Shahi Scoops`)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-choco dark:text-white hover:scale-105 transition-all no-underline shadow-lg btn-glow"
                    style={{ background: `linear-gradient(135deg, ${preview.accent}, #F0D080)` }}>
                    <ShoppingBag size={14} />
                    Order Now
                  </a>
                  <button onClick={() => { toggleWish(preview); setPreview(null) }}
                    className="w-12 h-12 rounded-full border border-choco/15 dark:border-white/10 flex items-center justify-center text-choco/40 dark:text-gray-300 hover:text-pink hover:border-pink/30 transition-all cursor-pointer">
                    <Heart size={16} className={wishlist.includes(String(preview.id)) ? "fill-pink text-pink" : "text-choco/40 dark:text-gray-300"} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
