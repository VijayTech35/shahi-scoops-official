import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/db.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { sendEmail, welcomeHtml, emailVerificationHtml, passwordResetHtml } from '../config/email.js'
import { generateSecret, verifyTOTP, otpAuthURI } from '../utils/totp.js'

const isProd = process.env.NODE_ENV === 'production'
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1' || isProd

export const register = async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' })
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, email_verify_token, email_verify_expires) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashed, verifyToken, verifyExpires]
    )

    const user = { id: result.insertId, email: email.toLowerCase(), role: 'customer' }
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: COOKIE_SECURE,
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    // Send welcome + verification emails
    sendEmail({ to: email, subject: 'Welcome to Shahi Scoops 👑', html: welcomeHtml(name) }).catch((e) => console.error('welcome email failed:', e.message))

    const clientUrl = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')[0].trim()
    const verifyLink = `${clientUrl}/verify-email?token=${verifyToken}`
    sendEmail({
      to: email, subject: 'Verify your email 👑',
      html: emailVerificationHtml(name, verifyLink),
    }).catch((e) => console.error('verify email failed:', e.message))

    res.status(201).json({
      accessToken,
      user: { id: user.id, name: name.trim(), email: email.toLowerCase(), role: 'customer', emailVerified: false },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, phone, avatar_url FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    )
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' })

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' })

    const tokenPayload = { id: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id])
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: COOKIE_SECURE,
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar_url: user.avatar_url },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'No refresh token' })

  try {
    const payload = verifyRefreshToken(token)
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()',
      [payload.id, token]
    )
    if (rows.length === 0) return res.status(401).json({ error: 'Refresh token invalid or expired' })

    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [payload.id])
    if (users.length === 0) return res.status(401).json({ error: 'User not found' })

    const user = users[0]
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query('DELETE FROM refresh_tokens WHERE id = ?', [rows[0].id])
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, newRefreshToken, expiresAt]
    )

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true, secure: COOKIE_SECURE,
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ accessToken: newAccessToken })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]).catch(() => {})
  }
  res.clearCookie('refreshToken')
  res.json({ success: true })
}

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, avatar_url, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email.toLowerCase().trim()])
    if (users.length === 0) return res.json({ success: true, message: 'If the email exists, a reset link has been sent' })

    const user = users[0]
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    )

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    sendEmail({
      to: email,
      subject: 'Reset Your Shahi Scoops Password',
      html: `<div style="font-family:Arial;padding:32px;background:#FFF8F0;border-radius:12px;max-width:480px;margin:0 auto">
        <div style="background:#2C1A0E;padding:24px;text-align:center;border-radius:8px 8px 0 0">
          <h2 style="color:#C9A84C;font-family:Georgia;margin:0">Reset Your Password</h2>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;border:1px solid #F7D794">
          <p style="color:#2C1A0E">Hi ${user.name},</p>
          <p style="color:#666">Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#F0D080);color:#2C1A0E;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;margin:16px 0">Reset Password</a>
          <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
    }).catch(() => {})

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Failed to process request' })
  }
}

export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body
  if (!token || !email || !password) return res.status(400).json({ error: 'Token, email, and password are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    const [rows] = await pool.query(
      `SELECT prt.id, prt.user_id FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND u.email = ? AND prt.expires_at > NOW() AND prt.used = FALSE
       LIMIT 1`,
      [token, email.toLowerCase().trim()]
    )

    if (rows.length === 0) return res.status(400).json({ error: 'Invalid or expired reset token' })

    const hashed = await bcrypt.hash(password, 12)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, rows[0].user_id])
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?', [rows[0].id])
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [rows[0].user_id])

    res.json({ success: true, message: 'Password reset successful. You can now sign in.' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Failed to reset password' })
  }
}

// ── EMAIL VERIFICATION ────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token required' })
  try {
    const [rows] = await pool.query(
      'SELECT id, email FROM users WHERE email_verify_token = ? AND email_verify_expires > NOW() LIMIT 1',
      [token]
    )
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired verification token' })
    await pool.query('UPDATE users SET email_verified = 1, email_verify_token = NULL, email_verify_expires = NULL WHERE id = ?', [rows[0].id])
    res.json({ success: true, message: 'Email verified successfully', email: rows[0].email })
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ error: 'Failed to verify email' })
  }
}

export const resendVerification = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })
  try {
    const [rows] = await pool.query('SELECT id, name, email_verified FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()])
    if (!rows.length || rows[0].email_verified) {
      // Don't leak whether email exists
      return res.json({ success: true, message: 'If the email exists and is unverified, a link has been sent' })
    }
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await pool.query('UPDATE users SET email_verify_token = ?, email_verify_expires = ? WHERE id = ?', [verifyToken, verifyExpires, rows[0].id])
    const clientUrl = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')[0].trim()
    const verifyLink = `${clientUrl}/verify-email?token=${verifyToken}`
    sendEmail({
      to: email, subject: 'Verify your email 👑',
      html: emailVerificationHtml(rows[0].name, verifyLink),
    }).catch((e) => console.error('resend verify failed:', e.message))
    res.json({ success: true, message: 'If the email exists and is unverified, a link has been sent' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' })
  }
}

// ── LOGOUT EVERYWHERE (invalidate all refresh tokens) ─────
export const logoutAll = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.id])
    res.clearCookie('refreshToken', { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'strict' })
    res.json({ success: true, message: `Logged out of ${result.affectedRows || 0} other session(s)` })
  } catch (err) {
    res.status(500).json({ error: 'Failed to logout everywhere' })
  }
}

// ── TWO-FACTOR AUTH (TOTP, admin only) ───────────────────
export const setup2FA = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '2FA is admin-only' })
    const secret = generateSecret()
    // Store temporarily — must verify before activation
    await pool.query('UPDATE users SET two_factor_secret = ? WHERE id = ?', [secret, req.user.id])
    const uri = otpAuthURI(secret, req.user.email)
    res.json({ secret, otpauth_uri: uri, message: 'Scan QR code with Google Authenticator, then verify with /api/auth/2fa/verify-setup' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to setup 2FA' })
  }
}

export const verifySetup2FA = async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Code required' })
  try {
    const [rows] = await pool.query('SELECT two_factor_secret FROM users WHERE id = ?', [req.user.id])
    if (!rows[0]?.two_factor_secret) return res.status(400).json({ error: 'Setup 2FA first' })
    if (!verifyTOTP(rows[0].two_factor_secret, code)) return res.status(400).json({ error: 'Invalid code' })
    await pool.query('UPDATE users SET two_factor_enabled = 1 WHERE id = ?', [req.user.id])
    res.json({ success: true, message: '2FA enabled successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify 2FA' })
  }
}

export const disable2FA = async (req, res) => {
  const { password, code } = req.body
  if (!password || !code) return res.status(400).json({ error: 'Password and 2FA code required' })
  try {
    const [rows] = await pool.query('SELECT password, two_factor_secret FROM users WHERE id = ?', [req.user.id])
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    const ok = await bcrypt.compare(password, rows[0].password)
    if (!ok) return res.status(401).json({ error: 'Invalid password' })
    if (!verifyTOTP(rows[0].two_factor_secret || '', code)) return res.status(400).json({ error: 'Invalid 2FA code' })
    await pool.query('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?', [req.user.id])
    res.json({ success: true, message: '2FA disabled' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to disable 2FA' })
  }
}
