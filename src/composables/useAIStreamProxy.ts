/**
 * Composable for AI Streaming via Backend Proxy
 * Uses EventSource for SSE streaming from proxy server
 * API key is NOT exposed to client
 */

import { ref, type Ref } from 'vue'
import type { Message } from '@/types/chat'

export interface UseAIStreamReturn {
  response: Ref<string>
  isStreaming: Ref<boolean>
  error: Ref<Error | null>
  send: (prompt: string, history?: Message[]) => Promise<void>
}

const API_URL = 'http://localhost:3000/api'
const MAX_RETRIES = 3

/**
 * Convert store Message[] to format expected by proxy
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

        // Make fetch request with streaming
        const res = await fetch(`${API_URL}/chat`, {
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
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
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
