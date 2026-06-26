import pool from '../config/db.js'
import { sendEmail, orderStatusHtml } from '../config/email.js'
import { logger } from '../config/logger.js'
import { logAudit } from '../utils/audit.js'

export const getStats = async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query("SELECT COUNT(*) as total_orders FROM orders WHERE DATE(created_at) = DATE('now')")
    const [[{ monthly_revenue }]] = await pool.query("SELECT COALESCE(SUM(total),0) as monthly_revenue FROM orders WHERE payment_status='paid' AND CAST(strftime('%m', created_at) AS INTEGER) = CAST(strftime('%m', CURRENT_TIMESTAMP) AS INTEGER) AND CAST(strftime('%Y', created_at) AS INTEGER) = CAST(strftime('%Y', CURRENT_TIMESTAMP) AS INTEGER)")
    const [[{ total_customers }]] = await pool.query("SELECT COUNT(*) as total_customers FROM users WHERE role='customer'")
    const [topProducts] = await pool.query("SELECT p.name, COUNT(oi.id) as order_count FROM order_items oi JOIN products p ON oi.product_id=p.id GROUP BY p.id ORDER BY order_count DESC LIMIT 3")
    res.json({ total_orders, monthly_revenue, total_customers, top_products: topProducts })
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }) }
}

// Products
export const adminGetProducts = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
  res.json(rows)
}

export const adminCreateProduct = async (req, res) => {
  const { name, description, price, image_url, category, badge, accent_color, is_available, is_featured } = req.body
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' })
  const [result] = await pool.query(
    `INSERT INTO products (name, description, price, image_url, category, badge, accent_color, is_available, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description, price, image_url, category || 'Traditional', badge || null, accent_color || '#C9A84C', is_available ? 1 : 1, is_featured ? 1 : 0]
  )
  res.status(201).json({ id: result.insertId, ...req.body })
}

export const adminUpdateProduct = async (req, res) => {
  const { name, description, price, image_url, category, badge, accent_color, is_available, is_featured } = req.body
  await pool.query(
    `UPDATE products SET name=?, description=?, price=?, image_url=?, category=?, badge=?, accent_color=?, is_available=?, is_featured=? WHERE id=?`,
    [name, description, price, image_url, category, badge, accent_color, is_available ? 1 : 0, is_featured ? 1 : 0, req.params.id]
  )
  res.json({ success: true })
}

export const adminDeleteProduct = async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
  res.json({ success: true })
}

export const adminToggleProduct = async (req, res) => {
  await pool.query('UPDATE products SET is_available = NOT is_available WHERE id = ?', [req.params.id])
  res.json({ success: true })
}

// Orders
export const adminGetOrders = async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query
  let sql = `SELECT o.*, u.name as customer_name, u.email as customer_email
             FROM orders o JOIN users u ON o.user_id = u.id`
  const params = []
  if (status && status !== 'all') { sql += ' WHERE o.status = ?'; params.push(status) }
  sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const [orders] = await pool.query(sql, params)
  for (const order of orders) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id])
    order.items = items
  }
  let countSql = 'SELECT COUNT(*) AS total FROM orders o'
  const countParams = []
  if (status && status !== 'all') { countSql += ' WHERE o.status = ?'; countParams.push(status) }
  const [[{ total }]] = await pool.query(countSql, countParams)
  res.json({ items: orders, total, limit: Number(limit), offset: Number(offset) })
}

export const adminUpdateOrderStatus = async (req, res) => {
  const { status, note } = req.body
  const validStatuses = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const [orders] = await pool.query('SELECT status, order_number FROM orders WHERE id = ?', [req.params.id])
  if (!orders.length) return res.status(404).json({ error: 'Order not found' })
  if (orders[0].status === 'delivered' || orders[0].status === 'cancelled')
    return res.status(400).json({ error: 'Cannot update a completed/cancelled order' })

  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])
  await pool.query(
    'INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)',
    [req.params.id, status, note || '']
  )

  await logAudit(req, 'order.update_status', 'order', req.params.id, { from: orders[0].status, to: status, note })

  // Notify customer (fire and forget)
  const [[user]] = await pool.query(
    'SELECT u.email, u.name FROM users u JOIN orders o ON o.user_id = u.id WHERE o.id = ?',
    [req.params.id]
  )
  if (user) {
    sendEmail({
      to: user.email,
      subject: `Order #${orders[0].order_number} — ${status.replace(/_/g, ' ')}`,
      html: orderStatusHtml({ order_number: orders[0].order_number }, status, note),
    }).catch((e) => console.error('status email failed:', e.message))
  }
  res.json({ success: true })
}

// Customers
export const adminGetCustomers = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total),0) as total_spent
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
     WHERE u.role = 'customer'
     GROUP BY u.id ORDER BY u.created_at DESC`
  )
  res.json({ items: rows, total: rows.length })
}

// Reviews admin
export const adminGetReviews = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.name as user_name, p.name as product_name
     FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id
     ORDER BY r.created_at DESC`
  )
  res.json(rows)
}

export const adminApproveReview = async (req, res) => {
  await pool.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id])
  // Recalculate product rating
  const [review] = await pool.query('SELECT product_id FROM reviews WHERE id = ?', [req.params.id])
  if (review.length) {
    await pool.query(
      `UPDATE products p SET
        rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_approved = 1),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1)
       WHERE id = ?`,
      [review[0].product_id, review[0].product_id, review[0].product_id]
    )
  }
  res.json({ success: true })
}

export const adminDeleteReview = async (req, res) => {
  await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id])
  res.json({ success: true })
}

// Image upload — returns URL for the saved image
export const adminUploadProductImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' })
  const url = `/uploads/${req.file.filename}`
  logger.info({ adminId: req.user.id, filename: req.file.filename, size: req.file.size }, 'image uploaded')
  res.json({ url, filename: req.file.filename, size: req.file.size })
}

// ── CUSTOMER DETAIL ──────────────────────────────────────
export const adminGetCustomerDetail = async (req, res) => {
  const { id } = req.params
  const [users] = await pool.query('SELECT id, name, email, phone, created_at FROM users WHERE id = ? AND role = ?', [id, 'customer'])
  if (!users.length) return res.status(404).json({ error: 'Customer not found' })
  const user = users[0]
  const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [id])
  const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [id])
  for (const order of orders) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id])
    order.items = items
  }
  const [[loyalty]] = await pool.query('SELECT * FROM loyalty_points WHERE user_id = ?', [id])
  res.json({ ...user, addresses, orders, loyalty: loyalty || { points: 0, level: 'Silver' } })
}

// ── SHIPPING ZONES ───────────────────────────────────────
export const adminGetShippingZones = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM shipping_zones ORDER BY name ASC')
  res.json(rows)
}

export const adminCreateShippingZone = async (req, res) => {
  const { name, pincodes, rate, free_above } = req.body
  if (!name || !pincodes) return res.status(400).json({ error: 'Name and pincodes required' })
  const [result] = await pool.query(
    'INSERT INTO shipping_zones (name, pincodes, rate, free_above) VALUES (?, ?, ?, ?)',
    [name, pincodes, parseFloat(rate) || 0, free_above ? parseFloat(free_above) : null]
  )
  res.status(201).json({ id: result.insertId, name, pincodes, rate: parseFloat(rate) || 0, free_above: free_above ? parseFloat(free_above) : null })
}

export const adminUpdateShippingZone = async (req, res) => {
  const { name, pincodes, rate, free_above, is_active } = req.body
  await pool.query(
    'UPDATE shipping_zones SET name=?, pincodes=?, rate=?, free_above=?, is_active=? WHERE id=?',
    [name, pincodes, parseFloat(rate) || 0, free_above ? parseFloat(free_above) : null, is_active !== undefined ? (is_active ? 1 : 0) : 1, req.params.id]
  )
  res.json({ success: true })
}

export const adminDeleteShippingZone = async (req, res) => {
  await pool.query('DELETE FROM shipping_zones WHERE id = ?', [req.params.id])
  res.json({ success: true })
}
