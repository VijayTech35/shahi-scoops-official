import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingBag, Trash2, Star, Share2, CheckCircle, Copy } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../hooks/useApi"
import useDocumentTitle from "../hooks/useDocumentTitle"
import { useCart } from "../context/CartContext"
import Breadcrumb from "../components/Breadcrumb"

export default function WishlistPage() {
  useDocumentTitle('My Wishlist')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    api.get("/wishlist").then(r => {
      setItems(r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const removeItem = async (productId) => {
    setItems(prev => prev.filter(i => i.product_id !== productId))
    await api.delete(`/wishlist/${productId}`).catch(() => {})
  }

  const shareWishlist = async () => {
    try {
      const { data } = await api.post('/wishlist/share')
      setShareUrl(data.share_url)
      await navigator.clipboard.writeText(data.share_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      alert('Failed to create share link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-24 border border-gold/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <Breadcrumb items={[{ label: 'My Wishlist' }]} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-gold" />
            <div>
              <h1 className="font-heading text-3xl text-choco font-bold">My Wishlist</h1>
              <p className="text-choco/50 text-sm">{items.length} {items.length === 1 ? "item" : "items"} saved</p>
            </div>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-2">
              {copied && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Copied!</span>}
              <button onClick={shareWishlist}
                className="flex items-center gap-1.5 text-xs border border-gold/30 text-gold rounded-full px-4 py-2 hover:bg-gold/5 cursor-pointer transition-colors">
                <Share2 size={12} /> Share Wishlist
              </button>
            </div>
          )}
        </motion.div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-16 text-center border border-gold/10">
            <Heart size={48} className="text-choco/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl text-choco mb-2">Your wishlist is empty</h2>
            <p className="text-choco/40 text-sm mb-6">Save your favourite flavours and come back to order them anytime.</p>
            <Link to="/products"
              className="inline-flex items-center gap-2 bg-choco text-cream rounded-full px-8 py-3 text-sm font-semibold no-underline hover:bg-choco/85 transition-colors">
              <ShoppingBag size={16} /> Explore Flavours
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-gold/10 hover:border-gold/25 transition-all shadow-sm flex items-center gap-4">
                <Link to={`/products/${item.product_id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-cream no-underline">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="no-underline">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-heading font-bold text-choco truncate hover:text-gold transition-colors">{item.name}</h3>
                      {item.badge && (
                        <span className="text-[9px] bg-gold/20 text-gold font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                  <p className="font-heading text-lg font-bold text-gold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { addToCart(item.product_id); removeItem(item.product_id) }}
                    className="bg-choco text-cream rounded-full px-5 py-2.5 text-xs font-semibold hover:bg-choco/85 transition-colors cursor-pointer flex items-center gap-1.5">
                    <ShoppingBag size={13} /> Add to Cart
                  </button>
                  <button onClick={() => removeItem(item.product_id)}
                    className="w-9 h-9 rounded-full border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
