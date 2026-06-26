// Plausible analytics (privacy-friendly, no cookies, no PII, GDPR-compliant).
// Set VITE_PLAUSIBLE_DOMAIN in .env to enable. Disabled by default.

export function initPlausible() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  if (!domain) {
    console.log('[analytics] VITE_PLAUSIBLE_DOMAIN not set — analytics disabled')
    return
  }
  if (document.getElementById('plausible-script')) return

  const script = document.createElement('script')
  script.id = 'plausible-script'
  script.defer = true
  script.dataset.domain = domain
  script.src = 'https://plausible.io/js/script.tagged-events.js'
  document.head.appendChild(script)

  console.log('[analytics] Plausible initialized for', domain)
}

// Track custom events
export function trackEvent(name, props) {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  if (!domain || typeof window === 'undefined' || !window.plausible) return
  window.plausible(name, { props })
}
