import { useState, useEffect } from 'react'
import { Crown, Menu, X, ShoppingBag, User, LogOut, Settings, Heart, Moon, Sun, BookOpen, Package, Search } from 'lucide-react'
import SearchBar from './SearchBar'
import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()
  const { count, setIsOpen } = useCart()
  const { dark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: 'Home', href: '/#home' },
    { label: 'Flavours', href: '/products' },
    { label: 'Combos', href: '/#combos' },
    { label: 'Gift Cards', href: '/#gift-cards' },
    { label: 'Blog', href: '/blog' },
    { label: 'Our Story', href: '/#story' },
    { label: 'Contact', href: '/#contact' },
  ]

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled || menuOpen ? 'bg-[#2C1A0E]/95 backdrop-blur-xl shadow-lg dark:bg-[#1A120B]/95' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between" style={{ height: scrolled ? '64px' : '76px', transition: 'height 0.4s' }}>

          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <Crown size={22} className="text-gold group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-heading text-xl md:text-2xl font-bold tracking-wide text-cream">Shahi Scoops</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map(link => (
              link.href.startsWith('/') ? (
                <Link key={link.href} to={link.href}
                  className="text-sm font-medium text-cream/75 hover:text-cream no-underline relative group transition-colors duration-200">
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                </Link>
              ) : (
                <a key={link.href} href={link.href}
                  className="text-sm font-medium text-cream/75 hover:text-cream no-underline relative group transition-colors duration-200">
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                </a>
              )
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Track Order */}
            <Link to="/track-order"
              className="hidden md:flex items-center gap-1 text-cream/70 hover:text-gold transition-colors p-1 text-xs"
              aria-label="Track Order">
              <Package size={16} />
            </Link>

            {/* Search */}
            <SearchBar />

            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme}
              className="text-cream/70 hover:text-gold transition-colors cursor-pointer p-1.5 rounded-full hover:bg-cream/5 hidden md:block"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="hidden md:block text-cream/70 hover:text-gold transition-colors p-1"
              aria-label="Wishlist">
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <button onClick={() => setIsOpen(true)}
              className="relative text-cream/70 hover:text-gold transition-colors cursor-pointer p-1">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-choco text-[9px] font-bold flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Auth */}
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-cream/70 hover:text-gold cursor-pointer transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-xs font-bold text-gold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-cream/70">{user?.name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-48 bg-[#2C1A0E] rounded-2xl border border-gold/15 shadow-2xl overflow-hidden z-50">
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-gold hover:bg-gold/10 transition-colors no-underline border-b border-gold/10">
                          <Settings size={14} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream/70 hover:text-cream hover:bg-cream/5 transition-colors no-underline">
                        <User size={14} /> My Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream/70 hover:text-cream hover:bg-cream/5 transition-colors no-underline">
                        <Heart size={14} /> Wishlist
                      </Link>
                      <Link to="/track-order" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream/70 hover:text-cream hover:bg-cream/5 transition-colors no-underline">
                        <Package size={14} /> Track Order
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer w-full text-left border-t border-gold/10">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className="hidden md:inline-flex items-center border border-gold/50 text-gold rounded-full px-5 py-2 text-xs font-semibold hover:bg-gold hover:text-choco transition-all duration-300 no-underline">
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden text-cream/70 cursor-pointer p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="md:hidden bg-[#2C1A0E]/97 border-t border-gold/10 overflow-hidden">
            <div className="px-6 py-5 space-y-4">
              <Link to="/" className="block text-cream/75 hover:text-gold text-base font-medium transition-colors no-underline"
                onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/products" className="block text-cream/75 hover:text-gold text-base font-medium transition-colors no-underline"
                onClick={() => setMenuOpen(false)}>All Flavours</Link>
              <Link to="/blog" className="block text-cream/75 hover:text-gold text-base font-medium transition-colors no-underline"
                onClick={() => setMenuOpen(false)}>Blog & Recipes</Link>
              <Link to="/track-order" className="block text-cream/75 hover:text-gold text-base font-medium transition-colors no-underline"
                onClick={() => setMenuOpen(false)}>Track Order</Link>
              <a href="/#combos" className="block text-cream/75 hover:text-gold text-base font-medium transition-colors no-underline"
                onClick={() => setMenuOpen(false)}>Combos</a>
              <a href="/#gift-cards" className="block text-cream/75 hover:text-gold text-base font-medium transition-colors no-underline"
                onClick={() => setMenuOpen(false)}>Gift Cards</a>
              <button onClick={toggleTheme}
                className="flex items-center gap-2 text-cream/75 hover:text-gold text-base font-medium cursor-pointer">
                {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <hr className="border-gold/10" />
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="block text-cream/75 text-base font-medium no-underline" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <Link to="/wishlist" className="block text-cream/75 text-base font-medium no-underline" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                  {user?.role === 'admin' && <Link to="/admin" className="block text-gold text-base font-medium no-underline" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-red-400 text-base font-medium cursor-pointer">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="inline-block border border-gold text-gold rounded-full px-7 py-3 text-sm font-semibold no-underline" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
