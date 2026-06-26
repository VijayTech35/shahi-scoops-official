// Audit log helper — records admin actions for compliance/forensics.
// Use: await logAudit(req, 'product.create', 'product', productId, { name, price })

import pool from '../config/db.js'

export async function logAudit(req, action, resourceType, resourceId, details) {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req?.user?.id || null,
        action,
        resourceType,
        resourceId,
        details ? JSON.stringify(details) : null,
        req?.ip || req?.headers?.['x-forwarded-for'] || null,
        req?.headers?.['user-agent']?.slice(0, 200) || null,
      ]
    )
  } catch (e) {
    // Don't crash the request if audit log fails
    console.error('audit log failed:', e.message)
  }
}
