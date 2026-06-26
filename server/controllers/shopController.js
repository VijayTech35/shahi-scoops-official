import crypto from 'crypto'
import pool from '../config/db.js'
import { sendEmail, orderConfirmationHtml, orderStatusHtml } from '../config/email.js'

// ── PRODUCTS ──────────────────────────────────────────────
export const getProducts = async (req, res) => {
  const { category, search, limit = 50, offset = 0 } = req.query
  let sql = 'SELECT * FROM products WHERE is_available = 1'
  const params = []
  if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category) }
  if (search && search.trim()) {
    const term = `%${search.trim()}%`
    sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)'
    params.push(term, term, term)
  }
  sql += ' ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const [rows] = await pool.query(sql, params)
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM products WHERE is_available = 1')
  res.json({ items: rows, total, limit: Number(limit), offset: Number(offset) })
}

export const getProduct = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Product not found' })
  res.json(rows[0])
}

// ── CART ──────────────────────────────────────────────────
export const getCart = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url, p.accent_color
     FROM cart_items c JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ? AND p.is_available = 1`,
    [req.user.id]
  )
  res.json(rows)
}

export const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body
  if (!product_id) return res.status(400).json({ error: 'product_id required' })
  await pool.query(
    'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity',
    [req.user.id, product_id, quantity]
  )
  const [rows] = await pool.query(
    `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url
     FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
    [req.user.id]
  )
  res.json(rows)
}

export const updateCart = async (req, res) => {
  const { quantity } = req.body
  if (!quantity || quantity < 1) {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  } else {
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id])
  }
  res.json({ success: true })
}

export const removeFromCart = async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  res.json({ success: true })
}

export const clearCart = async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
  res.json({ success: true })
}

// ── WISHLIST ──────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT w.id, p.id as product_id, p.name, p.price, p.image_url, p.accent_color, p.badge
     FROM wishlist_items w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
    [req.user.id]
  )
  res.json(rows)
}

export const addToWishlist = async (req, res) => {
  const { product_id } = req.body
  if (!product_id) return res.status(400).json({ error: 'product_id required' })
  await pool.query(
    'INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
    [req.user.id, product_id]
  )
  res.json({ success: true })
}

export const removeFromWishlist = async (req, res) => {
  await pool.query('DELETE FROM wishlist_items WHERE product_id = ? AND user_id = ?', [req.params.product_id, req.user.id])
  res.json({ success: true })
}

// ── ORDERS ────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  const { delivery_address, notes, payment_method } = req.body
  if (!delivery_address) return res.status(400).json({ error: 'Delivery address required' })
  // Default to online if not specified, validate
  const method = payment_method === 'cod' ? 'cod' : 'online'

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [cartItems] = await conn.query(
      `SELECT c.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.is_available = 1`,
      [req.user.id]
    )
    if (!cartItems.length) { await conn.rollback(); return res.status(400).json({ error: 'Cart is empty' }) }

    // Check stock for all items
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback()
        return res.status(400).json({
          error: `${item.name} is out of stock (only ${item.stock} available)`,
          requestId: req.id,
        })
      }
    }

    const subtotal = cartItems.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0)
    // GST: configurable via env, default 5% (Indian restaurant/food)
    const GST_RATE = parseFloat(process.env.GST_RATE) || 0.05
    const tax = parseFloat((subtotal * GST_RATE).toFixed(2))

    // Shipping: lookup zone by pincode from delivery_address (last 6 digits heuristic)
    let delivery_charge = 0
    let shipping_zone_id = null
    const pincodeMatch = (delivery_address || '').match(/\b(\d{6})\b/)
    if (pincodeMatch) {
      const pincode = pincodeMatch[1]
      const [zones] = await conn.query(
        `SELECT * FROM shipping_zones WHERE is_active = 1 AND (',' || pincodes || ',') LIKE ? LIMIT 1`,
        [`%,${pincode},%`]
      )
      if (zones.length) {
        const z = zones[0]
        shipping_zone_id = z.id
        delivery_charge = (z.free_above && subtotal >= z.free_above) ? 0 : Number(z.rate)
      } else {
        // Fallback to default
        delivery_charge = subtotal >= 300 ? 0 : 30
      }
    } else {
      delivery_charge = subtotal >= 300 ? 0 : 30
    }

    const total = parseFloat((subtotal + delivery_charge + tax).toFixed(2))
    const order_number = `SS${Date.now()}`

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, order_number, subtotal, delivery_charge, shipping_zone_id, tax, total, delivery_address, notes, status, payment_status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [req.user.id, order_number, subtotal, delivery_charge, shipping_zone_id, tax, total, delivery_address, notes || '', method === 'cod' ? 'pending' : 'pending', method]
    )
    const orderId = orderResult.insertId

    for (const item of cartItems) {
      const sub = parseFloat((parseFloat(item.price) * item.quantity).toFixed(2))
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.image_url, item.price, item.quantity, sub]
      )
      // Decrement stock
      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      )
    }

    await conn.query(
      `INSERT INTO order_status_history (order_id, status, note) VALUES (?, 'pending', 'Order placed')`,
      [orderId]
    )

    // Earn loyalty points: 1 point per ₹10
    const points = Math.floor(subtotal / 10)
    await conn.query(
      `INSERT INTO loyalty_points (user_id, points) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET points = points + excluded.points`,
      [req.user.id, points]
    )
    await conn.query(
      `INSERT INTO loyalty_transactions (user_id, points, type, description, order_id) VALUES (?, ?, 'earned', ?, ?)`,
      [req.user.id, points, `Earned for order #${order_number}`, orderId]
    )
    await conn.query("UPDATE loyalty_points SET level = CASE WHEN points >= 1500 THEN 'Royal' WHEN points >= 500 THEN 'Gold' ELSE 'Silver' END WHERE user_id = ?", [req.user.id])

    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
    await conn.commit()

    // Send confirmation email (fire and forget)
    const [[user]] = await pool.query('SELECT email, name FROM users WHERE id = ?', [req.user.id])
    if (user) {
      sendEmail({
        to: user.email,
        subject: `Order #${order_number} confirmed 👑`,
        html: orderConfirmationHtml({ order_number, total, delivery_address }, cartItems.map(i => ({
          product_name: i.name,
          quantity: i.quantity,
          subtotal: parseFloat((i.price * i.quantity).toFixed(2)),
        }))),
      }).catch((e) => console.error('order confirmation email failed:', e.message))
    }

    res.status(201).json({ order_id: orderId, order_number, total })
  } catch (err) {
    await conn.rollback()
    console.error('Order error:', err)
    res.status(500).json({ error: 'Order failed' })
  } finally { conn.release() }
}

export const getOrders = async (req, res) => {
  const { limit = 50, offset = 0 } = req.query
  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [req.user.id, Number(limit), Number(offset)]
  )
  for (const order of orders) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id])
    order.items = items
    const [history] = await pool.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', [order.id])
    order.status_history = history
  }
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?', [req.user.id])
  res.json({ items: orders, total, limit: Number(limit), offset: Number(offset) })
}

export const getOrder = async (req, res) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  if (!orders.length) return res.status(404).json({ error: 'Order not found' })
  const order = orders[0]
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id])
  const [history] = await pool.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', [order.id])
  res.json({ ...order, items, status_history: history })
}

export const cancelOrder = async (req, res) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  if (!orders.length) return res.status(404).json({ error: 'Order not found' })
  if (['delivered', 'cancelled'].includes(orders[0].status))
    return res.status(400).json({ error: 'Cannot cancel this order' })
  await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.params.id])
  await pool.query("INSERT INTO order_status_history (order_id, status, note) VALUES (?, 'cancelled', 'Cancelled by customer')", [req.params.id])
  res.json({ success: true })
}

// ── ORDER TRACKING (public) ────────────────────────────────
export const trackOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params
  const [orders] = await pool.query(
    'SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.order_number = ?',
    [orderNumber]
  )
  if (!orders.length) return res.status(404).json({ error: 'Order not found' })
  const order = orders[0]
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id])
  const [history] = await pool.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', [order.id])
  res.json({ ...order, items, status_history: history })
}

// ── WISHLIST SHARING ──────────────────────────────────────
export const createWishlistShare = async (req, res) => {
  const token = crypto.randomUUID()
  await pool.query(
    'INSERT INTO wishlist_shares (user_id, share_token) VALUES (?, ?)',
    [req.user.id, token]
  )
  res.json({ share_token: token, share_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/wishlist/shared/${token}` })
}

export const getSharedWishlist = async (req, res) => {
  const { token } = req.params
  const [shares] = await pool.query('SELECT * FROM wishlist_shares WHERE share_token = ? AND is_active = 1', [token])
  if (!shares.length) return res.status(404).json({ error: 'Shared wishlist not found' })
  const [rows] = await pool.query(
    `SELECT w.id, p.id as product_id, p.name, p.price, p.image_url, p.accent_color, p.badge
     FROM wishlist_items w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
    [shares[0].user_id]
  )
  const [[user]] = await pool.query('SELECT name FROM users WHERE id = ?', [shares[0].user_id])
  res.json({ user_name: user?.name || 'Someone', items: rows })
}

// ── BACK IN STOCK ──────────────────────────────────────────
export const requestBackInStock = async (req, res) => {
  const { product_id, email } = req.body
  await pool.query(
    'INSERT OR IGNORE INTO back_in_stock_requests (product_id, email) VALUES (?, ?)',
    [product_id, email]
  )
  res.json({ success: true, message: 'We will notify you when this product is back in stock!' })
}

// ── BLOG ──────────────────────────────────────────────────
export const getBlogPosts = async (req, res) => {
  const { limit = 50, offset = 0 } = req.query
  const [rows] = await pool.query(
    'SELECT id, title, slug, excerpt, image_url, author, category, tags, created_at FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [Number(limit), Number(offset)]
  )
  res.json({ items: rows })
}

export const getBlogPost = async (req, res) => {
  const { slug } = req.params
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1', [slug])
  if (!rows.length) return res.status(404).json({ error: 'Post not found' })
  res.json(rows[0])
}
