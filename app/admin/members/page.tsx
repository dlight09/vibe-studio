import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export default async function AdminMembersPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    take: 200,
  })

  return (
    <div className="admin-members-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">View members and manage memberships</p>
        </div>
      </div>

      <div className="table-container card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span className={u.role === 'ADMIN' ? 'badge badge-success' : u.role === 'STAFF' ? 'badge badge-warning' : 'badge'}>
                    {u.role}
                  </span>
                </td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <Link href={`/admin/members/${u.id}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="empty">
            <h3 className="empty-title">No users yet</h3>
            <p className="empty-description">Once members register, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
