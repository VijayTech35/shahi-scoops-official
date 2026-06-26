import { useEffect, useRef, useCallback } from "react"

const PARTICLE_COUNT = 20
const COLORS = ["#C9A84C", "#F0D080", "#FFF8F0", "#C9A84C"]

export default function CursorTrail() {
  const particles = useRef([])
  const mouse = useRef({ x: 0, y: 0 })
  const raf = useRef(null)
  const canvasRef = useRef(null)

  const init = useCallback(() => {
    particles.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: Math.random() * 3 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1 - i / PARTICLE_COUNT,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    init()

    const onMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", onMouse)

    let idx = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const p = particles.current

      p[idx].x = mouse.current.x
      p[idx].y = mouse.current.y
      p[idx].life = 1
      idx = (idx + 1) % PARTICLE_COUNT

      for (const pt of p) {
        pt.x += pt.vx
        pt.y += pt.vy
        pt.vx *= 0.95
        pt.vy *= 0.95
        pt.life -= pt.decay
        if (pt.life <= 0) continue

        ctx.globalAlpha = pt.life * pt.alpha * 0.6
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size * (1 - pt.life * 0.3), 0, Math.PI * 2)
        ctx.fillStyle = pt.color
        ctx.fill()

        ctx.shadowBlur = 6
        ctx.shadowColor = pt.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouse)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [init])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  )
}
