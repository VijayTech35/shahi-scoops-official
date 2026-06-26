import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Crown } from "lucide-react"

export default function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{ background: "#2C1A0E" }}>

          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-40 h-40 rounded-full border border-gold/20" />

          {/* Crown icon with 360° spin on entrance */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 140 }}>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}>
              <Crown size={44} className="text-gold mb-4" />
            </motion.div>
          </motion.div>

          {/* Brand name with shimmer */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-heading text-3xl font-bold shimmer tracking-wide">
            Shahi Scoops
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.25em] text-cream/30 mt-2">
            Royal Flavours, Crafted With Love
          </motion.p>

          {/* Decorative stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 0.5 }}
            className="absolute text-gold text-2xl select-none"
            style={{ top: "30%", left: "25%" }}>✦</motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 0.7 }}
            className="absolute text-gold text-xl select-none"
            style={{ bottom: "35%", right: "25%" }}>✦</motion.div>

          {/* Loading bar */}
          <div className="absolute bottom-10 w-32 h-px bg-cream/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #C9A84C, #F0D080)" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
