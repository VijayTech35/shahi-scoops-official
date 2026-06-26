import { useState } from "react"
import { X, Sparkles } from "lucide-react"

const offers = [
  "Monsoon Special: Buy 2 scoops, Get 1 Free!",
  "₹50 off on orders above ₹300. Use code: ROYAL50",
  "Free delivery on orders above ₹200 (within 5 km)",
]

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const offer = offers[Math.floor(Math.random() * offers.length)]

  return (
    <div className="relative z-50 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-white text-[11px]">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
        <Sparkles size={12} className="text-yellow-200 flex-shrink-0" />
        <span className="font-medium tracking-wide truncate">{offer}</span>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 ml-2 p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss announcement"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
