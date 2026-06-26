import pino from 'pino'
import pinoHttp from 'pino-http'

const isProd = process.env.NODE_ENV === 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: { service: 'shahi-scoops-api' },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', '*.accessToken', '*.refreshToken'],
    censor: '[REDACTED]',
  },
  transport: isProd ? undefined : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } },
})

export const httpLogStream = {
  write: (msg) => logger.info(msg.trim()),
}

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
})
