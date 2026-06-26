import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { flavours } from '../data/flavours'

export default function FlavorOfMonth() {
  const [dismissed, setDismissed] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Find Rose & Cardamom or fall back to first featured
  const featured = flavours.find(f => /rose/i.test(f.name)) || flavours[5]
  const [added, setAdded] = useState(false)

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return }
    const ok = await addToCart(featured.id, 1)
    if (ok) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  if (dismissed) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.5, type: 'spring' }}
        className="fixed top-0 left-0 w-full z-[60] flex items-center justify-center px-4 py-2.5"
        style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
        <div className="flex items-center gap-2 text-choco">
          <Sparkles size={13} className="flex-shrink-0" />
          <p className="text-xs font-semibold text-center">
            <span className="font-heading font-bold">🍦 Flavour of the Month:</span>
            {' '}{featured.name} — Limited batch!{' '}
            <button onClick={handleAdd} className="underline font-bold text-choco/80 hover:text-choco transition-colors bg-transparent border-0 cursor-pointer p-0">
              {added ? '✓ Added!' : 'Add to Cart →'}
            </button>
          </p>
        </div>
        <button onClick={() => setDismissed(true)}
          className="absolute right-3 text-choco/60 hover:text-choco cursor-pointer transition-colors bg-transparent border-0 p-1"
          aria-label="Dismiss banner">
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
