import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Gift, Crown, Star, Sparkles } from "lucide-react"
import { waUrl } from "../data/config"
import RevealText from "./RevealText"

const cardImages = {
  Silver: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=120&q=90&fit=crop&crop=center",
  Gold: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=120&q=90&fit=crop&crop=center",
  Platinum: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&q=90&fit=crop&crop=center",
}

const cards = [
  {
    tier: "Silver",
    amount: "₹250",
    desc: "Perfect for a quick sweet surprise — a single scoop treat for someone special.",
    icon: Star,
    color: "from-slate-200 to-slate-300",
    textColor: "text-slate-800",
    border: "border-slate-300",
    badge: "CLASSIC",
    img: cardImages.Silver,
    glow: "rgba(148,163,184,0.3)",
  },
  {
    tier: "Gold",
    amount: "₹500",
    desc: "Two premium scoops + toppings. The ideal gift for friends and family.",
    icon: Crown,
    color: "from-yellow-300 to-amber-400",
    textColor: "text-amber-900",
    border: "border-amber-400",
    badge: "POPULAR",
    best: true,
    img: cardImages.Gold,
    glow: "rgba(251,191,36,0.4)",
  },
  {
    tier: "Platinum",
    amount: "₹1,000",
    desc: "A lavish 4-scoop royal platter with premium toppings. For the true king or queen.",
    icon: Sparkles,
    color: "from-purple-300 via-pink-300 to-rose-300",
    textColor: "text-purple-900",
    border: "border-purple-300",
    badge: "LUXURY",
    img: cardImages.Platinum,
    glow: "rgba(192,132,252,0.3)",
  },
]

function GiftCard({ card, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = card.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.15 }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
      className={`relative rounded-3xl p-8 bg-gradient-to-br ${card.color} border ${card.border} shadow-xl overflow-hidden group`}
    >
      {/* Glow on hover */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none blur-3xl"
        style={{ background: card.glow }} />

      {card.best && (
        <motion.span
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300, delay: i * 0.15 + 0.3 }}
          className="absolute -top-3 right-6 bg-amber-800 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider shadow-lg"
        >
          BESTSELLER
        </motion.span>
      )}

      {/* Floating decorative circles */}
      <motion.div
        animate={inView ? { scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-8 translate-x-8 pointer-events-none"
      />
      <motion.div
        animate={inView ? { scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-6 -translate-x-6 pointer-events-none"
      />

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, idx) => (
          <motion.div key={idx}
            className="absolute"
            style={{ left: `${20 + idx * 30}%`, top: `${10 + (idx % 2) * 50}%` }}
            animate={{ y: [0, -8, 0], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2.5 + idx, repeat: Infinity, ease: "easeInOut", delay: idx * 0.8 }}
          >
            <Sparkles size={10} className={card.textColor} />
          </motion.div>
        ))}
      </div>

      {/* Decorative image */}
      <motion.div
        animate={inView ? { rotate: [12, 18, 12] } : {}}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -right-4 w-28 h-28 rounded-2xl overflow-hidden shadow-lg opacity-80 rotate-12 pointer-events-none ring-2 ring-white/30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
      >
        <img src={card.img} alt="" className="w-full h-full object-cover" loading="lazy" />
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={16} className={card.textColor} />
          <span className={`text-[10px] font-bold tracking-widest ${card.textColor} opacity-50`}>{card.badge}</span>
        </div>

        <h3 className={`text-xl font-bold font-serif ${card.textColor} mb-1`}>{card.tier}</h3>
        <p className={`text-4xl font-bold font-serif ${card.textColor} mb-3`}>{card.amount}</p>
        <p className={`text-sm leading-relaxed ${card.textColor} opacity-70 mb-6`}>{card.desc}</p>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={waUrl(`Hi! I'd like to buy a ${card.tier} Gift Card worth ${card.amount} from Shahi Scoops 🎁`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all no-underline shadow-lg bg-white/60 backdrop-blur-md ${card.textColor}`}
        >
          <Gift size={13} />
          Gift This
        </motion.a>
      </div>
    </motion.div>
  )
}

export default function GiftCards() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <section id="gift-cards" className="py-20 px-4 scroll-mt-[90px] relative overflow-hidden bg-[#FFF8F0] dark:bg-[#1A120B]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C1A0E]/5 via-transparent to-[#2C1A0E]/5 pointer-events-none" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div key={i}
            className="absolute text-gold/10 select-none"
            style={{
              left: `${15 + i * 25}%`,
              top: `${30 + (i % 2) * 40}%`,
              fontSize: `${12 + i * 4}px`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
          >
            {["✦", "◆", "✧", "◇"][i]}
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-amber-700 dark:text-amber-400 font-semibold text-sm tracking-widest uppercase inline-flex items-center gap-2">
            <Gift size={12} /> Give the Gift of Royalty
          </span>
          <RevealText as="h2" className="text-4xl md:text-5xl font-serif font-bold text-choco dark:text-white mt-2" delay={0.1}>
            Gift Cards
          </RevealText>
          <p className="text-choco/50 dark:text-gray-400 mt-3 max-w-xl mx-auto text-sm">
            The perfect gift for ice cream lovers. Redeemable on any flavour.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <GiftCard key={c.tier} card={c} i={i} />
          ))}
        </div>

        <p className="text-center text-choco/30 dark:text-gray-500 text-xs mt-6">
          Digital gift cards delivered via WhatsApp. Valid for 6 months.
        </p>
      </div>
    </section>
  )
}
