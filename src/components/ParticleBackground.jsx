import { useEffect, useRef } from "react"

const PARTICLE_COUNT = 30
const COLORS = ["#C9A84C", "#F0D080", "#FFF8F0"]

export default function ParticleBackground({ opacity = 0.15, speed = 0.3, className = "" }) {
  const canvasRef = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2.5 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.globalAlpha = p.alpha * opacity * 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [opacity, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  )
}
