import { Leaf, ChefHat, Crown, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import RevealText from "./RevealText"
import ParticleBackground from "./ParticleBackground"

const BG = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=2400&q=95&fit=crop"

const reasons = [
  { icon: Leaf, title: "Farm Fresh Milk", desc: "Sourced daily from certified organic farms. Cold-chain maintained from farm to scoop.", num: "01" },
  { icon: ChefHat, title: "Handcrafted Daily", desc: "Small batch churned each morning. Never frozen, always fresh — guaranteed.", num: "02" },
  { icon: Crown, title: "Royal Recipes", desc: "Inspired by centuries-old Mughal dessert traditions, refined for the modern palate.", num: "03" },
  { icon: ShieldCheck, title: "No Preservatives", desc: "100% natural, zero artificial colours or flavours. Pure ingredients, pure taste.", num: "04" },
]

export default function WhyUs() {
  return (
    <section className="relative section-pad overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={BG} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-[#2C1A0E]/88" />
        <ParticleBackground opacity={0.1} speed={0.15} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Our Promise</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-cream" delay={0.1}>
            Why Shahi Scoops?
          </RevealText>
          <p className="text-cream/40 text-sm mt-4 max-w-lg mx-auto">Since 2014, crafting royal flavours with the world's finest ingredients</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:bg-white/[0.10] hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500">
              {/* Glass highlight overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              {/* Number */}
              <span className="font-heading text-6xl font-bold text-white/[0.04] absolute top-4 right-5 select-none group-hover:text-gold/[0.06] transition-colors duration-500">
                {item.num}
              </span>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-gold/20 transition-all duration-400"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)", backdropFilter: "blur(8px)" }}>
                <item.icon size={26} className="text-gold transition-transform duration-300" />
              </div>
              <h3 className="font-heading text-lg text-cream font-semibold mb-3 relative z-10">{item.title}</h3>
              <p className="text-cream/45 text-sm leading-relaxed relative z-10">{item.desc}</p>
              <div className="mt-6 w-8 h-0.5 bg-gold/30 group-hover:w-full group-hover:bg-gold/50 transition-all duration-500 rounded-full relative z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
