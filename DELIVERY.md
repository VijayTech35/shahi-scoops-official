# 📦 Shahi Scoops — Delivery Package

**Project:** Shahi Scoops — Royal Flavours, Crafted With Love  
**Domain:** https://shahiscoops.com  
**Delivery date:** 2026-06-07  
**Status:** Production-ready, 17/17 tests passing, build clean

---

## ✅ What's in this delivery

| Item | Location | Status |
|---|---|---|
| Source code (frontend + backend) | `/` and `/server` | ✅ Ready |
| Database schema (auto-created) | `server/config/db.js` | ✅ Ready |
| Migrations (8 applied) | `server/config/db.js` MIGRATIONS array | ✅ Idempotent |
| 12 products + admin user seed | `server/config/db.js` SEED_PRODUCTS | ✅ Auto-runs on first start |
| Docker setup | `Dockerfile`, `server/Dockerfile`, `docker-compose.yml` | ✅ Ready |
| Nginx config (SPA + API proxy) | `nginx.conf` | ✅ Ready |
| GitHub Actions CI | `.github/workflows/ci.yml` | ✅ Tests + builds on every push |
| PWA manifest + service worker | `public/manifest.json`, `public/sw.js` | ✅ Installable + offline |
| OpenAPI / Swagger docs | `GET /api/docs/ui` | ✅ 30+ endpoints documented |
| Backup + restore scripts | `server/scripts/backup.mjs`, `restore.mjs` | ✅ Cron-ready |

---

## 🚀 Deployment — Step by Step

### 1. Provision a server
- **Minimum:** 1 vCPU, 1 GB RAM, 20 GB SSD
- **Recommended:** 2 vCPU, 2 GB RAM, 40 GB SSD (DigitalOcean, Hetzner, AWS Lightsail all work)
- **OS:** Ubuntu 22.04+ or Debian 12+
- **Ports:** 80, 443 open; 5000 closed to public (behind nginx)

### 2. Install Docker (if not already)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in
```

### 3. Clone the repo
```bash
git clone <your-repo-url> shahi-scoops
cd shahi-scoops
```

### 4. Generate secrets
```bash
cd server && npm install && npm run secrets
# This prints JWT_ACCESS_SECRET and JWT_REFRESH_SECRET (64+ chars each)
cd ..
```
Save these — you'll need them in step 5.

### 5. Configure environment

```bash
cp server/.env.production.example server/.env.production
nano server/.env.production
```

**Required values:**

| Variable | What to set | How to get it |
|---|---|---|
| `JWT_ACCESS_SECRET` | 64+ char random | From `npm run secrets` (step 4) |
| `JWT_REFRESH_SECRET` | 64+ char random | From `npm run secrets` (step 4) |
| `COOKIE_SECURE` | `1` | Always in prod |
| `CORS_ORIGINS` | `https://shahiscoops.com,https://www.shahiscoops.com` | Your actual domains |
| `EMAIL_USER` | Your Gmail address | — |
| `EMAIL_PASS` | Gmail App Password | https://myaccount.google.com/apppasswords (requires 2FA enabled) |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxxx` | Razorpay dashboard → Settings → API Keys (after KYC) |
| `RAZORPAY_KEY_SECRET` | Live secret | Same place |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret | Razorpay dashboard → Webhooks → Create endpoint → set URL to `https://shahiscoops.com/api/payments/webhook` |
| `SENTRY_DSN` | (optional) | Sentry project → Settings → Client Keys (DSN) |
| `CLIENT_URL` | `https://shahiscoops.com` | — |

**Before going live, change the admin password:**
1. Visit `https://shahiscoops.com/login` and log in as `admin@shahiscoops.com / admin123`
2. Go to Profile → Change Password
3. Set a strong password (16+ chars)
4. Also enable 2FA in Profile → Security

### 6. Point DNS

At your domain registrar (Namecheap, Cloudflare, GoDaddy, etc.):
- `@` (apex) → A record → `<server-ip>`
- `www` → CNAME → `shahiscoops.com`

### 7. Build + run

```bash
docker compose up -d --build
```

This starts two containers:
- `shahi-api` (Node 24) on internal port 5000
- `shahi-web` (nginx 1.27) on host ports 80 + 443

### 8. Set up HTTPS (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot

# Stop nginx temporarily
docker compose stop web

# Get cert
sudo certbot certonly --standalone -d shahiscoops.com -d www.shahiscoops.com

# Start nginx back
docker compose start web
```

Then mount the certs in `docker-compose.yml` (uncomment the volume lines) and reload:

```bash
# In docker-compose.yml, add under the web service:
#   volumes:
#     - /etc/letsencrypt:/etc/letsencrypt:ro

docker compose down
docker compose up -d
```

Alternatively, put Cloudflare in front (free) and use their Universal SSL — no certbot needed. Set SSL mode to "Full (Strict)".

### 9. Verify everything works

```bash
# Health check
curl https://shahiscoops.com/health
# Expected: {"status":"ok","db":"up","uptime":...,"timestamp":"..."}

# Open in browser
# https://shahiscoops.com
# Test:
#   - Browse flavours
#   - Register → log in
#   - Add to cart → checkout (test both COD and online)
#   - View order in /profile
#   - Log in as admin → /admin (manage products, orders, customers)
```

### 10. Set up automated backups

```bash
# Edit crontab
crontab -e
# Add this line (daily at 3am, keeps last 14):
0 3 * * * cd /opt/shahi-scoops/server && npm run backup >> /var/log/shahi-backup.log 2>&1
```

Backup files are written to `server/backups/shahi-YYYYMMDD-HHmmss.db`.

### 11. (Optional) Configure a reverse DNS monitor

Use a free service like UptimeRobot (https://uptimerobot.com) to ping `https://shahiscoops.com/health` every 5 minutes and alert you on downtime.

---

## 🆘 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "CORS: origin not allowed" in browser | `CORS_ORIGINS` doesn't include your domain | Add to `server/.env.production`, restart api |
| "Failed to load Razorpay" | Ad blocker or network issue | Open in incognito or check Network tab |
| "Invalid token" after login | Old refresh cookie + new server secret | Clear cookies, log in again |
| "no such column: razorpay_order_id" | Migration 008 didn't run | Should be auto; check server logs at startup |
| Cart appears empty after refresh | localStorage cleared (incognito) | Expected — cart is per-browser, not per-user |
| "Network Error" on checkout | API down or CORS | Check `https://shahiscoops.com/health` |
| Order emails not arriving | Wrong SMTP creds | Check server logs `[email]` for `Invalid login` |

---

## 🔄 Updating the site later

```bash
cd /opt/shahi-scoops
git pull
docker compose up -d --build
# Verify
curl https://shahiscoops.com/health
```

Migrations run automatically on server start.

---

## 📞 Support

For questions, see:
- **README.md** — full technical documentation
- **`/api/docs/ui`** — interactive API docs
- **GitHub Issues** — bug reports and feature requests

---

## 🔑 Admin Access Summary

After deployment, **immediately**:
1. Log in to `https://shahiscoops.com/login` with `admin@shahiscoops.com / admin123`
2. **Change the password** (Profile → Security)
3. **Enable 2FA** (Profile → Security → Enable 2FA)
4. **Add a real email** to the admin user (Profile → Edit Profile)
5. Test a real order before announcing the site

---

## 📊 Tech specs summary

- **Frontend bundle:** 378 kB (120 kB gzipped) — fast on 3G
- **API p95 latency:** <50ms for most endpoints
- **Database:** SQLite handles 100+ concurrent reads in WAL mode
- **Concurrent users:** Tested to 30 simultaneous (load test in `tools/loadtest.mjs`)
- **Lighthouse score target:** 90+ Performance, 100 Accessibility, 100 SEO, 100 Best Practices
- **Browser support:** Last 2 versions of Chrome, Firefox, Safari, Edge; iOS Safari 14+; Android Chrome 90+

---

🎉 **The site is delivery-ready. Happy selling!**
