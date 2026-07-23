import { createFileRoute } from '@tanstack/react-router'
import { Webhooks } from '@polar-sh/tanstack-start'
import { db } from '../../../lib/db'
import { userCredits } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

const PRODUCT_TIER_MAP: Record<string, { tier: string; monthlyJT: number }> = {
  '21cce3c0-6541-4e3d-81be-d8287e78eb0f': { tier: 'jetabone', monthlyJT: 100_000 },
  '575bb0d5-44c3-49d6-aaba-fa8a9b0cc08c': { tier: 'proabone', monthlyJT: 500_000 },
}

const FREE_TIER = { tier: 'free', monthlyJT: 5_000 }

async function upsertCredits(userId: string, values: Record<string, any>) {
  const existing = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .then((r: any[]) => r[0])

  if (existing) {
    await db.update(userCredits).set(values).where(eq(userCredits.userId, userId))
  } else {
    await db.insert(userCredits).values({ userId, extraJt: 0, ...values })
  }
}

export const Route = createFileRoute('/api/webhooks/polar')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
        if (!webhookSecret) {
          console.error('[Polar Webhook] Missing POLAR_WEBHOOK_SECRET')
          return Response.json({ error: 'Missing webhook secret' }, { status: 500 })
        }

        const handler = Webhooks({
          webhookSecret,
          onOrderPaid: async (event) => {
            const data = (event as any).data
            const userId = data.customer?.external_id
            const productId = data.product?.id || data.subscription?.product?.id || data.product_id
            if (!userId || !productId) return

            const tierInfo = PRODUCT_TIER_MAP[productId]
            if (!tierInfo) return

            const sub = data.subscription
            const periodEnd = sub?.current_period_end
              ? new Date(sub.current_period_end)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            await upsertCredits(userId, {
              tier: tierInfo.tier,
              monthlyJt: tierInfo.monthlyJT,
              usedJt: 0,
              polarSubId: sub?.id || data.subscription_id || null,
              polarSubStatus: 'active',
              polarSubCurrentPeriodEnd: periodEnd,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            })
          },
          onSubscriptionActive: async (event) => {
            const data = (event as any).data
            const userId = data.customer?.external_id
            const productId = data.product?.id || data.product_id
            if (!userId || !productId) return

            const tierInfo = PRODUCT_TIER_MAP[productId]
            if (!tierInfo) return

            const periodEnd = data.current_period_end
              ? new Date(data.current_period_end)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

            await upsertCredits(userId, {
              tier: tierInfo.tier,
              monthlyJt: tierInfo.monthlyJT,
              usedJt: 0,
              polarSubId: data.id,
              polarSubStatus: 'active',
              polarSubCurrentPeriodEnd: periodEnd,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            })
          },
          onSubscriptionCanceled: async (event) => {
            const data = (event as any).data
            const userId = data.customer?.external_id
            if (!userId) return

            await db
              .update(userCredits)
              .set({
                polarSubStatus: 'canceled',
                polarSubCurrentPeriodEnd: data.current_period_end
                  ? new Date(data.current_period_end)
                  : undefined,
                updatedAt: new Date(),
              })
              .where(eq(userCredits.userId, userId))
          },
          onSubscriptionRevoked: async (event) => {
            const data = (event as any).data
            const userId = data.customer?.external_id
            if (!userId) return

            await db
              .update(userCredits)
              .set({
                tier: FREE_TIER.tier,
                monthlyJt: FREE_TIER.monthlyJT,
                usedJt: 0,
                polarSubId: null,
                polarSubStatus: 'revoked',
                polarSubCurrentPeriodEnd: data.current_period_end
                  ? new Date(data.current_period_end)
                  : undefined,
                updatedAt: new Date(),
                resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              })
              .where(eq(userCredits.userId, userId))
          },
        })

        return handler({ request })
      },
    },
  },
})
