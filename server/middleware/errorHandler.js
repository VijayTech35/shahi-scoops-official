import { logger } from '../config/logger.js'

// 404 handler — must come after all routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    requestId: req.id,
  })
}

// Global error handler — must have 4 args (err, req, res, next)
export const errorHandler = (err, req, res, _next) => {
  const reqId = req.id
  const isProd = process.env.NODE_ENV === 'production'

  if (err.message?.startsWith('CORS:')) {
    logger.warn({ reqId, err: err.message }, 'cors blocked')
    return res.status(403).json({ error: 'Origin not allowed', requestId: reqId })
  }

  const status = err.status || err.statusCode || 500
  const payload = {
    error: isProd && status >= 500 ? 'Internal server error' : err.message,
    requestId: reqId,
  }
  if (!isProd && status >= 500) {
    payload.stack = err.stack
  }

  if (status >= 500) {
    logger.error({ reqId, err: { message: err.message, stack: err.stack }, status }, 'server error')
  } else {
    logger.warn({ reqId, err: err.message, status }, 'client error')
  }

  res.status(status).json(payload)
}

// Async wrapper to catch rejected promises in route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
