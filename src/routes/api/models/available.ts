import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { modelConfigs, userCredits } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/models/available')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        let userTier = 'free';
        if (session) {
          const credits = await db
            .select()
            .from(userCredits)
            .where(eq(userCredits.userId, session.user.id))
            .then((res: any[]) => res[0]);
          if (credits) {
            userTier = credits.tier;
          }
        }

        // Fetch all active models
        const models = await db
          .select()
          .from(modelConfigs)
          .where(eq(modelConfigs.isActive, true))
          .execute();

        const formattedModels = models.map((m: any) => {
          const allowedTiers = m.allowedTiers || [];
          return {
            id: m.modelId,
            displayName: m.displayName,
            provider: m.provider,
            htPer1kInput: parseFloat(m.htPer1kInput),
            htPer1kOutput: parseFloat(m.htPer1kOutput),
            accessible: allowedTiers.includes(userTier),
            allowedTiers,
            estimatedHtPerCall: Math.ceil(
              (2 * parseFloat(m.htPer1kInput)) + (1 * parseFloat(m.htPer1kOutput)) // Estimate for 2K input, 1K output
            ),
          };
        });

        return new Response(JSON.stringify(formattedModels), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
})
