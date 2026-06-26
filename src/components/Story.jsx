import { Crown, Leaf, Star, Heart } from "lucide-react"
import { motion } from "framer-motion"
import RevealText from "./RevealText"

const pills = [
  { icon: Crown, label: "Est. 2014", color: "text-gold" },
  { icon: Leaf, label: "100% Natural", color: "text-mint" },
  { icon: Star, label: "Award Winning", color: "text-pink" },
  { icon: Heart, label: "Family Owned", color: "text-red-400" },
]

const images = [
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=2400&q=95&fit=crop",
  "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=95&fit=crop",
  "https://images.unsplash.com/photo-1579165466741-7a7e3a2ea713?w=800&q=95&fit=crop",
]

export default function Story() {
  return (
    <section id="story" className="section-pad bg-white dark:bg-[#1A120B] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="relative mb-8 md:mb-0">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl shadow-choco/10 dark:shadow-black/40">
              <img src={images[0]} alt="Our Story"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-choco/40 via-transparent to-transparent" />
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -top-4 -right-4 md:top-6 md:-right-8 w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#2A1D15] float-delay">
              <img src={images[1]} alt="Premium Ingredients"
                className="w-full h-full object-cover" loading="lazy" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-choco rounded-2xl px-6 py-4 shadow-2xl">
              <p className="text-xs text-gold/70 font-medium uppercase tracking-wider">Happy Customers</p>
              <p className="font-heading text-3xl font-bold text-gold">50,000+</p>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_,i) => <Star key={i} size={10} className="fill-gold text-gold" />)}
              </div>
            </motion.div>

            <div className="absolute -z-10 top-8 left-8 w-full h-full rounded-3xl border-2 border-gold/15" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="ornament mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Our Heritage</span>
            </div>

            <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white leading-tight mb-2" delay={0.2} stagger={0.05}>
              The Royal Heritage Of Shahi Scoops
            </RevealText>
            <div className="h-1" />

            <p className="text-choco/60 dark:text-gray-300 leading-relaxed mb-5 text-base">
              Born in 2014, Shahi Scoops was founded on a simple dream — to
              bring the grandeur of royal Indian desserts to every family. Inspired
              by the magnificence of Mughal culinary traditions, each scoop is
              crafted as if it were fit for a king.
            </p>
            <p className="text-choco/60 dark:text-gray-300 leading-relaxed mb-8 text-base">
              We source premium ingredients from certified local organic farms,
              churn every batch by hand each morning, and serve happiness in every
              scoop. From Kesar Pista to Gulab Jamun Swirl — each flavour tells a
              story steeped in royal heritage.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {pills.map((pill) => (
                <div key={pill.label}
                  className="flex items-center gap-2 text-sm text-choco/75 dark:text-white bg-cream dark:bg-[#2A1D15] border border-gold/25 rounded-full px-4 py-2.5 hover:border-gold/60 hover:shadow-sm transition-all">
                  <pill.icon size={14} className={pill.color} />
                  <span className="font-medium">{pill.label}</span>
                </div>
              ))}
            </div>

            <a href="#flavours"
              className="inline-flex items-center gap-3 no-underline group">
              <span className="w-12 h-12 rounded-full bg-choco flex items-center justify-center text-cream group-hover:bg-gold group-hover:text-choco transition-all duration-300 shadow-lg">
                →
              </span>
              <span className="text-sm font-semibold text-choco dark:text-white group-hover:text-gold transition-colors border-b border-transparent group-hover:border-gold pb-0.5">
                Explore Our Flavours
              </span>
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
