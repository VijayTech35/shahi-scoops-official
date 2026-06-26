import { body, param, query, validationResult } from 'express-validator'

// Helper: format express-validator errors into a single message
export const formatValidationErrors = (req, res, next) => {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  const errors = result.array()
  const messages = errors.map(e => `${e.path}: ${e.msg}`).join('; ')
  return res.status(400).json({ error: messages, fields: errors.map(e => ({ path: e.path, msg: e.msg })) })
}

// ── AUTH ─────────────────────────────────────────────────
export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  formatValidationErrors,
]

export const loginValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  formatValidationErrors,
]

export const forgotPasswordValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  formatValidationErrors,
]

export const resetPasswordValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('token').isLength({ min: 32, max: 128 }).withMessage('Invalid token'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters'),
  formatValidationErrors,
]

// ── USERS ────────────────────────────────────────────────
export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[+\d\s()-]{7,20}$/).withMessage('Invalid phone'),
  formatValidationErrors,
]

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be 8-128 characters'),
  formatValidationErrors,
]

export const addressValidation = [
  body('label').optional().trim().isLength({ max: 40 }),
  body('full_address').trim().isLength({ min: 5, max: 500 }).withMessage('Address must be 5-500 characters'),
  body('city').optional().trim().isLength({ max: 80 }),
  body('pincode').optional({ checkFalsy: true }).trim().matches(/^\d{4,10}$/).withMessage('Invalid pincode'),
  body('is_default').optional().isBoolean(),
  formatValidationErrors,
]

export const addressIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid address id').toInt(),
  formatValidationErrors,
]

// ── CART / WISHLIST ──────────────────────────────────────
export const cartItemValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product_id required').toInt(),
  body('quantity').optional().isInt({ min: 1, max: 99 }).withMessage('Quantity 1-99').toInt(),
  formatValidationErrors,
]

export const wishlistValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product_id required').toInt(),
  formatValidationErrors,
]

export const cartIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid cart id').toInt(),
  formatValidationErrors,
]

// ── ORDERS ───────────────────────────────────────────────
export const placeOrderValidation = [
  body('delivery_address').trim().isLength({ min: 5, max: 500 }).withMessage('Delivery address must be 5-500 characters'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Notes must be under 500 characters'),
  body('payment_method').optional().isIn(['cod', 'online']).withMessage('payment_method must be cod or online'),
  formatValidationErrors,
]

export const orderIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid order id').toInt(),
  formatValidationErrors,
]

// ── REVIEWS ──────────────────────────────────────────────
export const reviewValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product_id required').toInt(),
  body('order_id').optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5').toInt(),
  body('title').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('body').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  formatValidationErrors,
]

export const productIdParam = [
  param('product_id').isInt({ min: 1 }).withMessage('Invalid product id').toInt(),
  formatValidationErrors,
]

// ── LOYALTY ──────────────────────────────────────────────
export const redeemValidation = [
  body('points').isInt({ min: 500, max: 100000 }).withMessage('Points must be 500-100000').toInt(),
  formatValidationErrors,
]

// ── NEWSLETTER / CONTACT / QUIZ ──────────────────────────
export const newsletterValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  formatValidationErrors,
]

export const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[+\d\s()-]{7,20}$/),
  body('interest').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('message').trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
  formatValidationErrors,
]

export const quizValidation = [
  body('answers').isObject().withMessage('answers must be an object'),
  body('recommended_flavour').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  formatValidationErrors,
]

// ── ADMIN ────────────────────────────────────────────────
export const adminProductValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2-120 characters'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('price').isFloat({ min: 0, max: 100000 }).withMessage('Price must be 0-100000').toFloat(),
  body('image_url').optional({ checkFalsy: true }).trim().isURL({ protocols: ['http', 'https'] }).withMessage('Invalid image URL'),
  body('category').optional().trim().isLength({ max: 60 }),
  body('badge').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('accent_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be hex like #C9A84C'),
  body('is_available').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
  formatValidationErrors,
]

export const adminOrderStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  formatValidationErrors,
]

// ── BACK IN STOCK ───────────────────────────────────────────
export const backInStockValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product_id required').toInt(),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  formatValidationErrors,
]

// ── QUERY (pagination, search) ───────────────────────────
export const paginationQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1-100').toInt(),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0').toInt(),
  formatValidationErrors,
]
