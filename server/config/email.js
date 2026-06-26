import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    console.log('[EMAIL SKIPPED] No EMAIL_USER configured:', { to, subject })
    return
  }
  await transporter.sendMail({
    from: `"Shahi Scoops" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  })
}

export const orderConfirmationHtml = (order, items) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#FFF8F0;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #F7D794">
  <div style="background:#2C1A0E;padding:32px;text-align:center">
    <h1 style="color:#C9A84C;font-family:Georgia,serif;margin:0;font-size:28px">👑 Shahi Scoops</h1>
    <p style="color:#FFF8F0;margin:8px 0 0;font-size:14px">Royal Flavours, Crafted With Love</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#2C1A0E;margin:0 0 8px">Order Confirmed! 🎉</h2>
    <p style="color:#666;margin:0 0 24px">Your royal order <strong>#${order.order_number}</strong> has been placed.</p>
    <div style="background:#FFF8F0;border-radius:8px;padding:16px;margin-bottom:20px">
      ${items.map(i => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F7D794">
          <span style="color:#2C1A0E">${i.product_name} × ${i.quantity}</span>
          <span style="color:#C9A84C;font-weight:600">₹${i.subtotal}</span>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-weight:bold">
        <span style="color:#2C1A0E">Total Paid</span>
        <span style="color:#C9A84C;font-size:18px">₹${order.total}</span>
      </div>
    </div>
    <div style="background:#2C1A0E;border-radius:8px;padding:16px;color:#FFF8F0;font-size:13px">
      <p style="margin:0 0 6px"><strong>Deliver to:</strong> ${order.delivery_address}</p>
      <p style="margin:0"><strong>Estimated time:</strong> 30–45 minutes</p>
    </div>
  </div>
  <div style="background:#F7D794;padding:16px;text-align:center">
    <p style="margin:0;color:#2C1A0E;font-size:12px">Questions? WhatsApp +91 62043 73073</p>
  </div>
</div></body></html>`

export const welcomeHtml = (name) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#FFF8F0;margin:0;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #F7D794">
  <div style="background:#2C1A0E;padding:28px;text-align:center">
    <h1 style="color:#C9A84C;font-family:Georgia,serif;margin:0;font-size:24px">👑 Welcome to Shahi Scoops</h1>
  </div>
  <div style="padding:28px;text-align:center">
    <p style="color:#2C1A0E;font-size:18px">Namaste, <strong>${name}</strong>! 🎉</p>
    <p style="color:#666;line-height:1.6">You've joined the Royal Club. Enjoy exclusive offers, early access to new flavours, and more!</p>
  </div>
</div></body></html>`

const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Being Prepared',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_EMOJIS = {
  pending: '📝',
  confirmed: '✅',
  preparing: '🍦',
  out_for_delivery: '🛵',
  delivered: '🎉',
  cancelled: '❌',
}

export const orderStatusHtml = (order, status, note) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#FFF8F0;margin:0;padding:20px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #F7D794">
  <div style="background:#2C1A0E;padding:28px;text-align:center">
    <h1 style="color:#C9A84C;font-family:Georgia,serif;margin:0;font-size:24px">👑 Shahi Scoops</h1>
  </div>
  <div style="padding:32px;text-align:center">
    <div style="font-size:48px;margin-bottom:8px">${STATUS_EMOJIS[status] || '📦'}</div>
    <h2 style="color:#2C1A0E;margin:0 0 8px">${STATUS_LABELS[status] || status}</h2>
    <p style="color:#666;margin:0 0 16px">Order <strong>#${order.order_number}</strong></p>
    ${note ? `<p style="background:#FFF8F0;border-radius:8px;padding:12px;color:#2C1A0E;margin:0 0 16px">${note}</p>` : ''}
    ${status === 'out_for_delivery' ? '<p style="color:#C9A84C;font-weight:600">Your royal treat is on its way! Estimated arrival: 15–30 min</p>' : ''}
    ${status === 'delivered' ? '<p style="color:#7EC8A4;font-weight:600">Enjoy your scoop! Don\'t forget to leave a review ❤️</p>' : ''}
    ${status === 'cancelled' ? '<p style="color:#E8637A;font-weight:600">Your order has been cancelled. Refund will be processed within 5–7 business days.</p>' : ''}
  </div>
  <div style="background:#F7D794;padding:16px;text-align:center">
    <p style="margin:0;color:#2C1A0E;font-size:12px">Track in your profile or WhatsApp +91 62043 73073</p>
  </div>
</div></body></html>`

export const emailVerificationHtml = (name, link) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#FFF8F0;margin:0;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #F7D794">
  <div style="background:#2C1A0E;padding:28px;text-align:center">
    <h1 style="color:#C9A84C;font-family:Georgia,serif;margin:0;font-size:24px">👑 Verify Your Email</h1>
  </div>
  <div style="padding:32px;text-align:center">
    <p style="color:#2C1A0E;font-size:18px">Namaste, <strong>${name}</strong>!</p>
    <p style="color:#666;line-height:1.6;margin-bottom:24px">Click below to verify your email and unlock all royal features.</p>
    <a href="${link}" style="display:inline-block;background:#C9A84C;color:#2C1A0E;padding:14px 32px;border-radius:24px;text-decoration:none;font-weight:bold">Verify My Email</a>
    <p style="color:#999;font-size:12px;margin-top:24px">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
  </div>
</div></body></html>`

export const passwordResetHtml = (name, link) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#FFF8F0;margin:0;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #F7D794">
  <div style="background:#2C1A0E;padding:28px;text-align:center">
    <h1 style="color:#C9A84C;font-family:Georgia,serif;margin:0;font-size:24px">👑 Reset Password</h1>
  </div>
  <div style="padding:32px;text-align:center">
    <p style="color:#2C1A0E;font-size:18px">Namaste, <strong>${name}</strong>!</p>
    <p style="color:#666;line-height:1.6;margin-bottom:24px">Click below to reset your password. Link valid for 1 hour.</p>
    <a href="${link}" style="display:inline-block;background:#C9A84C;color:#2C1A0E;padding:14px 32px;border-radius:24px;text-decoration:none;font-weight:bold">Reset Password</a>
    <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, ignore this email. Your password will stay safe.</p>
  </div>
</div></body></html>`
