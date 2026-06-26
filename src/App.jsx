import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Layout components
import Preloader from './components/Preloader'
import ScrollProgress from './components/ScrollProgress'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import CartDrawer from './components/cart/CartDrawer'
import ScrollToTop from './components/ScrollToTop'
import ShareButton from './components/ShareButton'
import FloatingCTA from './components/FloatingCTA'
import MobileStickyOrder from './components/MobileStickyOrder'
import CursorTrail from './components/CursorTrail'
import CookieConsent from './components/CookieConsent'

// Home page sections
const Hero = lazy(() => import('./components/Hero'))
const Marquee = lazy(() => import('./components/Marquee'))
const Stats = lazy(() => import('./components/Stats'))
const Story = lazy(() => import('./components/Story'))
const WaveDivider = lazy(() => import('./components/WaveDivider'))
const Flavours = lazy(() => import('./components/Flavours'))
const WhyUs = lazy(() => import('./components/WhyUs'))
const BestSeller = lazy(() => import('./components/BestSeller'))
const Combos = lazy(() => import('./components/Combos'))
const GiftCards = lazy(() => import('./components/GiftCards'))
const LoyaltyTeaser = lazy(() => import('./components/LoyaltyTeaser'))
const TrustBadges = lazy(() => import('./components/TrustBadges'))
const Gallery = lazy(() => import('./components/Gallery'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Newsletter = lazy(() => import('./components/Newsletter'))
const FAQ = lazy(() => import('./components/FAQ'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

// Pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ProfileDashboard = lazy(() => import('./pages/ProfileDashboard'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const SharedWishlistPage = lazy(() => import('./pages/SharedWishlistPage'))

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
)

function HomePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Hero /><Marquee /><Stats /><Story />
      <WaveDivider top="cream" bottom="dark" />
      <Flavours /><WhyUs /><BestSeller /><Combos /><GiftCards />
      <LoyaltyTeaser /><TrustBadges /><Gallery /><Testimonials /><FAQ />
      <Newsletter /><Contact /><Footer />
    </Suspense>
  )
}

function MainLayout({ children }) {
  return (
    <>
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:px-4 focus:py-2 focus:rounded-full focus:bg-gold focus:text-choco focus:font-bold focus:shadow-lg focus:no-underline">
        Skip to main content
      </a>
      <Preloader /><AnnouncementBar /><ScrollProgress /><Navbar /><CartDrawer />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
      <CursorTrail /><ScrollToTop /><ShareButton /><FloatingCTA /><MobileStickyOrder /><CookieConsent />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />

            {/* Auth pages */}
            <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
            <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />

            {/* Products */}
            <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
            <Route path="/products/:id" element={<MainLayout><ProductPage /></MainLayout>} />

            {/* Protected user pages */}
            <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfileDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><MainLayout><WishlistPage /></MainLayout></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>} />
            <Route path="/order-success/:orderId" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Blog */}
            <Route path="/blog" element={<MainLayout><BlogListPage /></MainLayout>} />
            <Route path="/blog/:slug" element={<MainLayout><BlogPostPage /></MainLayout>} />

            {/* Order tracking (public) */}
            <Route path="/track-order" element={<MainLayout><OrderTrackingPage /></MainLayout>} />

            {/* Shared wishlist (public) */}
            <Route path="/wishlist/shared/:token" element={<SharedWishlistPage />} />

            {/* Legal */}
            <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
            <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />

            {/* 404 */}
            <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
