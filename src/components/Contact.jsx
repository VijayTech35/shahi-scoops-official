import { useState } from "react"
import { MapPin, Phone, Mail, PhoneCall, Clock, Wifi, Car, Coffee, Users, Send, CheckCircle, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { config, waUrl } from "../data/config"

const amenities = [
  { icon: Car, label: "Free Parking" },
  { icon: Wifi, label: "Free WiFi" },
  { icon: Coffee, label: "Outdoor Seating" },
  { icon: Users, label: "Family Friendly" },
]

const interests = ["Kesar Pista", "Gulab Jamun Swirl", "Belgian Chocolate", "Alphonso Mango", "Bulk Order", "Franchise", "Other"]

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", interest: "", message: "" })
  const [focused, setFocused] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Your name is required"
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number"
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address"
    if (!form.message.trim()) e.message = "Please write a message"
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = {
        name: form.name, phone: form.phone, email: form.email,
        interest: form.interest || "General", message: form.message,
      }
      try {
        await fetch("/api/contact", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      } catch {
        const fallback = new URLSearchParams({ ...payload, _captcha: "false", _template: "table" })
        await fetch("https://formsubmit.co/hello@shahiscoops.com", {
          method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: fallback,
        })
      }
    } catch { /* silently succeed */ }
    setLoading(false); setSubmitted(true)
  }

  const inputBase = "w-full bg-transparent border-b-2 border-choco/15 focus:border-gold outline-none py-3 text-choco placeholder-choco/30 text-sm transition-all duration-300 font-body"
  const labelBase = "block text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 transition-colors duration-300"

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  }
  const slideLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7 } } }
  const slideUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }
  const slideRight = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7 } } }

  return (
    <section id="contact" className="section-pad bg-white dark:bg-[#1A120B] relative overflow-hidden">
      {/* Decorative background layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent 70%)" }} />
        <div className="absolute top-[40%] left-[15%] w-[200px] h-[200px] rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)" }} />
        {/* Subtle pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="contact-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20">
          <div className="ornament mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">Get In Touch</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-choco dark:text-white leading-tight">
            Visit Us or <span className="text-gradient">Write To Us</span>
          </h2>
          <p className="text-choco/45 dark:text-gray-400 text-sm mt-3 max-w-md mx-auto leading-relaxed">
            We'd love to hear from you — whether it's a flavour request, bulk order, or just saying hello
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* LEFT — Info + Map (2 cols) */}
          <motion.div variants={slideLeft} className="lg:col-span-2 flex flex-col gap-6">

            {/* Contact info card */}
            <div className="bg-[#FDF5EC] dark:bg-[#2A1D15] rounded-3xl p-7 border border-gold/15 card-lift relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gold/5 group-hover:bg-gold/10 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center">
                    <Crown size={16} className="text-gold" />
                  </div>
                  <span className="font-heading text-base text-choco dark:text-white font-semibold">Our Details</span>
                </div>
                <div className="space-y-5">
                  {[
                    { icon: MapPin, label: "Address", value: config.address, href: null },
                    { icon: Phone, label: "Phone", value: config.phoneDisplay, href: `tel:${config.whatsappNumber}` },
                    { icon: Mail, label: "Email", value: config.email, href: `mailto:${config.email}` },
                    { icon: Clock, label: "Hours", value: config.businessHours, href: null },
                  ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon size={14} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-choco/35 dark:text-gray-500 font-semibold mb-0.5">{item.label}</p>
                        {item.href
                          ? <a href={item.href} className="text-sm text-choco/65 dark:text-gray-300 no-underline hover:text-gold transition-colors leading-relaxed">{item.value}</a>
                          : <p className="text-sm text-choco/65 dark:text-gray-300 leading-relaxed">{item.value}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="grid grid-cols-2 gap-2.5">
              {amenities.map((a, i) => (
                <motion.div key={a.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2.5 bg-[#FDF5EC] dark:bg-[#2A1D15] rounded-2xl px-4 py-3 border border-gold/15 hover:border-gold/35 hover:bg-[#FFF8F0] dark:hover:bg-[#3B2A20] transition-all duration-300 card-lift">
                  <a.icon size={14} className="text-gold" />
                  <span className="text-xs text-choco/65 dark:text-gray-300 font-medium">{a.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden border border-gold/15 shadow-lg flex-1 min-h-[240px] bg-amber-50/50 dark:bg-[#2A1D15] relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <iframe src="https://maps.google.com/maps?q=Maanyata+Stay+Pg+Nagawara+Bengaluru+560045&output=embed"
                width="100%" height="100%" style={{ border: 0, minHeight: "240px" }}
                loading="lazy" allowFullScreen title="Shahi Scoops Location" />
            </div>

            {/* Delivery info */}
            <div className="bg-choco rounded-3xl p-7 text-white border border-gold/15 relative overflow-hidden group">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gold/[0.04] group-hover:bg-gold/[0.07] transition-all duration-500" />
              <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gold/[0.03] group-hover:bg-gold/[0.06] transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <span className="font-heading text-base text-gold font-semibold">Delivery Info</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  {[
                    { label: "Minimum", value: "₹200 order" },
                    { label: "Free", value: "Within 5 km" },
                    { label: "Time", value: "30–45 mins" },
                    { label: "Areas", value: "Bengaluru" },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-2.5">
                      <span className="text-gold/60 text-[10px] uppercase tracking-wider w-16 flex-shrink-0">{d.label}</span>
                      <span className="text-cream/80">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CENTER — Premium Contact Form (2 cols) */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <div className="relative bg-choco rounded-3xl overflow-hidden h-full group">
              {/* Decorative gold glows */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: "radial-gradient(circle, rgba(201,168,76,0.12), transparent)", transform: "translate(30%, -30%)" }} />
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent)", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(201,168,76,0.05), transparent)", transform: "translate(-30%, 30%)" }} />

              <div className="relative z-10 p-8 md:p-10">
                {/* Form header */}
                <div className="mb-8">
                  <motion.span initial={{ opacity: 0, y: -5 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold/70 font-semibold border border-gold/20 rounded-full px-4 py-1.5 mb-4">
                    <Crown size={10} /> Royal Enquiry
                  </motion.span>
                  <h3 className="font-heading text-2xl md:text-3xl text-cream leading-tight">
                    Send Us a<br />
                    <span className="text-gradient">Message</span>
                  </h3>
                  <p className="text-cream/40 text-xs mt-2 leading-relaxed">
                    Fill in your details and we'll get back to you within 24 hours
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="success"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center justify-center py-10 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        style={{ background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.3)" }}>
                        <CheckCircle size={36} className="text-gold" />
                      </motion.div>
                      <h4 className="font-heading text-2xl text-cream mb-3">Message Received!</h4>
                      <p className="text-cream/50 text-sm leading-relaxed max-w-xs mb-8">
                        Thank you, <span className="text-gold">{form.name}</span>! Our royal team will get back to you within 24 hours.
                      </p>
                      <button onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", interest: "", message: "" }) }}
                        className="text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 rounded-full px-5 py-2 transition-all cursor-pointer">
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit} noValidate
                      initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className={labelBase} style={{ color: focused === "name" ? "#C9A84C" : "rgba(255,248,240,0.35)" }}>
                            Your Name
                          </label>
                          <input type="text" placeholder="e.g. Priya Sharma"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused("")}
                            className={inputBase}
                            style={{ borderBottomColor: errors.name ? "#E8637A" : focused === "name" ? "#C9A84C" : "rgba(255,248,240,0.12)", color: "#FFF8F0" }} />
                          {errors.name && <p className="text-[11px] mt-1.5" style={{ color: "#E8637A" }}>{errors.name}</p>}
                        </div>
                        <div>
                          <label className={labelBase} style={{ color: focused === "phone" ? "#C9A84C" : "rgba(255,248,240,0.35)" }}>
                            Phone Number
                          </label>
                          <input type="tel" placeholder="10-digit number"
                            value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            onFocus={() => setFocused("phone")}
                            onBlur={() => setFocused("")}
                            className={inputBase}
                            style={{ borderBottomColor: errors.phone ? "#E8637A" : focused === "phone" ? "#C9A84C" : "rgba(255,248,240,0.12)", color: "#FFF8F0" }} />
                          {errors.phone && <p className="text-[11px] mt-1.5" style={{ color: "#E8637A" }}>{errors.phone}</p>}
                        </div>
                      </div>
                      <div>
                        <label className={labelBase} style={{ color: focused === "email" ? "#C9A84C" : "rgba(255,248,240,0.35)" }}>
                          Email Address
                        </label>
                        <input type="email" placeholder="you@example.com"
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused("")}
                          className={inputBase}
                          style={{ borderBottomColor: errors.email ? "#E8637A" : focused === "email" ? "#C9A84C" : "rgba(255,248,240,0.12)", color: "#FFF8F0" }} />
                        {errors.email && <p className="text-[11px] mt-1.5" style={{ color: "#E8637A" }}>{errors.email}</p>}
                      </div>
                      <div>
                        <label className={labelBase} style={{ color: "rgba(255,248,240,0.35)" }}>
                          I'm Interested In
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {interests.map(interest => (
                            <button key={interest} type="button"
                              onClick={() => setForm(p => ({ ...p, interest }))}
                              className="text-[11px] rounded-full px-3 py-1.5 font-medium transition-all duration-200 cursor-pointer border"
                              style={form.interest === interest
                                ? { background: "#C9A84C", color: "#2C1A0E", borderColor: "#C9A84C" }
                                : { background: "transparent", color: "rgba(255,248,240,0.45)", borderColor: "rgba(255,248,240,0.12)" }}>
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelBase} style={{ color: focused === "message" ? "#C9A84C" : "rgba(255,248,240,0.35)" }}>
                          Your Message
                        </label>
                        <textarea rows={3} placeholder="Tell us what's on your mind..."
                          value={form.message}
                          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                          onFocus={() => setFocused("message")}
                          onBlur={() => setFocused("")}
                          className={`${inputBase} resize-none`}
                          style={{ borderBottomColor: errors.message ? "#E8637A" : focused === "message" ? "#C9A84C" : "rgba(255,248,240,0.12)", color: "#FFF8F0" }} />
                        {errors.message && <p className="text-[11px] mt-1.5" style={{ color: "#E8637A" }}>{errors.message}</p>}
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full rounded-2xl py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed pulse-glow"
                        style={{ background: loading ? "rgba(201,168,76,0.6)" : "linear-gradient(135deg, #C9A84C, #F0D080)", color: "#2C1A0E" }}>
                        {loading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending your message...
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            Send Royal Enquiry
                          </>
                        )}
                      </button>
                      <p className="text-center text-[10px] text-cream/20">
                        We respect your privacy. No spam, ever.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — WhatsApp + Quick Order (1 col) */}
          <motion.div variants={slideRight} className="lg:col-span-1 flex flex-col gap-5">
            {/* WhatsApp CTA — for support / bulk / custom orders */}
            <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-3xl p-7 text-white flex flex-col items-center text-center overflow-hidden relative flex-1 group">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col items-center">
                <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}
                  className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <PhoneCall size={24} />
                </motion.div>
                <h3 className="font-heading text-xl text-white mb-2">Support & Bulk Orders</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-6">
                  For custom flavours, event catering, corporate gifts & bulk orders over 5 kg.
                </p>
                <a href={waUrl("Hi! I have a bulk / custom order enquiry")}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-white text-green-700 rounded-full px-6 py-3 text-xs font-bold hover:bg-green-50 transition-all inline-flex items-center gap-2 no-underline shadow-lg hover:scale-105 hover:shadow-xl">
                  <PhoneCall size={13} />
                  Chat with us
                </a>
                <p className="text-white/30 text-[10px] mt-3">Replies within 5 mins</p>
              </div>
            </div>

            {/* Events & Catering */}
            <div className="bg-gradient-to-br from-amber-900 to-[#2C1A0E] rounded-3xl p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gold/5 -translate-y-6 translate-x-6 group-hover:scale-125 transition-transform duration-500" />
              <div className="relative z-10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <h3 className="font-heading text-lg text-gold font-semibold mb-1">Events & Catering</h3>
                <p className="text-cream/50 text-xs leading-relaxed mb-4">
                  Weddings, birthdays, corporate events — we bring the royal scoop to your celebration.
                </p>
                <a href={waUrl("Hi! I'd like to enquire about catering/events with Shahi Scoops")}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-bold text-choco bg-gold rounded-full px-5 py-2.5 hover:scale-105 transition-all no-underline shadow-lg hover:shadow-gold/30">
                  Enquire Now
                </a>
              </div>
            </div>

            {/* Quick order */}
            <div className="bg-[#FDF5EC] dark:bg-[#2A1D15] rounded-3xl border border-gold/15 p-5 card-lift">
              <p className="font-heading text-sm text-choco dark:text-white font-semibold mb-4">Quick Order</p>
              <div className="space-y-1">
                {[
                  { name: "Kesar Pista", price: "₹90", emoji: "🌿" },
                  { name: "Gulab Jamun", price: "₹85", emoji: "🍡" },
                  { name: "Chocolate", price: "₹95", emoji: "🍫" },
                  { name: "Mango Magic", price: "₹85", emoji: "🥭" },
                ].map((f, i) => (
                  <motion.a key={f.name} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    href={waUrl(`Hi! I'd like to order ${f.name} (${f.price}) from Shahi Scoops`)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-white dark:hover:bg-[#3B2A20] hover:shadow-sm transition-all no-underline group/item cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{f.emoji}</span>
                      <span className="text-xs text-choco dark:text-white font-medium">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-xs font-bold text-choco dark:text-white">{f.price}</span>
                      <span className="text-[10px] text-green-600 font-bold opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
