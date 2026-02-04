import { NextRequest, NextResponse } from 'next/server'
import { bookClass } from '@/lib/actions/bookings'

export async function POST(request: NextRequest) {
  let classId: string | null = null
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await request.formData()
      classId = (formData.get('classId') as string | null) ?? null
    } catch {
      classId = null
    }
  } else if (contentType.includes('application/json')) {
    try {
      const body = await request.json()
      classId = typeof body?.classId === 'string' ? body.classId : null
    } catch {
      classId = null
    }
  }

  if (!classId) {
    return NextResponse.json({ error: 'Class ID required' }, { status: 400 })
  }

  const result = await bookClass(classId)

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: result.message,
    isWaitlist: result.isWaitlist,
  })
}
