// TOTP (RFC 6238) implementation using only Node's built-in crypto.
// Used for admin 2FA. No external dependency.

import crypto from 'crypto'

// Base32 encode/decode (RFC 4648)
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export function base32Encode(buf) {
  let bits = 0, value = 0, output = ''
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i]
    bits += 8
    while (bits >= 5) {
      output += B32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += B32[(value << (5 - bits)) & 31]
  return output
}

export function base32Decode(str) {
  str = str.replace(/=+$/, '').toUpperCase()
  let bits = 0, value = 0
  const out = []
  for (const c of str) {
    const v = B32.indexOf(c)
    if (v < 0) continue
    value = (value << 5) | v
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

// Generate a random base32 secret (160 bits, recommended for SHA-1)
export function generateSecret() {
  return base32Encode(crypto.randomBytes(20))
}

// Generate TOTP code for a given secret at a given time
export function generateTOTP(secret, time = Math.floor(Date.now() / 1000), step = 30, digits = 6) {
  const counter = Math.floor(time / step)
  const counterBuf = Buffer.alloc(8)
  // Write big-endian 64-bit counter
  counterBuf.writeBigUInt64BE(BigInt(counter))
  const key = base32Decode(secret)
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff)
  return String(code % (10 ** digits)).padStart(digits, '0')
}

// Verify a TOTP code (allows ±1 step for clock drift)
export function verifyTOTP(secret, code, window = 1) {
  if (!/^\d{6}$/.test(code)) return false
  const time = Math.floor(Date.now() / 1000)
  for (let i = -window; i <= window; i++) {
    if (generateTOTP(secret, time + i * 30) === code) return true
  }
  return false
}

// Generate otpauth:// URI for QR code
export function otpAuthURI(secret, accountName, issuer = 'Shahi Scoops') {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}
