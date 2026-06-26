import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Sparkles, Zap, Crown, ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import RevealText from "./RevealText"

const comboImages = {
  RoyalTrio: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=120&q=90&fit=crop&crop=center",
  FamilyFeast: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=120&q=90&fit=crop&crop=center",
  BirthdaySpecial: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&q=90&fit=crop&crop=center",
  ShahiFeast: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=120&q=90&fit=crop&crop=center",
}

const combos = [
  {
    name: "Royal Trio",
    desc: "Any 3 single-scoop flavours of your choice",
    price: "₹240",
    save: "₹45",
    bg: "from-amber-900/80 to-amber-700/80",
    border: "border-amber-500/40",
    img: comboImages.RoyalTrio,
    glow: "#C9A84C",
    icon: Crown,
  },
  {
    name: "Family Feast",
    desc: "4 generous scoops (2 regular + 2 premium flavours)",
    price: "₹299",
    save: "₹81",
    bg: "from-yellow-900/80 to-yellow-700/80",
    border: "border-yellow-500/40",
    img: comboImages.FamilyFeast,
    glow: "#E8901A",
    icon: Sparkles,
  },
  {
    name: "Birthday Special",
    desc: "6-scoop platter + complimentary crown topper",
    price: "₹499",
    save: "₹120",
    bg: "from-orange-900/80 to-orange-700/80",
    border: "border-orange-400/40",
    img: comboImages.BirthdaySpecial,
    glow: "#FF8C00",
    icon: Zap,
  },
  {
    name: "Shahi Feast",
    desc: "8 premium scoops + 2 toppings + 4 wafers",
    price: "₹699",
    save: "₹200",
    bg: "from-rose-900/80 to-rose-700/80",
    border: "border-rose-400/40",
    best: true,
    img: comboImages.ShahiFeast,
    glow: "#E8637A",
    icon: Crown,
  },
]

function ComboCard({ combo, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = combo.icon
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleCombo = () => {
    // Combos need custom selection — send to flavours page where they can pick
    if (!user) { navigate('/login'); return }
    navigate('/flavours?combo=' + encodeURIComponent(combo.name))
  }
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.12 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative rounded-2xl p-6 bg-gradient-to-br ${combo.bg} border ${combo.border} backdrop-blur-sm shadow-xl overflow-hidden group`}
    >
      {/* Glow effect on hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none blur-2xl"
        style={{ background: combo.glow }} />

      {/* Decorative icon */}
      <div className="absolute top-3 left-3 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Icon size={20} className="text-white" />
      </div>

      {combo.best && (
        <motion.span
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300, delay: i * 0.12 + 0.3 }}
          className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg"
        >
          BEST VALUE
        </motion.span>
      )}
      {/* Decorative image */}
      <motion.div
        animate={inView ? { rotate: [12, 15, 12] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4 w-16 h-16 rounded-xl overflow-hidden shadow-lg opacity-60 rotate-12 pointer-events-none ring-2 ring-white/20 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
      >
        <img src={combo.img} alt="" className="w-full h-full object-cover" loading="lazy" />
      </motion.div>
      <h3 className="text-xl font-bold text-white font-serif relative z-10">{combo.name}</h3>
      <p className="text-white/70 text-sm mt-1 leading-relaxed relative z-10">{combo.desc}</p>
      <div className="flex items-end justify-between mt-4 relative z-10">
        <div>
          <span className="text-3xl font-bold text-white">{combo.price}</span>
          <span className="ml-2 text-white/50 line-through text-sm">{combo.save}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCombo}
          aria-label={`Build ${combo.name}`}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-all border border-white/20 cursor-pointer inline-flex items-center gap-1.5"
        >
          <ShoppingBag size={14} /> Build Combo
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function Combos() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <section id="combos" className="py-20 px-4 scroll-mt-[90px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C1A0E] via-[#3D2314] to-[#2C1A0E] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            className="absolute text-gold/10 text-lg select-none"
            style={{
              left: `${10 + i * 17}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            {["✦", "❄", "✦", "❄", "✦", "❄"][i]}
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-amber-400 font-semibold text-sm tracking-widest uppercase inline-flex items-center gap-2">
            <Sparkles size={12} /> Saver Deals
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-2">
            Combos & <span className="text-amber-400">Specials</span>
          </h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">
            More scoops, less spend — curated for sharing (or not).
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {combos.map((c, i) => (
            <ComboCard key={c.name} combo={c} i={i} />
          ))}
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          * Add-ons and customisations available. Prices inclusive of all taxes.
        </p>
      </div>
    </section>
  )
}
