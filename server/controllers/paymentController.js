import Razorpay from 'razorpay'
import crypto from 'crypto'
import pool from '../config/db.js'
import { sendEmail, orderConfirmationHtml } from '../config/email.js'
import dotenv from 'dotenv'
dotenv.config()

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const isPlaceholder = (v) => !v || /placeholder|your_|_placeholder$|example|test_key_id|test_key$/i.test(v)
const SANDBOX_MODE = isPlaceholder(RAZORPAY_KEY_ID) || isPlaceholder(RAZORPAY_KEY_SECRET) ||
  process.env.PAYMENT_SANDBOX === 'true'

console.log(`[payments] Razorpay mode: ${SANDBOX_MODE ? 'SANDBOX (no real API call)' : 'LIVE'}`)

const razorpay = SANDBOX_MODE ? null : new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
})

const markOrderPaid = async (orderId, userId, paymentId) => {
  await pool.query(
    `UPDATE orders SET
      payment_status = 'paid',
      status = 'confirmed',
      razorpay_payment_id = ?
     WHERE id = ?`,
    [paymentId, orderId]
  )
  await pool.query(
    `INSERT INTO order_status_history (order_id, status, note) VALUES (?, 'confirmed', 'Payment confirmed')`,
    [orderId]
  )
  await sendOrderEmail(orderId, userId)
}

export const createRazorpayOrder = async (req, res) => {
  const { order_id } = req.body
  if (!order_id) return res.status(400).json({ error: 'order_id required' })

  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, req.user.id]
    )
    if (!orders.length) return res.status(404).json({ error: 'Order not found' })

    const order = orders[0]
    const amountPaise = Math.round(parseFloat(order.total) * 100)

    if (SANDBOX_MODE) {
      // Sandbox: no real Razorpay call — generate a mock order id, mark order as paid immediately
      const mockOrderId = `sandbox_order_${order.id}_${Date.now()}`
      await pool.query(
        'UPDATE orders SET razorpay_order_id = ? WHERE id = ?',
        [mockOrderId, order.id]
      )
      return res.json({
        sandbox: true,
        message: 'Running in payment sandbox — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env to enable real payments',
        razorpay_order_id: mockOrderId,
        amount: amountPaise,
        currency: 'INR',
        key_id: null,
        order_id: order.id,
        order_number: order.order_number,
        total: parseFloat(order.total),
      })
    }

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order.order_number,
      notes: { order_id: order.id, user_id: req.user.id },
    })

    await pool.query(
      'UPDATE orders SET razorpay_order_id = ? WHERE id = ?',
      [rzpOrder.id, order.id]
    )

    res.json({
      sandbox: false,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay order error:', err)
    res.status(500).json({ error: 'Payment initiation failed', detail: err.message })
  }
}

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sandbox } = req.body

  if (!razorpay_order_id || !razorpay_payment_id)
    return res.status(400).json({ error: 'Missing payment verification fields' })

  // Sandbox path: skip signature check, just confirm
  if (sandbox && SANDBOX_MODE) {
    try {
      const [orders] = await pool.query(
        'SELECT * FROM orders WHERE razorpay_order_id = ? AND user_id = ?',
        [razorpay_order_id, req.user.id]
      )
      if (!orders.length) return res.status(404).json({ error: 'Order not found' })
      await markOrderPaid(orders[0].id, req.user.id, razorpay_payment_id)
      return res.json({
        success: true,
        order_id: orders[0].id,
        order_number: orders[0].order_number,
        sandbox: true,
      })
    } catch (err) {
      console.error('Sandbox verify error:', err)
      return res.status(500).json({ error: 'Sandbox verification failed' })
    }
  }

  if (!razorpay_signature)
    return res.status(400).json({ error: 'Missing payment signature' })

  // CRITICAL: Always verify on backend
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET || 'placeholder')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature)
    return res.status(400).json({ error: 'Payment verification failed — invalid signature' })

  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE razorpay_order_id = ? AND user_id = ?',
      [razorpay_order_id, req.user.id]
    )
    if (!orders.length) return res.status(404).json({ error: 'Order not found' })

    const order = orders[0]

    await markOrderPaid(order.id, req.user.id, razorpay_payment_id)

    res.json({ success: true, order_id: order.id, order_number: order.order_number })
  } catch (err) {
    console.error('Verify payment error:', err)
    res.status(500).json({ error: 'Payment verification failed' })
  }
}

const sendOrderEmail = async (orderId, userId) => {
  try {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId])
    const [users] = await pool.query('SELECT email, name FROM users WHERE id = ?', [userId])
    if (users.length) {
      const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId])
      const order = orderRows[0]
      sendEmail({
        to: users[0].email,
        subject: `Order Confirmed #${order.order_number} 👑`,
        html: orderConfirmationHtml(order, items),
      }).catch(() => {})
    }
  } catch {}
}

export const razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature']
  const body = JSON.stringify(req.body)

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature)
    return res.status(400).json({ error: 'Invalid webhook signature' })

  const { event, payload } = req.body

  if (event === 'payment.captured') {
    const paymentId = payload.payment.entity.id
    const orderId = payload.payment.entity.order_id
    await pool.query(
      `UPDATE orders SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = ?
       WHERE razorpay_order_id = ? AND payment_status = 'pending'`,
      [paymentId, orderId]
    ).catch(() => {})
  }

  if (event === 'payment.failed') {
    const orderId = payload.payment.entity.order_id
    await pool.query(
      `UPDATE orders SET payment_status = 'failed' WHERE razorpay_order_id = ?`,
      [orderId]
    ).catch(() => {})
  }

  res.json({ received: true })
}
