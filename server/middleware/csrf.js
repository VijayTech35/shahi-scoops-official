// CSRF protection via Origin/Referer header check on state-changing requests
// (POST, PUT, PATCH, DELETE). Cookies are SameSite=strict which already
// blocks most CSRF, but this is defense-in-depth against subdomain attacks
// or future SameSite changes.

const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const csrfProtection = (req, res, next) => {
  if (!STATE_CHANGING.has(req.method)) return next()

  if (req.headers['x-requested-by'] === 'shahi-internal') return next()

  const allowed = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map(s => s.trim()).filter(Boolean)

  // Also trust the request's own host as an allowed origin (supports any deployment domain)
  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (host) {
    const hostOrigin = (req.protocol || 'https') + '://' + host
    if (!allowed.includes(hostOrigin)) allowed.push(hostOrigin)
  }

  const origin = req.headers.origin
  const referer = req.headers.referer

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
    const userAgent = req.headers['user-agent'] || ''
    const isLikelyBrowser = /mozilla|chrome|safari|firefox|edge/i.test(userAgent)
    if (isLikelyBrowser) {
      return res.status(403).json({ error: 'CSRF: missing origin', requestId: req.id })
    }
    if (req.headers.cookie) {
      return res.status(403).json({ error: 'CSRF: cookie without origin', requestId: req.id })
    }
  }

  next()
}
