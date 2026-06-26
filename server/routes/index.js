import express from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import { auth, adminOnly } from '../middleware/auth.js'
import * as v from '../middleware/validators.js'

import { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification, logoutAll, setup2FA, verifySetup2FA, disable2FA } from '../controllers/authController.js'
import { getProfile, updateProfile, changePassword, uploadAvatar, getAddresses, addAddress, updateAddress, deleteAddress, deleteAccount, exportData } from '../controllers/userController.js'
import { getProducts, getProduct, getCart, addToCart, updateCart, removeFromCart, clearCart, getWishlist, addToWishlist, removeFromWishlist, placeOrder, getOrders, getOrder, cancelOrder, trackOrderByNumber, createWishlistShare, getSharedWishlist, requestBackInStock, getBlogPosts, getBlogPost } from '../controllers/shopController.js'
import { createRazorpayOrder, verifyPayment, razorpayWebhook } from '../controllers/paymentController.js'
import { getStats, adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminToggleProduct, adminGetOrders, adminUpdateOrderStatus, adminGetCustomers, adminGetCustomerDetail, adminGetReviews, adminApproveReview, adminDeleteReview, adminUploadProductImage, adminGetShippingZones, adminCreateShippingZone, adminUpdateShippingZone, adminDeleteShippingZone } from '../controllers/adminController.js'
import { getReviews, submitReview, getLoyalty, redeemPoints, subscribeNewsletter, saveQuizResult, submitContact, getRecommendations } from '../controllers/featureController.js'
import { validateCoupon, adminListCoupons, adminCreateCoupon, adminDeleteCoupon } from '../controllers/couponController.js'
import { googleLogin, googleCallback } from '../controllers/oauthController.js'

const router = express.Router()

// Multer setup
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}-${file.originalname.replace(/\s/g, '_').replace(/[^\w.-]/g, '')}`),
})
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpe?g|png|webp|gif)$/i
    cb(allowed.test(file.mimetype) ? null : new Error('Only JPEG/PNG/WEBP/GIF images allowed'), allowed.test(file.mimetype))
  },
})

// ── RATE LIMITERS ────────────────────────────────────────
const authMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 30
const authWindow = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000
const apiMax = parseInt(process.env.API_RATE_LIMIT_MAX, 10) || 300
const apiWindow = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000

const authLimiter = rateLimit({ windowMs: authWindow, max: authMax, message: { error: 'Too many attempts, try again later' } })
const apiLimiter = rateLimit({ windowMs: apiWindow, max: apiMax, message: { error: 'Too many requests, slow down' } })

// ── AUTH ─────────────────────────────────────────────────
router.post('/auth/register', authLimiter, v.registerValidation, register)
router.post('/auth/login', authLimiter, v.loginValidation, login)
router.post('/auth/logout', logout)
router.post('/auth/refresh-token', refreshToken)
router.get('/auth/me', auth, getMe)
router.post('/auth/forgot-password', authLimiter, v.forgotPasswordValidation, forgotPassword)
router.post('/auth/reset-password', authLimiter, v.resetPasswordValidation, resetPassword)
router.get('/auth/verify-email', verifyEmail)
router.post('/auth/resend-verification', authLimiter, resendVerification)
router.post('/auth/logout-all', auth, logoutAll)
router.post('/auth/2fa/setup', auth, setup2FA)
router.post('/auth/2fa/verify-setup', auth, verifySetup2FA)
router.post('/auth/2fa/disable', auth, disable2FA)

// OAuth
router.get('/auth/google', googleLogin)
router.get('/auth/google/callback', googleCallback)

// ── USERS ────────────────────────────────────────────────
router.get('/users/profile', auth, getProfile)
router.put('/users/profile', auth, v.updateProfileValidation, updateProfile)
router.put('/users/password', auth, v.changePasswordValidation, changePassword)
router.post('/users/avatar', auth, upload.single('avatar'), uploadAvatar)
router.get('/users/addresses', auth, getAddresses)
router.post('/users/addresses', auth, v.addressValidation, addAddress)
router.put('/users/addresses/:id', auth, v.addressIdParam, v.addressValidation, updateAddress)
router.delete('/users/addresses/:id', auth, v.addressIdParam, deleteAddress)
router.delete('/users/account', auth, deleteAccount)
router.get('/users/export', auth, exportData)

// ── PRODUCTS (public) ─────────────────────────────────────
router.get('/products', apiLimiter, v.paginationQuery, getProducts)
router.get('/products/:id', getProduct)

// ── CART ──────────────────────────────────────────────────
router.get('/cart', auth, getCart)
router.post('/cart', auth, v.cartItemValidation, addToCart)
router.put('/cart/:id', auth, v.cartIdParam, updateCart)
router.delete('/cart/:id', auth, v.cartIdParam, removeFromCart)
router.delete('/cart', auth, clearCart)

// ── WISHLIST ──────────────────────────────────────────────
router.get('/wishlist', auth, getWishlist)
router.post('/wishlist', auth, v.wishlistValidation, addToWishlist)
router.delete('/wishlist/:product_id', auth, v.productIdParam, removeFromWishlist)

// ── ORDERS ────────────────────────────────────────────────
router.post('/orders', auth, v.placeOrderValidation, placeOrder)
router.get('/orders', auth, v.paginationQuery, getOrders)
router.get('/orders/:id', auth, v.orderIdParam, getOrder)
router.post('/orders/:id/cancel', auth, v.orderIdParam, cancelOrder)

// ── PAYMENTS ─────────────────────────────────────────────
router.post('/payments/create-order', auth, createRazorpayOrder)
router.post('/payments/verify', auth, verifyPayment)
router.post('/payments/webhook', express.raw({ type: 'application/json' }), razorpayWebhook)

// ── REVIEWS ───────────────────────────────────────────────
router.get('/reviews/:product_id', v.productIdParam, getReviews)
router.post('/reviews', auth, upload.single('photo'), v.reviewValidation, submitReview)

// ── LOYALTY ───────────────────────────────────────────────
router.get('/loyalty', auth, getLoyalty)
router.post('/loyalty/redeem', auth, v.redeemValidation, redeemPoints)

// ── RECOMMENDATIONS ───────────────────────────────────────
router.get('/recommendations/:product_id', v.productIdParam, getRecommendations)

// ── NEWSLETTER ────────────────────────────────────────────
router.post('/newsletter/subscribe', apiLimiter, v.newsletterValidation, subscribeNewsletter)

// ── QUIZ ─────────────────────────────────────────────────
router.post('/quiz/result', v.quizValidation, saveQuizResult)

// ── CONTACT ───────────────────────────────────────────────
router.post('/contact', apiLimiter, v.contactValidation, submitContact)

// ── ADMIN ────────────────────────────────────────────────
router.get('/admin/stats', auth, adminOnly, getStats)
router.get('/admin/products', auth, adminOnly, v.paginationQuery, adminGetProducts)
router.post('/admin/products', auth, adminOnly, v.adminProductValidation, adminCreateProduct)
router.post('/admin/products/upload-image', auth, adminOnly, upload.single('image'), adminUploadProductImage)
router.put('/admin/products/:id', auth, adminOnly, v.adminProductValidation, adminUpdateProduct)
router.delete('/admin/products/:id', auth, adminOnly, adminDeleteProduct)
router.patch('/admin/products/:id/toggle', auth, adminOnly, adminToggleProduct)
router.get('/admin/orders', auth, adminOnly, v.paginationQuery, adminGetOrders)
router.patch('/admin/orders/:id/status', auth, adminOnly, v.orderIdParam, v.adminOrderStatusValidation, adminUpdateOrderStatus)
router.get('/admin/customers', auth, adminOnly, v.paginationQuery, adminGetCustomers)
router.get('/admin/reviews', auth, adminOnly, v.paginationQuery, adminGetReviews)
router.patch('/admin/reviews/:id/approve', auth, adminOnly, adminApproveReview)
router.delete('/admin/reviews/:id', auth, adminOnly, adminDeleteReview)

// Blog (public)
router.get('/blog', getBlogPosts)
router.get('/blog/:slug', getBlogPost)

// Back in stock
router.post('/back-in-stock', v.backInStockValidation, requestBackInStock)

// Wishlist sharing
router.post('/wishlist/share', auth, createWishlistShare)
router.get('/wishlist/shared/:token', getSharedWishlist)

// Order tracking (public)
router.get('/orders/track/:orderNumber', trackOrderByNumber)

// Admin shipping zones
router.get('/admin/shipping-zones', auth, adminOnly, adminGetShippingZones)
router.post('/admin/shipping-zones', auth, adminOnly, adminCreateShippingZone)
router.put('/admin/shipping-zones/:id', auth, adminOnly, adminUpdateShippingZone)
router.delete('/admin/shipping-zones/:id', auth, adminOnly, adminDeleteShippingZone)

// Admin customer detail
router.get('/admin/customers/:id', auth, adminOnly, adminGetCustomerDetail)

// Coupons
router.post('/coupons/validate', auth, validateCoupon)
router.get('/admin/coupons', auth, adminOnly, adminListCoupons)
router.post('/admin/coupons', auth, adminOnly, adminCreateCoupon)
router.delete('/admin/coupons/:id', auth, adminOnly, adminDeleteCoupon)

export default router
