import { Crown, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2C1A0E] px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-white/5 border border-gold/20 flex items-center justify-center mb-8">
        <Crown size={40} className="text-gold" />
      </div>
      <h1 className="font-heading text-7xl md:text-8xl font-bold text-gold shimmer mb-4">404</h1>
      <p className="font-heading text-2xl text-cream/80 mb-2">Oops, this scoop doesn't exist!</p>
      <p className="text-cream/40 text-sm mb-10 max-w-md">
        Looks like you've wandered off the royal path. Let's get you back to the ice cream.
      </p>
      <a href="/"
        className="inline-flex items-center gap-2 bg-gold text-choco font-bold rounded-full px-8 py-4 text-sm hover:scale-105 transition-all no-underline shadow-xl">
        <Home size={16} />
        Return Home
      </a>
    </div>
  )
}
