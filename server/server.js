/**
 * Gemini API Proxy Server
 * Hides API key from client-side
 * Streams responses to frontend
 */

import express from 'express'
import cors from 'cors'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from server directory
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Check API key - but don't exit if not found (will use mock mode)
const hasApiKey = !!process.env.GEMINI_API_KEY
if (!hasApiKey) {
  console.warn('⚠️  GEMINI_API_KEY not found - Running in MOCK MODE')
  console.warn('   Responses will be simulated')
}

// Initialize Gemini SDK (server-side only) - only if key exists
let genAI = null
if (hasApiKey) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    console.log('✅ Gemini SDK initialized')
  } catch (err) {
    console.error('❌ Failed to initialize Gemini SDK:', err.message)
  }
}

const MODEL_NAME = 'gemini-2.0-flash'
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
}

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
]

const MAX_RETRIES = 3

// MOCK MODE: Generate realistic AI responses when API fails
const MOCK_RESPONSES = {
  'ciao': "Ciao! Sono un'assistente AI di test. Come posso aiutarti oggi?",
  'hello': "Hello! I'm a test AI assistant. How can I help you today?",
  'help': "Sono qui per aiutarti! Posso rispondere a domande, aiutarti con la programmazione, scrivere testi e molto altro. Cosa ti serve?",
  'ai': "L'Intelligenza Artificiale è un campo affascinante che sta rivoluzionando il modo in cui interagiamo con la tecnologia. Vuoi saperne di più?",
  'code': "Posso aiutarti con il codice! Mostrami cosa stai cercando di fare e ti darò una mano.",
  'grazie': "Di nulla! Sono felice di essere utile. Hai altre domande?",
  'default': "Grazie per il tuo messaggio! Sono attualmente in modalità test, quindi la mia risposta è simulata. In produzione con un'API key valida, risponderei in modo più dettagliato e personalizzato. Cosa vorresti sapere?"
}

function generateMockResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  
  // Check for keywords
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (lowerPrompt.includes(keyword)) {
      return response
    }
  }
  
  return MOCK_RESPONSES.default
}

async function streamMockResponse(res, prompt) {
  const response = generateMockResponse(prompt)
  const words = response.split(' ')
  
  // Simulate streaming by sending word by word
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ text: word + ' ' })}

`)
    // Small delay to simulate real streaming
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  res.write(`data: ${JSON.stringify({ done: true })}

`)
  res.end()
}

// Health check - shows if running in mock mode
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: hasApiKey ? 'live' : 'mock',
    timestamp: new Date().toISOString() 
  })
})

// Chat endpoint with streaming - with fallback to mock mode
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // If no API key, use mock mode immediately
    if (!hasApiKey || !genAI) {
      console.log('🎭 Using MOCK MODE (no API key)')
      return await streamMockResponse(res, prompt)
    }

    // Try Gemini API with retries
    let lastError = null
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: MODEL_NAME,
          generationConfig: GENERATION_CONFIG,
          safetySettings: SAFETY_SETTINGS,
        })

        // Convert history to Gemini format
        const geminiHistory = history
          .filter((m) => !m.isStreaming && m.content.trim())
          .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }))

        let stream

        if (geminiHistory.length > 0) {
          const chat = model.startChat({ history: geminiHistory })
          const result = await chat.sendMessageStream(prompt)
          stream = result.stream
        } else {
          const result = await model.generateContentStream(prompt)
          stream = result.stream
        }

        // Stream tokens to client
        for await (const chunk of stream) {
          const text = chunk.text()
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}

`)
          }
        }

        // Success - end stream
        res.write(`data: ${JSON.stringify({ done: true })}

`)
        res.end()
        return

      } catch (error) {
        lastError = error
        console.error(`API attempt ${attempt + 1}/${MAX_RETRIES} failed:`, error.message)
        
        // Check if it's a quota error
        if (error.message && error.message.includes('429')) {
          console.log('⏳ Quota exceeded, will retry or fallback to mock...')
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    // All retries failed - fallback to mock mode
    console.log('🎭 All API attempts failed, using MOCK MODE')
    console.log('   Original error:', lastError?.message || 'Unknown error')
    
    // Send a notice about mock mode
    res.write(`data: ${JSON.stringify({ text: '[Modalità Test] ' })}

`)
    
    await streamMockResponse(res, prompt)

  } catch (error) {
    console.error('Server error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: error.message })
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}

`)
      res.end()
    }
  }
})

// Non-streaming endpoint (alternative)
app.post('/api/chat-complete', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    })

    const geminiHistory = history
      .filter((m) => !m.isStreaming && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    let result
    if (geminiHistory.length > 0) {
      const chat = model.startChat({ history: geminiHistory })
      result = await chat.sendMessage(prompt)
    } else {
      result = await model.generateContent(prompt)
    }

    const response = result.response.text()
    res.json({ text: response })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Gemini Proxy Server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints:`)
  console.log(`   POST http://localhost:${PORT}/api/chat (streaming)`)
  console.log(`   POST http://localhost:${PORT}/api/chat-complete (non-streaming)`)
  console.log(`   GET  http://localhost:${PORT}/api/health`)
  console.log(``)
  if (hasApiKey) {
    console.log(`✅ Mode: LIVE (connected to Gemini API)`)
    console.log(`   Will fallback to MOCK on quota errors`)
  } else {
    console.log(`🎭 Mode: MOCK (no API key configured)`)
    console.log(`   Responses are simulated`)
  }
  console.log(``)
  console.log(`💡 To use live mode, add GEMINI_API_KEY to server/.env`)
})
