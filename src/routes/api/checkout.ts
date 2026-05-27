import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../lib/auth'
import { db } from '../../lib/db'
import { userCredits } from '../../lib/schema'
import { eq } from 'drizzle-orm'
import { TIER_CONFIG } from '../../lib/tiers'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        const userId = session.user.id;
        const body = await request.json().catch(() => ({}));
        const { action, tier, amount } = body;

        // Fetch user credits
        let credits = await db
          .select()
          .from(userCredits)
          .where(eq(userCredits.userId, userId))
          .then((res: any[]) => res[0]);

        if (!credits) {
          credits = await db
            .insert(userCredits)
            .values({
              userId,
              tier: 'free',
              monthlyHt: 5000,
              usedHt: 0,
              extraHt: 0,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .returning()
            .then((res: any[]) => res[0]);
        }

        if (action === 'subscribe') {
          if (!tier || !TIER_CONFIG[tier as keyof typeof TIER_CONFIG]) {
            return new Response(JSON.stringify({ error: "Invalid tier" }), { 
              status: 400, 
              headers: { 'Content-Type': 'application/json' } 
            });
          }

          const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
          
          await db
            .update(userCredits)
            .set({
              tier: tier,
              monthlyHt: config.monthlyHT,
              usedHt: 0, // Reset usage for new period
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, userId));

          return new Response(JSON.stringify({ 
            success: true, 
            message: `Tebrikler! ${config.displayName} planına başarıyla geçtiniz.`,
            tier,
            monthlyHT: config.monthlyHT
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } 
        
        if (action === 'buy_extra') {
          const extraHTAmount = amount || 10000;
          
          await db
            .update(userCredits)
            .set({
              extraHt: credits.extraHt + extraHTAmount,
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, userId));

          return new Response(JSON.stringify({ 
            success: true, 
            message: `Başarılı! Hesabınıza ${extraHTAmount.toLocaleString()} HT ek kredi yüklendi.`,
            extraHT: credits.extraHt + extraHTAmount
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }
})
