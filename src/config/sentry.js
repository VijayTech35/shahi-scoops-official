// Frontend Sentry initialization via CDN — no install required.
// Loads browser bundle from jsDelivr, then calls init.
// Set VITE_SENTRY_DSN in .env to enable. Disabled by default.

let initialized = false
let Sentry = null
let loadingPromise = null

function loadSentrySDK() {
  if (loadingPromise) return loadingPromise
  loadingPromise = new Promise((resolve, reject) => {
    if (window.Sentry) {
      Sentry = window.Sentry
      return resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@sentry/browser@7.119.0/build/bundle.min.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      Sentry = window.Sentry
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Sentry SDK'))
    document.head.appendChild(script)
  })
  return loadingPromise
}

export async function initSentryFrontend() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    console.log('[sentry] VITE_SENTRY_DSN not set — frontend error tracking disabled')
    return
  }
  if (initialized) return
  try {
    await loadSentrySDK()
    if (!Sentry) return
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      beforeSend(event) {
        // Strip cookies/headers from network breadcrumbs (PII)
        if (event.breadcrumbs) {
          for (const b of event.breadcrumbs) {
            if (b.data?.headers) delete b.data.headers.authorization
            if (b.data?.headers?.cookie) delete b.data.headers.cookie
          }
        }
        return event
      },
    })
    initialized = true
    console.log('[sentry] frontend initialized')
  } catch (e) {
    console.warn('[sentry] frontend init failed:', e.message)
  }
}

export function captureException(err, context) {
  if (!initialized || !Sentry) return
  try {
    Sentry.captureException(err, context ? { extra: context } : undefined)
  } catch {}
}
