import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { createClass } from '@/lib/actions/admin'
import ClassForm from '@/components/admin/ClassForm'

async function createAction(_: { error?: string; success?: boolean }, formData: FormData) {
  'use server'
  const classTypeId = String(formData.get('classTypeId') || '')
  const instructorId = String(formData.get('instructorId') || '')
  const startTimeRaw = String(formData.get('startTime') || '')
  const durationMinutes = Number(formData.get('durationMinutes') || 0)
  const capacity = Number(formData.get('capacity') || 0)
  const room = (formData.get('room') as string) || undefined
  const overrideConflicts = formData.get('overrideConflicts') === '1'
  const overrideReason = String(formData.get('overrideReason') || '')

  const result = await createClass({
    classTypeId,
    instructorId,
    startTime: startTimeRaw,
    durationMinutes,
    capacity,
    room,
    overrideConflicts,
    overrideReason,
  })

  if (result?.error) return { error: result.error, success: false }
  return { success: true }
}

export default async function NewClassPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const [classTypes, instructors] = await Promise.all([
    prisma.classType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.instructor.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div className="admin-classes-page" style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Create Class</h1>
          <p className="page-subtitle">Add a new class to the schedule</p>
        </div>
      </div>

      <ClassForm
        classTypes={classTypes}
        instructors={instructors}
        action={createAction}
        submitLabel="Create Class"
        canOverride={session.role === 'ADMIN'}
      />
    </div>
  )
}
