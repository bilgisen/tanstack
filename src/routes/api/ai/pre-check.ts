// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { checkAndReserveHT } from '../../../lib/ht-middleware'

export const Route = createFileRoute('/api/ai/pre-check')({
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

        const body = await request.json().catch(() => ({}));
        const { modelId, estimatedInputTokens, estimatedOutputTokens } = body;

        if (!modelId) {
          return new Response(JSON.stringify({ error: "Missing modelId" }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        const check = await checkAndReserveHT(
          session.user.id,
          modelId,
          estimatedInputTokens || 1000,
          estimatedOutputTokens || 500
        );

        return new Response(JSON.stringify(check), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
})
