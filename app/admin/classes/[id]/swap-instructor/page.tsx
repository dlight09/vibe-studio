export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { updateClass } from '@/lib/actions/admin'
import { formatDateTime } from '@/lib/utils'

export default async function SwapInstructorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const { id } = await params

  const classItem = await prisma.class.findUnique({
    where: { id },
    include: {
      classType: true,
      instructor: true,
    },
  })
  if (!classItem) redirect('/admin/classes')

  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/admin/classes" className="back-link">
        ← Back to Classes
      </Link>

      <div style={{ marginTop: 12, marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 6 }}>Swap Instructor</h1>
        <div className="text-sm text-muted">
          {classItem.classType.name} • {formatDateTime(classItem.startTime)}
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="text-sm text-muted">Current instructor</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div className="avatar avatar-sm">
            {classItem.instructor.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="font-semibold">{classItem.instructor.name}</div>
        </div>
      </div>

      <form
        className="card"
        style={{ padding: 24, display: 'grid', gap: 16 }}
        action={async (formData: FormData) => {
          'use server'
          const instructorId = String(formData.get('instructorId') || '')
          const changeNote = String(formData.get('changeNote') || '')
          const overrideConflicts = formData.get('overrideConflicts') === '1'
          const overrideReason = String(formData.get('overrideReason') || '')

          const res = await updateClass(id, {
            instructorId,
            changeNote,
            overrideConflicts,
            overrideReason,
          })

          if (res?.error) {
            redirect(`/admin/classes/${id}/swap-instructor?error=${encodeURIComponent(res.error)}`)
          }
          redirect('/admin/classes')
        }}
      >
        <div className="form-group">
          <label className="label" htmlFor="instructorId">New instructor</label>
          <select className="input" id="instructorId" name="instructorId" defaultValue="" required>
            <option value="" disabled>Select instructor</option>
            {instructors
              .filter((i) => i.id !== classItem.instructorId)
              .map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="changeNote">Reason *</label>
          <input
            className="input"
            id="changeNote"
            name="changeNote"
            placeholder="Why are we swapping the instructor?"
            required
          />
        </div>

        {session.role === 'ADMIN' && (
          <div className="card" style={{ padding: '14px 16px', background: 'rgb(var(--muted))' }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" name="overrideConflicts" value="1" />
              <span className="text-sm font-medium">Override conflicts (Admin only)</span>
            </label>
            <div style={{ marginTop: 10 }}>
              <label className="label" htmlFor="overrideReason">Override reason</label>
              <input className="input" id="overrideReason" name="overrideReason" placeholder="Required when overriding" />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/admin/classes" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary">Swap Instructor</button>
        </div>
      </form>
    </div>
  )
}
