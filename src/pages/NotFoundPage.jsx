import { Link } from 'react-router-dom'
import { Home, Search, Phone } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-[#1A120B] px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-[120px] leading-none mb-2 font-heading text-gold">404</div>
        <h1 className="font-heading text-3xl text-choco dark:text-cream font-bold mb-3">This page got scooped</h1>
        <p className="text-choco/60 dark:text-gray-300 text-sm mb-8">
          The flavour you're looking for doesn't exist on our menu. But we have plenty of others waiting to be discovered.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Link to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-choco hover:scale-105 transition-transform no-underline"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
            <Home size={14} /> Back to Home
          </Link>
          <a href="#flavours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-choco text-cream hover:bg-choco/85 transition-colors no-underline">
            <Search size={14} /> Browse Flavours
          </a>
        </div>
        <a href="tel:+916204373073"
          className="inline-flex items-center gap-1.5 text-xs text-choco/50 dark:text-gray-400 hover:text-gold transition-colors no-underline">
          <Phone size={12} /> Need help? Call +91 62043 73073
        </a>
      </div>
    </div>
  )
}
