import { NextRequest, NextResponse } from 'next/server'
import { createStripeCheckoutForPlan } from '@/lib/actions/membership'
import { logError } from '@/lib/observability'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const planId = typeof body?.planId === 'string' ? body.planId : null

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    const result = await createStripeCheckoutForPlan({ planId })
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, checkoutUrl: result.checkoutUrl })
  } catch (error) {
    logError('api.payments.checkout.failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
