// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { auth } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { userCredits } from '../../../lib/schema'
import { TIER_CONFIG } from '../../../lib/tiers'

export const Route = createFileRoute('/api/user/credits')({
  server: {
    handlers: {
      GET: async ({ request }) => {
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

        // Fetch or auto-provision credits with try-catch fallback
        let credits: any = null;
        try {
          credits = await db
            .select()
            .from(userCredits)
            .where(eq(userCredits.userId, userId))
            .then((res: Array<any>) => res[0]);

          if (!credits) {
            try {
              credits = await db
                .insert(userCredits)
                .values({
                  userId,
                  tier: 'free',
                  monthlyJt: 5000,
                  usedJt: 0,
                  extraJt: 0,
                  resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                })
                .returning()
                .then((res: Array<any>) => res[0]);
            } catch (err) {
              console.error("Auto-provision error in GET /api/user/credits:", err);
            }
          }
        } catch (dbErr) {
          console.warn("Database connection or query failed in GET /api/user/credits, falling back to mock credits:", dbErr);
        }

        const monthlyJT = credits?.monthlyJt ?? 5000;
        const usedJT = credits?.usedJt ?? 0;
        const extraJT = credits?.extraJt ?? 0;
        const availableJT = (monthlyJT - usedJT) + extraJT;
        const usagePercent = Math.min(100, Math.round((usedJT / Math.max(1, monthlyJT)) * 100));

        return new Response(JSON.stringify({
          tier: credits?.tier ?? 'free',
          tierDisplayName: TIER_CONFIG[(credits?.tier || 'free') as keyof typeof TIER_CONFIG]?.displayName || credits?.tier,
          monthlyJT,
          usedJT,
          extraJT,
          availableJT,
          usagePercent,
          resetAt: credits?.resetAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          dodoCustomerId: credits?.dodoCustomerId || null,
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
})
