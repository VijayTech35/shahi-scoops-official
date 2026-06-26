import { Component } from 'react'
import { Link } from 'react-router-dom'
import { captureException } from '../config/sentry.js'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    captureException(error, { componentStack: info?.componentStack })
  }

  handleReload = () => window.location.reload()

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-4">👑</div>
          <h1 className="font-heading text-3xl text-choco font-bold mb-3">Something went wrong</h1>
          <p className="text-choco/60 text-sm mb-6">
            We've been notified. Please try refreshing the page, or come back in a moment.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details className="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-xs text-red-800">
              <summary className="font-semibold cursor-pointer">Error details (dev only)</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">{this.state.error.toString()}</pre>
            </details>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={this.handleReload}
              className="px-6 py-3 rounded-full text-sm font-bold text-choco hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #F0D080)' }}>
              Reload Page
            </button>
            <Link to="/"
              className="px-6 py-3 rounded-full text-sm font-bold bg-choco text-cream hover:bg-choco/85 transition-colors no-underline">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
