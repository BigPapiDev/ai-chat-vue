/**
 * Vercel Serverless Function - Gemini API Proxy
 * Endpoint: /api/chat
 * Hides API key from client-side
 * Supports streaming via SSE
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const MAX_RETRIES = 3

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, history = [] } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured')
      return res.status(500).json({ error: 'Server configuration error - API key missing' })
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey)

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

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

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
          .filter((m) => !m.isStreaming && m.content && m.content.trim())
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
            res.write(`data: ${JSON.stringify({ text })}\n\n`)
          }
        }

        // Success - end stream
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
        res.end()
        return

      } catch (error) {
        lastError = error
        console.error(`API attempt ${attempt + 1}/${MAX_RETRIES} failed:`, error.message)
        
        // Wait before retry (exponential backoff)
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    // All retries failed
    console.error('All API attempts failed:', lastError)
    res.write(`data: ${JSON.stringify({ error: 'API temporarily unavailable. Please try again later.' })}\n\n`)
    res.end()

  } catch (error) {
    console.error('Server error:', error)
    
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
      res.end()
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }
}
