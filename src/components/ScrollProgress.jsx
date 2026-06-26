import { useEffect, useState } from "react"
import { motion, useSpring } from "framer-motion"

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? scrolled / total : 0)
    }
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent pointer-events-none">
      <motion.div
        className="h-full rounded-r-full"
        style={{
          scaleX: smoothProgress,
          transformOrigin: "left",
          background: "linear-gradient(90deg, #C9A84C, #F0D080, #E8637A)",
          boxShadow: "0 0 8px rgba(201,168,76,0.6)",
        }}
      />
    </div>
  )
}
