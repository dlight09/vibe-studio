import { NextRequest, NextResponse } from 'next/server'
import { bookClass } from '@/lib/actions/bookings'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const classId = formData.get('classId') as string

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
