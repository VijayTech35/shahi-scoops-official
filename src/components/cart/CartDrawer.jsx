import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { cartItems, isOpen, setIsOpen, updateQuantity, removeItem, total, count } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const delivery = total >= 300 ? 0 : 30
  const tax = parseFloat((total * 0.05).toFixed(2))
  const grand = (total + delivery + tax).toFixed(2)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

          {/* Drawer */}
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold/15 bg-choco">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" />
                <span className="font-heading text-lg text-cream font-semibold">Your Cart</span>
                {count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold text-choco text-xs font-bold flex items-center justify-center">{count}</span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cream/60 hover:text-cream cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag size={48} className="text-choco/10 mb-4" />
                  <p className="text-choco/40 text-sm font-medium">Your cart is empty</p>
                  <button onClick={() => setIsOpen(false)}
                    className="mt-4 text-sm text-gold border border-gold/30 rounded-full px-5 py-2 cursor-pointer hover:bg-gold/5 transition-colors">
                    Explore Flavours
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex gap-3 bg-cream rounded-2xl p-3 border border-gold/10">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gold/10">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm text-choco font-semibold truncate">{item.name}</p>
                      <p className="font-heading text-base text-gold font-bold">₹{item.price}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-white border border-gold/20 flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-semibold text-choco w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-white border border-gold/20 flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
                            <Plus size={11} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="text-choco/25 hover:text-red-400 cursor-pointer transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gold/15 p-4 space-y-3 bg-cream/50">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-choco/60">
                    <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-choco/60">
                    <span>Delivery {total >= 300 && <span className="text-green-600 text-xs">(Free!)</span>}</span>
                    <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
                  </div>
                  <div className="flex justify-between text-choco/60">
                    <span>GST (5%)</span><span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-choco text-base border-t border-gold/15 pt-2">
                    <span>Total</span><span className="text-gold">₹{grand}</span>
                  </div>
                </div>
                {isLoggedIn ? (
                  <button onClick={() => { setIsOpen(false); navigate('/checkout') }}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-choco cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                    Proceed to Checkout
                  </button>
                ) : (
                  <button onClick={() => { setIsOpen(false); navigate('/login', { state: { from: '/checkout' } }) }}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-choco cursor-pointer transition-all"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                    Sign In to Checkout
                  </button>
                )}
                <p className="text-center text-xs text-choco/35">Free delivery on orders above ₹300</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
