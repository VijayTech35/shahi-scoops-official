import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, ShoppingBag, Crown, Star, Lock, Camera, Plus, Trash2, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../hooks/useApi'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'loyalty', label: 'Royal Club', icon: Crown },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'delete', label: 'Delete Account', icon: AlertTriangle, danger: true },
]

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_STEPS = ['pending','confirmed','preparing','out_for_delivery','delivered']

export default function ProfileDashboard() {
  useDocumentTitle('My Profile')
  const { user, updateUser, logout } = useAuth()
  const [tab, setTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loyalty, setLoyalty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    if (tab === 'orders') api.get('/orders').then(r => setOrders(r.data.items || [])).catch(() => {})
    if (tab === 'addresses') api.get('/users/addresses').then(r => setAddresses(r.data)).catch(() => {})
    if (tab === 'loyalty') api.get('/loyalty').then(r => setLoyalty(r.data)).catch(() => {})
  }, [tab])

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const saveProfile = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.put('/users/profile', profileForm)
      updateUser(data); showToast('Profile updated!')
    } catch { showToast('Update failed') } finally { setLoading(false) }
  }

  // Password form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const changePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirm) { showToast('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.put('/users/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
      showToast('Password changed!')
    } catch (err) { showToast(err.response?.data?.error || 'Failed') } finally { setLoading(false) }
  }

  // Avatar
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const fd = new FormData(); fd.append('avatar', file)
    const { data } = await api.post('/users/avatar', fd).catch(() => ({ data: {} }))
    if (data.avatar_url) updateUser({ avatar_url: data.avatar_url })
  }

  const inputClass = "w-full border border-choco/10 focus:border-gold rounded-xl px-4 py-3 text-sm text-choco outline-none transition-colors bg-white"

  return (
    <div className="min-h-screen bg-cream pt-20 pb-16">
      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 right-6 z-50 bg-choco text-cream rounded-2xl px-5 py-3 flex items-center gap-2 shadow-xl">
          <CheckCircle size={16} className="text-gold" />
          <span className="text-sm font-medium">{toast}</span>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gold/20 border-2 border-gold/30">
              {user?.avatar_url
                ? <img src={`${import.meta.env.VITE_API_URL}${user.avatar_url}`} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-heading text-2xl text-gold">{user?.name?.[0]?.toUpperCase()}</div>
              }
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center cursor-pointer hover:bg-gold/80 transition-colors">
              <Camera size={12} className="text-choco" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <div>
            <h1 className="font-heading text-2xl text-choco font-bold">{user?.name}</h1>
            <p className="text-choco/50 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gold/10">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                    tab === t.id ? 'bg-choco text-cream' : 'text-choco/60 hover:text-choco hover:bg-cream'
                  }`}>
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer mt-1">
                Sign Out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">

            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm">
                <h2 className="font-heading text-xl text-choco mb-6">My Profile</h2>
                <form onSubmit={saveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-choco/40 font-semibold mb-1.5">Full Name</label>
                    <input className={inputClass} value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-choco/40 font-semibold mb-1.5">Phone Number</label>
                    <input className={inputClass} value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-choco/40 font-semibold mb-1.5">Email (cannot change)</label>
                    <input className={`${inputClass} opacity-50 cursor-not-allowed`} value={user?.email} disabled />
                  </div>
                  <button type="submit" disabled={loading}
                    className="bg-choco text-cream rounded-full px-8 py-3 text-sm font-semibold hover:bg-choco/85 transition-colors cursor-pointer disabled:opacity-60">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl text-choco">My Orders</h2>
                {orders.length === 0
                  ? <div className="bg-white rounded-2xl p-12 text-center border border-gold/10">
                      <ShoppingBag size={40} className="text-choco/20 mx-auto mb-3" />
                      <p className="text-choco/40 text-sm">No orders yet</p>
                      <Link to="/#flavours" className="inline-block mt-4 bg-choco text-cream rounded-full px-6 py-2 text-sm no-underline font-medium">
                        Explore Flavours
                      </Link>
                    </div>
                  : orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl p-5 border border-gold/10 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-heading text-sm font-bold text-choco">#{order.order_number}</span>
                          <p className="text-xs text-choco/40 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {/* Status timeline */}
                      {order.status !== 'cancelled' && (
                        <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-1">
                          {STATUS_STEPS.map((step, i) => {
                            const stepIdx = STATUS_STEPS.indexOf(order.status)
                            const done = i <= stepIdx
                            return (
                              <div key={step} className="flex items-center flex-shrink-0">
                                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${done ? 'bg-gold' : 'bg-choco/10'}`} />
                                {i < STATUS_STEPS.length - 1 && (
                                  <div className={`h-px w-6 md:w-10 transition-colors ${done && i < stepIdx ? 'bg-gold' : 'bg-choco/10'}`} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {order.items?.map(item => (
                          <span key={item.id} className="text-xs bg-cream rounded-full px-3 py-1 text-choco/60">
                            {item.product_name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-base font-bold text-choco">₹{order.total}</span>
                        {order.status === 'pending' && (
                          <button onClick={async () => {
                            await api.post(`/orders/${order.id}/cancel`)
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))
                          }} className="text-xs text-red-500 border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-50 transition-colors cursor-pointer">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Addresses Tab */}
            {tab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl text-choco">My Addresses</h2>
                  <button onClick={() => {
                    const addr = prompt('Enter your full address:')
                    const city = prompt('City:')
                    const pin = prompt('Pincode:')
                    if (addr) {
                      api.post('/users/addresses', { label: 'Home', full_address: addr, city, pincode: pin, is_default: addresses.length === 0 })
                        .then(r => setAddresses(prev => [...prev, r.data]))
                    }
                  }} className="flex items-center gap-1.5 text-sm text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/5 cursor-pointer transition-colors">
                    <Plus size={14} /> Add Address
                  </button>
                </div>
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-white rounded-2xl p-5 border border-gold/10 shadow-sm flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-choco">{addr.label}</span>
                          {addr.is_default && <span className="text-[10px] bg-gold/20 text-yellow-700 rounded-full px-2 py-0.5 font-semibold">Default</span>}
                        </div>
                        <p className="text-sm text-choco/60 mt-0.5">{addr.full_address}</p>
                        <p className="text-xs text-choco/40">{addr.city} {addr.pincode}</p>
                      </div>
                    </div>
                    <button onClick={() => {
                      api.delete(`/users/addresses/${addr.id}`)
                      setAddresses(prev => prev.filter(a => a.id !== addr.id))
                    }} className="text-choco/30 hover:text-red-500 cursor-pointer transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Loyalty Tab */}
            {tab === 'loyalty' && loyalty && (
              <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm">
                <h2 className="font-heading text-xl text-choco mb-6">Royal Club</h2>
                <div className="bg-choco rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-cream/50 text-xs uppercase tracking-wider">Your Level</p>
                      <p className="font-heading text-2xl text-gold font-bold mt-1">{loyalty.level}</p>
                    </div>
                    <Crown size={36} className="text-gold/50" />
                  </div>
                  <p className="font-heading text-4xl text-gold font-bold">{loyalty.points}</p>
                  <p className="text-cream/50 text-sm mt-1">Royal Points</p>
                  {loyalty.nextLevel && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-cream/40 mb-1">
                        <span>{loyalty.points} pts</span>
                        <span>{loyalty.nextThreshold} pts for {loyalty.nextLevel}</span>
                      </div>
                      <div className="h-2 bg-cream/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${loyalty.progress}%`, background: 'linear-gradient(90deg, #C9A84C, #F0D080)' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {loyalty.history?.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-gold/10">
                      <span className="text-sm text-choco/60">{t.description}</span>
                      <span className={`text-sm font-semibold ${t.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'earned' ? '+' : '-'}{Math.abs(t.points)} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Tab */}
            {tab === 'password' && (
              <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm">
                <h2 className="font-heading text-xl text-choco mb-6">Change Password</h2>
                <form onSubmit={changePassword} className="space-y-4 max-w-md">
                  {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                    { key: 'newPassword', label: 'New Password', placeholder: 'Enter new password (min 6 chars)' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs uppercase tracking-wider text-choco/40 font-semibold mb-1.5">{field.label}</label>
                      <input type="password" required placeholder={field.placeholder}
                        value={passForm[field.key]}
                        onChange={e => setPassForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className={inputClass} />
                    </div>
                  ))}
                  <button type="submit" disabled={loading}
                    className="bg-choco text-cream rounded-full px-8 py-3 text-sm font-semibold hover:bg-choco/85 cursor-pointer disabled:opacity-60 transition-colors">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                {/* Logout everywhere */}
                <div className="mt-8 pt-6 border-t border-gold/10">
                  <h3 className="text-sm font-semibold text-choco mb-2">Active Sessions</h3>
                  <p className="text-xs text-choco/50 mb-3">Sign out of all other devices/browsers.</p>
                  <button type="button" onClick={async () => {
                    if (!confirm('Log out of all other sessions?')) return
                    try {
                      const r = await api.post('/auth/logout-all')
                      showToast(r.data.message || 'Done', 'success')
                    } catch (e) { showToast('Failed', 'error') }
                  }}
                    className="text-xs border border-choco/20 px-4 py-2 rounded-full hover:bg-choco/5 cursor-pointer transition-colors">
                    Log Out of All Other Sessions
                  </button>
                </div>
              </div>
            )}

            {/* Delete Account Tab */}
            {tab === 'delete' && (
              <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get('/users/export', { responseType: 'blob' })
                      const url = window.URL.createObjectURL(new Blob([res.data]))
                      const link = document.createElement('a')
                      link.href = url
                      link.setAttribute('download', `shahi-scoops-data-${Date.now()}.json`)
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                      window.URL.revokeObjectURL(url)
                      showToast('Your data is downloading', 'success')
                    } catch (err) {
                      showToast('Export failed', 'error')
                    }
                  }}
                  className="mb-4 px-4 py-2 bg-cream text-choco rounded-lg text-sm font-semibold hover:bg-gold/20 transition flex items-center gap-2"
                >
                  <Download size={16} /> Download My Data (GDPR)
                </button>
                <h2 className="font-heading text-xl text-red-600 mb-2">Delete Account</h2>
                <p className="text-choco/60 text-sm mb-6">
                  This permanently deletes your account, orders, wishlist, addresses, and loyalty points. This action cannot be undone.
                </p>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const pwd = e.currentTarget.password.value
                  if (!pwd) { showToast('Enter your password to confirm', 'error'); return }
                  if (!confirm('Are you absolutely sure? This cannot be undone.')) return
                  try {
                    await api.delete('/users/account', { data: { password: pwd } })
                    showToast('Account deleted. Goodbye!', 'success')
                    setTimeout(() => window.location.href = '/', 1500)
                  } catch (err) {
                    showToast(err.response?.data?.error || 'Delete failed', 'error')
                  }
                }} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-choco/40 font-semibold mb-1.5">Confirm Password</label>
                    <input type="password" name="password" required placeholder="Enter your password"
                      className={inputClass} />
                  </div>
                  <button type="submit"
                    className="bg-red-600 text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-red-700 cursor-pointer transition-colors">
                    Delete My Account Permanently
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
