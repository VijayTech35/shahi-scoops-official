import { Share2 } from "lucide-react"

export default function ShareButton() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shahi Scoops — Royal Ice Cream",
          text: "India's most royal handcrafted ice cream. Premium flavours since 2014!",
          url: window.location.origin,
        })
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard?.writeText(window.location.origin)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this site"
      className="fixed z-40 bottom-28 right-5 md:right-8 w-12 h-12 rounded-full bg-gold text-choco shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer"
    >
      <Share2 size={18} />
    </button>
  )
}
