import { useState, useEffect } from "react"
import { Star, Quote, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { flavours } from "../data/flavours"
import RevealText from "./RevealText"

const testimonials = [
  {
    name: "Priya Sharma", city: "Mumbai",
    text: "The Shahi Kesar Pista tastes absolutely royal. It's the perfect blend of tradition and premium quality — the best kulfi-inspired ice cream I have ever had.",
    flavour: "Kesar Pista",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=90&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Rahul Mehta", city: "Delhi",
    text: "Best ice cream I've tasted anywhere in India. The Gulab Jamun Swirl is next level — it genuinely tastes like the real thing. Worth every rupee.",
    flavour: "Gulab Jamun Swirl",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=90&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Ananya Krishnan", city: "Bangalore",
    text: "Shahi Scoops sets the gold standard for premium ice cream in India. The Belgian Chocolate Royal is my non-negotiable weekend treat. Pure luxury.",
    flavour: "Belgian Chocolate",
    img: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e?w=400&q=90&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Vikram Joshi", city: "Pune",
    text: "Every flavour is better than the last. The Alphonso Mango is like summer in a scoop — absolutely unforgettable. Handcrafted perfection.",
    flavour: "Alphonso Mango",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=90&fit=crop&crop=face",
    rating: 5,
  },
  {
    name: "Meera Iyer", city: "Chennai",
    text: "The Rose & Cardamom is pure poetry. So elegant and aromatic. Shahi Scoops truly understands how to elevate ice cream into an experience.",
    flavour: "Rose & Cardamom",
    img: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e?w=400&q=90&fit=crop&crop=face",
    rating: 5,
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)
  const [touchX, setTouchX] = useState(null)

  const next = () => { setDir(1); setCurrent(i => (i + 1) % testimonials.length) }
  const prev = () => { setDir(-1); setCurrent(i => (i - 1 + testimonials.length) % testimonials.length) }

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [])

  const onTouchStart = (e) => setTouchX(e.touches[0].clientX)
  const onTouchEnd = (e) => {
    if (touchX === null) return
    const diff = touchX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setTouchX(null)
  }

  const t = testimonials[current]
  const flavourData = flavours.find(f => f.name === t.flavour)

  const flavourAccent = flavourData?.accent || "#C9A84C"

  const variants = {
    enter: (d) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  }

  return (
    <section className="section-pad bg-[#FDF5EC] dark:bg-[#1A120B]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Customer Love</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white" delay={0.1}>
            Trusted By 50,000+ Dessert Lovers
          </RevealText>
          <p className="text-choco/50 dark:text-gray-400 text-sm mt-3 max-w-md mx-auto">Discover why customers across India love Shahi Scoops</p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={current}
                custom={dir} variants={variants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white dark:bg-[#2A1D15] rounded-3xl border border-gold/10 relative overflow-hidden shadow-sm">
                <Quote size={60} className="text-gold/6 absolute top-4 right-6 rotate-180" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                  {/* Flavor image */}
                  <div className="md:col-span-2 relative overflow-hidden min-h-[200px] md:min-h-full">
                    <img src={flavourData?.image || t.img} alt={t.flavour}
                      className="w-full h-full absolute inset-0 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/40 md:to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/80 font-semibold bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                        <BadgeCheck size={10} className="text-gold" />
                        {t.flavour}
                      </span>
                    </div>
                  </div>

                  {/* Review content */}
                  <div className="md:col-span-3 p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-shrink-0">
                        <img src={t.img} alt={t.name}
                          className="w-14 h-14 rounded-full object-cover border-2" loading="lazy"
                          style={{ borderColor: `${flavourAccent}40` }} />
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#2A1D15]">
                          <BadgeCheck size={11} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-heading text-lg text-choco dark:text-white font-semibold">{t.name}</p>
                        <p className="text-xs text-choco/45 dark:text-gray-400">{t.city} · Verified Customer</p>
                      </div>
                    </div>

                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15}
                          className={i < t.rating ? "fill-gold text-gold" : "text-choco/10 dark:text-gray-600"} />
                      ))}
                    </div>

                    <p className="text-choco/70 dark:text-gray-300 text-base leading-relaxed italic md:text-lg">
                      &ldquo;{t.text}&rdquo;
                    </p>

                    <div className="flex items-center gap-1.5 mt-6 text-mint text-xs font-semibold">
                      <BadgeCheck size={13} />
                      Verified Purchase
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} aria-label="Previous review"
              className="w-10 h-10 rounded-full border border-choco/15 dark:border-white/10 flex items-center justify-center text-choco/40 dark:text-gray-400 hover:text-gold hover:border-gold transition-all cursor-pointer">
              <ChevronLeft size={17} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i) }}
                  className="rounded-full transition-all duration-300 cursor-pointer"
                  style={i === current
                    ? { width: "28px", height: "7px", background: "#C9A84C" }
                    : { width: "7px", height: "7px", background: "rgba(201,168,76,0.25)" }} />
              ))}
            </div>
            <button onClick={next} aria-label="Next review"
              className="w-10 h-10 rounded-full border border-choco/15 dark:border-white/10 flex items-center justify-center text-choco/40 dark:text-gray-400 hover:text-gold hover:border-gold transition-all cursor-pointer">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-choco rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
          {[
            { val: "4.9", label: "Average Rating", sub: "Out of 5.0" },
            { val: "50K+", label: "Happy Customers", sub: "Across India" },
            { val: "98%", label: "Recommend Us", sub: "Would come again" },
          ].map((stat, i) => (
            <div key={stat.label} className="relative">
              <p className="font-heading text-5xl font-bold text-gold">{stat.val}</p>
              <p className="text-cream/80 text-sm font-semibold mt-1">{stat.label}</p>
              <p className="text-cream/35 text-xs mt-0.5">{stat.sub}</p>
              {i < 2 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-cream/10 translate-x-[4rem]" />}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
