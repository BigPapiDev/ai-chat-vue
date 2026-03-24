/**
 * Type definitions for AI Chat Interface
 * Following CLAUDE.md specifications
 */

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface StreamEvent {
  type: 'token' | 'done' | 'error'
  content?: string
  error?: string
}
