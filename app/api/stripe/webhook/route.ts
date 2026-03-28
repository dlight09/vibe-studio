import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe'
import { handleStripeCheckoutCompleted } from '@/lib/actions/membership'
import { logError, logInfo, logWarn } from '@/lib/observability'

export async function POST(request: NextRequest) {
  const stripe = getStripeClient()
  const webhookSecret = getStripeWebhookSecret()

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    logWarn('api.stripe.webhook.invalid_signature', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      if (!userId || !planId) {
        logWarn('api.stripe.webhook.missing_metadata', {
          checkoutSessionId: session.id,
        })
        return NextResponse.json({ received: true })
      }

      const result = await handleStripeCheckoutCompleted({
        checkoutSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        userId,
        planId,
      })

      if (result.error) {
        logError('api.stripe.webhook.checkout_completed_failed', {
          checkoutSessionId: session.id,
          userId,
          planId,
          error: result.error,
        })
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      logInfo('api.stripe.webhook.checkout_completed', {
        checkoutSessionId: session.id,
        purchaseId: result.purchaseId,
        duplicate: result.duplicate,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logError('api.stripe.webhook.unhandled', {
      eventType: event.type,
      error: error instanceof Error ? error.message : 'unknown',
    })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
