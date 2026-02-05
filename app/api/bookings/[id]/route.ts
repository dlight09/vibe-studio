import { NextRequest, NextResponse } from 'next/server'
import { cancelBooking } from '@/lib/actions/bookings'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await cancelBooking(id)

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: result.message })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await cancelBooking(id)

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: result.message })
}
