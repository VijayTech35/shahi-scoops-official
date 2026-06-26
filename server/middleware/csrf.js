// CSRF protection via Origin/Referer header check on state-changing requests
// (POST, PUT, PATCH, DELETE). Cookies are SameSite=strict which already
// blocks most CSRF, but this is defense-in-depth against subdomain attacks
// or future SameSite changes.

const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const csrfProtection = (req, res, next) => {
  if (!STATE_CHANGING.has(req.method)) return next()

  // Allow server-to-server / tests with explicit header indicating non-browser
  if (req.headers['x-requested-by'] === 'shahi-internal') return next()

  // Get allowed origins from env (same as CORS)
  const allowed = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map(s => s.trim()).filter(Boolean)

  const origin = req.headers.origin
  const referer = req.headers.referer

  // For browser requests, Origin or Referer must match allowed origins
  if (origin) {
    if (!allowed.includes(origin)) {
      return res.status(403).json({ error: 'CSRF: invalid origin', requestId: req.id })
    }
  } else if (referer) {
    try {
      const refOrigin = new URL(referer).origin
      if (!allowed.includes(refOrigin)) {
        return res.status(403).json({ error: 'CSRF: invalid referer', requestId: req.id })
      }
    } catch {
      return res.status(403).json({ error: 'CSRF: invalid referer', requestId: req.id })
    }
  } else {
    // No origin AND no referer — only allow if explicitly non-browser
    // (e.g. curl with custom header). For safety, reject.
    const userAgent = req.headers['user-agent'] || ''
    const isLikelyBrowser = /mozilla|chrome|safari|firefox|edge/i.test(userAgent)
    if (isLikelyBrowser) {
      return res.status(403).json({ error: 'CSRF: missing origin', requestId: req.id })
    }
    // Non-browser without origin (curl, server) — allow only if no cookies
    // For auth-required endpoints with cookies, this is a risk. Reject.
    if (req.headers.cookie) {
      return res.status(403).json({ error: 'CSRF: cookie without origin', requestId: req.id })
    }
  }

  next()
}
