import { useState } from "react"
import { Crown, Phone, Mail, MapPin, Heart, ArrowUp, Send, CheckCircle, MessageCircle, BookOpen, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { config, waUrl } from "../data/config"

const InstagramIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
  </svg>
)

const FacebookIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

export default function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const links = [
    { label: "Home", href: "#home" },
    { label: "All Flavours", href: "/products", internal: true },
    { label: "Combos", href: "#combos" },
    { label: "Gift Cards", href: "#gift-cards" },
    { label: "Blog & Recipes", href: "/blog", internal: true },
    { label: "Track Order", href: "/track-order", internal: true },
    { label: "Our Story", href: "#story" },
    { label: "Contact", href: "#contact" },
  ]

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) return
    setSubscribed(true)
  }

  return (
    <footer className="bg-[#1C0D06] text-cream relative overflow-hidden">
      <div className="h-px w-full" style={{background:"linear-gradient(90deg, transparent, #C9A84C, transparent)"}} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{background:"radial-gradient(circle, #C9A84C, transparent)"}} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-14 md:pt-18 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-cream/5">

          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <Crown size={22} className="text-gold" />
              <span className="font-heading text-2xl font-bold tracking-wide shimmer">{config.brand.name}</span>
            </div>
            <p className="text-cream/45 text-sm leading-relaxed mb-6 max-w-xs">
              India's most royal handcrafted ice cream experience. Inspired by Mughal dessert traditions, crafted with love since {config.brand.since}.
            </p>
            <div className="flex items-center gap-3 mb-6">
              {[
                { icon: InstagramIcon, href: config.instagram, label: "Instagram" },
                { icon: FacebookIcon, href: config.facebook, label: "Facebook" },
                { icon: MessageCircle, href: waUrl("Hi! I have a question or bulk-order enquiry"), label: "WhatsApp Support" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-10 h-10 rounded-2xl border border-cream/10 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 hover:scale-110 transition-all duration-300">
                  <s.icon size={16} />
                </a>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 border border-gold/20 rounded-full px-4 py-2 hover:border-gold/40 transition-colors">
              <Crown size={12} className="text-gold" />
              <span className="text-[11px] text-gold/70 font-medium">{config.brand.tagline}</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-heading text-sm text-cream/80 font-semibold mb-5 uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-3.5">
              {links.map((link) => (
                link.internal ? (
                  <Link key={link.href} to={link.href}
                    className="block text-cream/40 hover:text-gold text-sm transition-colors no-underline group">
                    <span className="mr-2 text-gold/0 group-hover:text-gold transition-colors">›</span>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.href} href={link.href}
                    className="block text-cream/40 hover:text-gold text-sm transition-colors no-underline group">
                    <span className="mr-2 text-gold/0 group-hover:text-gold transition-colors">›</span>
                    {link.label}
                  </a>
                )
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-heading text-sm text-cream/80 font-semibold mb-5 uppercase tracking-wider">Get In Touch</h3>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: config.address },
                { icon: Phone, text: config.phoneDisplay, href: `tel:${config.whatsappNumber}` },
                { icon: Mail, text: config.email, href: `mailto:${config.email}` },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  {item.href
                    ? <a href={item.href} className="text-xs text-cream/40 no-underline hover:text-gold transition-colors leading-relaxed">{item.text}</a>
                    : <span className="text-xs text-cream/40 leading-relaxed">{item.text}</span>
                  }
                </div>
              ))}
              <div className="mt-4 p-3 rounded-2xl border border-cream/5 bg-cream/3 hover:border-gold/20 transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-gold/50 font-semibold">Hours</p>
                <p className="text-xs text-cream/50 mt-1">{config.businessHours}</p>
              </div>
            </div>
            {/* Compact inline email */}
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-wider text-gold/40 font-semibold mb-2">Get Royal Updates</p>
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex items-center gap-0 overflow-hidden rounded-xl border border-cream/10 bg-cream/5 backdrop-blur-sm hover:border-gold/30 transition-colors focus-within:border-gold/50">
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 bg-transparent px-4 py-2.5 text-xs text-cream placeholder-cream/20 outline-none" />
                  <button type="submit"
                    className="flex-shrink-0 text-choco text-xs font-bold px-4 py-2.5 m-0.5 rounded-lg cursor-pointer transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                    <Send size={12} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-gold/80 text-xs">
                  <CheckCircle size={14} />
                  <span>Subscribed! Welcome to the Royal Club.</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-heading text-sm text-cream/80 font-semibold mb-5 uppercase tracking-wider">Royal Newsletter</h3>
            <p className="text-cream/35 text-xs leading-relaxed mb-4">
              Get exclusive offers, new flavour alerts, and royal treats delivered to your inbox.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-cream/10 bg-cream/5 backdrop-blur-sm hover:border-gold/30 transition-colors focus-within:border-gold/50">
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 bg-transparent px-4 py-3 text-xs text-cream placeholder-cream/20 outline-none" />
                  <button type="submit"
                    className="flex-shrink-0 text-choco text-xs font-bold px-4 py-3 m-0.5 rounded-lg cursor-pointer transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                    <Send size={13} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-gold/80 text-xs">
                <CheckCircle size={14} />
                <span>Subscribed! Welcome to the Royal Club.</span>
              </div>
            )}
            <p className="text-cream/15 text-[10px] mt-3">No spam. Unsubscribe anytime.</p>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-cream/25 text-xs">© 2024 {config.brand.name}. All rights reserved.</p>
          <p className="text-cream/25 text-xs flex items-center gap-1.5">
            Made with <Heart size={10} className="text-pink fill-pink" /> for ice cream lovers across India
          </p>
          <a href="#home"
            className="w-9 h-9 rounded-full border border-cream/10 flex items-center justify-center text-cream/30 hover:text-gold hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all">
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
