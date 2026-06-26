import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'shahi_access_secret_change_in_production'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'shahi_refresh_secret_change_in_production'

export const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  )

export const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  )

export const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET)

export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET)
