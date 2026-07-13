// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { chatSessions, chatMessages } from '../../../lib/schema'
import { eq, sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/chat/save')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const body = await request.json().catch(() => ({}))
        const { sessionId, ticker, context, title, userMessage, assistantMessage } = body

        if (!userMessage?.text || !assistantMessage?.text) {
          return new Response(JSON.stringify({ error: 'Missing user or assistant message' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        try {
          let sid = sessionId
          const now = new Date()

          if (!sid) {
            sid = crypto.randomUUID()
            await db.insert(chatSessions).values({
              id: sid,
              userId: session.user.id,
              ticker: ticker || null,
              context: context || null,
              title: title || userMessage.text.slice(0, 80),
              createdAt: now,
              updatedAt: now,
            })
          }

          await db.insert(chatMessages).values({
            id: crypto.randomUUID(),
            sessionId: sid,
            role: 'user',
            text: userMessage.text,
            context: userMessage.context || context || null,
            createdAt: now,
          })

          await db.insert(chatMessages).values({
            id: crypto.randomUUID(),
            sessionId: sid,
            role: 'assistant',
            text: assistantMessage.text,
            suggestions: assistantMessage.suggestions ? JSON.stringify(assistantMessage.suggestions) : null,
            widget: assistantMessage.widget ? JSON.stringify(assistantMessage.widget) : null,
            inputTokens: assistantMessage.inputTokens || null,
            outputTokens: assistantMessage.outputTokens || null,
            createdAt: now,
          })

          await db.update(chatSessions)
            .set({ messageCount: sql`COALESCE(message_count, 0) + 2`, updatedAt: now })
            .where(eq(chatSessions.id, sid))

          return new Response(JSON.stringify({ success: true, sessionId: sid }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err) {
          console.error('chat save error:', err)
          return new Response(JSON.stringify({ error: 'Failed to save chat' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }
  }
})
