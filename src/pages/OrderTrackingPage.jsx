import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, MapPin, Calendar, Clock, Truck, CheckCircle, ChevronRight } from 'lucide-react'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'
import Breadcrumb from '../components/Breadcrumb'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
const STATUS_LABELS = { pending: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' }

export default function OrderTrackingPage() {
  useDocumentTitle('Track Order')
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const trackOrder = async (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const { data } = await api.get(`/orders/track/${orderNumber.trim()}`)
      setOrder(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found. Please check the order number.')
    } finally { setLoading(false) }
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Breadcrumb items={[{ label: 'Track Order' }]} />

        <div className="flex items-center gap-3 mb-6">
          <Package size={24} className="text-gold" />
          <h1 className="font-heading text-3xl text-choco">Track Your Order</h1>
        </div>

        {/* Search form */}
        <form onSubmit={trackOrder} className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm mb-6">
          <label className="block text-sm font-medium text-choco mb-2">Enter your order number</label>
          <div className="flex gap-3">
            <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
              placeholder="e.g. SS1718000000000"
              className="flex-1 border border-choco/10 focus:border-gold rounded-xl px-4 py-3 text-sm text-choco outline-none transition-colors bg-cream" />
            <button type="submit" disabled={loading || !orderNumber.trim()}
              className="bg-choco text-cream rounded-xl px-6 py-3 text-sm font-semibold hover:bg-choco/85 disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : <Search size={15} />}
              Track
            </button>
          </div>
          <p className="text-xs text-choco/40 mt-2">Order number format: SS followed by numbers (found in your order confirmation email)</p>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Order details */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Status timeline */}
            <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm mb-5">
              <h2 className="font-heading text-lg text-choco mb-5">Order Status</h2>
              <div className="relative">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStep
                  const isLast = i === STATUS_STEPS.length - 1
                  return (
                    <div key={step} className="flex items-start gap-4 pb-6 relative">
                      {!isLast && (
                        <div className={`absolute left-[15px] top-8 w-0.5 h-full -z-0 ${i < currentStep ? 'bg-gold' : 'bg-choco/10'}`} />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        done ? 'bg-gold text-choco' : 'bg-choco/10 text-choco/30'
                      }`}>
                        {done ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${done ? 'text-choco' : 'text-choco/40'}`}>{STATUS_LABELS[step]}</p>
                        {done && order.status_history?.find(h => h.status === step) && (
                          <p className="text-xs text-choco/40 mt-0.5">
                            {new Date(order.status_history.find(h => h.status === step).changed_at).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order info */}
            <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm mb-5">
              <h2 className="font-heading text-lg text-choco mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-choco/40 text-xs uppercase tracking-wider mb-1">Order Number</p>
                  <p className="font-semibold text-choco">#{order.order_number}</p>
                </div>
                <div>
                  <p className="text-choco/40 text-xs uppercase tracking-wider mb-1">Status</p>
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize bg-amber-100 text-amber-700">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-choco/40 text-xs uppercase tracking-wider mb-1">Order Date</p>
                  <p className="text-choco flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-choco/40 text-xs uppercase tracking-wider mb-1">Total</p>
                  <p className="font-heading font-bold text-gold">₹{order.total}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gold/10">
                <p className="text-choco/40 text-xs uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm text-choco flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 flex-shrink-0" /> {order.delivery_address}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm">
              <h2 className="font-heading text-lg text-choco mb-4">Items ({order.items?.length || 0})</h2>
              <div className="space-y-3">
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gold/5 last:border-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gold/10 flex-shrink-0">
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-choco truncate">{item.product_name}</p>
                      <p className="text-xs text-choco/40">₹{item.price} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-heading font-bold text-choco">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
