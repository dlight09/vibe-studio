import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { updateClass } from '@/lib/actions/admin'
import ClassForm from '@/components/admin/ClassForm'

async function updateAction(classId: string, _: { error?: string; success?: boolean }, formData: FormData) {
  'use server'
  const classTypeId = String(formData.get('classTypeId') || '')
  const instructorId = String(formData.get('instructorId') || '')
  const startTimeRaw = String(formData.get('startTime') || '')
  const durationMinutes = Number(formData.get('durationMinutes') || 0)
  const capacity = Number(formData.get('capacity') || 0)
  const room = (formData.get('room') as string) || undefined

  const result = await updateClass(classId, {
    classTypeId,
    instructorId,
    startTime: startTimeRaw,
    durationMinutes,
    capacity,
    room,
  })

  if (result?.error) return { error: result.error, success: false }
  return { success: true }
}

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [classTypes, instructors] = await Promise.all([
    prisma.classType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.instructor.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const initial = {
    classTypeId: classItem.classTypeId,
    instructorId: classItem.instructorId,
    startTime: new Date(classItem.startTime).toISOString().slice(0, 16),
    durationMinutes: Math.round((classItem.endTime.getTime() - classItem.startTime.getTime()) / 60000),
    capacity: classItem.capacity,
    room: classItem.room,
  }

  return (
    <div className="admin-classes-page" style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Edit Class</h1>
          <p className="page-subtitle">Update class details and instructor</p>
        </div>
      </div>

      <ClassForm
        classTypes={classTypes}
        instructors={instructors}
        initial={initial}
        action={updateAction.bind(null, id)}
        submitLabel="Update Class"
      />
    </div>
  )
}
