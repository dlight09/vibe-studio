import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { createInstructor } from '@/lib/actions/instructors'

export default async function NewInstructorPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <div className="new-instructor-page">
      <div className="page-header">
        <a href="/admin/instructors" className="back-link">← Back to Instructors</a>
        <h1 className="page-title">Add New Instructor</h1>
        <p className="page-subtitle">Create a new instructor profile</p>
      </div>

      <form action={async (formData) => {
        'use server'
        const name = formData.get('name') as string
        const bio = formData.get('bio') as string
        const specialtiesStr = formData.get('specialties') as string
        const specialties = specialtiesStr.split(',').map(s => s.trim()).filter(Boolean)

        await createInstructor({ name, bio, specialties })
        redirect('/admin/instructors')
      }} className="instructor-form card">
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="name" className="label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input"
              placeholder="e.g., Sarah Johnson"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="label">Bio</label>
            <textarea
              id="bio"
              name="bio"
              className="input textarea"
              rows={4}
              placeholder="Brief biography and teaching experience..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialties" className="label">Specialties</label>
            <input
              type="text"
              id="specialties"
              name="specialties"
              className="input"
              placeholder="e.g., Vinyasa Yoga, Pilates, Meditation"
            />
            <p className="form-hint">Separate specialties with commas</p>
          </div>

          <div className="form-group">
            <label htmlFor="avatarUrl" className="label">Profile Photo URL</label>
            <input
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              className="input"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="form-actions">
            <a href="/admin/instructors" className="btn btn-secondary">Cancel</a>
            <button type="submit" className="btn btn-primary">Create Instructor</button>
          </div>
        </div>
      </form>
    </div>
  )
}
