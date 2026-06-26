import { ShoppingBag, MessageCircle, Menu } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { waUrl } from "../data/config"

export default function FloatingCTA() {
  const { count, setIsOpen } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  // Don't show on checkout, cart drawer, or admin
  if (location.pathname.startsWith('/checkout') || location.pathname.startsWith('/admin')) return null

  const hasItems = count > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Cart button (primary) */}
      {hasItems ? (
        <motion.button
          onClick={() => {
            if (location.pathname === '/') {
              // Open cart drawer
              setIsOpen(true)
            } else {
              navigate('/checkout')
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-gradient-to-br from-gold to-gold/80 text-choco rounded-full pl-4 pr-5 py-3.5 flex items-center gap-2.5 shadow-2xl shadow-gold/40 cursor-pointer border-0"
        >
          <ShoppingBag size={20} />
          <span className="text-sm font-bold hidden sm:inline tracking-wide">
            {location.pathname === '/' ? 'View Cart' : 'Checkout'} · {count}
          </span>
          <span className="absolute -top-1 -right-1 bg-choco text-gold text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        </motion.button>
      ) : null}

      {/* Secondary: WhatsApp support (always available, smaller) */}
      <motion.a
        href={waUrl("Hi! I have a question about Shahi Scoops 🍦")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-900/30 no-underline"
        title="Support / bulk orders"
      >
        <MessageCircle size={20} />
      </motion.a>
    </motion.div>
  )
}
