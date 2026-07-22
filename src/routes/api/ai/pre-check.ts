// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { checkAndReserveJT } from '../../../lib/jt-middleware'

export const Route = createFileRoute('/api/ai/pre-check')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
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

          const check = await checkAndReserveJT(
            session.user.id,
            modelId,
            estimatedInputTokens || 1000,
            estimatedOutputTokens || 500
          );

          return new Response(JSON.stringify(check), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('[pre-check] Error:', error);
          return new Response(
            JSON.stringify({ 
              error: "Internal server error", 
              details: error instanceof Error ? error.message : String(error)
            }), 
            { 
              status: 500, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    }
  }
})
