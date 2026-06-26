// OpenAPI 3.0 spec for Shahi Scoops API.
// Served at /api/docs (JSON) and /api/docs/ui (Swagger UI).

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Shahi Scoops API',
    version: '1.0.0',
    description: 'Royal handcrafted ice cream e-commerce API',
    contact: { name: 'Shahi Scoops', email: 'hello@shahiscoops.com' },
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local dev' },
    { url: 'https://api.shahiscoops.com', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Registration, login, tokens' },
    { name: 'User', description: 'Profile, addresses, password' },
    { name: 'Shop', description: 'Products, cart, wishlist, orders' },
    { name: 'Reviews', description: 'Product reviews' },
    { name: 'Loyalty', description: 'Royal Club points' },
    { name: 'Coupons', description: 'Discount codes' },
    { name: 'Payments', description: 'Razorpay integration' },
    { name: 'Admin', description: 'Admin-only endpoints' },
    { name: 'Marketing', description: 'Newsletter, quiz, contact' },
    { name: 'Misc', description: 'Health, root' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' }, fields: { type: 'array' }, requestId: { type: 'string' } },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['customer', 'admin'] },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          image_url: { type: 'string', format: 'uri' },
          category: { type: 'string' },
          badge: { type: 'string', nullable: true },
          is_available: { type: 'integer' },
          is_featured: { type: 'integer' },
          rating: { type: 'number' },
          review_count: { type: 'integer' },
          stock: { type: 'integer' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          order_number: { type: 'string' },
          subtotal: { type: 'number' },
          tax: { type: 'number' },
          delivery_charge: { type: 'number' },
          total: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] },
          payment_status: { type: 'string' },
          delivery_address: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      PaginatedProducts: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: { tags: ['Misc'], summary: 'Health check', responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register new user',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', minLength: 2, maxLength: 80 }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8, maxLength: 128 } } } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }, '409': { description: 'Email exists' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { '200': { description: 'OK' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { description: 'No token' } } },
    },
    '/api/auth/refresh-token': {
      post: { tags: ['Auth'], summary: 'Refresh access token (uses refresh cookie)', responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout (clears refresh cookie)', responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/logout-all': {
      post: { tags: ['Auth'], summary: 'Logout of all sessions', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/verify-email': {
      get: { tags: ['Auth'], summary: 'Verify email with token', parameters: [{ name: 'token', in: 'query', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '400': { description: 'Invalid token' } } },
    },
    '/api/auth/resend-verification': {
      post: { tags: ['Auth'], summary: 'Resend verification email', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } } } } }, responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/forgot-password': {
      post: { tags: ['Auth'], summary: 'Request password reset', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } } } } }, responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/reset-password': {
      post: { tags: ['Auth'], summary: 'Reset password with token', responses: { '200': { description: 'OK' } } },
    },
    '/api/products': {
      get: {
        tags: ['Shop'], summary: 'List products (paginated)',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
        ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedProducts' } } } } },
      },
    },
    '/api/products/{id}': {
      get: { tags: ['Shop'], summary: 'Get product', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
    },
    '/api/cart': {
      get: { tags: ['Shop'], summary: 'Get cart', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Shop'], summary: 'Add to cart', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' } } },
      delete: { tags: ['Shop'], summary: 'Clear cart', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/cart/{id}': {
      put: { tags: ['Shop'], summary: 'Update cart item', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Shop'], summary: 'Remove from cart', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/wishlist': {
      get: { tags: ['Shop'], summary: 'Get wishlist', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Shop'], summary: 'Add to wishlist', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' } } },
    },
    '/api/wishlist/{product_id}': {
      delete: { tags: ['Shop'], summary: 'Remove from wishlist', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/orders': {
      get: { tags: ['Shop'], summary: 'List my orders', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Shop'], summary: 'Place order', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' }, '400': { description: 'Validation error' } } },
    },
    '/api/orders/{id}': {
      get: { tags: ['Shop'], summary: 'Get order', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/orders/{id}/cancel': {
      post: { tags: ['Shop'], summary: 'Cancel order', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/reviews/{product_id}': {
      get: { tags: ['Reviews'], summary: 'Get reviews for product', responses: { '200': { description: 'OK' } } },
    },
    '/api/reviews': {
      post: { tags: ['Reviews'], summary: 'Submit review', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' } } },
    },
    '/api/loyalty': {
      get: { tags: ['Loyalty'], summary: 'Get loyalty status', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/loyalty/redeem': {
      post: { tags: ['Loyalty'], summary: 'Redeem points', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/coupons/validate': {
      post: { tags: ['Coupons'], summary: 'Validate coupon for cart', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '400': { description: 'Invalid coupon' } } },
    },
    '/api/payments/create-order': {
      post: { tags: ['Payments'], summary: 'Create Razorpay order', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/payments/verify': {
      post: { tags: ['Payments'], summary: 'Verify Razorpay payment', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/payments/webhook': {
      post: { tags: ['Payments'], summary: 'Razorpay webhook (raw body, signature-verified)', responses: { '200': { description: 'OK' } } },
    },
    '/api/newsletter/subscribe': {
      post: { tags: ['Marketing'], summary: 'Subscribe to newsletter', responses: { '200': { description: 'OK' } } },
    },
    '/api/quiz/result': {
      post: { tags: ['Marketing'], summary: 'Save quiz result', responses: { '200': { description: 'OK' } } },
    },
    '/api/contact': {
      post: { tags: ['Marketing'], summary: 'Submit contact form', responses: { '200': { description: 'OK' } } },
    },
    '/api/users/profile': {
      get: { tags: ['User'], summary: 'Get profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['User'], summary: 'Update profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/users/password': {
      put: { tags: ['User'], summary: 'Change password', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/users/avatar': {
      post: { tags: ['User'], summary: 'Upload avatar (multipart)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/users/addresses': {
      get: { tags: ['User'], summary: 'List addresses', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['User'], summary: 'Add address', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' } } },
    },
    '/api/users/addresses/{id}': {
      put: { tags: ['User'], summary: 'Update address', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      delete: { tags: ['User'], summary: 'Delete address', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/users/account': {
      delete: { tags: ['User'], summary: 'Delete account (cascades all data)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/stats': {
      get: { tags: ['Admin'], summary: 'Dashboard stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/products': {
      get: { tags: ['Admin'], summary: 'List all products', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Admin'], summary: 'Create product', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' } } },
    },
    '/api/admin/products/upload-image': {
      post: { tags: ['Admin'], summary: 'Upload product image (multipart)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/products/{id}': {
      put: { tags: ['Admin'], summary: 'Update product', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Admin'], summary: 'Delete product', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/orders': {
      get: { tags: ['Admin'], summary: 'List all orders', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/orders/{id}/status': {
      put: { tags: ['Admin'], summary: 'Update order status (sends email to customer)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/customers': {
      get: { tags: ['Admin'], summary: 'List customers', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/reviews': {
      get: { tags: ['Admin'], summary: 'List all reviews', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/reviews/{id}': {
      delete: { tags: ['Admin'], summary: 'Delete review', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/coupons': {
      get: { tags: ['Admin'], summary: 'List coupons', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Admin'], summary: 'Create coupon', security: [{ bearerAuth: [] }], responses: { '201': { description: 'OK' } } },
    },
    '/api/admin/coupons/{id}': {
      delete: { tags: ['Admin'], summary: 'Delete coupon', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
  },
}

export default spec
