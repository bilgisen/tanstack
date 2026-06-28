// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../lib/db'
import { userCredits, webhookEvents } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export const Route = createFileRoute('/api/webhooks/polar')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

        const body = await request.text();
        const signature = request.headers.get('polar-signature') || '';

        // Verify signature if secret is defined
        if (POLAR_WEBHOOK_SECRET) {
          const expected = crypto
            .createHmac('sha256', POLAR_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

          if (signature !== `sha256=${expected}`) {
            return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
              status: 401, 
              headers: { 'Content-Type': 'application/json' } 
            });
          }
        }

        const event = JSON.parse(body);
        const eventId = event.id;

        // Idempotency check
        const alreadyProcessed = await db
          .select()
          .from(webhookEvents)
          .where(eq(webhookEvents.eventId, eventId))
          .then((res: any[]) => res[0]);

        if (alreadyProcessed) {
          return new Response(JSON.stringify({ ok: true, skipped: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          await handlePolarEvent(event);

          // Save to webhook_events
          await db.insert(webhookEvents).values({
            eventId,
            eventType: event.type,
            processedAt: new Date(),
          });

          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err: any) {
          console.error('Webhook processing error:', err);
          return new Response(JSON.stringify({ error: 'Processing failed', message: err.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
      }
    }
  }
})

async function handlePolarEvent(event: any) {
  const { type, data } = event;

  // Retrieve user_id from metadata
  const userId = data.customer?.metadata?.user_id
    || data.subscription?.customer?.metadata?.user_id;

  if (!userId) throw new Error('user_id not found in event metadata');

  const polarCustomerId = data.customer?.id || data.subscription?.customer?.id;
  const polarSubId = data.subscription?.id || data.id;
  const metadata = data.product?.metadata || data.subscription?.product?.metadata || {};
  const tier = metadata.tier || 'free';
  const monthlyHT = metadata.monthly_ht || 5000;

  switch (type) {
    case 'subscription.created':
    case 'subscription.updated':
      await db
        .update(userCredits)
        .set({
          tier,
          monthlyHt: monthlyHT,
          usedHt: 0, // Reset usage for new period
          polarCustomerId,
          polarSubId,
          resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));
      break;

    case 'subscription.canceled':
    case 'subscription.revoked':
      await db
        .update(userCredits)
        .set({
          tier: 'free',
          monthlyHt: 5000,
          polarSubId: null,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));
      break;

    case 'order.created':
      const extraHT = metadata.extra_ht || 0;
      if (extraHT > 0) {
        // Fetch current user credits to add extraHt
        const credits = await db
          .select()
          .from(userCredits)
          .where(eq(userCredits.userId, userId))
          .then((res: any[]) => res[0]);

        if (credits) {
          await db
            .update(userCredits)
            .set({
              extraHt: credits.extraHt + extraHT,
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, userId));
        }
      }
      break;
  }
}
