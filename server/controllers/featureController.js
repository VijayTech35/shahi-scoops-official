import pool from '../config/db.js'
import { sendEmail } from '../config/email.js'
import { logger } from '../config/logger.js'

// ── REVIEWS ───────────────────────────────────────────────
export const getReviews = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.body, r.photo_url, r.created_at, u.name as user_name, u.avatar_url
     FROM reviews r JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ? AND r.is_approved = 1
     ORDER BY r.created_at DESC`,
    [req.params.product_id]
  )
  res.json(rows)
}

export const submitReview = async (req, res) => {
  const { product_id, order_id, rating, title, body } = req.body
  if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' })
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' })

  // Check user has a delivered order with this product
  const [eligibility] = await pool.query(
    `SELECT oi.id FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
     LIMIT 1`,
    [req.user.id, product_id]
  )
  if (!eligibility.length) return res.status(403).json({ error: 'You can only review products you have received' })

  try {
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null
    await pool.query(
      `INSERT INTO reviews (user_id, product_id, order_id, rating, title, body, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, product_id, order_id || null, rating, title || '', body || '', photo_url]
    )
    res.status(201).json({ success: true, message: 'Review submitted and pending approval' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'You have already reviewed this product' })
    res.status(500).json({ error: 'Review submission failed' })
  }
}

// ── LOYALTY ───────────────────────────────────────────────
export const getLoyalty = async (req, res) => {
  const [[balance]] = await pool.query(
    'SELECT points, level FROM loyalty_points WHERE user_id = ?',
    [req.user.id]
  )
  const [history] = await pool.query(
    'SELECT * FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.user.id]
  )

  const levels = { Silver: 0, Gold: 500, Royal: 1500 }
  const current = balance || { points: 0, level: 'Silver' }
  const nextLevel = current.level === 'Royal' ? null : current.level === 'Gold' ? 'Royal' : 'Gold'
  const nextThreshold = nextLevel ? levels[nextLevel] : null
  const progress = nextThreshold ? Math.min((current.points / nextThreshold) * 100, 100) : 100

  res.json({ ...current, history, nextLevel, nextThreshold, progress })
}

export const redeemPoints = async (req, res) => {
  const { points } = req.body
  if (!points || points < 500) return res.status(400).json({ error: 'Minimum 500 points to redeem' })

  const [[balance]] = await pool.query('SELECT points FROM loyalty_points WHERE user_id = ?', [req.user.id])
  if (!balance || balance.points < points) return res.status(400).json({ error: 'Insufficient points' })

  const discount = Math.floor(points / 10) // 500 pts = ₹50
  await pool.query('UPDATE loyalty_points SET points = points - ? WHERE user_id = ?', [points, req.user.id])
  await pool.query(
    `INSERT INTO loyalty_transactions (user_id, points, type, description) VALUES (?, ?, 'redeemed', ?)`,
    [req.user.id, points, `Redeemed ${points} points for ₹${discount} discount`]
  )
  res.json({ success: true, discount, remaining_points: balance.points - points })
}

// ── NEWSLETTER ────────────────────────────────────────────
export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Valid email required' })

  try {
    await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES (?) ON CONFLICT(email) DO UPDATE SET is_active = 1',
      [email.toLowerCase().trim()]
    )
    sendEmail({
      to: email,
      subject: 'Welcome to Shahi Scoops Royal Insider 👑',
      html: `<div style="font-family:Arial;padding:32px;background:#2C1A0E;color:#FFF8F0;border-radius:12px;text-align:center">
        <h2 style="color:#C9A84C;font-family:Georgia">You're In The Royal Club!</h2>
        <p>Welcome! You'll be the first to know about new flavours, exclusive deals & royal events.</p>
        <p style="color:#C9A84C;font-size:12px;margin-top:24px">Shahi Scoops · Bengaluru</p>
      </div>`,
    }).catch(() => {})
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Subscription failed' })
  }
}

// ── QUIZ RESULT ───────────────────────────────────────────
export const saveQuizResult = async (req, res) => {
  const { answers, recommended_flavour } = req.body
  // Store anonymously or for logged-in user
  const userId = req.user?.id || null
  await pool.query(
    'INSERT INTO quiz_results (user_id, answers, recommended_flavour) VALUES (?, ?, ?)',
    [userId, JSON.stringify(answers), recommended_flavour]
  ).catch(() => {})
  res.json({ success: true })
}

// ── CONTACT FORM ──────────────────────────────────────────
export const submitContact = async (req, res) => {
  const { name, phone, email, interest, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required' })

  // Persist to DB first (so enquiry is never lost even if email fails)
  try {
    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, interest, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, interest || 'General', message]
    )
  } catch (e) {
    logger.error({ err: e }, 'failed to save contact message')
    return res.status(500).json({ error: 'Could not save message' })
  }

  // Try to send notification email (don't fail the request if SMTP is down)
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `New Enquiry from ${name} — Shahi Scoops`,
      html: `<div style="font-family:Arial;padding:24px">
        <h2 style="color:#2C1A0E">New Royal Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Interest:</strong> ${interest || 'General'}</p>
        <p><strong>Message:</strong><br>${message}</p>
      </div>`,
    }).catch(() => {})
    // Auto-reply to customer (best-effort)
    sendEmail({
      to: email,
      subject: 'We received your message — Shahi Scoops 👑',
      html: `<div style="font-family:Arial;padding:24px;background:#FFF8F0;border-radius:12px">
        <h2 style="color:#C9A84C;font-family:Georgia">Thank you, ${name}!</h2>
        <p style="color:#2C1A0E">We've received your message and will get back to you within 24 hours.</p>
        <p style="color:#666;font-size:12px">In the meantime, you can WhatsApp us at +91 62043 73073</p>
      </div>`,
    }).catch(() => {})
  } catch {
    // SMTP failure is non-fatal — message is in DB
  }
  res.json({ success: true })
}

// ── RECOMMENDATIONS ───────────────────────────────────────
export const getRecommendations = async (req, res) => {
  const { product_id } = req.params
  const [rows] = await pool.query(
    `SELECT p.*, COUNT(oi2.id) as co_count
     FROM order_items oi1
     JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi2.product_id != oi1.product_id
     JOIN products p ON oi2.product_id = p.id
     WHERE oi1.product_id = ? AND p.is_available = 1
     GROUP BY p.id ORDER BY co_count DESC LIMIT 4`,
    [product_id]
  )
  // Fallback to featured products if no co-purchase data
  if (rows.length < 2) {
    const [featured] = await pool.query(
      'SELECT * FROM products WHERE is_available = 1 AND id != ? ORDER BY is_featured DESC, rating DESC LIMIT 4',
      [product_id]
    )
    return res.json(featured)
  }
  res.json(rows)
}
