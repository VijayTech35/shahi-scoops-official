import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, ShoppingBag, Users, Package, BarChart3, LogOut, Plus, Edit3, Trash2, Check, X,
  ToggleLeft, ToggleRight, Truck, MapPin, Eye, ArrowLeft, DollarSign, Star
} from 'lucide-react'
import api from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useNavigate } from 'react-router-dom'
import { TableSkeleton } from '../components/Skeleton'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'shipping', label: 'Shipping Zones', icon: Truck },
  { id: 'reviews', label: 'Reviews', icon: Crown },
]

const STATUS_OPTS = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled']
const STATUS_COLORS = {
  pending:'bg-amber-100 text-amber-700', confirmed:'bg-blue-100 text-blue-700',
  preparing:'bg-purple-100 text-purple-700', out_for_delivery:'bg-orange-100 text-orange-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700',
}

const EMPTY_PRODUCT = { name:'', description:'', price:'', image_url:'', category:'Traditional', badge:'', accent_color:'#C9A84C', is_available:true, is_featured:false }

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard')
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [reviews, setReviews] = useState([])
  const [shippingZones, setShippingZones] = useState([])
  const [customerDetail, setCustomerDetail] = useState(null)
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [orderFilter, setOrderFilter] = useState('all')
  const [toast, setToast] = useState('')
  const [zoneForm, setZoneForm] = useState({ name:'', pincodes:'', rate:'', free_above:'' })
  const [showZoneForm, setShowZoneForm] = useState(false)
  const [editingZoneId, setEditingZoneId] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchData = useCallback(() => {
    if (tab === 'overview') api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
    if (tab === 'products') api.get('/admin/products').then(r => setProducts(r.data.items || r.data || [])).catch(() => {})
    if (tab === 'orders') api.get(`/admin/orders?status=${orderFilter}`).then(r => setOrders(r.data.items || r.data || [])).catch(() => {})
    if (tab === 'customers') api.get('/admin/customers').then(r => setCustomers(r.data.items || r.data || [])).catch(() => {})
    if (tab === 'reviews') api.get('/admin/reviews').then(r => setReviews(r.data.items || r.data || [])).catch(() => {})
    if (tab === 'shipping') api.get('/admin/shipping-zones').then(r => setShippingZones(r.data || [])).catch(() => {})
  }, [tab, orderFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // Products
  const saveProduct = async () => {
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, productForm)
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...productForm } : p))
      } else {
        const { data } = await api.post('/admin/products', productForm)
        setProducts(prev => [data, ...prev])
      }
      setShowForm(false); setProductForm(EMPTY_PRODUCT); setEditingId(null)
      showToast(editingId ? 'Product updated!' : 'Product added!')
    } catch { showToast('Save failed') }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/admin/products/${id}`)
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast('Deleted!')
  }

  const toggleProduct = async (id) => {
    await api.patch(`/admin/products/${id}/toggle`)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !p.is_available } : p))
  }

  // Orders
  const updateOrderStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}/status`, { status })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    showToast('Status updated!')
  }

  // Reviews
  const approveReview = async (id) => {
    await api.patch(`/admin/reviews/${id}/approve`)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r))
    showToast('Review approved!')
  }

  const deleteReview = async (id) => {
    await api.delete(`/admin/reviews/${id}`)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  // Shipping Zones
  const saveZone = async () => {
    try {
      if (editingZoneId) {
        await api.put(`/admin/shipping-zones/${editingZoneId}`, zoneForm)
        setShippingZones(prev => prev.map(z => z.id === editingZoneId ? { ...z, ...zoneForm } : z))
      } else {
        const { data } = await api.post('/admin/shipping-zones', zoneForm)
        setShippingZones(prev => [...prev, data])
      }
      setShowZoneForm(false); setZoneForm({ name:'', pincodes:'', rate:'', free_above:'' }); setEditingZoneId(null)
      showToast(editingZoneId ? 'Zone updated!' : 'Zone added!')
    } catch { showToast('Save failed') }
  }

  const deleteZone = async (id) => {
    if (!confirm('Delete this zone?')) return
    await api.delete(`/admin/shipping-zones/${id}`)
    setShippingZones(prev => prev.filter(z => z.id !== id))
    showToast('Zone deleted!')
  }

  const viewCustomer = async (id) => {
    try {
      const { data } = await api.get(`/admin/customers/${id}`)
      setCustomerDetail(data)
      setTab('customers')
    } catch { showToast('Failed to load customer') }
  }

  const inputClass = "w-full border border-choco/10 dark:border-white/10 focus:border-gold rounded-xl px-3 py-2.5 text-sm text-choco dark:text-white outline-none transition-colors bg-white dark:bg-[#2A1D15]"

  return (
    <div className="min-h-screen bg-[#FDF5EC] flex">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-choco text-cream rounded-2xl px-5 py-3 text-sm font-medium shadow-xl flex items-center gap-2">
          <Check size={14} className="text-gold" /> {toast}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-56 bg-[#1C0D06] dark:bg-[#1A120B] min-h-screen flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-cream/5">
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-gold" />
            <span className="font-heading text-base text-gold font-bold">Admin Panel</span>
          </div>
          <p className="text-cream/30 text-xs mt-1">Shahi Scoops</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCustomerDetail(null) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                tab === t.id ? 'bg-gold/15 text-gold' : 'text-cream/40 hover:text-cream/70 hover:bg-cream/5'
              }`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-cream/5">
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-red-400/70 hover:text-red-400 cursor-pointer transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto p-6">

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div>
            <h1 className="font-heading text-2xl text-choco mb-6">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Today's Orders", value: stats.total_orders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
                { label: 'Monthly Revenue', value: `₹${parseFloat(stats.monthly_revenue).toFixed(0)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
                { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'text-purple-600 bg-purple-50' },
                { label: 'Best Seller', value: stats.top_products?.[0]?.name || 'N/A', icon: Crown, color: 'text-yellow-600 bg-yellow-50' },
              ].map((card, i) => (
                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-gold/10 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                    <card.icon size={18} />
                  </div>
                  <p className="font-heading text-2xl font-bold text-choco">{card.value}</p>
                  <p className="text-xs text-choco/40 mt-1">{card.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gold/10">
              <h3 className="font-heading text-base text-choco mb-3">Top Products</h3>
              {stats.top_products?.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/15 text-yellow-700 text-xs font-bold flex items-center justify-center">{i+1}</span>
                    <span className="text-sm text-choco">{p.name}</span>
                  </div>
                  <span className="text-xs text-choco/50">{p.order_count} orders</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading text-2xl text-choco">Products ({products.length})</h1>
              <button onClick={() => { setProductForm(EMPTY_PRODUCT); setEditingId(null); setShowForm(true) }}
                className="flex items-center gap-2 bg-choco text-cream rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-choco/85 transition-colors">
                <Plus size={15} /> Add Product
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl p-6 border border-gold/15 shadow-sm mb-6">
                <h3 className="font-heading text-base text-choco mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Name *</label>
                    <input className={inputClass} value={productForm.name} onChange={e => setProductForm(p => ({...p, name: e.target.value}))} /></div>
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Price (₹) *</label>
                    <input type="number" className={inputClass} value={productForm.price} onChange={e => setProductForm(p => ({...p, price: e.target.value}))} /></div>
                  <div className="sm:col-span-2"><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Description</label>
                    <textarea className={inputClass} rows={2} value={productForm.description} onChange={e => setProductForm(p => ({...p, description: e.target.value}))} /></div>
                  <div className="sm:col-span-2"><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Image URL</label>
                    <input className={inputClass} value={productForm.image_url} onChange={e => setProductForm(p => ({...p, image_url: e.target.value}))} /></div>
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Category</label>
                    <select className={inputClass} value={productForm.category} onChange={e => setProductForm(p => ({...p, category: e.target.value}))}>
                      {['Traditional','Chocolate','Fruit','Special'].map(c => <option key={c}>{c}</option>)}
                    </select></div>
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Badge</label>
                    <input className={inputClass} placeholder="Best Seller, New, etc." value={productForm.badge} onChange={e => setProductForm(p => ({...p, badge: e.target.value}))} /></div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.is_available} onChange={e => setProductForm(p => ({...p, is_available: e.target.checked}))} className="accent-yellow-600" />
                      <span className="text-sm text-choco">Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={productForm.is_featured} onChange={e => setProductForm(p => ({...p, is_featured: e.target.checked}))} className="accent-yellow-600" />
                      <span className="text-sm text-choco">Featured</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveProduct} className="bg-choco text-cream rounded-xl px-6 py-2.5 text-sm font-semibold cursor-pointer hover:bg-choco/85 transition-colors">
                    {editingId ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditingId(null) }}
                    className="text-choco/40 text-sm px-4 cursor-pointer">Cancel</button>
                </div>
              </div>
            )}

            {products.length === 0 ? <TableSkeleton rows={5} cols={5} /> : (
              <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream/50 border-b border-gold/10">
                    <tr>{['Product', 'Price', 'Category', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-choco/50 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gold/5">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gold/10">
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <span className="font-medium text-choco text-sm">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-heading font-semibold text-choco">₹{p.price}</td>
                        <td className="px-4 py-3 text-choco/50 text-xs">{p.category}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleProduct(p.id)} className="cursor-pointer">
                            {p.is_available
                              ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><ToggleRight size={16} /> Live</span>
                              : <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><ToggleLeft size={16} /> Hidden</span>
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setProductForm(p); setEditingId(p.id); setShowForm(true) }}
                              className="text-choco/40 hover:text-gold cursor-pointer transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => deleteProduct(p.id)}
                              className="text-choco/40 hover:text-red-500 cursor-pointer transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            <h1 className="font-heading text-2xl text-choco mb-4">Orders</h1>
            <div className="flex gap-2 mb-5 flex-wrap">
              {['all', ...STATUS_OPTS].map(s => (
                <button key={s} onClick={() => setOrderFilter(s)}
                  className={`text-xs rounded-full px-4 py-1.5 font-medium cursor-pointer border transition-all capitalize ${orderFilter === s ? 'bg-choco text-cream border-choco' : 'border-choco/15 text-choco/50 hover:border-choco/30'}`}>
                  {s.replace(/_/g,' ')}
                </button>
              ))}
            </div>
            {orders.length === 0 ? <TableSkeleton rows={3} cols={1} /> : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-gold/10 shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-choco">#{order.order_number}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>{order.status.replace(/_/g,' ')}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.payment_method === 'cod' ? 'COD' : order.payment_status}
                          </span>
                        </div>
                        <p className="text-xs text-choco/40 mt-0.5">{order.customer_name} · {order.customer_email}</p>
                        <p className="text-xs text-choco/30 mt-0.5">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {order.items?.map(i => (
                            <span key={i.id} className="text-[10px] bg-cream rounded-full px-2 py-1 text-choco/50">{i.product_name}×{i.quantity}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-heading text-lg font-bold text-gold">₹{order.total}</p>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className="mt-2 text-xs border border-gold/20 rounded-xl px-3 py-1.5 bg-cream text-choco outline-none cursor-pointer">
                            {STATUS_OPTS.filter(s => s !== 'cancelled').map(s => (
                              <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customers */}
        {tab === 'customers' && !customerDetail && (
          <div>
            <h1 className="font-heading text-2xl text-choco mb-6">Customers ({customers.length})</h1>
            {customers.length === 0 ? <TableSkeleton rows={5} cols={6} /> : (
              <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream/50 border-b border-gold/10">
                    <tr>{['Name', 'Email', 'Phone', 'Orders', 'Spent', 'Joined', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-choco/50 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gold/5">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-cream/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-yellow-700">{c.name?.[0]?.toUpperCase()}</div>
                            <span className="font-medium text-choco">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-choco/50">{c.email}</td>
                        <td className="px-4 py-3 text-choco/50">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-choco font-medium">{c.total_orders}</td>
                        <td className="px-4 py-3 font-heading font-semibold text-gold">₹{parseFloat(c.total_spent).toFixed(0)}</td>
                        <td className="px-4 py-3 text-choco/40 text-xs">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => viewCustomer(c.id)}
                            className="text-choco/30 hover:text-gold cursor-pointer transition-colors" title="View Details">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Customer Detail */}
        {tab === 'customers' && customerDetail && (
          <div>
            <button onClick={() => setCustomerDetail(null)}
              className="flex items-center gap-1.5 text-sm text-choco/50 hover:text-gold mb-4 cursor-pointer transition-colors">
              <ArrowLeft size={14} /> Back to Customers
            </button>

            <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-xl font-bold text-gold">
                  {customerDetail.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="font-heading text-xl text-choco">{customerDetail.name}</h1>
                  <p className="text-sm text-choco/50">{customerDetail.email} {customerDetail.phone && `· ${customerDetail.phone}`}</p>
                  <p className="text-xs text-choco/30">Joined {new Date(customerDetail.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-cream rounded-xl p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-choco">{customerDetail.orders?.length || 0}</p>
                  <p className="text-xs text-choco/40 mt-1">Orders</p>
                </div>
                <div className="bg-cream rounded-xl p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-gold">₹{customerDetail.orders?.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(0)}</p>
                  <p className="text-xs text-choco/40 mt-1">Total Spent</p>
                </div>
                <div className="bg-cream rounded-xl p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-choco">{customerDetail.loyalty?.points || 0}</p>
                  <p className="text-xs text-choco/40 mt-1">Loyalty Points ({customerDetail.loyalty?.level || 'Silver'})</p>
                </div>
              </div>

              {customerDetail.addresses?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-choco mb-3">Addresses</h3>
                  <div className="space-y-2">
                    {customerDetail.addresses.map(a => (
                      <div key={a.id} className="flex items-start gap-2 text-sm text-choco/60 bg-cream rounded-xl p-3">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{a.full_address}, {a.city} {a.pincode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-sm font-semibold text-choco mb-3">Order History</h3>
              {customerDetail.orders?.length === 0 ? (
                <p className="text-sm text-choco/40">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {customerDetail.orders?.map(o => (
                    <div key={o.id} className="flex items-center justify-between bg-cream rounded-xl p-3">
                      <div>
                        <span className="font-medium text-sm text-choco">#{o.order_number}</span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status]}`}>{o.status.replace(/_/g, ' ')}</span>
                        <p className="text-xs text-choco/40 mt-0.5">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className="font-heading font-bold text-gold">₹{o.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div>
            <h1 className="font-heading text-2xl text-choco mb-6">Reviews ({reviews.length})</h1>
            {reviews.length === 0 ? <TableSkeleton rows={3} cols={1} /> : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 border border-gold/10 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-choco text-sm">{r.user_name}</span>
                          <span className="text-xs text-choco/40">on {r.product_name}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_,i) => (
                              <span key={i} className={`text-xs ${i < r.rating ? 'text-gold' : 'text-choco/10'}`}>★</span>
                            ))}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {r.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        {r.title && <p className="text-sm font-semibold text-choco">{r.title}</p>}
                        <p className="text-sm text-choco/60 mt-0.5">{r.body}</p>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        {!r.is_approved && (
                          <button onClick={() => approveReview(r.id)}
                            className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 cursor-pointer transition-colors">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteReview(r.id)}
                          className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 cursor-pointer transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shipping Zones */}
        {tab === 'shipping' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading text-2xl text-choco">Shipping Zones ({shippingZones.length})</h1>
              <button onClick={() => { setZoneForm({ name:'', pincodes:'', rate:'', free_above:'' }); setEditingZoneId(null); setShowZoneForm(true) }}
                className="flex items-center gap-2 bg-choco text-cream rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-choco/85 transition-colors">
                <Plus size={15} /> Add Zone
              </button>
            </div>

            {showZoneForm && (
              <div className="bg-white rounded-2xl p-6 border border-gold/15 shadow-sm mb-6">
                <h3 className="font-heading text-base text-choco mb-4">{editingZoneId ? 'Edit Shipping Zone' : 'Add Shipping Zone'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Zone Name *</label>
                    <input className={inputClass} value={zoneForm.name} onChange={e => setZoneForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Bengaluru Local" /></div>
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Rate (₹)</label>
                    <input type="number" className={inputClass} value={zoneForm.rate} onChange={e => setZoneForm(p => ({...p, rate: e.target.value}))} placeholder="Delivery charge" /></div>
                  <div><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Free Above (₹, optional)</label>
                    <input type="number" className={inputClass} value={zoneForm.free_above} onChange={e => setZoneForm(p => ({...p, free_above: e.target.value}))} placeholder="Free delivery above" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs text-choco/40 mb-1 uppercase tracking-wide">Pincodes (comma-separated) *</label>
                    <textarea className={inputClass} rows={2} value={zoneForm.pincodes} onChange={e => setZoneForm(p => ({...p, pincodes: e.target.value}))} placeholder="560001,560002,560003" /></div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveZone} className="bg-choco text-cream rounded-xl px-6 py-2.5 text-sm font-semibold cursor-pointer hover:bg-choco/85 transition-colors">
                    {editingZoneId ? 'Save Changes' : 'Add Zone'}
                  </button>
                  <button onClick={() => { setShowZoneForm(false); setEditingZoneId(null) }}
                    className="text-choco/40 text-sm px-4 cursor-pointer">Cancel</button>
                </div>
              </div>
            )}

            {shippingZones.length === 0 ? <TableSkeleton rows={3} cols={4} /> : (
              <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream/50 border-b border-gold/10">
                    <tr>{['Zone', 'Pincodes', 'Rate', 'Free Above', 'Active', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-choco/50 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gold/5">
                    {shippingZones.map(z => (
                      <tr key={z.id} className="hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-choco">{z.name}</td>
                        <td className="px-4 py-3 text-choco/50 text-xs max-w-[200px] truncate">{z.pincodes}</td>
                        <td className="px-4 py-3 font-heading font-semibold text-choco">₹{z.rate}</td>
                        <td className="px-4 py-3 text-choco/50">{z.free_above ? `₹${z.free_above}` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${z.is_active ? 'text-green-600' : 'text-red-400'}`}>
                            {z.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setZoneForm({ name: z.name, pincodes: z.pincodes, rate: z.rate, free_above: z.free_above || '' }); setEditingZoneId(z.id); setShowZoneForm(true) }}
                              className="text-choco/40 hover:text-gold cursor-pointer transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => deleteZone(z.id)}
                              className="text-choco/40 hover:text-red-500 cursor-pointer transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
