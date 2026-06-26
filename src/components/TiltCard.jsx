import { useRef, useState } from "react"

export default function TiltCard({ children, className = "", maxTilt = 12, glare = true }) {
  const ref = useRef(null)
  const [style, setStyle] = useState({})
  const [glareStyle, setGlareStyle] = useState({})

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * -maxTilt
    const tiltY = (x - 0.5) * maxTilt

    setStyle({
      transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    })

    if (glare) {
      setGlareStyle({
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15), transparent 60%)`,
      })
    }
  }

  const onMouseLeave = () => {
    setStyle({ transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)", transition: "transform 0.5s ease" })
    setGlareStyle({})
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ ...style, position: "relative" }}
    >
      {glare && <div className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]" style={glareStyle} />}
      {children}
    </div>
  )
}
