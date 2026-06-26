import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, ShoppingBag, Home, Banknote } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function PaymentSuccessPage() {
  useDocumentTitle('Order Confirmation')
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const isCOD = searchParams.get('method') === 'cod'
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`).then(r => setOrder(r.data)).catch(() => {})
    }
  }, [orderId])

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.12) 0%, #1C0D06 65%)' }}>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center">

        {/* Animated checkmark */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.circle cx="50" cy="50" r="46" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="3" />
            <motion.circle cx="50" cy="50" r="46" fill="none" stroke="#C9A84C" strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ strokeDasharray: '289', strokeDashoffset: '0', transformOrigin: 'center', rotate: '-90deg' }} />
            <motion.path d="M 30 50 L 45 65 L 70 38" fill="none" stroke="#C9A84C" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.8, ease: 'easeInOut' }} />
          </svg>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}>
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold/60 font-semibold">
            {isCOD ? 'Order Confirmed' : 'Payment Confirmed'}
          </span>
          <h1 className="font-heading text-4xl text-cream font-bold mt-2 mb-3">
            {isCOD ? 'Order Placed!' : 'Order Placed!'}
          </h1>
          <p className="text-cream/50 text-sm leading-relaxed mb-6">
            {isCOD
              ? 'Your royal order is confirmed! Pay cash to our delivery executive when your scoops arrive.'
              : "Your royal order has been confirmed. We're preparing your scoops with love!"}
          </p>

          {order && (
            <div className="rounded-2xl p-5 mb-6 border border-gold/15 text-left"
              style={{ background: 'rgba(255,248,240,0.05)' }}>
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-xs text-cream/40 uppercase tracking-wider">Order Number</p>
                  <p className="font-heading text-gold font-bold">#{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cream/40 uppercase tracking-wider">
                    {isCOD ? 'Pay on Delivery' : 'Total Paid'}
                  </p>
                  <p className="font-heading text-gold font-bold">₹{order.total}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-cream/60">{item.product_name} × {item.quantity}</span>
                    <span className="text-cream/80">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-cream/30 mt-3 flex items-center gap-1.5">
                {isCOD ? <><Banknote size={12} /> Cash on Delivery · Keep exact change handy</> : '📦 Estimated delivery: 30–45 minutes'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/profile" className="flex-1 border border-gold/30 text-gold rounded-full py-3.5 text-sm font-semibold no-underline flex items-center justify-center gap-2 hover:bg-gold/5 transition-colors">
              <ShoppingBag size={15} /> Track Order
            </Link>
            <Link to="/" className="flex-1 rounded-full py-3.5 text-sm font-bold text-choco no-underline flex items-center justify-center gap-2 hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
              <Home size={15} /> Back Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
