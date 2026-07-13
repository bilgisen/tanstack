// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { chatSessions, chatMessages } from '../../../lib/schema'
import { eq, and, asc } from 'drizzle-orm'

export const Route = createFileRoute('/api/chat/sessions/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        try {
          const [meta] = await db.select().from(chatSessions)
            .where(and(eq(chatSessions.id, params.id), eq(chatSessions.userId, session.user.id)))
            .limit(1)

          if (!meta) {
            return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
          }

          const messages = await db.select({
            id: chatMessages.id,
            role: chatMessages.role,
            text: chatMessages.text,
            context: chatMessages.context,
            suggestions: chatMessages.suggestions,
            widget: chatMessages.widget,
            inputTokens: chatMessages.inputTokens,
            outputTokens: chatMessages.outputTokens,
            createdAt: chatMessages.createdAt,
          })
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, params.id))
            .orderBy(asc(chatMessages.createdAt))

          const parsedMessages = messages.map(m => ({
            ...m,
            suggestions: m.suggestions ? JSON.parse(m.suggestions) : undefined,
            widget: m.widget ? JSON.parse(m.widget) : undefined,
          }))

          return new Response(JSON.stringify({ session: { ...meta, messages: parsedMessages } }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err) {
          console.error('chat session get error:', err)
          return new Response(JSON.stringify({ error: 'Failed to get session' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      },

      DELETE: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        try {
          await db.delete(chatSessions)
            .where(and(eq(chatSessions.id, params.id), eq(chatSessions.userId, session.user.id)))

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err) {
          console.error('chat session delete error:', err)
          return new Response(JSON.stringify({ error: 'Failed to delete session' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }
  }
})
