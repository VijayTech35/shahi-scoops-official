import { flavours } from "../data/flavours"

export default function Marquee() {
  const items = [
    ...flavours.map(f => f.name),
    "Award Winning Since 2014",
    "Handcrafted Daily",
  ]

  return (
    <div className="w-full overflow-hidden bg-[#2C1A0E] border-y border-gold/10 py-3">
      <div className="flex whitespace-nowrap marquee-animate">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-center gap-6 shrink-0 mx-4">
            {items.map((name, i) => (
              <span key={`${idx}-${i}`} className="flex items-center gap-6 text-xs uppercase tracking-[0.15em] text-gold/60 font-medium">
                <span>✦</span>
                <span>{name}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
