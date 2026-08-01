import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'

export const Route = createFileRoute('/api/ai/session-token')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session) {
            return new Response(JSON.stringify({ token: null }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ token: session.session.token }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err) {
          console.error('[session-token] Error:', err);
          return new Response(JSON.stringify({ token: null }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
})
