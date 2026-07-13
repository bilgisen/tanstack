// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { chatSessions } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'

export const Route = createFileRoute('/api/chat/sessions')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const url = new URL(request.url)
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
        const offset = parseInt(url.searchParams.get('offset') || '0')

        try {
          const rows = await db.select({
            id: chatSessions.id,
            ticker: chatSessions.ticker,
            context: chatSessions.context,
            title: chatSessions.title,
            messageCount: chatSessions.messageCount,
            createdAt: chatSessions.createdAt,
            updatedAt: chatSessions.updatedAt,
          })
            .from(chatSessions)
            .where(eq(chatSessions.userId, session.user.id))
            .orderBy(desc(chatSessions.updatedAt))
            .limit(limit)
            .offset(offset)

          return new Response(JSON.stringify({ sessions: rows }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err) {
          console.error('chat sessions list error:', err)
          return new Response(JSON.stringify({ error: 'Failed to list sessions' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }
  }
})
