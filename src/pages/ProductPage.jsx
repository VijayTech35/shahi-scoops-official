import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingBag, Star, Bell, CheckCircle, Clock, MapPin, ChevronRight } from "lucide-react"
import api from "../hooks/useApi"
import useDocumentTitle from "../hooks/useDocumentTitle"
import { useCart } from "../context/CartContext"
import Breadcrumb from "../components/Breadcrumb"
import { Skeleton } from "../components/Skeleton"

export default function ProductPage() {
  const { id } = useParams()
  const { addToCart, isLoggedIn } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [stockEmail, setStockEmail] = useState('')
  const [stockRequested, setStockRequested] = useState(false)

  useDocumentTitle(product?.name)

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    if (!isLoggedIn) {
      const ok = await addToCart(product.id)
      if (ok) { setAdded(true); setTimeout(() => setAdded(false), 2000) }
      return
    }
    const ok = await addToCart(product.id)
    if (ok) { setAdded(true); setTimeout(() => setAdded(false), 2000) }
  }

  const requestStock = async (e) => {
    e.preventDefault()
    if (!stockEmail.trim()) return
    try {
      await api.post('/back-in-stock', { product_id: parseInt(id), email: stockEmail.trim() })
      setStockRequested(true)
    } catch { alert('Failed to submit request') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Skeleton className="h-4 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16 flex flex-col items-center justify-center">
        <p className="font-heading text-4xl text-choco mb-4">Product Not Found</p>
        <Link to="/" className="text-gold no-underline hover:underline text-sm">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <Breadcrumb items={[{ label: 'All Flavours', href: '/products' }, { label: product.name }]} />

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-3xl overflow-hidden border border-gold/10 bg-white">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover" loading="lazy" />
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              {product.badge && (
                <span className="text-[10px] bg-gold/20 text-gold font-bold px-3 py-1 rounded-full">{product.badge}</span>
              )}
              <span className="text-[11px] text-choco/40 uppercase tracking-wider">{product.category}</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-choco mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-gold fill-gold" />
                <span className="text-sm font-bold text-choco">{product.rating || "4.8"}</span>
              </div>
              <span className="text-choco/30">·</span>
              <span className="text-sm text-choco/50">{product.review_count || 0} reviews</span>
              {product.stock !== undefined && (
                <>
                  <span className="text-choco/30">·</span>
                  <span className={`text-xs flex items-center gap-1 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </>
              )}
            </div>
            <p className="font-heading text-3xl font-bold text-gold mb-4">₹{product.price}</p>
            <p className="text-choco/55 leading-relaxed mb-8">{product.description}</p>

            {(product.stock === undefined || product.stock > 0) ? (
              <button onClick={handleAdd}
                className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide text-choco transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                style={{ background: added ? "#7EC8A4" : "linear-gradient(135deg, #C9A84C, #F0D080)" }}>
                <ShoppingBag size={16} />
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-amber-600" />
                  <span className="font-semibold text-sm text-amber-800">Out of Stock</span>
                </div>
                <p className="text-xs text-amber-700 mb-3">This flavour is currently unavailable. Leave your email and we'll notify you when it's back!</p>
                {stockRequested ? (
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle size={16} /> We'll email you when it's back!
                  </div>
                ) : (
                  <form onSubmit={requestStock} className="flex gap-2">
                    <input type="email" value={stockEmail} onChange={e => setStockEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 border border-amber-300 rounded-xl px-3 py-2.5 text-sm text-choco outline-none bg-white" required />
                    <button type="submit"
                      className="bg-amber-700 text-white rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-amber-800 cursor-pointer transition-colors flex items-center gap-1">
                      <Bell size={13} /> Notify
                    </button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
