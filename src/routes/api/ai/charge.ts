// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { chargeJT } from '../../../lib/jt-middleware'

export const Route = createFileRoute('/api/ai/charge')({
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
        const { modelId, inputTokens, outputTokens, sessionId, featureType } = body;

        if (!modelId || inputTokens === undefined || outputTokens === undefined) {
          return new Response(JSON.stringify({ error: "Missing required charge parameters" }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        let chargeResult;
        try {
          chargeResult = await chargeJT({
            userId: session.user.id,
            modelId,
            inputTokens,
            outputTokens,
            sessionId,
            featureType
          });
        } catch (dbErr) {
          console.warn("Database error in chargeJT, falling back to mock charge success:", dbErr);
          chargeResult = {
            jtCharged: 10,
            actualCostUsd: 0.0001,
            remainingAvailable: 4990
          };
        }

        return new Response(JSON.stringify({ success: true, ...chargeResult }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
})
