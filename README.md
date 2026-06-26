# 👑 Shahi Scoops — Full Stack Production Website

Premium Indian ice cream brand website with complete ecommerce functionality. **Ready for client delivery.**

## Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Framer Motion
- **Backend:** Node.js 24 + Express.js (no native deps)
- **Database:** SQLite via built-in `node:sqlite` (zero install, zero native build)
- **Auth:** JWT (access 15min + refresh 7d in httpOnly cookie)
- **Payments:** Razorpay with automatic sandbox fallback (works without API keys)
- **Email:** Nodemailer (Gmail App Password or any SMTP)
- **Validation:** express-validator
- **Logging:** pino with PII redaction
- **Security:** helmet, CORS allowlist, rate-limit, HSTS, CSRF, Sentry-ready
- **Deployment:** Docker + nginx, or any Node host

---

## ⚡ Quick Start (Local Dev — under 60 seconds)

```bash
# 1. Install frontend deps
npm install

# 2. Install backend deps
cd server && npm install && cd ..

# 3. Start both servers (separate windows or use start-wmi.ps1)
#    Backend:  cd server && npm run dev   (port 5000)
#    Frontend: npm run dev                (port 5173)

# 4. Open http://localhost:5173
```

DB is auto-created at `server/data/shahi_scoops.db` on first server start, with 12 products + admin user.

### Default Admin Login
```
Email:    admin@shahiscoops.com
Password: admin123
```
**Change this in production** (edit `server/.env` ADMIN_EMAIL/ADMIN_PASSWORD, then re-seed).

---

## 📁 What's Included

| ✅ | Feature |
|---|---|
| ✅ | Home page with hero, stats, story, flavours, combos, gift cards, gallery, testimonials, FAQ, newsletter, contact, footer |
| ✅ | Product detail pages with reviews |
| ✅ | Cart with add/update/remove + localStorage persistence |
| ✅ | Wishlist with toggle from any product |
| ✅ | Auth: register, login, forgot/reset password, email verify, JWT refresh |
| ✅ | 2FA (TOTP) setup in profile |
| ✅ | Google OAuth login |
| ✅ | Checkout with COD + Razorpay online payment (sandbox mode for dev) |
| ✅ | Order history + cancel + reorder |
| ✅ | Loyalty points (1 pt / ₹10) with Silver/Gold/Royal tiers |
| ✅ | Profile dashboard (orders, addresses, wishlist, change password, delete account) |
| ✅ | GDPR data export (download all your data) |
| ✅ | Admin dashboard (stats, products, orders, customers, reviews) |
| ✅ | Reviews with photo upload + admin approval |
| ✅ | Newsletter subscription |
| ✅ | "Find your flavour" quiz with personalised recommendations |
| ✅ | PWA: service worker, manifest, install prompt, offline support |
| ✅ | Dark mode toggle |
| ✅ | Cookie consent banner |
| ✅ | Terms of Service + Privacy Policy pages |
| ✅ | Custom 404 page |
| ✅ | SEO: meta tags, Open Graph, Twitter card, JSON-LD, sitemap.xml, robots.txt |
| ✅ | Accessibility: skip-link, ARIA labels, keyboard nav, focus management |
| ✅ | Error boundary, boot error overlay (dev), 404 with request ID |
| ✅ | OpenAPI / Swagger UI at `/api/docs/ui` |
| ✅ | Automated DB backup + restore |
| ✅ | 17/17 tests passing (unit + integration) |

---

## 🧪 Test Coverage

```bash
cd server
npm test              # all 17 tests (sequential)
npm run test:unit     # 7 fast unit tests (no server needed)
npm run test:integration  # 10 integration tests (server must be running)
```

What's tested:
- **Unit (7):** SQL preprocessor (NOW/CURDATE/INSERT IGNORE), parameter normalization (Date, boolean, bigint), email/phone/pagination validators
- **Integration (10):** health check, register validation, successful register, login bad creds, products pagination, limit cap, 404 with requestId, full user flow (register → wishlist → cart → order), auth required, loyalty points

---

## 🏗️ Project Structure

```
shahi-final/
├── public/                    # Static files copied to dist/
│   ├── favicon.svg            # Gold crown SVG
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt             # SEO (disallow /admin, /api)
│   ├── sitemap.xml            # Sitemap
│   ├── sw.js                  # Service worker (cache-first static, network-first API)
│   ├── _redirects             # Netlify-style SPA fallback
│   └── icons.svg              # Social share icons
├── src/                       # React frontend
│   ├── components/            # 40+ UI components (Hero, Flavours, Cart, etc.)
│   │   ├── auth/              # ProtectedRoute
│   │   ├── cart/              # CartDrawer
│   │   ├── ErrorBoundary.jsx  # Catches render errors
│   │   ├── Preloader.jsx      # Branded loader
│   │   └── ... 40+ more
│   ├── pages/                 # Route-level pages
│   │   ├── LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage
│   │   ├── ProfileDashboard, WishlistPage
│   │   ├── CheckoutPage, PaymentSuccessPage
│   │   ├── ProductPage, AdminDashboard
│   │   ├── TermsPage, PrivacyPage
│   │   └── NotFoundPage
│   ├── context/               # AuthContext, CartContext, ThemeContext
│   ├── hooks/                 # useApi (with auto refresh-token)
│   ├── config/                # sentry.js, analytics.js (CDN lazy-loaded)
│   ├── data/                  # Static flavour data
│   ├── App.jsx                # Routes + providers + ErrorBoundary
│   ├── main.jsx               # Boot (Sentry, Plausible, SW registration, error overlay)
│   └── index.css              # Tailwind v4 + theme tokens
├── server/                    # Express backend
│   ├── config/
│   │   ├── db.js              # node:sqlite + schema + seed + migrations + pool shim
│   │   ├── logger.js          # pino with redaction
│   │   └── sentry.js          # Sentry init (no-op without DSN)
│   ├── controllers/           # auth, user, shop, admin, payment, feature, coupon, oauth
│   ├── middleware/            # auth, validators, csrf, errorHandler
│   ├── routes/index.js        # All API routes
│   ├── utils/                 # jwt, email
│   ├── scripts/               # generate-secrets, backup, restore
│   ├── test/                  # unit + integration tests
│   ├── data/                  # SQLite DB (auto-created, gitignored)
│   ├── Dockerfile             # node:24-alpine
│   └── index.js               # Express app + middleware chain
├── .github/workflows/ci.yml   # GitHub Actions (test + build + Docker)
├── Dockerfile                 # Frontend build + nginx serve
├── docker-compose.yml         # API + nginx web
├── nginx.conf                 # SPA + gzip + security headers + /api proxy
├── vite.config.js             # Vite + React + Tailwind v4
├── index.html                 # SEO meta, Open Graph, JSON-LD, PWA
├── vercel.json                # Vercel SPA config (optional)
└── package.json
```

---

## 🔌 API Reference

All endpoints under `/api`. Auth required = `Authorization: Bearer <accessToken>` or session cookie.

### Auth
- `POST /auth/register` — `{ name, email, password }` → `{ user, accessToken }` + refresh cookie
- `POST /auth/login` — `{ email, password }` → same
- `POST /auth/logout` — clears refresh cookie
- `POST /auth/refresh-token` — issues new access token
- `GET  /auth/me` — current user
- `POST /auth/forgot-password` — sends email with reset link
- `POST /auth/reset-password` — `{ token, password }`
- `POST /auth/2fa/setup`, `/verify-setup`, `/disable` — TOTP
- `GET  /auth/google`, `/auth/google/callback` — OAuth

### User
- `GET    /users/profile` / `PUT /users/profile`
- `PUT    /users/password`
- `POST   /users/avatar` (multipart, max 2MB, image MIME only)
- `GET    /users/addresses` / `POST` / `PUT /:id` / `DELETE /:id`
- `DELETE /users/account` — `{ password }` — full cascade delete (GDPR)
- `GET    /users/export` — JSON download of all user data (GDPR)

### Shop
- `GET    /products?limit=20&offset=0&search=&category=&featured=` — paginated, public
- `GET    /products/:id`
- `GET    /cart` / `POST /cart` / `PUT /cart/:id` / `DELETE /cart/:id` / `DELETE /cart`
- `GET    /wishlist` / `POST /wishlist` / `DELETE /wishlist/:product_id`
- `POST   /orders` / `GET /orders?limit=20&offset=0` / `GET /orders/:id` / `POST /orders/:id/cancel`
- `GET    /reviews/:product_id` / `POST /reviews` (multipart, auth)
- `GET    /loyalty` / `POST /loyalty/redeem`
- `GET    /recommendations/:product_id`
- `POST   /coupons/validate`

### Payments
- `POST /payments/create-order` — Razorpay (sandbox-aware)
- `POST /payments/verify` — verifies signature
- `POST /payments/webhook` — Razorpay webhook (raw body, no CSRF)

### Admin (admin role required)
- `GET  /admin/stats`
- `GET  /admin/products?limit=20&offset=0` / `POST` / `PUT /:id` / `DELETE /:id` / `PATCH /:id/toggle`
- `POST /admin/products/:id/image` (multipart)
- `GET  /admin/orders?limit=20&offset=0` / `PATCH /orders/:id/status`
- `GET  /admin/customers?limit=20&offset=0`
- `GET  /admin/reviews?limit=20&offset=0` / `PATCH /:id/approve` / `DELETE /:id`
- `GET  /admin/coupons` / `POST` / `DELETE /:id`

### Marketing
- `POST /newsletter/subscribe`
- `POST /quiz/result`
- `POST /contact`

### Misc
- `GET /health` — `{ status, db, uptime, timestamp }` for load balancers
- `GET /api/docs` — OpenAPI 3.0 JSON spec
- `GET /api/docs/ui` — Swagger UI
- `*` — 404 with `requestId`

Full interactive API docs: **`http://localhost:5000/api/docs/ui`**

---

## 🚀 Production Deployment

See **[DELIVERY.md](./DELIVERY.md)** for the complete step-by-step production deployment guide.

### TL;DR Docker
```bash
# 1. Generate secrets
cd server && npm run secrets
cd ..

# 2. Set secrets in server/.env.production
cp server/.env.production.example server/.env.production
$EDITOR server/.env.production
#   Set: NODE_ENV=production, JWT_*, COOKIE_SECURE=1, CORS_ORIGINS, EMAIL_*, RAZORPAY_*, SENTRY_DSN

# 3. Build and run
docker compose up -d --build

# 4. Verify
curl https://yourdomain.com/health
```

### TL;DR Manual
```bash
# Backend
cd server
npm ci --omit=dev
NODE_ENV=production npm start

# Frontend
cd ..
npm ci
npm run build
# Serve dist/ with any static host (nginx, Caddy, S3+CloudFront, etc.)
```

---

## 💳 Payment Modes

The backend auto-detects payment mode at startup:

| Condition | Mode | Behavior |
|---|---|---|
| `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` set to real values | **LIVE** | Real Razorpay API calls |
| Keys missing, empty, or contain "placeholder/your_" | **SANDBOX** | Mock order ID, simulated verify, order marked paid |
| `PAYMENT_SANDBOX=true` in env | **SANDBOX (forced)** | Always sandbox, regardless of keys |

**Sandbox UX in the frontend**: shows a yellow ⚙️ banner on the payment step with clear instructions on how to enable real payments, button changes to "Simulate Payment of ₹X".

To switch to live:
1. Sign up at [razorpay.com](https://razorpay.com), complete KYC
2. Get test keys from Settings → API Keys
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`
4. Restart backend → logs `[payments] Razorpay mode: LIVE`

---

## 🔐 Security Features

- ✅ Helmet (HSTS 1yr with preload, X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ CORS with explicit origin allowlist (no wildcards)
- ✅ Rate limiting: 30/15min auth, 300/60s API
- ✅ CSRF protection (Origin/Referer check + `X-Requested-By` bypass for tests)
- ✅ Input validation on all routes (express-validator)
- ✅ Password hashing with bcrypt (cost 12 for admin, 10 for users)
- ✅ JWT in httpOnly cookies (refresh), localStorage (access — auto-refreshed)
- ✅ SQL injection prevention (parameterized queries everywhere)
- ✅ File upload restrictions: image MIME types only, 2MB max, UUID filenames
- ✅ Trust proxy for accurate client IPs behind reverse proxy
- ✅ HTTPS redirect in production
- ✅ Secrets in env (not in repo), example files for production
- ✅ Request ID for log correlation (`X-Request-ID` header)
- ✅ Error redaction (no stack traces leaked in prod)
- ✅ PII redaction in logs (auth, password, token, cookie)
- ✅ Account deletion with full cascade (GDPR-compliant)
- ✅ Cookie consent banner
- ✅ Terms of Service + Privacy Policy pages
- ✅ Content Security Policy (production only, with Razorpay + Sentry exceptions)

---

## 🗄️ Database

SQLite via `node:sqlite` (built-in, zero install). DB file at `server/data/shahi_scoops.db`. WAL mode for concurrent reads.

### Schema (19 tables)
`users`, `refresh_tokens`, `password_reset_tokens`, `oauth_accounts`, `addresses`, `products`, `categories`, `product_categories`, `cart_items`, `wishlist_items`, `orders`, `order_items`, `order_status_history`, `reviews`, `quiz_results`, `loyalty_points`, `loyalty_transactions`, `coupons`, `newsletter_subscribers`, `contact_messages`, `shipping_zones`, `_migrations`

All auto-created on first server start. Seed: 12 products + 1 admin user + 4 shipping zones + 2 sample coupons.

### Migrations (8)
Tracked in `_migrations` table. Idempotent and forward-only.

1. `2026_06_06_001_products_stock` — adds `stock` to products
2. `2026_06_06_002_products_low_stock` — adds `low_stock_threshold`
3. `2026_06_06_003_users_email_verified` — adds `email_verified` to users
4. `2026_06_06_004_users_verify_token` — adds `email_verify_token`, `email_verify_expires`
5. `2026_06_06_005_users_2fa` — adds `two_factor_secret`, `two_factor_enabled`
6. `2026_06_06_006_orders_shipping_zone` — adds `shipping_zone_id` to orders
7. `2026_06_06_007_orders_payment_method` — adds `payment_method` to orders
8. `2026_06_07_008_orders_razorpay` — adds `razorpay_order_id`, `razorpay_payment_id`

To add a new migration: append to the `MIGRATIONS` array in `server/config/db.js`. Never edit applied ones.

### Backups
```bash
# Manual
cd server
npm run backup                    # creates backups/shahi-YYYYMMDD-HHmmss.db
npm run restore -- <filename>     # restore from a backup

# Cron (daily at 3am)
0 3 * * * cd /app/server && npm run backup
```

Old backups are auto-pruned to keep last 14 by default (override with `BACKUP_KEEP` env var).

---

## 📜 License

MIT
