import { Camera } from "lucide-react"
import { motion } from "framer-motion"
import RevealText from "./RevealText"

const images = [
  { src: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=1200&q=100&fit=crop", span: "row-span-2", label: "Kesar Pista" },
  { src: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=1200&q=100&fit=crop", span: "", label: "Rose & Cardamom" },
  { src: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&q=100&fit=crop", span: "", label: "Belgian Chocolate" },
  { src: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1200&q=100&fit=crop", span: "row-span-2", label: "Sitaphal" },
  { src: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&q=100&fit=crop", span: "", label: "Shahi Tukda" },
  { src: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=100&fit=crop", span: "", label: "Anjeer & Honey" },
  { src: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=1200&q=100&fit=crop", span: "", label: "Gulab Jamun Swirl" },
  { src: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200&q=100&fit=crop", span: "", label: "Alphonso Mango" },
  { src: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=1200&q=100&fit=crop", span: "", label: "Mango Delight" },
  { src: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=1200&q=100&fit=crop", span: "row-span-2", label: "Malai Kulfi" },
  { src: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=100&fit=crop", span: "", label: "Paan Royal" },
  { src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=100&fit=crop", span: "", label: "Rasmalai" },
]

export default function Gallery() {
  return (
    <section className="section-pad bg-[#1C0D06] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-5 pointer-events-none blur-3xl"
        style={{ background: "#C9A84C" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-14">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">@shahiscoops</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-cream" delay={0.1}>
            Follow Our Sweet Journey
          </RevealText>
          <p className="text-cream/40 text-sm mt-3 max-w-sm mx-auto">
            Tag us in your Shahi moments for a chance to be featured
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: "200px" }}>
          {images.map((img, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${img.span}`}>
              <img src={img.src} alt={img.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 transition-all duration-400 flex flex-col items-center justify-end p-5">
                <div className="flex items-center gap-2 text-white mb-1.5">
                  <Camera size={15} className="text-pink-400" />
                  <span className="text-xs font-semibold">@shahiscoops</span>
                </div>
                <p className="text-cream text-xs font-medium">{img.label}</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                <Camera size={13} className="text-white" />
              </div>
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] bg-pink-500/80 text-white font-semibold px-2 py-0.5 rounded-full">Instagram</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10">
          <a href="https://instagram.com/shahiscoops" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-gold/30 text-gold rounded-full px-8 py-3.5 text-sm font-semibold hover:bg-gold hover:text-choco transition-all duration-300 no-underline hover:shadow-xl hover:shadow-gold/20 btn-glow">
            <Camera size={16} />
            Follow @shahiscoops
          </a>
        </motion.div>
      </div>
    </section>
  )
}
