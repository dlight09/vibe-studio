import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { deleteInstructor } from '@/lib/actions/instructors'
import { revalidatePath } from 'next/cache'

async function getInstructors() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return []
  }

  return prisma.instructor.findMany({
    orderBy: { name: 'asc' },
    include: {
      classes: {
        where: {
          startTime: { gte: new Date() },
        },
        take: 5,
        orderBy: { startTime: 'asc' },
      },
      _count: {
        select: {
          classes: {
            where: {
              startTime: { gte: new Date() },
            },
          },
        },
      },
    },
  })
}

export default async function AdminInstructorsPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const instructors = await getInstructors()

  return (
    <div className="instructors-page-admin">
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructors</h1>
          <p className="page-subtitle">Manage your studio's instructors</p>
        </div>
        <form action={async () => {
          'use server'
          redirect('/admin/instructors/new')
        }}>
          <button type="submit" className="btn btn-primary">
            + Add Instructor
          </button>
        </form>
      </div>

      {instructors.length === 0 ? (
        <div className="empty card">
          <div className="empty-icon">👩‍🏫</div>
          <h3 className="empty-title">No instructors yet</h3>
          <p className="empty-description">
            Add your first instructor to start scheduling classes.
          </p>
        </div>
      ) : (
        <div className="instructors-grid">
          {instructors.map((instructor) => {
            const specialties = Array.isArray(instructor.specialties)
              ? instructor.specialties
              : JSON.parse(instructor.specialties || '[]')
            return (
              <div key={instructor.id} className="card instructor-card">
                <div className="instructor-header">
                  <div className="instructor-avatar">
                    {instructor.avatarUrl ? (
                      <img src={instructor.avatarUrl} alt={instructor.name} />
                    ) : (
                      <span>{instructor.name.split(' ').map(n => n[0]).join('')}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="instructor-name">{instructor.name}</h3>
                    <p className="instructor-count">
                      {instructor._count.classes} upcoming classes
                    </p>
                  </div>
                </div>

                {instructor.bio && (
                  <p className="instructor-bio">{instructor.bio}</p>
                )}

                <div className="instructor-specialties">
                  {specialties.map((specialty: string) => (
                    <span key={specialty} className="specialty-tag">
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="instructor-actions">
                  <Link href={`/admin/instructors/${instructor.id}`} className="btn btn-secondary btn-sm">
                    View Profile
                  </Link>
                  <form action={async () => {
                    'use server'
                    await deleteInstructor(instructor.id)
                    revalidatePath('/admin/instructors')
                  }}>
                    <button
                      type="submit"
                      className="btn btn-ghost btn-sm text-error"
                      disabled={instructor._count.classes > 0}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
