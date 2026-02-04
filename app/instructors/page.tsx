import Link from 'next/link'
import { getInstructorsPublic } from '@/lib/actions/instructors-public'

export default async function InstructorsPage() {
  const instructors = await getInstructorsPublic()

  return (
    <div className="instructors-page">
      <div className="page-header">
        <h1 className="page-title">Our Instructors</h1>
        <p className="page-subtitle">Meet the team guiding your fitness journey</p>
      </div>

      {instructors.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👩‍🏫</div>
          <h3 className="empty-title">No instructors available</h3>
          <p className="empty-description">Check back soon for our talented team.</p>
        </div>
      ) : (
        <div className="instructors-grid">
          {instructors.map((instructor) => {
            const specialties = Array.isArray(instructor.specialties)
              ? instructor.specialties
              : JSON.parse(instructor.specialties || '[]')
            return (
              <Link href={`/instructors/${instructor.id}`} key={instructor.id} className="instructor-card-link">
                <div className="card instructor-card">
                  <div className="instructor-avatar">
                    {instructor.avatarUrl ? (
                      <img src={instructor.avatarUrl} alt={instructor.name} />
                    ) : (
                      <span>{instructor.name.split(' ').map(n => n[0]).join('')}</span>
                    )}
                  </div>
                  <h3 className="instructor-name">{instructor.name}</h3>
                  {instructor.bio && (
                    <p className="instructor-bio">{instructor.bio}</p>
                  )}
                  <div className="instructor-specialties">
                    {specialties.slice(0, 3).map((specialty: string) => (
                      <span key={specialty} className="specialty-tag">{specialty}</span>
                    ))}
                  </div>
                  <span className="view-profile">View Profile →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
