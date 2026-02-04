import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { getAdminClasses, promoteFromWaitlistAdmin } from '@/lib/actions/admin'
import { prisma } from '@/lib/db'
import { formatDate, formatTime } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export default async function AdminClassesPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 14)

  const [classes, classTypes, instructors] = await Promise.all([
    getAdminClasses(new Date(), endDate),
    prisma.classType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.instructor.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="admin-classes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Classes</h1>
          <p className="page-subtitle">Create, edit, and manage class schedules</p>
        </div>
        <form action={async () => {
          'use server'
          redirect('/admin/classes/new')
        }}>
          <button type="submit" className="btn btn-primary">
            + Add Class
          </button>
        </form>
      </div>

      <div className="table-container card">
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Class</th>
              <th>Instructor</th>
              <th>Bookings</th>
              <th>Waitlist</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem.id}>
                <td>
                  <div className="date-cell">
                    <span className="date-main">{formatDate(classItem.startTime)}</span>
                    <span className="date-sub">{formatTime(classItem.startTime)}</span>
                  </div>
                </td>
                <td>
                  <div className="class-cell">
                    <span className="class-name">{classItem.classType.name}</span>
                    <span className="class-room">{classItem.room || 'Main Studio'}</span>
                  </div>
                </td>
                <td>
                  <div className="instructor-cell">
                    <div className="avatar avatar-sm">
                      {classItem.instructor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{classItem.instructor.name}</span>
                  </div>
                </td>
                <td>
                  <div className="booking-cell">
                    <span className={classItem.bookings.length >= classItem.capacity ? 'text-warning' : ''}>
                      {classItem.bookings.length}/{classItem.capacity}
                    </span>
                  </div>
                </td>
                <td>
                  {classItem.waitlistEntries.length > 0 ? (
                    <div className="waitlist-cell">
                      <span className="waitlist-count">{classItem.waitlistEntries.length}</span>
                      <div className="waitlist-preview">
                        {classItem.waitlistEntries.slice(0, 3).map((entry) => (
                          <div key={entry.id} className="waitlist-item">
                            <span>{entry.user.name}</span>
                            <form action={async () => {
                              'use server'
                              await promoteFromWaitlistAdmin(classItem.id, entry.userId)
                              revalidatePath('/admin/classes')
                            }}>
                              <button type="submit" className="btn btn-ghost btn-sm">
                                Promote
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <form action={async () => {
                      'use server'
                      redirect(`/admin/classes/${classItem.id}/edit`)
                    }}>
                      <button type="submit" className="btn btn-ghost btn-sm">
                        Edit
                      </button>
                    </form>
                    {classItem.bookings.length === 0 && (
                      <form action={async () => {
                        'use server'
                        await prisma.class.delete({ where: { id: classItem.id } })
                        revalidatePath('/admin/classes')
                      }}>
                        <button type="submit" className="btn btn-ghost btn-sm text-error">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {classes.length === 0 && (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <h3 className="empty-title">No classes scheduled</h3>
            <p className="empty-description">
              Create your first class to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
