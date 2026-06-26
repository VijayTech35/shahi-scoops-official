import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../hooks/useApi'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'shahi-guest-cart'

function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
  } catch { return [] }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [merged, setMerged] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems(loadGuestCart())
      return
    }
    try {
      const { data } = await api.get('/cart')
      setCartItems(data)
    } catch { setCartItems([]) }
  }, [isLoggedIn])

  useEffect(() => { fetchCart() }, [fetchCart])

  // Merge guest cart into server cart on login
  useEffect(() => {
    if (!isLoggedIn || !user || merged) return
    const guestItems = loadGuestCart()
    if (guestItems.length === 0) { setMerged(true); return }
    setMerged(true)
    ;(async () => {
      for (const item of guestItems) {
        try {
          await api.post('/cart', { product_id: item.product_id, quantity: item.quantity })
        } catch {}
      }
      localStorage.removeItem(GUEST_CART_KEY)
      fetchCart()
    })()
  }, [isLoggedIn, user, merged, fetchCart])

  // Reset merge flag on logout
  useEffect(() => {
    if (!isLoggedIn) setMerged(false)
  }, [isLoggedIn])

  const addToCart = async (product_id, quantity = 1) => {
    if (!isLoggedIn) {
      const items = loadGuestCart()
      const existing = items.find(i => i.product_id === product_id)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.push({ product_id, quantity, id: Date.now() })
      }
      saveGuestCart(items)
      setCartItems(loadGuestCart())
      setIsOpen(true)
      return true
    }
    try {
      const { data } = await api.post('/cart', { product_id, quantity })
      setCartItems(data)
      setIsOpen(true)
      return true
    } catch { return false }
  }

  const updateQuantity = async (id, quantity) => {
    if (!isLoggedIn) {
      const items = loadGuestCart().map(i => i.id === id ? { ...i, quantity } : i)
      saveGuestCart(items)
      setCartItems(items)
      return
    }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
    await api.put(`/cart/${id}`, { quantity }).catch(fetchCart)
  }

  const removeItem = async (id) => {
    if (!isLoggedIn) {
      const items = loadGuestCart().filter(i => i.id !== id)
      saveGuestCart(items)
      setCartItems(items)
      return
    }
    setCartItems(prev => prev.filter(i => i.id !== id))
    await api.delete(`/cart/${id}`).catch(fetchCart)
  }

  const clearCart = async () => {
    if (!isLoggedIn) {
      saveGuestCart([])
      setCartItems([])
      return
    }
    setCartItems([])
    await api.delete('/cart').catch(() => {})
  }

  // Need to get prices for guest cart items
  const [guestPrices, setGuestPrices] = useState({})
  useEffect(() => {
    if (isLoggedIn) return
    const items = loadGuestCart()
    if (items.length === 0) return
    const ids = [...new Set(items.map(i => i.product_id))]
    api.get(`/products?limit=${ids.length}`).then(r => {
      const prods = r.data.items || []
      const prices = {}
      prods.forEach(p => { prices[p.id] = { name: p.name, price: p.price, image_url: p.image_url } })
      setGuestPrices(prices)
    }).catch(() => {})
  }, [isLoggedIn, cartItems])

  // For guest cart, we need to build items with proper data
  const displayItems = isLoggedIn ? cartItems : cartItems.map(i => ({
    ...i,
    name: guestPrices[i.product_id]?.name || `Product #${i.product_id}`,
    price: guestPrices[i.product_id]?.price || 0,
    image_url: guestPrices[i.product_id]?.image_url || '',
    product_id: i.product_id,
  }))

  const total = displayItems.reduce((sum, i) => sum + parseFloat(i.price || 0) * i.quantity, 0)
  const count = displayItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems: displayItems,
      isOpen, setIsOpen, loading,
      addToCart, updateQuantity, removeItem, clearCart,
      total, count, refetch: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
