#!/usr/bin/env node
// Generate cryptographically random JWT secrets for .env
import crypto from 'crypto'
const a = crypto.randomBytes(64).toString('base64url')
const r = crypto.randomBytes(64).toString('base64url')
console.log('Add these to your .env:\n')
console.log(`JWT_ACCESS_SECRET=${a}`)
console.log(`JWT_REFRESH_SECRET=${r}`)
console.log(`\nKeep them secret. Rotate periodically. Never commit them.`)
