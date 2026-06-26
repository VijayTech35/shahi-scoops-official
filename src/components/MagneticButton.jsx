import { useRef, useState } from "react"
import { motion } from "framer-motion"

export default function MagneticButton({ children, as: Component = "a", className = "", strength = 0.3, ...props }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    setPos({ x, y })
  }

  const onMouseLeave = () => setPos({ x: 0, y: 0 })

  return (
    <Component
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      {...props}
    >
      <motion.span
        className="inline-flex items-center gap-2"
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        {children}
      </motion.span>
    </Component>
  )
}
