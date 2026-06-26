import { useState, useRef, useEffect } from "react"
import { Search, X, ArrowRight, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import api from "../hooks/useApi"

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); setError(null); return }
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setError(null); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=20`)
        setResults(data.items || data.products || [])
      } catch (e) {
        setError("Search failed — please try again")
        setResults([])
      }
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (product) => {
    setOpen(false)
    navigate(`/products/${product.id}`)
  }

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape" && open) setOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-cream/70 hover:text-gold transition-colors cursor-pointer p-1"
        aria-label="Search flavours (Ctrl+K)"
        title="Search (Ctrl+K)">
        <Search size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}>
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }} transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="max-w-2xl mx-auto mt-16 md:mt-24 px-4">
              <div className="bg-[#2C1A0E] rounded-3xl border border-gold/20 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gold/10">
                  <Search size={18} className="text-gold/50 flex-shrink-0" />
                  <input ref={inputRef} type="text" value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search flavours, combos..."
                    className="flex-1 bg-transparent text-cream placeholder-cream/30 outline-none text-sm" />
                  <button onClick={() => setOpen(false)}
                    className="text-cream/40 hover:text-cream cursor-pointer p-1"
                    aria-label="Close search">
                    <X size={16} />
                  </button>
                </div>

                {loading && (
                  <div className="px-5 py-6 text-center text-cream/40 text-xs flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                    Searching...
                  </div>
                )}

                {error && !loading && (
                  <div className="px-5 py-6 text-center text-red-300/70 text-xs">{error}</div>
                )}

                {!loading && !error && query.trim().length >= 2 && results.length > 0 && (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {results.map(product => (
                      <button key={product.id} onClick={() => handleSelect(product)}
                        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gold/5 transition-colors text-left cursor-pointer">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream/10 flex-shrink-0">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-cream truncate">{product.name}</p>
                          <p className="text-xs text-cream/40">₹{product.price} · {product.category}</p>
                        </div>
                        <ArrowRight size={14} className="text-gold/30 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <Sparkles size={20} className="text-gold/30 mx-auto mb-2" />
                    <p className="text-cream/50 text-sm">No flavours found for "{query}"</p>
                    <p className="text-cream/30 text-xs mt-1">Try &quot;kesar&quot;, &quot;gulab&quot;, or &quot;mango&quot;</p>
                  </div>
                )}

                {!loading && query.trim().length < 2 && (
                  <div className="px-5 py-4 text-cream/30 text-xs flex items-center justify-between">
                    <span>Start typing to search our flavours...</span>
                    <span className="text-cream/20 hidden sm:inline">Esc to close</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
