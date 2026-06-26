import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ShoppingBag, CreditCard, CheckCircle, Plus, Crown, Truck, Banknote } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

const STEPS = ['Address', 'Summary', 'Payment']

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const { cartItems, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [newAddr, setNewAddr] = useState({ full_address: '', city: '', pincode: '' })
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' | 'online'
  const [sandboxMode, setSandboxMode] = useState(false)

  const delivery = total >= 300 ? 0 : 30
  const tax = parseFloat((total * 0.05).toFixed(2))
  const grand = parseFloat((total + delivery + tax).toFixed(2))

  useEffect(() => {
    api.get('/users/addresses').then(r => {
      setAddresses(r.data)
      const def = r.data.find(a => a.is_default) || r.data[0]
      if (def) setSelectedAddr(def)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (cartItems.length === 0) navigate('/')
  }, [cartItems])

  const addNewAddress = async () => {
    if (!newAddr.full_address) return
    const { data } = await api.post('/users/addresses', {
      label: 'Home', ...newAddr, is_default: addresses.length === 0
    })
    setAddresses(prev => [...prev, data])
    setSelectedAddr(data)
    setShowNewAddr(false)
  }

  const placeOrder = async () => {
    if (!selectedAddr) return
    setLoading(true)
    try {
      const addr = `${selectedAddr.full_address}, ${selectedAddr.city} ${selectedAddr.pincode}`
      const { data } = await api.post('/orders', {
        delivery_address: addr,
        notes,
        payment_method: paymentMethod,
      })
      setOrderId(data.order_id)
      if (paymentMethod === 'cod') {
        // COD: order is fully placed, go straight to success
        await clearCart()
        navigate(`/order-success/${data.order_id}?method=cod`)
      } else {
        // Online: probe whether backend is in sandbox mode, then go to payment step
        try {
          const { data: probe } = await api.post('/payments/create-order', { order_id: data.order_id })
          if (probe.sandbox) setSandboxMode(true)
        } catch {}
        setStep(2)
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Order failed')
    } finally { setLoading(false) }
  }

  const handleRazorpay = async () => {
    setLoading(true)
    try {
      const { data: rzp } = await api.post('/payments/create-order', { order_id: orderId })

      // Sandbox mode (no Razorpay keys configured) — skip Razorpay modal
      // and simulate a successful payment via the sandbox verify path.
      if (rzp.sandbox) {
        const { data } = await api.post('/payments/verify', {
          razorpay_order_id: rzp.razorpay_order_id,
          razorpay_payment_id: `sandbox_pay_${Date.now()}`,
          sandbox: true,
        })
        if (data.success) {
          await clearCart()
          navigate(`/order-success/${data.order_id}?method=online`)
        }
        return
      }

      const options = {
        key: rzp.key_id,
        amount: rzp.amount,
        currency: rzp.currency,
        name: 'Shahi Scoops',
        description: 'Royal Ice Cream Order',
        order_id: rzp.razorpay_order_id,
        handler: async (response) => {
          const { data } = await api.post('/payments/verify', response)
          if (data.success) {
            await clearCart()
            navigate(`/order-success/${data.order_id}?method=online`)
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#C9A84C' },
        modal: { ondismiss: () => setLoading(false) },
      }
      if (!window.Razorpay) {
        alert('Payment SDK not loaded. Please refresh and try again.')
        setLoading(false)
        return
      }
      new window.Razorpay(options).open()
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed to initialize')
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-choco/10 dark:border-white/10 focus:border-gold rounded-xl px-4 py-3 text-sm text-choco dark:text-white outline-none transition-colors bg-white dark:bg-[#2A1D15]"

  return (
    <div className="min-h-screen bg-cream dark:bg-[#1A120B] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Crown size={20} className="text-gold" />
          <h1 className="font-heading text-2xl text-choco dark:text-white">Checkout</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i <= step ? 'bg-choco dark:bg-white text-gold' : 'bg-choco/10 text-choco/30'
                }`}>
                  {i < step ? <CheckCircle size={14} className="text-gold" /> : i + 1}
                </div>
                <span className={`text-[11px] mt-1 font-medium ${i <= step ? 'text-choco dark:text-white' : 'text-choco/30'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-2 mb-5 transition-colors ${i < step ? 'bg-gold' : 'bg-choco/10 dark:bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left panel */}
          <div className="md:col-span-3">

            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#2A1D15] rounded-2xl p-6 border border-gold/10 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={18} className="text-gold" />
                  <h2 className="font-heading text-lg text-choco dark:text-white">Delivery Address</h2>
                </div>

                <div className="space-y-3 mb-4">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddr?.id === addr.id ? 'border-gold bg-gold/5' : 'border-choco/10 dark:border-white/10 hover:border-gold/40'
                    }`}>
                      <input type="radio" name="address" checked={selectedAddr?.id === addr.id}
                        onChange={() => setSelectedAddr(addr)} className="mt-0.5 accent-yellow-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-choco dark:text-white">{addr.label}</span>
                          {addr.is_default && <span className="text-[10px] bg-gold/20 text-yellow-700 dark:text-amber-300 rounded-full px-2 py-0.5">Default</span>}
                        </div>
                        <p className="text-sm text-choco/60 dark:text-gray-300 mt-0.5">{addr.full_address}</p>
                        <p className="text-xs text-choco/40 dark:text-gray-400">{addr.city} {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {!showNewAddr ? (
                  <button onClick={() => setShowNewAddr(true)}
                    className="flex items-center gap-2 text-sm text-gold border border-gold/30 rounded-xl px-4 py-2.5 hover:bg-gold/5 cursor-pointer transition-colors w-full justify-center">
                    <Plus size={14} /> Add New Address
                  </button>
                ) : (
                  <div className="border border-gold/20 dark:border-gold/20 rounded-xl p-4 space-y-3">
                    <textarea className={inputClass} rows={2} placeholder="Full address"
                      value={newAddr.full_address} onChange={e => setNewAddr(p => ({ ...p, full_address: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={inputClass} placeholder="City" value={newAddr.city}
                        onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} />
                      <input className={inputClass} placeholder="Pincode" value={newAddr.pincode}
                        onChange={e => setNewAddr(p => ({ ...p, pincode: e.target.value }))} />
                    </div>
                      <div className="flex gap-2">
                      <button onClick={addNewAddress}
                        className="flex-1 bg-choco text-cream rounded-xl py-2.5 text-sm font-semibold cursor-pointer">Save</button>
                      <button onClick={() => setShowNewAddr(false)}
                        className="text-choco/40 dark:text-gray-400 text-sm px-4 cursor-pointer">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-xs text-choco/40 dark:text-gray-400 uppercase tracking-wider mb-1.5">Special Instructions (optional)</label>
                  <textarea className={inputClass} rows={2} placeholder="Any delivery notes..."
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <button disabled={!selectedAddr}
                  onClick={() => setStep(1)}
                  className="mt-5 w-full py-3.5 rounded-xl text-sm font-bold text-choco cursor-pointer disabled:opacity-40 transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                  Continue to Summary
                </button>
              </motion.div>
            )}

            {/* Step 1: Summary */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#2A1D15] rounded-2xl p-6 border border-gold/10 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <ShoppingBag size={18} className="text-gold" />
                  <h2 className="font-heading text-lg text-choco dark:text-white">Order Summary</h2>
                </div>

                <div className="space-y-3 mb-5">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-choco dark:text-white">{item.name}</p>
                        <p className="text-xs text-choco/40 dark:text-gray-400">₹{item.price} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-heading font-bold text-choco dark:text-white">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gold/10 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-choco/60 dark:text-gray-300"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-choco/60 dark:text-gray-300">
                    <span>Delivery {total >= 300 && <span className="text-green-600 dark:text-green-400 text-xs ml-1">Free!</span>}</span>
                    <span>{delivery === 0 ? '₹0' : `₹${delivery}`}</span>
                  </div>
                  <div className="flex justify-between text-choco/60 dark:text-gray-300"><span>GST 5%</span><span>₹{tax}</span></div>
                  <div className="flex justify-between font-heading font-bold text-choco dark:text-white text-base border-t border-gold/10 pt-2">
                    <span>Grand Total</span><span className="text-gold">₹{grand}</span>
                  </div>
                </div>

                <div className="border-t border-gold/10 pt-4 mt-2">
                  <p className="text-xs uppercase tracking-wider text-choco/40 dark:text-gray-400 font-semibold mb-3">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-gold bg-gold/5'
                          : 'border-choco/10 dark:border-white/10 hover:border-choco/30'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Banknote size={16} className="text-gold" />
                        <span className="text-sm font-semibold text-choco dark:text-white">Cash on Delivery</span>
                      </div>
                      <p className="text-[10px] text-choco/50 dark:text-gray-400">Pay when your order arrives</p>
                    </button>
                    <button onClick={() => setPaymentMethod('online')}
                      className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        paymentMethod === 'online'
                          ? 'border-gold bg-gold/5'
                          : 'border-choco/10 dark:border-white/10 hover:border-choco/30'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={16} className="text-gold" />
                        <span className="text-sm font-semibold text-choco dark:text-white">Pay Online</span>
                      </div>
                      <p className="text-[10px] text-choco/50 dark:text-gray-400">UPI · Cards · Net Banking</p>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(0)}
                    className="flex-1 border border-choco/10 dark:border-white/10 text-choco/60 dark:text-gray-300 rounded-xl py-3 text-sm cursor-pointer hover:border-choco/30 dark:hover:border-white/30 transition-colors">
                    Back
                  </button>
                  <button onClick={placeOrder} disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-choco cursor-pointer disabled:opacity-60 transition-all hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                    {loading ? 'Placing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Continue to Payment'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#2A1D15] rounded-2xl p-8 border border-gold/10 shadow-sm text-center">
                {sandboxMode && (
                  <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">⚙️ Payment Sandbox Mode</p>
                    <p className="text-xs text-amber-800 dark:text-amber-200/80">
                      Razorpay API keys are not configured on the server. Clicking the button below will simulate a successful payment so you can test the full checkout flow. Add <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">RAZORPAY_KEY_ID</code> and <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">RAZORPAY_KEY_SECRET</code> to <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">server/.env</code> to enable real payments.
                    </p>
                  </div>
                )}
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={28} className="text-gold" />
                </div>
                <h2 className="font-heading text-xl text-choco dark:text-white mb-2">Pay Securely</h2>
                <p className="text-choco/50 dark:text-gray-300 text-sm mb-2">Order placed! Complete payment to confirm.</p>
                <p className="font-heading text-3xl font-bold text-gold mb-6">₹{grand}</p>

                {!sandboxMode && (
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {['UPI', 'Cards', 'Net Banking', 'Wallets'].map(m => (
                      <span key={m} className="text-xs bg-cream dark:bg-[#2A1D15] border border-gold/15 text-choco/60 dark:text-gray-300 rounded-full px-3 py-1.5">{m}</span>
                    ))}
                  </div>
                )}

                <button onClick={handleRazorpay} disabled={loading}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-choco cursor-pointer disabled:opacity-60 hover:scale-[1.02] transition-all shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
                  {loading
                    ? (sandboxMode ? 'Simulating Payment...' : 'Opening Payment...')
                    : (sandboxMode ? `Simulate Payment of ₹${grand}` : `Pay ₹${grand} with Razorpay`)}
                </button>
                <p className="text-xs text-choco/30 dark:text-gray-500 mt-3">
                  {sandboxMode ? 'No real money will be charged' : '100% secure · Powered by Razorpay'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right: mini cart summary */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-[#2A1D15] rounded-2xl p-5 border border-gold/10 shadow-sm sticky top-24">
              <p className="font-heading text-sm text-choco dark:text-white font-semibold mb-4">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-choco/60 dark:text-gray-300 truncate flex-1 pr-2">{item.name} ×{item.quantity}</span>
                    <span className="text-choco dark:text-white font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gold/10 pt-3">
                <div className="flex justify-between font-heading font-bold text-choco dark:text-white">
                  <span>Total</span>
                  <span className="text-gold">₹{grand}</span>
                </div>
              </div>
              {selectedAddr && (
                <div className="mt-4 p-3 bg-cream dark:bg-[#3B2A20] rounded-xl text-xs text-choco/50 dark:text-gray-300">
                  <p className="font-semibold text-choco/70 dark:text-white mb-1">Delivering to</p>
                  <p>{selectedAddr.full_address}, {selectedAddr.city}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
