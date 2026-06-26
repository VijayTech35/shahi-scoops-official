import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'shahi-cookie-consent'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }))
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, at: new Date().toISOString() }))
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gold/20 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
              <Cookie size={20} className="text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-choco leading-relaxed">
                <strong>We use cookies.</strong> Essential cookies keep your cart and login working.
                Optional analytics cookies help us improve your experience. See our{' '}
                <Link to="/privacy" className="text-gold underline hover:text-gold/80">Privacy Policy</Link>.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={decline}
                className="px-4 py-2 rounded-full text-xs font-semibold text-choco/70 hover:text-choco border border-choco/15 hover:border-choco/30 transition-colors cursor-pointer">
                Essential Only
              </button>
              <button onClick={accept}
                className="px-5 py-2 rounded-full text-xs font-bold text-choco hover:scale-105 transition-transform cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                Accept All
              </button>
            </div>
            <button onClick={decline} aria-label="Dismiss"
              className="absolute top-2 right-2 md:relative md:top-auto md:right-auto p-1 text-choco/30 hover:text-choco/60 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
