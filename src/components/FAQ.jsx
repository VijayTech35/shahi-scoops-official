import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle, Search, Package, Truck, ShoppingBag, Sparkles } from "lucide-react"
import RevealText from "./RevealText"

const categories = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "products", label: "Products", icon: Package },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "orders", label: "Orders", icon: ShoppingBag },
]

const faqs = [
  { q: "Do you use natural ingredients?", a: "Absolutely. Every scoop is made with 100% natural ingredients — no artificial flavours, no preservatives, no shortcuts. We source premium dairy, real fruits, and authentic spices.", cat: "products" },
  { q: "How should I store your ice cream?", a: "Keep it at -18°C or below. Once opened, consume within 7 days for the best texture and taste. Let it sit at room temperature for 3-4 minutes before scooping.", cat: "products" },
  { q: "Do you offer bulk orders for events?", a: "Yes! We cater weddings, corporate events, birthday parties, and festivals. Order at least 48 hours in advance. Contact us via WhatsApp or the enquiry form for a custom quote.", cat: "orders" },
  { q: "What areas do you deliver to?", a: "We currently deliver across Bengaluru. Minimum order is ₹200 for delivery. Delivery within 5 km is free; a nominal charge applies beyond that. Typical delivery time is 30-45 minutes.", cat: "delivery" },
  { q: "Are there vegan or lactose-free options?", a: "We're developing a dedicated vegan line launching this summer. Currently, our Belgian Chocolate and Alphonso Mango sorbets are dairy-free. Ask our team for the latest options.", cat: "products" },
  { q: "Can I customise a flavour or create my own?", a: "For bulk or event orders, yes! Our chef can work with you to create a custom flavour. Minimum 5 kg. Reach out via the enquiry form or WhatsApp to start the conversation.", cat: "orders" },
  { q: "What payment methods do you accept?", a: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and cash on delivery. All online payments are processed securely.", cat: "orders" },
  { q: "How long does delivery take?", a: "Standard delivery takes 30-45 minutes within Bengaluru. During peak hours it may take up to 60 minutes. You'll receive a WhatsApp notification when your order is on its way.", cat: "delivery" },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)
  const [search, setSearch] = useState("")
  const [activeCat, setActiveCat] = useState("all")

  const filtered = useMemo(() => {
    return faqs.filter(f => {
      const matchCat = activeCat === "all" || f.cat === activeCat
      const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCat, search])

  return (
    <section className="section-pad bg-white dark:bg-[#1A120B] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent 70%)" }} />
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Got Questions?</span>
          </div>
          <RevealText as="h2" className="font-heading text-4xl md:text-5xl text-choco dark:text-white" delay={0.1}>
            Frequently Asked
          </RevealText>
          <p className="text-choco/50 dark:text-gray-400 text-sm mt-3 max-w-md mx-auto">
            Everything you need to know about Shahi Scoops
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="relative max-w-md mx-auto mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(null) }}
            placeholder="Search questions..."
            className="w-full bg-[#FDF5EC] dark:bg-[#2A1D15] border border-gold/15 focus:border-gold/40 rounded-2xl pl-11 pr-4 py-3 text-sm text-choco dark:text-white placeholder-choco/30 dark:placeholder-gray-500 outline-none transition-all duration-300"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-choco/30 dark:text-gray-500 hover:text-choco/60 dark:hover:text-gray-300 transition-colors text-xs cursor-pointer">
              Clear
            </button>
          )}
        </motion.div>

        {/* Category pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCat(cat.id); setOpen(null) }}
              className={"inline-flex items-center gap-1.5 text-xs rounded-full px-4 py-2 font-medium transition-all duration-300 cursor-pointer border " + (activeCat === cat.id
                ? "bg-gold text-choco border-gold shadow-md"
                : "bg-transparent text-choco/50 dark:text-gray-400 border-gold/20 hover:border-gold/40 hover:text-choco/70 dark:hover:text-gray-200")}>
              <cat.icon size={12} />
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ items */}
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? filtered.map((faq, i) => (
              <motion.div key={faq.q}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={"rounded-2xl border border-gold/10 overflow-hidden transition-all duration-300 hover:border-gold/25 " + (open === faq.q ? "bg-gold/[0.04]" : "bg-white dark:bg-[#2A1D15]")}>
                <button onClick={() => setOpen(open === faq.q ? null : faq.q)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer transition-colors"
                  aria-expanded={open === faq.q}>
                  <HelpCircle size={15} className="text-gold flex-shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-choco dark:text-white leading-snug">{faq.q}</span>
                  <motion.div animate={{ rotate: open === faq.q ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={15} className="text-gold/50 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === faq.q && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-choco/55 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-12">
                <Sparkles size={32} className="text-gold/30 mx-auto mb-3" />
                <p className="text-choco/40 dark:text-gray-500 text-sm">No questions match your search</p>
                <button onClick={() => { setSearch(""); setActiveCat("all") }}
                  className="mt-3 text-xs text-gold hover:text-gold/80 underline cursor-pointer">
                  Reset filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Still have questions */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center bg-[#FDF5EC] dark:bg-[#2A1D15] rounded-2xl p-6 border border-gold/15">
          <p className="text-sm font-semibold text-choco dark:text-white">Still have questions?</p>
          <p className="text-xs text-choco/50 dark:text-gray-400 mt-1">Reach out to us on WhatsApp — we reply within 5 minutes</p>
          <a href="https://wa.me/916204373073?text=Hi!%20I%20have%20a%20question%20about%20Shahi%20Scoops"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-choco bg-gold rounded-full px-6 py-2.5 hover:scale-105 transition-all no-underline shadow-lg">
            <Truck size={12} />
            Ask on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
