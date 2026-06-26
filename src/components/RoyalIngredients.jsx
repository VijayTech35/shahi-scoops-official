import { motion } from "framer-motion"
import { Leaf, Sparkles, MapPin } from "lucide-react"
import RevealText from "./RevealText"

const ingredients = [
  {
    name: "Kashmiri Saffron",
    desc: "The finest red-gold saffron threads from the high valleys of Pampore, Kashmir. Harvested by hand at dawn for unparalleled aroma and colour.",
    image: "https://images.unsplash.com/photo-1602673752289-8acf5aa1e77b?w=1200&q=95&fit=crop",
    accent: "#C9A84C",
    region: "Kashmir Valley",
    origin: "India",
  },
  {
    name: "Premium Pistachios",
    desc: "Jumbo-grade pistachios imported from the finest Mediterranean groves. Hand-shelled and lightly toasted to release their natural oils and flavour.",
    image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=1200&q=95&fit=crop",
    accent: "#7EC8A4",
    region: "Mediterranean",
    origin: "Iran / Turkey",
  },
  {
    name: "Alphonso Mangoes",
    desc: "Sun-ripened Alphonso mangoes from the orchards of Ratnagiri. Each fruit selected for its deep golden colour, honeyed sweetness, and fibreless pulp.",
    image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200&q=95&fit=crop",
    accent: "#E8901A",
    region: "Ratnagiri",
    origin: "India",
  },
  {
    name: "Rose Petals",
    desc: "Hand-selected organic rose petals from the gardens of Kannauj. Cold-infused to capture their delicate fragrance without any artificial essence.",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=1200&q=95&fit=crop",
    accent: "#E8637A",
    region: "Kannauj",
    origin: "India",
  },
]

export default function RoyalIngredients() {
  return (
    <section id="ingredients" className="section-pad bg-[#FDF5EC] dark:bg-[#1A120B] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Farm To Scoop</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white" delay={0.1}>
            The Royal Ingredients
          </RevealText>
          <p className="text-choco/50 dark:text-gray-400 text-sm mt-3 max-w-lg mx-auto">
            Every scoop tells a story of origin — we source the world's finest ingredients for your royal experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {ingredients.map((item, i) => (
            <motion.div key={item.name}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative bg-white dark:bg-[#2A1D15] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 card-border-glow">
              <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-gradient-to-br from-amber-100/50 to-amber-50/30">
                <img src={item.image} alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy" onError={e => { e.target.style.opacity = "0" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-[#3B2A20]/90 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-sm">
                  <MapPin size={10} className="text-gold" />
                  <span className="text-[10px] font-semibold text-choco dark:text-white">{item.region}</span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gold/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Sparkles size={9} className="text-choco" />
                  <span className="text-[9px] font-bold text-choco uppercase tracking-wider">{item.origin}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-heading text-xl md:text-2xl text-white font-bold drop-shadow-lg">{item.name}</h3>
                  <p className="text-white/70 text-xs mt-1 max-w-sm leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              </div>
              <div className="p-6 md:p-7 relative bg-white dark:bg-[#2A1D15]">
                <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.04] pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${item.accent}, transparent)`, transform: "translate(30%, -30%)" }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-8 rounded-full" style={{ background: item.accent }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Leaf size={12} className="text-mint" />
                      <span className="text-[10px] uppercase tracking-wider text-choco/40 dark:text-gray-400 font-semibold">Premium Ingredient</span>
                    </div>
                    <p className="text-choco/50 dark:text-gray-400 text-xs mt-0.5">Sourced with care & tradition</p>
                  </div>
                </div>
                <p className="text-choco/60 dark:text-gray-300 text-sm leading-relaxed relative z-10">{item.desc}</p>
                <div className="mt-5 flex items-center gap-2">
                  <div className="w-10 h-0.5 rounded-full transition-all duration-500 group-hover:w-16"
                    style={{ background: item.accent }} />
                  <span className="text-[9px] font-semibold text-choco/30 uppercase tracking-wider transition-opacity duration-500 opacity-0 group-hover:opacity-100">Royal grade</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
