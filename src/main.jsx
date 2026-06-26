import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initSentryFrontend } from './config/sentry.js'
import { initPlausible } from './config/analytics.js'

// Initialize Sentry + analytics before rendering (lazy — no-op if env missing)
initSentryFrontend()
initPlausible()

// Register service worker for PWA + offline support (production only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('[sw] registration failed:', e.message)
    })
  })
} else if ('serviceWorker' in navigator) {
  // Dev: unregister any old service worker from a previous prod build,
  // so it doesn't intercept requests and serve stale assets.
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister().catch(() => {}))
  })
}

// Surface fatal boot errors instead of leaving a blank screen
window.addEventListener('error', (e) => {
  if (!document.getElementById('boot-error')) {
    const el = document.createElement('div')
    el.id = 'boot-error'
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;padding:12px 16px;font:13px/1.4 monospace;white-space:pre-wrap;'
    el.textContent = `⚠️ Boot error: ${e.message}\n${e.filename}:${e.lineno}:${e.colno}`
    document.body.appendChild(el)
  }
})
window.addEventListener('unhandledrejection', (e) => {
  if (!document.getElementById('boot-error')) {
    const el = document.createElement('div')
    el.id = 'boot-error'
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;padding:12px 16px;font:13px/1.4 monospace;white-space:pre-wrap;'
    el.textContent = `⚠️ Unhandled rejection: ${e.reason?.message || e.reason}`
    document.body.appendChild(el)
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
