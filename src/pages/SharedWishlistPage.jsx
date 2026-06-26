import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Crown, Star } from 'lucide-react'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function SharedWishlistPage() {
  const { token } = useParams()
  const { isLoggedIn } = useAuth()
  const { addToCart } = useCart()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useDocumentTitle('Shared Wishlist')

  useEffect(() => {
    api.get(`/wishlist/shared/${token}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Wishlist not found'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
        <Heart size={48} className="text-choco/20 mb-4" />
        <h1 className="font-heading text-2xl text-choco mb-2">Wishlist Not Found</h1>
        <p className="text-choco/40 text-sm text-center">{error || 'This shared wishlist is no longer available.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <Heart size={28} className="text-gold mx-auto mb-3" />
          <h1 className="font-heading text-2xl md:text-3xl text-choco mb-2">
            {data.user_name}'s Wishlist
          </h1>
          <p className="text-choco/50 text-sm">{data.items?.length || 0} favourite flavour{data.items?.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.items?.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gold/10 overflow-hidden group hover:shadow-lg transition-all">
              <div className="aspect-square overflow-hidden relative">
                <img src={item.image_url} alt={item.name} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {item.badge && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-choco shadow-sm">{item.badge}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading text-base font-bold text-choco">{item.name}</h3>
                <span className="font-heading text-lg font-bold text-gold">₹{item.price}</span>
                {isLoggedIn ? (
                  <button onClick={() => addToCart(item.product_id)}
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-choco cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                    <span className="flex items-center justify-center gap-2"><ShoppingBag size={14} /> Add to Cart</span>
                  </button>
                ) : (
                  <p className="text-xs text-choco/40 mt-3 text-center">Sign in to add to your cart</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
