import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal, Star, ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useCart } from '../context/CartContext'
import Breadcrumb from '../components/Breadcrumb'
import { PageSkeleton, ProductCardSkeleton } from '../components/Skeleton'

const CATEGORIES = ['All', 'Traditional', 'Chocolate', 'Fruit', 'Special']
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' },
]

export default function ProductsPage() {
  useDocumentTitle('All Flavours')
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [addedIds, setAddedIds] = useState({})
  const limit = 12

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category !== 'All') params.set('category', category)
    if (params.toString() !== searchParams.toString()) setSearchParams(params, { replace: true })
  }, [search, category])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const offset = (page - 1) * limit
    const params = { limit, offset }
    if (category !== 'All') params.category = category
    if (search.trim()) params.search = search.trim()

    api.get('/products', { params })
      .then(r => {
        let items = r.data.items || []
        if (sort === 'price_asc') items.sort((a, b) => a.price - b.price)
        else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price)
        else if (sort === 'rating') items.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        else if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name))
        setProducts(items)
        setTotal(r.data.total || items.length)
      })
      .catch(e => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [category, search, page, sort])

  const totalPages = Math.ceil(total / limit)

  const handleAdd = async (productId) => {
    const ok = await addToCart(productId)
    if (ok) {
      setAddedIds(prev => ({ ...prev, [productId]: true }))
      setTimeout(() => setAddedIds(prev => ({ ...prev, [productId]: false })), 2000)
    }
  }

  if (loading && products.length === 0) return <PageSkeleton />

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Breadcrumb items={[{ label: 'All Flavours' }]} />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl text-choco">All Flavours</h1>
            <p className="text-choco/50 text-sm mt-1">{total} royal flavour{total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl p-4 border border-gold/10 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-choco/30" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search flavours..."
                className="w-full border border-choco/10 focus:border-gold rounded-xl pl-9 pr-8 py-2.5 text-sm text-choco outline-none transition-colors bg-cream" />
              {search && <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-choco/30 hover:text-choco cursor-pointer"><X size={14} /></button>}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => { setCategory(c); setPage(1) }}
                  className={`text-xs rounded-full px-3.5 py-1.5 font-medium cursor-pointer transition-all ${category === c ? 'bg-choco text-cream' : 'bg-cream text-choco/60 border border-choco/10 hover:border-choco/30'}`}>
                  {c === 'All' ? <span className="flex items-center gap-1"><Sparkles size={12} /> All</span> : c}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-choco/30" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-xs border border-choco/10 rounded-xl px-3 py-2 bg-cream text-choco outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 rounded-2xl p-6 text-center mb-6">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-xs border border-red-200 rounded-full px-4 py-1.5 text-red-500 hover:bg-red-50 cursor-pointer">Try Again</button>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gold/10">
            <Search size={40} className="text-choco/20 mx-auto mb-3" />
            <p className="font-heading text-lg text-choco mb-1">No flavours found</p>
            <p className="text-choco/40 text-sm">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); setCategory('All'); setPage(1) }}
              className="mt-4 text-sm text-gold border border-gold/30 rounded-full px-5 py-2 hover:bg-gold/5 cursor-pointer transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 12) * 0.05 }}
                  className="bg-white rounded-2xl border border-gold/10 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Link to={`/products/${product.id}`} className="no-underline">
                    <div className="aspect-square overflow-hidden relative">
                      <img src={product.image_url} alt={product.name} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23C9A84C15" width="400" height="400"/%3E%3Ctext x="200" y="200" text-anchor="middle" dominant-baseline="middle" font-size="60" font-family="serif" fill="%23C9A84C30"%3ES%3C/text%3E%3C/svg%3E' }} />
                      {product.badge && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-choco shadow-sm">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-wider text-choco/40 mb-1">{product.category}</p>
                    <Link to={`/products/${product.id}`} className="no-underline">
                      <h3 className="font-heading text-base font-bold text-choco group-hover:text-gold transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 mb-2">
                      <div className="flex items-center gap-0.5">
                        <Star size={11} className="text-gold fill-gold" />
                        <span className="text-xs font-semibold text-choco">{product.rating || '4.8'}</span>
                      </div>
                      <span className="text-choco/20">·</span>
                      <span className="text-xs text-choco/40">{product.review_count || 0} reviews</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-lg font-bold text-gold">₹{product.price}</span>
                      <button onClick={() => handleAdd(product.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${addedIds[product.id] ? 'bg-green-500 text-white scale-110' : 'bg-choco text-cream hover:bg-choco/85'}`}>
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-choco/10 flex items-center justify-center text-choco/50 hover:text-choco hover:border-choco/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-choco/20 px-1">...</span>}
                      <button onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-semibold cursor-pointer transition-all ${page === p ? 'bg-choco text-cream' : 'text-choco/50 hover:bg-choco/5'}`}>
                        {p}
                      </button>
                    </span>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-choco/10 flex items-center justify-center text-choco/50 hover:text-choco hover:border-choco/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
