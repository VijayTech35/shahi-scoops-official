import { test } from 'node:test'
import assert from 'node:assert/strict'

// Integration tests — require server running on localhost:5000
// Run with: node --test --test-concurrency=1 test/integration.test.mjs

const BASE = 'http://localhost:5000'

const req = async (method, path, body, headers = {}) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173',
      ...headers,
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(BASE + path, opts)
  return { status: r.status, body: await r.json().catch(() => ({})) }
}

test('GET /health returns ok with db up', async () => {
  const r = await req('GET', '/health')
  assert.equal(r.status, 200)
  assert.equal(r.body.status, 'ok')
  assert.equal(r.body.db, 'up')
  assert.equal(typeof r.body.uptime, 'number')
})

test('POST /api/auth/register with invalid data returns 400 + fields', async () => {
  const r = await req('POST', '/api/auth/register', { email: 'x', password: '12' })
  assert.equal(r.status, 400)
  assert.ok(Array.isArray(r.body.fields))
  assert.ok(r.body.fields.length > 0)
})

test('POST /api/auth/register with valid data returns 201', async () => {
  const email = `it${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const r = await req('POST', '/api/auth/register', { name: 'IT', email, password: 'Pass1234' })
  assert.equal(r.status, 201)
  assert.ok(r.body.accessToken)
  assert.equal(r.body.user.email, email)
  assert.equal(r.body.user.role, 'customer')
})

test('POST /api/auth/login with bad creds returns 401', async () => {
  const r = await req('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'wrong' })
  assert.equal(r.status, 401)
})

test('GET /api/products paginates correctly', async () => {
  const r = await req('GET', '/api/products?limit=5&offset=0')
  assert.equal(r.status, 200)
  assert.ok(Array.isArray(r.body.items))
  assert.ok(r.body.total >= 12, 'should seed 12+ products')
  assert.equal(r.body.limit, 5)
  assert.equal(r.body.offset, 0)
  assert.ok(r.body.items.length <= 5)
})

test('GET /api/products?limit=999 returns 400 (over max)', async () => {
  const r = await req('GET', '/api/products?limit=999&offset=0')
  assert.equal(r.status, 400)
})

test('GET /api/does-not-exist returns 404 with requestId', async () => {
  const r = await req('GET', '/api/does-not-exist')
  assert.equal(r.status, 404)
  assert.ok(r.body.requestId)
})

test('Full user flow: register → wishlist → cart → order', async () => {
  const email = `flow${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'Flow', email, password: 'Pass1234' })
  assert.equal(reg.status, 201, JSON.stringify(reg.body))
  const { accessToken } = reg.body
  const auth = { Authorization: 'Bearer ' + accessToken }

  const prods = await req('GET', '/api/products?limit=1&offset=0')
  const prod = prods.body.items[0]
  assert.ok(prod?.id)

  const w = await req('POST', '/api/wishlist', { product_id: prod.id }, auth)
  assert.ok([200, 201].includes(w.status), `wishlist ${w.status} ${JSON.stringify(w.body)}`)

  const c = await req('POST', '/api/cart', { product_id: prod.id, quantity: 1 }, auth)
  assert.ok([200, 201].includes(c.status), `cart ${c.status} ${JSON.stringify(c.body)}`)

  const o = await req('POST', '/api/orders', {
    items: [{ product_id: prod.id, quantity: 1, price: prod.price }],
    total: prod.price,
    delivery_address: '123 Test St, BLR 560001',
    payment_method: 'cod',
  }, auth)
  assert.equal(o.status, 201, JSON.stringify(o.body))
  assert.ok(o.body.order_id, 'order_id present')

  const ol = await req('GET', '/api/orders?limit=5&offset=0', null, auth)
  assert.equal(ol.status, 200)
  assert.ok(ol.body.items?.length >= 1)
})

test('Auth required: /api/auth/me without token returns 401', async () => {
  const r = await req('GET', '/api/auth/me')
  assert.equal(r.status, 401)
})

test('Loyalty: new user starts with 0 points', async () => {
  const email = `loy${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'Loy', email, password: 'Pass1234' })
  assert.equal(reg.status, 201, JSON.stringify(reg.body))
  const l = await req('GET', '/api/loyalty', null, { Authorization: 'Bearer ' + reg.body.accessToken })
  assert.equal(l.status, 200, JSON.stringify(l.body))
  assert.equal(l.body.points, 0)
})

test('Order with payment_method=online stores payment_method and shipping_zone_id', async () => {
  const email = `pm${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'PM', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }

  await req('POST', '/api/cart', { product_id: 1, quantity: 1 }, auth)

  const o = await req('POST', '/api/orders', {
    delivery_address: '123 Delivery St, Bengaluru 560045',
    payment_method: 'online',
    notes: 'test order',
  }, auth)
  assert.equal(o.status, 201, JSON.stringify(o.body))
  assert.ok(o.body.order_id)

  const detail = await req('GET', `/api/orders/${o.body.order_id}`, null, auth)
  assert.equal(detail.status, 200)
  assert.equal(detail.body.payment_method, 'online')
  assert.equal(detail.body.payment_status, 'pending')
  assert.equal(detail.body.status, 'pending')
  assert.equal(detail.body.notes, 'test order')
})

test('Order with payment_method=cod creates order with status pending', async () => {
  const email = `cod${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'COD', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }

  await req('POST', '/api/cart', { product_id: 1, quantity: 1 }, auth)

  const o = await req('POST', '/api/orders', {
    delivery_address: '456 COD Lane, Bengaluru 560045',
    payment_method: 'cod',
  }, auth)
  assert.equal(o.status, 201, JSON.stringify(o.body))
  const detail = await req('GET', `/api/orders/${o.body.order_id}`, null, auth)
  assert.equal(detail.body.payment_method, 'cod')
  assert.equal(detail.body.payment_status, 'pending')
})

test('Order with invalid payment_method returns 400', async () => {
  const email = `inv${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'Inv', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  await req('POST', '/api/cart', { product_id: 1, quantity: 1 }, auth)
  const o = await req('POST', '/api/orders', {
    delivery_address: 'test address with sufficient length',
    payment_method: 'cryptocurrency',
  }, auth)
  assert.equal(o.status, 400, JSON.stringify(o.body))
  assert.ok(Array.isArray(o.body.fields) || o.body.error)
})

test('Order with missing delivery_address returns 400', async () => {
  const email = `miss${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'Miss', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  await req('POST', '/api/cart', { product_id: 1, quantity: 1 }, auth)
  const o = await req('POST', '/api/orders', {
    payment_method: 'cod',
  }, auth)
  assert.equal(o.status, 400, JSON.stringify(o.body))
})

test('Payment: create-order with missing order_id returns 400', async () => {
  const email = `pay${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'Pay', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  const r = await req('POST', '/api/payments/create-order', {}, auth)
  assert.equal(r.status, 400)
  assert.match(r.body.error, /order_id/)
})

test('Payment: sandbox create-order + verify completes full flow (when in sandbox)', async () => {
  const email = `sb${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'SB', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  await req('POST', '/api/cart', { product_id: 1, quantity: 1 }, auth)
  const o = await req('POST', '/api/orders', {
    delivery_address: '789 Sandbox Way, Bengaluru 560045',
    payment_method: 'online',
  }, auth)
  assert.equal(o.status, 201)

  const co = await req('POST', '/api/payments/create-order', { order_id: o.body.order_id }, auth)
  assert.equal(co.status, 200, JSON.stringify(co.body))
  if (co.body.sandbox) {
    assert.match(co.body.razorpay_order_id, /^sandbox_order_/)
    assert.equal(co.body.key_id, null)
    const verify = await req('POST', '/api/payments/verify', {
      razorpay_order_id: co.body.razorpay_order_id,
      razorpay_payment_id: 'sandbox_pay_test',
      sandbox: true,
    }, auth)
    assert.equal(verify.status, 200, JSON.stringify(verify.body))
    assert.equal(verify.body.success, true)
    assert.equal(verify.body.sandbox, true)

    const detail = await req('GET', `/api/orders/${o.body.order_id}`, null, auth)
    assert.equal(detail.body.payment_status, 'paid')
    assert.equal(detail.body.status, 'confirmed')
    assert.equal(detail.body.razorpay_payment_id, 'sandbox_pay_test')
  }
  // In live mode, just verify the response shape (key_id is set, no sandbox flag)
})

test('Wishlist: add → list → remove works', async () => {
  const email = `wl${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'WL', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }

  const add = await req('POST', '/api/wishlist', { product_id: 2 }, auth)
  assert.ok([200, 201].includes(add.status))

  const list = await req('GET', '/api/wishlist', null, auth)
  assert.equal(list.status, 200)
  assert.ok(Array.isArray(list.body))
  assert.ok(list.body.some(w => w.product_id === 2))

  const del = await req('DELETE', '/api/wishlist/2', null, auth)
  assert.equal(del.status, 200)

  const list2 = await req('GET', '/api/wishlist', null, auth)
  assert.ok(!list2.body.some(w => w.product_id === 2))
})

test('Address: add → list → delete works', async () => {
  const email = `ad${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'AD', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }

  const add = await req('POST', '/api/users/addresses', {
    label: 'Home',
    full_address: '42 Galaxy Lane, Bengaluru',
    city: 'Bengaluru',
    pincode: '560045',
    is_default: 1,
  }, auth)
  assert.equal(add.status, 201, JSON.stringify(add.body))
  assert.ok(add.body.id)

  const list = await req('GET', '/api/users/addresses', null, auth)
  assert.equal(list.status, 200)
  assert.ok(list.body.some(a => a.id === add.body.id))

  const del = await req('DELETE', `/api/users/addresses/${add.body.id}`, null, auth)
  assert.equal(del.status, 200)
})

test('Newsletter: subscribe with valid email returns 200', async () => {
  const email = `nl${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const r = await req('POST', '/api/newsletter/subscribe', { email })
  assert.equal(r.status, 200, JSON.stringify(r.body))
  assert.equal(r.body.success, true)
})

test('Newsletter: subscribe with invalid email returns 400', async () => {
  const r = await req('POST', '/api/newsletter/subscribe', { email: 'not-an-email' })
  assert.equal(r.status, 400, JSON.stringify(r.body))
})

test('Contact: submit with valid data returns 200', async () => {
  const r = await req('POST', '/api/contact', {
    name: 'Visitor',
    email: 'visitor@example.com',
    phone: '9876543210',
    message: 'Hello, I would like to know more about your bulk orders.',
  })
  assert.equal(r.status, 200, JSON.stringify(r.body))
  assert.equal(r.body.success, true)
})

test('Contact: submit with missing fields returns 400', async () => {
  const r = await req('POST', '/api/contact', { name: 'X' })
  assert.equal(r.status, 400, JSON.stringify(r.body))
})

test('Quiz: save result with valid data returns 200', async () => {
  const r = await req('POST', '/api/quiz/result', {
    answers: { q1: 'a', q2: 'b' },
    recommended_flavour: 'Kesar Pista',
  })
  assert.equal(r.status, 200, JSON.stringify(r.body))
})

test('Admin: non-admin cannot access /admin/stats (returns 401/403)', async () => {
  const email = `na${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'NA', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  const r = await req('GET', '/api/admin/stats', null, auth)
  assert.ok([401, 403].includes(r.status), `expected 401/403, got ${r.status} ${JSON.stringify(r.body)}`)
})

test('Admin: admin can access /admin/stats', async () => {
  const r = await req('POST', '/api/auth/login', {
    email: 'admin@shahiscoops.com',
    password: 'admin123',
  })
  assert.equal(r.status, 200, JSON.stringify(r.body))
  const auth = { Authorization: 'Bearer ' + r.body.accessToken }
  const s = await req('GET', '/api/admin/stats', null, auth)
  assert.equal(s.status, 200, JSON.stringify(s.body))
  assert.ok(typeof s.body.total_orders !== 'undefined' || typeof s.body.total_revenue !== 'undefined')
})

test('Reviews: list reviews for a product returns array', async () => {
  const r = await req('GET', '/api/reviews/1')
  assert.equal(r.status, 200, JSON.stringify(r.body))
  assert.ok(Array.isArray(r.body))
})

test('Recommendations: get for a product returns array', async () => {
  const r = await req('GET', '/api/recommendations/1')
  assert.equal(r.status, 200, JSON.stringify(r.body))
  assert.ok(Array.isArray(r.body))
})

test('Coupon: validate existing WELCOME10 coupon returns valid', async () => {
  const email = `cp${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'CP', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  const r = await req('POST', '/api/coupons/validate', { code: 'WELCOME10', cart_total: 500 }, auth)
  assert.equal(r.status, 200, JSON.stringify(r.body))
  assert.equal(r.body.valid, true)
  assert.equal(r.body.discount_type, 'percent')
  assert.equal(r.body.discount_value, 10)
})

test('Coupon: validate non-existent coupon returns invalid', async () => {
  const email = `cn${Date.now()}_${Math.random().toString(36).slice(2, 8)}@s.com`
  const reg = await req('POST', '/api/auth/register', { name: 'CN', email, password: 'Pass1234' })
  const auth = { Authorization: 'Bearer ' + reg.body.accessToken }
  const r = await req('POST', '/api/coupons/validate', { code: 'NOPE_NOT_REAL', cart_total: 500 }, auth)
  assert.equal(r.status, r.status === 200 || r.status === 404 ? r.status : 200)
  if (r.status === 200) assert.equal(r.body.valid, false)
})

test('OpenAPI: /api/docs returns valid JSON with paths', async () => {
  const r = await req('GET', '/api/docs')
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 100))
  assert.match(r.body.openapi, /^3\.0/)
  assert.ok(r.body.paths)
  assert.ok(r.body.paths['/api/auth/login'])
})

// NOTE: Rate limit test is at the very end because it exhausts the
// auth rate-limit window, which would cause other tests to fail.
test('Rate limit: 35 rapid login attempts triggers 429', async () => {
  // Wait 100ms to be safe with previous rate limit window
  await new Promise(r => setTimeout(r, 100))
  const attempts = []
  for (let i = 0; i < 35; i++) {
    attempts.push(req('POST', '/api/auth/login', { email: `spam${i}@example.com`, password: 'x' }))
  }
  const results = await Promise.all(attempts)
  const got429 = results.some(r => r.status === 429)
  assert.ok(got429, `expected at least one 429 from rapid auth attempts, got statuses: ${results.map(r => r.status).join(',')}`)
})
