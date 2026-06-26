import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-choco/40 mb-6 overflow-x-auto pb-1" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-gold transition-colors no-underline flex items-center gap-1">
        <Home size={12} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={10} />
          {item.href ? (
            <Link to={item.href} className="hover:text-gold transition-colors no-underline truncate max-w-[200px]">
              {item.label}
            </Link>
          ) : (
            <span className="text-choco/60 truncate max-w-[200px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
