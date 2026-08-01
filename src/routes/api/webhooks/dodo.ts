import { createFileRoute } from '@tanstack/react-router'
import { Webhooks } from '@dodopayments/tanstack'
import { eq } from 'drizzle-orm'
import { db } from '../../../lib/db'
import { userCredits, webhookEvents } from '../../../lib/schema'

const PRODUCT_TIER_MAP: Record<string, { tier: string; monthlyJT: number }> = {
  'pdt_0NjpffB3aBE7RwdXJULbw': { tier: 'jetabone', monthlyJT: 100_000 },
  'pdt_0NkGi2vCdyy51kPeIqNoS': { tier: 'proabone', monthlyJT: 500_000 },
}

const FREE_TIER = { tier: 'free', monthlyJT: 5_000 }

async function dedupEvent(eventId: string, eventType: string): Promise<boolean> {
  if (!eventId) return false
  const existing = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId))
    .then((r: Array<any>) => r[0])
  if (existing) return true
  await db.insert(webhookEvents).values({ eventId: eventId, eventType, processedAt: new Date() })
  return false
}

async function upsertCredits(userId: string, values: Omit<Partial<typeof userCredits.$inferInsert>, 'resetAt'> & { resetAt: Date }) {
  const existing = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .then((r: Array<any>) => r[0])

  if (existing) {
    await db.update(userCredits).set(values).where(eq(userCredits.userId, userId))
  } else {
    await db.insert(userCredits).values({ userId, extraJt: 0, ...values })
  }
}

export const Route = createFileRoute('/api/webhooks/dodo')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY
        if (!webhookKey) {
          console.error('[Dodo Webhook] Missing DODO_PAYMENTS_WEBHOOK_KEY')
          return Response.json({ error: 'Missing webhook key' }, { status: 500 })
        }

        const res = await Webhooks({
          webhookKey,
          onSubscriptionActive: async (payload) => {
            const data = (payload as any).data
            const eventId = (payload as any).business_id ? `${(payload as any).type}_${data.subscription_id}` : undefined
            const userId = data.customer?.metadata?.user_id
            const productId = data.product_id
            if (!userId || !productId) return
            if (eventId && await dedupEvent(eventId, 'subscription.active')) return

            const tierInfo = PRODUCT_TIER_MAP[productId]
            if (!tierInfo) return

            const periodEnd = data.next_billing_date
              ? new Date(data.next_billing_date)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            await upsertCredits(userId, {
              tier: tierInfo.tier,
              monthlyJt: tierInfo.monthlyJT,
              usedJt: 0,
              dodoCustomerId: data.customer?.customer_id || null,
              dodoSubId: data.subscription_id,
              dodoSubStatus: 'active',
              dodoSubCurrentPeriodEnd: periodEnd,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            })
          },
          onSubscriptionRenewed: async (payload) => {
            const data = (payload as any).data
            const eventId = (payload as any).business_id ? `${(payload as any).type}_${data.subscription_id}` : undefined
            const userId = data.customer?.metadata?.user_id
            const productId = data.product_id
            if (!userId || !productId) return
            if (eventId && await dedupEvent(eventId, 'subscription.renewed')) return

            const tierInfo = PRODUCT_TIER_MAP[productId]
            if (!tierInfo) return

            const periodEnd = data.next_billing_date
              ? new Date(data.next_billing_date)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            await upsertCredits(userId, {
              tier: tierInfo.tier,
              monthlyJt: tierInfo.monthlyJT,
              usedJt: 0,
              dodoSubStatus: 'active',
              dodoSubCurrentPeriodEnd: periodEnd,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            })
          },
          onSubscriptionCancelled: async (payload) => {
            const data = (payload as any).data
            const eventId = (payload as any).business_id ? `${(payload as any).type}_${data.subscription_id}` : undefined
            const userId = data.customer?.metadata?.user_id
            if (!userId) return
            if (eventId && await dedupEvent(eventId, 'subscription.cancelled')) return

            await db
              .update(userCredits)
              .set({
                dodoSubStatus: 'cancelled',
                dodoSubCurrentPeriodEnd: data.next_billing_date
                  ? new Date(data.next_billing_date)
                  : undefined,
                updatedAt: new Date(),
              })
              .where(eq(userCredits.userId, userId))
          },
          onSubscriptionExpired: async (payload) => {
            const data = (payload as any).data
            const eventId = (payload as any).business_id ? `${(payload as any).type}_${data.subscription_id}` : undefined
            const userId = data.customer?.metadata?.user_id
            if (!userId) return
            if (eventId && await dedupEvent(eventId, 'subscription.expired')) return

            await db
              .update(userCredits)
              .set({
                tier: FREE_TIER.tier,
                monthlyJt: FREE_TIER.monthlyJT,
                usedJt: 0,
                dodoSubId: null,
                dodoSubStatus: 'expired',
                dodoSubCurrentPeriodEnd: undefined,
                updatedAt: new Date(),
                resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              })
              .where(eq(userCredits.userId, userId))
          },
        })(request)
        return new Response(await res.text(), {
          status: res.status,
          statusText: res.statusText,
          headers: { 'content-type': 'application/json' },
        })
      },
    },
  },
})
