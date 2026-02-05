export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'

export default async function AuditPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const logs = await (prisma as any).auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Audit Log</h1>
          <p className="admin-subtitle">Recent operational events (last 200)</p>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l: any) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString()}</td>
                <td><code>{l.action}</code></td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="font-medium">{l.entityType}</span>
                    <span className="text-xs text-muted">{l.entityId || '—'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="font-medium">{l.actorEmail || 'system'}</span>
                    <span className="text-xs text-muted">{l.actorRole || '—'}</span>
                  </div>
                </td>
                <td style={{ maxWidth: 520 }}>
                  <pre style={{ margin: 0, fontSize: 12, overflow: 'auto', maxHeight: 120 }}>
                    {l.metadata ? JSON.stringify(l.metadata, null, 2) : '—'}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🧾</div>
            <h3 className="empty-title">No audit events yet</h3>
            <p className="empty-description">Events will appear as staff operate the studio.</p>
          </div>
        )}
      </div>
    </div>
  )
}
