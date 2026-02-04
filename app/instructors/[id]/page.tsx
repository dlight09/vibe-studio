import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate, formatTime } from '@/lib/utils'

async function getInstructor(id: string) {
  const instructor = await prisma.instructor.findFirst({
    where: { id, isActive: true },
    include: {
      classes: {
        where: {
          startTime: { gte: new Date() },
          isCancelled: false,
        },
        include: {
          classType: true,
          bookings: {
            where: { status: 'CONFIRMED' },
          },
        },
        orderBy: { startTime: 'asc' },
        take: 20,
      },
    },
  })

  if (!instructor) return null

  const upcomingClasses = instructor.classes.filter(
    c => new Date(c.startTime) >= new Date()
  )

  const byClassType = upcomingClasses.reduce((acc: Record<string, { name: string; count: number }>, c) => {
    const type = c.classType.name
    if (!acc[type]) acc[type] = { name: type, count: 0 }
    acc[type].count++
    return acc
  }, {})

  const specialties = Array.isArray(instructor.specialties)
    ? instructor.specialties
    : JSON.parse(instructor.specialties || '[]')

  return {
    ...instructor,
    upcomingClasses,
    byClassType: Object.values(byClassType),
    specialties,
  }
}

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const instructor = await getInstructor(id)

  if (!instructor) {
    redirect('/instructors')
  }

  return (
    <div className="instructor-detail-page">
      <div className="page-header">
        <Link href="/instructors" className="back-link">← All Instructors</Link>
        <div className="instructor-profile">
          <div className="instructor-avatar large">
            {instructor.avatarUrl ? (
              <img src={instructor.avatarUrl} alt={instructor.name} />
            ) : (
              <span>{instructor.name.split(' ').map(n => n[0]).join('')}</span>
            )}
          </div>
          <div className="instructor-info">
            <h1 className="instructor-name">{instructor.name}</h1>
            {instructor.bio && <p className="instructor-bio">{instructor.bio}</p>}
            <div className="specialties-list">
              {instructor.specialties.map((specialty: string) => (
                <span key={specialty} className="specialty-badge">{specialty}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2 className="section-title">Upcoming Classes</h2>
        {instructor.upcomingClasses.length === 0 ? (
          <div className="empty card">
            <p className="empty-description">No upcoming classes scheduled</p>
            <Link href="/schedule" className="btn btn-primary">Browse Schedule</Link>
          </div>
        ) : (
          <div className="classes-grid">
            {instructor.upcomingClasses.map((classItem) => (
              <Link href="/schedule" key={classItem.id} className="class-card-link">
                <div className="card class-card">
                  <div className="class-header">
                    <span className="class-icon">{classItem.classType.icon || '●'}</span>
                    <div>
                      <h3 className="class-name">{classItem.classType.name}</h3>
                      <p className="class-meta">
                        {formatDate(classItem.startTime)} at {formatTime(classItem.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="class-footer">
                    <span className="class-duration">{classItem.classType.durationMinutes} min</span>
                    <span className="class-spots">
                      {classItem.bookings.length >= classItem.capacity ? (
                        <span className="badge badge-error">Full</span>
                      ) : (
                        <span className="badge">{classItem.capacity - classItem.bookings.length} spots</span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {instructor.byClassType.length > 0 && (
        <div className="content-section">
          <h2 className="section-title">Classes by Type</h2>
          <div className="class-types-list">
            {instructor.byClassType.map((type) => (
              <div key={type.name} className="class-type-item">
                <span className="type-name">{type.name}</span>
                <span className="type-count">{type.count} upcoming</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
