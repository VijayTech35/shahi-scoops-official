import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

// ── DB FILE ──────────────────────────────────────────────
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = path.join(dataDir, 'shahi_scoops.db')

const db = new DatabaseSync(dbPath)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

// ── SCHEMA ───────────────────────────────────────────────
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  full_address TEXT NOT NULL,
  city TEXT,
  pincode TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category TEXT,
  badge TEXT,
  accent_color TEXT DEFAULT '#C9A84C',
  is_available INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 100,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  subtotal REAL NOT NULL,
  delivery_charge REAL NOT NULL,
  shipping_zone_id INTEGER,
  tax REAL NOT NULL,
  total REAL NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  user_id INTEGER PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Silver',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  order_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  order_id INTEGER,
  rating INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  photo_url TEXT,
  is_approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id, order_id)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  answers TEXT,
  recommended_flavour TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percent','fixed')),
  discount_value REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  valid_from TEXT,
  valid_until TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  discount_amount REAL NOT NULL,
  redeemed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(coupon_id, user_id, order_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id INTEGER,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pincodes TEXT NOT NULL,
  rate REAL NOT NULL DEFAULT 0,
  free_above REAL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT,
  category TEXT DEFAULT 'General',
  tags TEXT,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS back_in_stock_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  user_id INTEGER,
  notified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, email)
);

CREATE TABLE IF NOT EXISTS wishlist_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

db.exec(SCHEMA)

// ── SEED ─────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 1,  name: 'Kesar Pista',            description: 'Premium saffron strands & hand-crushed pistachios in velvety organic cream', price: 90,  image_url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800', category: 'Traditional', badge: 'Bestseller',     accent_color: '#C9A84C', is_featured: 1, rating: 4.8, review_count: 240 },
  { id: 2,  name: 'Gulab Jamun Swirl',      description: 'Soft gulab jamun pieces swirled into rose-kissed saffron cream',           price: 85,  image_url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800', category: 'Traditional', badge: null,             accent_color: '#E8637A', is_featured: 1, rating: 4.9, review_count: 312 },
  { id: 3,  name: 'Shahi Tukda',            description: 'Royal bread pudding reimagined as a handcrafted Indian ice cream scoop',   price: 80,  image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800', category: 'Traditional', badge: null,             accent_color: '#A0784C', is_featured: 0, rating: 4.7, review_count: 189 },
  { id: 4,  name: 'Belgian Chocolate',      description: 'Single-origin Belgian cocoa blended with our signature cream base',        price: 95,  image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800', category: 'Chocolate',  badge: 'Limited Edition', accent_color: '#6B3A2A', is_featured: 1, rating: 4.9, review_count: 456 },
  { id: 5,  name: 'Alphonso Mango',         description: 'Pure Alphonso mango pulp churned fresh each morning into silky cream',     price: 85,  image_url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800', category: 'Fruit',      badge: 'Seasonal',        accent_color: '#E8901A', is_featured: 1, rating: 4.8, review_count: 278 },
  { id: 6,  name: 'Rose & Cardamom',        description: 'Delicate Persian rose petals with warm cardamom — a truly royal combination', price: 80, image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800', category: 'Traditional', badge: null,           accent_color: '#C06070', is_featured: 0, rating: 4.7, review_count: 201 },
  { id: 7,  name: 'Malai Kulfi',            description: 'Rich Indian cream cheese ice cream with crushed cardamom, saffron, and a hint of rose water', price: 90, image_url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800', category: 'Traditional', badge: null,         accent_color: '#D4A373', is_featured: 0, rating: 4.9, review_count: 189 },
  { id: 8,  name: 'Sitaphal Custard Apple', description: 'Handpicked sitaphal pulp blended into silky cream — capturing the authentic taste of Indian orchards', price: 95, image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', category: 'Fruit', badge: 'Premium', accent_color: '#7EC8A4', is_featured: 1, rating: 4.8, review_count: 156 },
  { id: 9,  name: 'Anjeer & Honey',         description: 'Premium dried figs soaked in organic wild honey, folded into a rich cream base', price: 100, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800', category: 'Special', badge: 'New',             accent_color: '#B8860B', is_featured: 0, rating: 4.8, review_count: 134 },
  { id: 10, name: 'Paan Royal',             description: 'Authentic betel leaf and gulkand ice cream with a hint of fennel — a deconstructed paan experience', price: 85, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', category: 'Special', badge: 'Special Edition', accent_color: '#2E8B57', is_featured: 0, rating: 4.7, review_count: 198 },
  { id: 11, name: 'Rasmalai',               description: 'Creamy malai scoops studded with tender rasmalai pieces, saffron strands, and slivered pistachios', price: 95, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', category: 'Traditional', badge: 'Fan Favourite', accent_color: '#E8637A', is_featured: 1, rating: 4.9, review_count: 223 },
  { id: 12, name: 'Sea Salt Caramel',       description: 'House-made caramel ribbon swirled through vanilla cream with flakes of French sea salt', price: 95, image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', category: 'Special', badge: 'Trending',     accent_color: '#CD853F', is_featured: 0, rating: 4.8, review_count: 167 },
]

const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c
if (productCount === 0) {
  const ins = db.prepare(`INSERT INTO products
    (id, name, description, price, image_url, category, badge, accent_color, is_available, is_featured, rating, review_count, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const p of SEED_PRODUCTS) {
    ins.run(p.id, p.name, p.description, p.price, p.image_url, p.category, p.badge, p.accent_color, 1, p.is_featured, p.rating, p.review_count, 100)
  }
  console.log(`\u{1F33E}  Seeded ${SEED_PRODUCTS.length} products`)
}

// ── MIGRATION RUNNER ──────────────────────────────────────
// Tracks applied migrations in a _migrations table. Idempotent.
// Add new migrations to the MIGRATIONS array, never edit applied ones.
db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`)

// Check if a column exists in a table (for safe ALTER TABLE)
const hasColumn = (table, col) => {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all()
  return rows.some(r => r.name === col)
}

const MIGRATIONS = [
  ['2026_06_06_001_products_stock', () => {
    if (!hasColumn('products', 'stock')) db.exec("ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 100")
  }],
  ['2026_06_06_002_products_low_stock', () => {
    if (!hasColumn('products', 'low_stock_threshold')) db.exec("ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5")
  }],
  ['2026_06_06_003_users_email_verified', () => {
    if (!hasColumn('users', 'email_verified')) db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0")
  }],
  ['2026_06_06_004_users_verify_token', () => {
    if (!hasColumn('users', 'email_verify_token')) db.exec("ALTER TABLE users ADD COLUMN email_verify_token TEXT")
    if (!hasColumn('users', 'email_verify_expires')) db.exec("ALTER TABLE users ADD COLUMN email_verify_expires TEXT")
  }],
  ['2026_06_06_005_users_2fa', () => {
    if (!hasColumn('users', 'two_factor_secret')) db.exec("ALTER TABLE users ADD COLUMN two_factor_secret TEXT")
    if (!hasColumn('users', 'two_factor_enabled')) db.exec("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER NOT NULL DEFAULT 0")
  }],
  ['2026_06_06_006_orders_shipping_zone', () => {
    if (!hasColumn('orders', 'shipping_zone_id')) db.exec("ALTER TABLE orders ADD COLUMN shipping_zone_id INTEGER")
  }],
  ['2026_06_06_007_orders_payment_method', () => {
    if (!hasColumn('orders', 'payment_method')) db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'online'")
  }],
  ['2026_06_07_008_orders_razorpay', () => {
    if (!hasColumn('orders', 'razorpay_order_id')) db.exec("ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT")
    if (!hasColumn('orders', 'razorpay_payment_id')) db.exec("ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT")
  }],
]

const appliedMigrations = new Set(db.prepare('SELECT name FROM _migrations').all().map(r => r.name))
const recordMigration = db.prepare('INSERT INTO _migrations (name) VALUES (?)')

for (const [name, fn] of MIGRATIONS) {
  if (appliedMigrations.has(name)) continue
  try {
    db.exec('BEGIN')
    fn()
    recordMigration.run(name)
    db.exec('COMMIT')
    console.log(`✓  Migration applied: ${name}`)
  } catch (e) {
    db.exec('ROLLBACK')
    console.warn(`✗  Migration failed: ${name} — ${e.message}`)
  }
}

// ── SEED SHIPPING ZONES (Bengaluru + India default) ─────
const zoneCount = db.prepare('SELECT COUNT(*) AS c FROM shipping_zones').get().c
if (zoneCount === 0) {
  const ins = db.prepare('INSERT INTO shipping_zones (name, pincodes, rate, free_above) VALUES (?, ?, ?, ?)')
  ins.run('Bengaluru Local', '560001,560002,560003,560004,560005,560010,560011,560013,560015,560020,560034,560040,560042,560045,560064,560066,560076,560078,560085,560087,560094,560095,560096,560097,560098,560099,560100,560102,560103', 0, 300)
  ins.run('Karnataka', '560000,561000,562000,563000,564000,565000,566000,567000,568000,570000,571000,572000,573000,574000,575000,576000,577000,580000,581000,582000,583000,584000,585000,586000,587000,588000,590000,591000,592000,593000,594000,595000,596000', 40, 500)
  ins.run('South India', '500000,501000,502000,503000,504000,505000,506000,507000,508000,509000,510000,511000,512000,513000,514000,515000,516000,517000,518000,519000,520000,521000,522000,523000,524000,525000,526000,527000,528000,529000,530000,600000,601000,602000,603000,604000,605000,606000,607000,608000,609000,610000,620000,621000,622000,623000,624000,625000,626000,627000,628000,629000,630000,631000,632000,633000,636000,637000,638000,639000,640000,641000,642000,643000,670000,671000,672000,673000,675000,676000,677000,678000,679000,680000,682000,683000,685000,686000,687000,688000,689000,690000,691000,692000,695000', 70, 700)
  ins.run('Rest of India', '000000,999999', 100, 1000)
  console.log('🚚  Seeded 4 shipping zones (Bengaluru local → all-India)')
}

const adminCount = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get().c
if (adminCount === 0) {
  const hash = bcrypt.hashSync('admin123', 12)
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
    .run('Admin', 'admin@shahiscoops.com', hash, 'admin')
  console.log('\u{1F451}  Seeded admin user: admin@shahiscoops.com / admin123')
}

// ── SEED SAMPLE COUPON ───────────────────────────────────
const couponCount = db.prepare('SELECT COUNT(*) AS c FROM coupons').get().c
if (couponCount === 0) {
  db.prepare(`INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, max_uses_per_user, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
    .run('WELCOME10', '10% off your first order (max ₹50 off)', 'percent', 10, 100, 1000, 1)
  db.prepare(`INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, max_uses_per_user, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
    .run('FLAT50', 'Flat ₹50 off on orders above ₹300', 'fixed', 50, 300, 500, 5)
  console.log('\u{1F3AF}  Seeded 2 sample coupons: WELCOME10, FLAT50')
}

// ── SEED BLOG POSTS ───────────────────────────────────────
const blogCount = db.prepare('SELECT COUNT(*) AS c FROM blog_posts').get().c
if (blogCount === 0) {
  const ins = db.prepare('INSERT INTO blog_posts (title, slug, excerpt, content, image_url, author, category, tags, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
  ins.run(
    '5 Ways to Enjoy Kesar Pista Ice Cream at Home',
    '5-ways-enjoy-kesar-pista-ice-cream',
    'From classic sundaes to fusion desserts, discover creative ways to enjoy our bestselling Kesar Pista ice cream.',
    'Kesar Pista is our crown jewel and for good reason. Here are 5 delicious ways to enjoy it at home:\n\n1. The Royal Sundae - Layer Kesar Pista with warm gulab jamun, drizzle with saffron syrup, and top with chopped pistachios.\n\n2. Kesar Pista Lassi - Blend 2 scoops of Kesar Pista ice cream with 1 cup of chilled yoghurt, a pinch of cardamom, and a drizzle of honey.\n\n3. Pistachio Crunch Parfait - Alternate layers of crushed biscuits, Kesar Pista ice cream, and saffron-infused whipped cream.\n\n4. Shahi Kulfi Shake - Blend with milk and crushed ice for a thick, creamy shake. Garnish with saffron strands.\n\n5. Deep-Fried Ice Cream - Yes! Roll frozen scoops in crushed cornflakes, freeze for 2 hours, then deep fry for 30 seconds.\n\nEach of these recipes takes just minutes to prepare but tastes like hours of royal kitchen magic.',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800',
    'Chef Priya Sharma', 'Recipes', 'kesar pista,recipes,home desserts'
  )
  ins.run(
    'The Story Behind Shahi Scoops: A Royal Beginning',
    'story-behind-shahi-scoops',
    'How a family recipe from Mughal India inspired a premium ice cream brand loved by thousands.',
    'Every great brand has a story. Shahi Scoops began not in a corporate boardroom, but in a small kitchen in Old Delhi.\n\nIt was 2018 when our founder, Priya Sharma, discovered her grandmothers handwritten recipe book. Tucked between pages of biryani and korma recipes was something unexpected - a recipe for Shahi Kulfi - royal ice cream.\n\nThe recipe called for full-cream milk reduced over hours, genuine saffron from Kashmir, pistachios from Iran, and cardamom from the Western Ghats. No shortcuts. No substitutes.\n\n"We spent six months perfecting that recipe," Priya recalls. "My grandmother would taste each batch and say - not yet, beta, the saffron needs more time to bloom."\n\nIn 2020, what started as a home kitchen experiment became Shahi Scoops - Indias first premium ice cream brand inspired entirely by Mughal dessert traditions.\n\nToday, we source our saffron directly from Pampore, our mangoes from Ratnagiri, and our cream from grass-fed cows in Karnataka. Every scoop carries forward a culinary tradition that spans centuries.\n\nWelcome to the royal family.',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800',
    'The Shahi Team', 'Behind the Brand', 'story,origin,founder,muglai desserts'
  )
  ins.run(
    'Summer Coolers: 3 Ice Cream Based Drinks to Beat the Heat',
    'summer-coolers-ice-cream-drinks',
    'Beat the summer heat with these refreshing ice cream based drinks that are as beautiful as they are delicious.',
    'Summer is here and there is no better way to cool down than with ice cream-based drinks. Here are 3 absolutely delightful recipes:\n\n1. Mango Cream Dream - Blend 2 scoops of Alphonso Mango ice cream with 1 cup chilled milk, add a splash of rose syrup, and top with crushed ice. Garnish with fresh mango cubes and a sprinkle of chaat masala for that perfect sweet-tangy balance.\n\n2. Rose & Cardamom Frappe - Blend Rose & Cardamom ice cream with cold coffee, a drizzle of honey, and crushed ice. Top with whipped cream and rose petals.\n\n3. Belgian Chocolate Chill - Blend Belgian Chocolate ice cream with chilled milk, a pinch of sea salt, and a shot of espresso. Top with chocolate shavings and a dusting of cocoa powder.\n\nPro tip: Chill your glasses before serving - it keeps the drinks cold for longer and makes the presentation extra special.\n\nStay cool, royalty.',
    'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800',
    'Chef Priya Sharma', 'Recipes', 'summer,drinks,recipes,coolers'
  )
  console.log('Seeded 3 blog posts')
}

// ── SQL TRANSLATOR (MySQL → SQLite) ──────────────────────
function translate(sql) {
  let s = sql
  s = s.replace(/\bNOW\s*\(\s*\)/gi, "CURRENT_TIMESTAMP")
  s = s.replace(/\bCURDATE\s*\(\s*\)/gi, "DATE('now')")
  s = s.replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, 'INSERT OR IGNORE INTO')
  return s
}

function normalizeParams(params) {
  return (params || []).map(p => {
    if (p === undefined || p === null) return null
    if (p instanceof Date) return dateToSQLite(p)
    if (typeof p === 'object' && p && p.constructor && p.constructor.name === 'Date') {
      return dateToSQLite(new Date(p))
    }
    if (typeof p === 'boolean') return p ? 1 : 0
    if (typeof p === 'bigint') return Number(p)
    return p
  })
}

function dateToSQLite(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

function mapError(err) {
  if (err && (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')) {
    const e = new Error(err.message)
    e.code = 'ER_DUP_ENTRY'
    return e
  }
  return err
}

// ── POOL SHIM (mysql2-compatible interface) ──────────────
const stmtCache = new Map()

function getStmt(sql) {
  let stmt = stmtCache.get(sql)
  if (!stmt) {
    stmt = db.prepare(sql)
    stmtCache.set(sql, stmt)
  }
  return stmt
}

async function query(sql, params = []) {
  const translated = translate(sql)
  const cleaned = normalizeParams(params)
  try {
    if (/^\s*(SELECT|PRAGMA)/i.test(translated)) {
      const stmt = getStmt(translated)
      const rows = cleaned.length ? stmt.all(...cleaned) : stmt.all()
      return [rows, []]
    } else {
      const stmt = getStmt(translated)
      const r = cleaned.length ? stmt.run(...cleaned) : stmt.run()
      return [{ insertId: Number(r.lastInsertRowid), affectedRows: r.changes }, []]
    }
  } catch (err) {
    throw mapError(err)
  }
}

async function getConnection() {
  let inTx = false
  return {
    query: async (sql, params = []) => {
      const translated = translate(sql)
      const cleaned = normalizeParams(params)
      try {
        if (/^\s*(SELECT|PRAGMA)/i.test(translated)) {
          const stmt = getStmt(translated)
          const rows = cleaned.length ? stmt.all(...cleaned) : stmt.all()
          return [rows, []]
        } else {
          const stmt = getStmt(translated)
          const r = cleaned.length ? stmt.run(...cleaned) : stmt.run()
          return [{ insertId: Number(r.lastInsertRowid), affectedRows: r.changes }, []]
        }
      } catch (err) {
        throw mapError(err)
      }
    },
    async beginTransaction() {
      if (!inTx) { db.exec('BEGIN'); inTx = true }
    },
    async commit() {
      if (inTx) { db.exec('COMMIT'); inTx = false }
    },
    async rollback() {
      if (inTx) { db.exec('ROLLBACK'); inTx = false }
    },
    release() {
      if (inTx) { try { db.exec('ROLLBACK') } catch {} ; inTx = false }
    },
  }
}

const pool = { query, getConnection }

export default pool
