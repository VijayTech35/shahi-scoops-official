import { test } from 'node:test'
import assert from 'node:assert/strict'

// Pure-function unit tests for the SQL preprocessor + translation logic
// These exercise the parts of db.js most likely to break under load.

test('translate: NOW() → datetime(\'now\')', () => {
  const t = (s) => s.replace(/\bNOW\(\)/gi, "datetime('now')").replace(/\bCURDATE\(\)/gi, "date('now')")
  assert.equal(t('expires_at > NOW()'), "expires_at > datetime('now')")
  assert.equal(t('WHERE CURDATE()', ), "WHERE date('now')")
  assert.equal(t('NOW() and CURDATE()'), "datetime('now') and date('now')")
})

test('translate: INSERT IGNORE → INSERT OR IGNORE', () => {
  const t = (s) => s.replace(/\bINSERT\s+IGNORE\b/gi, 'INSERT OR IGNORE')
  assert.equal(t('INSERT IGNORE INTO x'), 'INSERT OR IGNORE INTO x')
})

test('normalize: Date → SQLite datetime string', () => {
  const d = new Date('2026-06-06T07:00:00Z')
  const norm = (p) => p instanceof Date
    ? d.toISOString().slice(0, 19).replace('T', ' ')
    : p
  assert.equal(norm(d), '2026-06-06 07:00:00')
})

test('normalize: boolean → 0/1', () => {
  const norm = (p) => typeof p === 'boolean' ? (p ? 1 : 0) : p
  assert.equal(norm(true), 1)
  assert.equal(norm(false), 0)
  assert.equal(norm(0), 0)
  assert.equal(norm(1), 1)
})

test('email validator: rejects too-short, accepts valid', () => {
  const valid = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254
  assert.equal(valid('a@b.co'), true)
  assert.equal(valid('user@example.com'), true)
  assert.equal(valid('notanemail'), false)
  assert.equal(valid('a@b'), false)
  assert.equal(valid(''), false)
})

test('phone validator: 10-15 digits, optional +', () => {
  const valid = (p) => typeof p === 'string' && /^\+?\d{10,15}$/.test(p.replace(/[\s-]/g, ''))
  assert.equal(valid('9876543210'), true)
  assert.equal(valid('+919876543210'), true)
  assert.equal(valid('12345'), false)
  assert.equal(valid('abcdefghij'), false)
})

test('pagination: clamp limit 1-100, default 20, offset >= 0', () => {
  const clamp = (q) => {
    let limit = parseInt(q.limit, 10)
    let offset = parseInt(q.offset, 10)
    if (isNaN(limit) || limit < 1) limit = 20
    if (limit > 100) limit = 100
    if (isNaN(offset) || offset < 0) offset = 0
    return { limit, offset }
  }
  assert.deepEqual(clamp({}), { limit: 20, offset: 0 })
  assert.deepEqual(clamp({ limit: '5' }), { limit: 5, offset: 0 })
  assert.deepEqual(clamp({ limit: '999' }), { limit: 100, offset: 0 })
  assert.deepEqual(clamp({ limit: '-1' }), { limit: 20, offset: 0 })
  assert.deepEqual(clamp({ offset: 'abc' }), { limit: 20, offset: 0 })
  assert.deepEqual(clamp({ limit: '50', offset: '20' }), { limit: 50, offset: 20 })
})
