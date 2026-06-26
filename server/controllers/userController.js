import bcrypt from 'bcryptjs'
import pool from '../config/db.js'

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, avatar_url, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch { res.status(500).json({ error: 'Failed to fetch profile' }) }
}

export const updateProfile = async (req, res) => {
  const { name, phone } = req.body
  try {
    await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.user.id])
    const [rows] = await pool.query('SELECT id, name, email, phone, avatar_url FROM users WHERE id = ?', [req.user.id])
    res.json(rows[0])
  } catch { res.status(500).json({ error: 'Update failed' }) }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'Invalid password data' })

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id])
    const valid = await bcrypt.compare(currentPassword, rows[0].password)
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Password change failed' }) }
}

export const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = `/uploads/${req.file.filename}`
  await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [url, req.user.id])
  res.json({ avatar_url: url })
}

export const getAddresses = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id])
  res.json(rows)
}

export const addAddress = async (req, res) => {
  const { label, full_address, city, pincode, is_default } = req.body
  if (!full_address) return res.status(400).json({ error: 'Address is required' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    if (is_default) {
      await conn.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id])
    }
    const [result] = await conn.query(
      'INSERT INTO addresses (user_id, label, full_address, city, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, label || 'Home', full_address, city, pincode, is_default ? 1 : 0]
    )
    await conn.commit()
    res.status(201).json({ id: result.insertId, label, full_address, city, pincode, is_default })
  } catch (e) {
    await conn.rollback()
    res.status(500).json({ error: 'Failed to add address' })
  } finally { conn.release() }
}

export const updateAddress = async (req, res) => {
  const { label, full_address, city, pincode, is_default } = req.body
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    if (is_default) {
      await conn.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id])
    }
    await conn.query(
      'UPDATE addresses SET label=?, full_address=?, city=?, pincode=?, is_default=? WHERE id=? AND user_id=?',
      [label, full_address, city, pincode, is_default ? 1 : 0, req.params.id, req.user.id]
    )
    await conn.commit()
    res.json({ success: true })
  } catch {
    await conn.rollback()
    res.status(500).json({ error: 'Failed to update address' })
  } finally { conn.release() }
}

export const deleteAddress = async (req, res) => {
  await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  res.json({ success: true })
}

export const deleteAccount = async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Password required to confirm deletion' })

  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id])
  if (!rows.length) return res.status(404).json({ error: 'User not found' })
  const valid = await bcrypt.compare(password, rows[0].password)
  if (!valid) return res.status(400).json({ error: 'Password is incorrect' })

  // Hard delete (cascades via FK not set — explicit cleanup)
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM wishlist_items WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM addresses WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM reviews WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM quiz_results WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM loyalty_transactions WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM loyalty_points WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [req.user.id])
  await pool.query('DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [req.user.id])
  await pool.query('DELETE FROM orders WHERE user_id = ?', [req.user.id])
  await pool.query('DELETE FROM users WHERE id = ?', [req.user.id])

  res.clearCookie('refreshToken')
  res.json({ success: true, message: 'Account deleted' })
}

// GDPR data export — returns all user data as a downloadable JSON bundle
export const exportData = async (req, res) => {
  const userId = req.user.id
  const [profile] = await pool.query(
    'SELECT id, name, email, phone, role, email_verified, two_factor_enabled, created_at FROM users WHERE id = ?',
    [userId]
  )
  const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [userId])
  const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ?', [userId])
  const [orderItems] = await pool.query(
    'SELECT oi.* FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ?',
    [userId]
  )
  const [reviews] = await pool.query('SELECT * FROM reviews WHERE user_id = ?', [userId])
  const [quizResults] = await pool.query('SELECT * FROM quiz_results WHERE user_id = ?', [userId])
  const [loyalty] = await pool.query('SELECT * FROM loyalty_points WHERE user_id = ?', [userId])
  const [loyaltyTx] = await pool.query('SELECT * FROM loyalty_transactions WHERE user_id = ?', [userId])

  const exportBundle = {
    exportedAt: new Date().toISOString(),
    dataSubject: { id: userId, email: req.user.email },
    profile: profile[0] || null,
    addresses,
    orders,
    orderItems,
    reviews,
    quizResults,
    loyaltyPoints: loyalty,
    loyaltyTransactions: loyaltyTx,
    rightsNotice: 'You have the right to rectification, erasure, and portability under GDPR Art. 15-20.',
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="shahi-scoops-data-${userId}.json"`)
  res.send(JSON.stringify(exportBundle, null, 2))
}
