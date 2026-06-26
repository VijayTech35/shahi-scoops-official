// Cross-platform SQLite backup script.
// Uses SQLite's built-in backup API (safe, atomic, no file-lock issues).
// Usage:
//   node scripts/backup.mjs              # backup to ./backups/
//   node scripts/backup.mjs /custom/dir  # backup to custom dir
//   node scripts/backup.mjs --keep=30    # keep last 30 backups (default 14)

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { backup, DatabaseSync } from 'node:sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.join(__dirname, '..')
const DB_PATH = path.join(SERVER_ROOT, 'data', 'shahi_scoops.db')

const argDir = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null
const keepArg = process.argv.find(a => a.startsWith('--keep='))
const KEEP = keepArg ? parseInt(keepArg.split('=')[1], 10) : 14
const OUT_DIR = argDir || path.join(SERVER_ROOT, 'backups')

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Database not found: ${DB_PATH}`)
  console.error('   Start the server once to create it.')
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const outFile = path.join(OUT_DIR, `shahi-${stamp}.db`)

console.log(`📦 Backing up ${DB_PATH}`)
console.log(`   → ${outFile}`)

const start = Date.now()

let source = null
try {
  source = new DatabaseSync(DB_PATH)
  // Force WAL checkpoint so all writes are in the main DB file
  // TRUNCATE also resets the -wal file to zero
  source.exec('PRAGMA wal_checkpoint(TRUNCATE)')
  // Now use the online backup API for a clean snapshot
  backup(source, outFile)
} catch (e) {
  console.error('❌ Backup failed:', e.message)
  try { fs.unlinkSync(outFile) } catch {}
  if (source) try { source.close() } catch {}
  process.exit(1)
} finally {
  if (source) try { source.close() } catch {}
}

try {
  const size = fs.statSync(outFile).size
  console.log(`✅ Backup complete (${(size / 1024).toFixed(1)} KB) in ${Date.now() - start}ms`)

  // Verify by opening the backup
  const verify = new DatabaseSync(outFile)
  const rows = verify.prepare('SELECT COUNT(*) AS c FROM products').all()
  verify.close()
  console.log(`✓  Verified: ${rows[0].c} products in backup`)
} catch (e) {
  console.error('❌ Verify failed:', e.message)
  process.exit(1)
}

// Prune old backups
const files = fs.readdirSync(OUT_DIR)
  .filter(f => f.startsWith('shahi-') && f.endsWith('.db'))
  .map(f => ({ name: f, time: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
  .sort((a, b) => b.time - a.time)

if (files.length > KEEP) {
  const toDelete = files.slice(KEEP)
  for (const f of toDelete) {
    fs.unlinkSync(path.join(OUT_DIR, f.name))
    console.log(`🗑  Pruned old backup: ${f.name}`)
  }
}

console.log(`📁 Kept ${Math.min(files.length, KEEP)} of ${files.length} backups in ${OUT_DIR}`)
