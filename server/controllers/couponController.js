// Coupon validation, application, and admin management
import pool from '../config/db.js'

// Validate a coupon for a user + cart total
export const validateCoupon = async (req, res) => {
  const { code, cart_total } = req.body
  if (!code) return res.status(400).json({ error: 'Coupon code required' })
  if (typeof cart_total !== 'number') return res.status(400).json({ error: 'cart_total required' })

  const [rows] = await pool.query(
    `SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1`,
    [code.toUpperCase().trim()]
  )
  if (!rows.length) return res.status(404).json({ error: 'Invalid coupon code' })

  const c = rows[0]
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  if (c.valid_from && c.valid_from > now) return res.status(400).json({ error: 'Coupon not yet valid' })
  if (c.valid_until && c.valid_until < now) return res.status(400).json({ error: 'Coupon expired' })
  if (c.max_uses && c.current_uses >= c.max_uses) return res.status(400).json({ error: 'Coupon fully redeemed' })
  if (cart_total < c.min_order_amount) return res.status(400).json({ error: `Minimum order ₹${c.min_order_amount} required` })

  // Per-user limit
  if (c.max_uses_per_user) {
    const [used] = await pool.query(
      'SELECT COUNT(*) AS c FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?',
      [c.id, req.user.id]
    )
    if (used[0].c >= c.max_uses_per_user) {
      return res.status(400).json({ error: 'You have already used this coupon' })
    }
  }

  // Compute discount
  let discount = c.discount_type === 'percent'
    ? (cart_total * c.discount_value / 100)
    : c.discount_value
  discount = Math.min(parseFloat(discount.toFixed(2)), cart_total)

  res.json({
    valid: true,
    code: c.code,
    description: c.description,
    discount_type: c.discount_type,
    discount_value: c.discount_value,
    discount_amount: discount,
    new_total: parseFloat((cart_total - discount).toFixed(2)),
  })
}

// Admin: list all coupons
export const adminListCoupons = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC')
  res.json(rows)
}

// Admin: create coupon
export const adminCreateCoupon = async (req, res) => {
  const { code, description, discount_type, discount_value, min_order_amount, max_uses, max_uses_per_user, valid_from, valid_until } = req.body
  if (!code || !discount_type || discount_value == null) return res.status(400).json({ error: 'code, discount_type, discount_value required' })
  if (!['percent', 'fixed'].includes(discount_type)) return res.status(400).json({ error: 'discount_type must be percent or fixed' })

  try {
    const [r] = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, max_uses_per_user, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase().trim(), description || null, discount_type, discount_value, min_order_amount || 0, max_uses || null, max_uses_per_user || 1, valid_from || null, valid_until || null]
    )
    res.status(201).json({ id: r.insertId, code: code.toUpperCase() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Coupon code already exists' })
    }
    res.status(500).json({ error: 'Failed to create coupon' })
  }
}

// Admin: delete coupon
export const adminDeleteCoupon = async (req, res) => {
  await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id])
  await pool.query('DELETE FROM coupon_redemptions WHERE coupon_id = ?', [req.params.id])
  res.json({ success: true })
}

// Internal: redeem coupon when order is placed
export const redeemCoupon = async (conn, couponId, userId, orderId, discountAmount) => {
  await conn.query(
    'INSERT INTO coupon_redemptions (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)',
    [couponId, userId, orderId, discountAmount]
  )
  await conn.query('UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?', [couponId])
}
