import { verifyAccessToken } from '../utils/jwt.js'

export const auth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const token = header.split(' ')[1]
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' })
  }
}

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
