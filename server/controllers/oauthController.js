// Google OAuth integration.
// Requires:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in env
// Add to Google Console: https://console.cloud.google.com/apis/credentials
// Authorized redirect URI: ${GOOGLE_REDIRECT_URI}

import crypto from 'crypto'
import pool from '../config/db.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js'
import { sendEmail, welcomeHtml } from '../config/email.js'

const isConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI)

const SCOPES = ['openid', 'email', 'profile']

// Step 1: redirect user to Google's consent screen
export const googleLogin = (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env' })
  }
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000, secure: process.env.NODE_ENV === 'production' })

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

// Step 2: Google redirects back with code; exchange for tokens, then user info
export const googleCallback = async (req, res) => {
  if (!isConfigured()) return res.status(503).json({ error: 'Google OAuth not configured' })

  const { code, state } = req.query
  const cookieState = req.cookies?.oauth_state

  if (!code || !state || state !== cookieState) {
    return res.redirect(`${process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/login?error=oauth_state_mismatch`)
  }
  res.clearCookie('oauth_state')

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('No access token from Google')

    // Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await userRes.json()
    if (!profile.email) throw new Error('No email from Google')

    // Find or create user
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [profile.email.toLowerCase()])
    let user
    if (existing.length > 0) {
      user = existing[0]
      // Link OAuth account
      await pool.query(
        'INSERT OR IGNORE INTO oauth_accounts (user_id, provider, provider_user_id, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
        [user.id, 'google', profile.id, tokens.access_token, tokens.refresh_token || null]
      )
    } else {
      const [r] = await pool.query(
        'INSERT INTO users (name, email, role, email_verified) VALUES (?, ?, ?, 1)',
        [profile.name || profile.email.split('@')[0], profile.email.toLowerCase()]
      )
      user = { id: r.insertId, name: profile.name, email: profile.email.toLowerCase(), role: 'customer' }
      await pool.query(
        'INSERT INTO oauth_accounts (user_id, provider, provider_user_id, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
        [user.id, 'google', profile.id, tokens.access_token, tokens.refresh_token || null]
      )
      sendEmail({ to: user.email, subject: 'Welcome to Shahi Scoops 👑', html: welcomeHtml(user.name) }).catch(() => {})
    }

    // Issue our JWT
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt])

    const COOKIE_SECURE = process.env.COOKIE_SECURE === '1' || process.env.NODE_ENV === 'production'
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    // Redirect back to app with access token in URL (app will store it)
    const clientUrl = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')[0].trim()
    res.redirect(`${clientUrl}/oauth/callback?accessToken=${accessToken}`)
  } catch (err) {
    console.error('Google OAuth error:', err.message)
    const clientUrl = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')[0].trim()
    res.redirect(`${clientUrl}/login?error=oauth_failed`)
  }
}
