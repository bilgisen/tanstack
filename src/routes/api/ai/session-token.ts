import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'

export const Route = createFileRoute('/api/ai/session-token')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const cookieHeader = request.headers.get("cookie") || "";
          const hasAuthCookie = cookieHeader.length > 0;
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session) {
            if (!hasAuthCookie) {
              console.warn("[session-token] No cookie header received on request (mobile off-origin / cookie blocked?)");
            } else {
              console.warn("[session-token] Cookie present but no session found (expired / test subdomain cookie scope?)");
            }
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
