/**
 * Composable for AI Streaming with Vercel Serverless Function
 * 
 * Uses Vercel serverless function at /api/chat
 * Works with both `vercel dev` (local) and production deploy
 * 
 * API key is NEVER exposed to client - handled server-side only
 */

import { ref, type Ref } from 'vue'
import type { Message } from '@/types/chat'

export interface UseAIStreamReturn {
  response: Ref<string>
  isStreaming: Ref<boolean>
  error: Ref<Error | null>
  send: (prompt: string, history?: Message[]) => Promise<void>
}

// Always use relative URL - Vercel handles the routing
// In local dev: vercel dev proxies /api/* to the function
// In production: Works on Vercel's domain
const API_URL = '/api/chat'
const MAX_RETRIES = 3

// Fun fallback responses when AI can't respond
const FALLBACK_RESPONSES = [
  "Un esercito di scimmie sta digitando furiosamente sulla tastiera per risolvere il problema! 🐒🔧",
  "Le quote API sono finite: sto mandando un piccione viaggiatore a Google per ricaricarle! 🐦📨",
  "La chiave è esaurita! Immagina un esercito di pinguini che scava nel ghiaccio per trovarne una nuova. 🐧⛄",
  "API ko: un team di gatti ninja sta hackerando il server Gemini in questo momento! 🐱💻",
  "Scimmie al lavoro! Stanno provando tutte le banane possibili per sbloccare la quota. 🍌🐒",
  "Quota zero: ho convocato gli alieni dello spazio per una ricarica intergalattica! 👽🚀",
  "La chiave è partita in vacanza. Un'orda di formiche operaie la sta inseguendo! 🐜🏖️",
  "Errore 429: supereroi robotici stanno combattendo il mostro 'Rate Limit'! 🤖🦸‍♂️",
  "Scimmie in sciopero! Chiedono più banane prima di fixare l'API. 😿🍌",
  "API esausta: un drago sta custodendo la quota, ma lo sto convincendo con caramelle! 🐉🍬",
  "Esercito di scoiattoli iperattivi sta raccogliendo token persi nei boschi! 🐿️🌳",
  "La chiave si è nascosta. Squadra di detective elefanti la sta fiutando! 🐘🔍",
  "Quote finite: zombie caffè-dipendenti stanno codificando il fix tutta la notte! ☕🧟",
  "Scimmie volanti con jetpack in missione per ricaricare Gemini! 🐵🪂",
  "API in pausa caffè. Un'orda di castori sta costruendo un nuovo server! 🦫☕",
]

function getRandomFallback(): string {
  const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length)
  return FALLBACK_RESPONSES[index]!
}

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

        // Make fetch request with streaming
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
          // AI couldn't respond - use fun fallback message
          response.value = getRandomFallback()
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
