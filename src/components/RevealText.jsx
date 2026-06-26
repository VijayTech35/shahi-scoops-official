import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export default function RevealText({ children, as: Tag = "h2", className = "", delay = 0, stagger = 0.03 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  const text = typeof children === "string" ? children : ""
  const words = text.split(" ")

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i} className="inline-block" style={{ overflow: "hidden", verticalAlign: "top" }}>
            <motion.span
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: delay + i * stagger }}
            >
              {word}{i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  )
}
