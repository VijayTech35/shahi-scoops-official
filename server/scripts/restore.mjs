// Restore a Shahi Scoops SQLite backup.
// Usage:
//   node scripts/restore.mjs                                    # restore most recent
//   node scripts/restore.mjs backups/shahi-2026-06-06T07-45-24.db # restore specific
// DESTRUCTIVE — overwrites the current DB. Back up the current one first.

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import readline from 'readline'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.join(__dirname, '..')
const DB_PATH = path.join(SERVER_ROOT, 'data', 'shahi_scoops.db')
const BACKUPS_DIR = path.join(SERVER_ROOT, 'backups')

const target = process.argv[2]

let backupFile
if (target) {
  backupFile = path.isAbsolute(target) ? target : path.join(SERVER_ROOT, target)
} else {
  // Find most recent backup
  if (!fs.existsSync(BACKUPS_DIR)) {
    console.error('❌ No backups directory found.')
    process.exit(1)
  }
  const files = fs.readdirSync(BACKUPS_DIR)
    .filter(f => f.startsWith('shahi-') && f.endsWith('.db'))
    .map(f => ({ name: f, time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time)
  if (!files.length) {
    console.error('❌ No backups found in', BACKUPS_DIR)
    process.exit(1)
  }
  backupFile = path.join(BACKUPS_DIR, files[0].name)
  console.log(`📂 Most recent backup: ${files[0].name}`)
}

if (!fs.existsSync(backupFile)) {
  console.error(`❌ Backup not found: ${backupFile}`)
  process.exit(1)
}

// Confirm
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question(`⚠️  This will OVERWRITE ${DB_PATH} with ${path.basename(backupFile)}. Continue? (yes/no): `, async (answer) => {
  rl.close()
  if (answer.toLowerCase() !== 'yes') {
    console.log('Cancelled.')
    process.exit(0)
  }

  // Save current as pre-restore backup
  if (fs.existsSync(DB_PATH)) {
    const safety = path.join(BACKUPS_DIR, `pre-restore-${Date.now()}.db`)
    fs.copyFileSync(DB_PATH, safety)
    console.log(`🛟  Current DB saved as ${path.basename(safety)}`)
    // Also copy WAL/SHM if present
    for (const ext of ['-wal', '-shm']) {
      const f = DB_PATH + ext
      if (fs.existsSync(f)) {
        try { fs.copyFileSync(f, safety + ext) } catch {}
      }
    }
  }

  try {
    // Remove existing DB files (must close any connections first)
    for (const ext of ['', '-wal', '-shm']) {
      const f = DB_PATH + ext
      if (fs.existsSync(f)) fs.unlinkSync(f)
    }
    // Copy backup over
    fs.copyFileSync(backupFile, DB_PATH)
    console.log(`✅ Restored ${path.basename(backupFile)} → ${DB_PATH}`)
    console.log('💡 Restart the server for changes to take effect.')
  } catch (e) {
    console.error('❌ Restore failed:', e.message)
    process.exit(1)
  }
})
