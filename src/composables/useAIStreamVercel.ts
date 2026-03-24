/**
 * Composable for AI Streaming with Vercel Serverless Function
 * Works both in local development (vercel dev) and production
 * 
 * LOCAL:  Run `vercel dev` - serves both frontend and API at localhost:3000
 * PROD:   Automatically uses Vercel's serverless functions
 * 
 * API key is NEVER exposed to client - stored in Vercel env vars only
 */

import { ref, type Ref } from 'vue'
import type { Message } from '@/types/chat'

export interface UseAIStreamReturn {
  response: Ref<string>
  isStreaming: Ref<boolean>
  error: Ref<Error | null>
  send: (prompt: string, history?: Message[]) => Promise<void>
}

// Always use relative URL - Vercel handles routing automatically
// In local dev: vercel dev proxies /api/chat to the function
// In production: Same path works on Vercel's domain
const API_URL = '/api/chat'
const MAX_RETRIES = 3

/**
 * Convert store Message[] to format expected by API
 */
function formatHistory(messages: Message[]) {
  return messages
    .filter((m) => !m.isStreaming && m.content.trim())
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
}

export function useAIStream(): UseAIStreamReturn {
  const response = ref('')
  const isStreaming = ref(false)
  const error = ref<Error | null>(null)

  async function send(prompt: string, history: Message[] = []): Promise<void> {
    response.value = ''
    error.value = null
    isStreaming.value = true

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const formattedHistory = formatHistory(history)

        // Make fetch request with streaming to Vercel API
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            history: formattedHistory,
          }),
        })

        if (!res.ok) {
          const errorText = await res.text().catch(() => res.statusText)
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }

        // Read the stream
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        // Process stream
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.error) {
                  throw new Error(data.error)
                }
                
                if (data.done) {
                  isStreaming.value = false
                  return
                }
                
                if (data.text) {
                  response.value += data.text
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        isStreaming.value = false
        return

      } catch (err) {
        console.error(`AI Stream Error (attempt ${attempt + 1}/${MAX_RETRIES}):`, err)
        
        if (attempt === MAX_RETRIES - 1) {
          error.value = err instanceof Error ? err : new Error(String(err))
          isStreaming.value = false
          return
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        response.value = ''
      }
    }
  }

  return {
    response,
    isStreaming,
    error,
    send,
  }
}
