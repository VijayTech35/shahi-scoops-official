import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCart } from "../context/CartContext"

export default function MobileStickyOrder() {
  const [show, setShow] = useState(false)
  const { count, setIsOpen } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const handleClick = () => {
    if (location.pathname === '/') {
      setIsOpen(true)
    } else {
      navigate('/checkout')
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-4 pt-2"
          style={{ background: "linear-gradient(to top, rgba(28,13,6,0.98) 60%, transparent)" }}>
          <button
            onClick={handleClick}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-sm font-bold tracking-wide shadow-2xl border-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #C9A84C, #F0D080)", color: "#2C1A0E" }}>
            <ShoppingBag size={17} />
            {count > 0 ? `View Cart (${count})` : 'Browse Menu'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
