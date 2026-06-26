import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

export default function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }} transition={{ duration: 0.3 }}
          className="fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full border border-gold/30 bg-choco flex items-center justify-center text-gold shadow-lg hover:bg-gold hover:text-choco hover:scale-110 transition-all duration-300 cursor-pointer"
          style={{ boxShadow: "0 4px 20px rgba(201,168,76,0.15)" }}
          aria-label="Scroll to top">
          <ArrowUp size={17} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
