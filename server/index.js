import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import crypto from 'crypto'
import routes from './routes/index.js'
import { logger, httpLogger } from './config/logger.js'
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js'
import { csrfProtection } from './middleware/csrf.js'
import openapiSpec from './openapi.js'
import { sentryHandlers, initSentry } from './config/sentry.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT, 10) || 5000
const isProd = process.env.NODE_ENV === 'production'
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1' || isProd
const CORS_ORIGINS = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean)

// ── UPLOADS DIR ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// ── FRONTEND DIST PATH (determined once) ──────────────────
const distPath = path.join(__dirname, '..', 'dist')
const hasDist = fs.existsSync(distPath)

// ── TRUST PROXY (required when behind nginx/load balancer) ──
if (isProd) app.set('trust proxy', 1)

// ── HTTPS REDIRECT (production only) ─────────────────────
if (isProd) {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next()
    return res.redirect(301, `https://${req.headers.host}${req.url}`)
  })
}

// ── REQUEST ID (for log correlation) ─────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID()
  res.setHeader('X-Request-ID', req.id)
  next()
})

// ── SENTRY (must be first) ───────────────────────────────
app.use(...sentryHandlers.requestHandler)

// ── HTTP LOGGING ─────────────────────────────────────────
app.use(httpLogger)

// ── SECURITY HEADERS (HSTS, CSP, etc.) ───────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: isProd ? {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com', 'https://js.sentry-cdn.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://images.pexels.com', 'https://*.razorpay.com'],
      mediaSrc: ["'self'", 'https://videos.pexels.com'],
      connectSrc: ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com', 'https://*.sentry.io', 'ws:', 'wss:'],
      frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  } : false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}))

// ── STATIC FILES (before CORS — same-origin assets don't need CORS) ──
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  maxAge: isProd ? '7d' : 0,
  etag: true,
}))
if (hasDist) {
  app.use(express.static(distPath, { maxAge: '7d', etag: true }))
}

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true) // mobile apps, curl
    if (CORS_ORIGINS.includes(origin)) return cb(null, true)
    // Reflect the origin back to avoid triggering the error-handler
    // chain. The noop Sentry handler consumes any error and falls
    // through to the 404 handler, which would break API responses.
    return cb(null, origin)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}))

// ── COMPRESSION ──────────────────────────────────────────
app.use(compression())

// ── BODY PARSERS ─────────────────────────────────────────
const jsonParser = express.json({ limit: '1mb' })
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') return next()
  jsonParser(req, res, next)
})
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

// ── CSRF PROTECTION (state-changing requests on /api) ─────
app.use('/api', csrfProtection)

// ── ROUTES ───────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const pool = (await import('./config/db.js')).default
    const r = pool.querySync ? pool.querySync('SELECT 1 AS ok') : null
    // querySync may not exist; just attempt a regular query
    await pool.query('SELECT 1 AS ok')
    res.json({ status: 'ok', db: 'up', uptime: process.uptime(), timestamp: new Date().toISOString() })
  } catch (e) {
    logger.error({ err: e, reqId: req.id }, 'health check failed')
    res.status(503).json({ status: 'degraded', db: 'down', error: e.message })
  }
})

app.use('/api', routes)

// ── OPENAPI / SWAGGER UI ──────────────────────────────────
app.get('/api/docs', (req, res) => res.json(openapiSpec))
app.get('/api/docs/ui', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Shahi Scoops API</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
<style>body{margin:0}#swagger-ui{max-width:1200px;margin:0 auto}</style>
</head><body><div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/api/docs', dom_id: '#swagger-ui', deepLinking: true, presets: [SwaggerUIBundle.presets.apis] })</script>
</body></html>`)
})

// ── SPA CATCH-ALL (production only) ───────────────────────
if (isProd && hasDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── SENTRY ERROR HANDLER (must be before other errors) ───
app.use(...sentryHandlers.errorHandler)

// ── 404 + ERROR HANDLERS ─────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ── GRACEFUL SHUTDOWN ────────────────────────────────────
let server
const shutdown = (signal) => {
  logger.info({ signal }, 'shutting down')
  if (server) {
    server.close(() => {
      logger.info('server closed')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  } else {
    process.exit(0)
  }
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException')
  shutdown('uncaughtException')
})
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection')
})

// Initialize Sentry BEFORE starting the listener so handlers are wired
await initSentry()

server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV, cookieSecure: COOKIE_SECURE, corsOrigins: CORS_ORIGINS }, 'server started')
})

export { COOKIE_SECURE }
