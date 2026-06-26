// Sentry integration. Activates only when SENTRY_DSN is set.
// Run `npm install @sentry/node` to enable.

let sentry = null

const noopHandlers = {
  requestHandler: [(_req, _res, next) => next()],
  errorHandler: [(_err, _req, _res, next) => next()],
}

export const sentryHandlers = noopHandlers

export async function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('[sentry] SENTRY_DSN not set — error tracking disabled')
    return
  }
  try {
    const { default: Sentry } = await import('@sentry/node')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      beforeSend(event) {
        if (event.request?.cookies) delete event.request.cookies
        if (event.request?.headers) {
          delete event.request.headers.authorization
          delete event.request.headers.cookie
        }
        return event
      },
    })
    sentry = Sentry
    sentryHandlers.requestHandler = [Sentry.Handlers.requestHandler(), Sentry.Handlers.tracingHandler()]
    sentryHandlers.errorHandler = [Sentry.Handlers.errorHandler()]
    console.log('[sentry] initialized')
  } catch (e) {
    console.warn('[sentry] failed to initialize:', e.message)
  }
}
