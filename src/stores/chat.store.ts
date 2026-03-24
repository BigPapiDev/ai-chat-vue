/**
 * Pinia Store for Chat State Management
 * Following CLAUDE.md: Single store for all chat state, no props drilling
 * All business logic centralized here + useAIStream composable
 * Persistence via useLocalStorage (VueUse) for chats and currentChatId
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Message, Chat } from '@/types/chat'
import { useAIStream } from '@/composables/useAIStream'

export const useChatStore = defineStore('chat', () => {
  // ── State (persisted via useLocalStorage) ───────────────
  const messages = ref<Message[]>([])
  const isStreaming = ref(false)
  const chats = useLocalStorage<Chat[]>('ai-chat-chats', [])
  const currentChatId = useLocalStorage<string | null>('ai-chat-current-id', null)

  // Derived currentChat from persisted data
  const currentChat = computed<Chat | null>(() =>
    chats.value.find((c) => c.id === currentChatId.value) ?? null
  )

  // ── Composable (instantiated inside setup store) ───────
  const { response: streamResponse, error: streamError, send: streamSend } = useAIStream()

  // ── Getters ────────────────────────────────────────────
  const currentMessages = computed(() => messages.value)
  const hasMessages = computed(() => messages.value.length > 0)
  const sortedChats = computed(() =>
    [...chats.value].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  // ── Helpers ────────────────────────────────────────────

  /** Mutate the current chat object inside chats array (triggers localStorage sync) */
  function syncCurrentChat(): void {
    const chat = chats.value.find((c) => c.id === currentChatId.value)
    if (chat) {
      chat.messages = [...messages.value]
      chat.updatedAt = new Date()
    }
  }

  // ── Actions ────────────────────────────────────────────

  function addMessage(message: Message): void {
    messages.value.push(message)
    syncCurrentChat()
  }

  async function sendMessage(prompt: string): Promise<void> {
    if (isStreaming.value) return

    // Auto-create chat if none exists
    if (!currentChat.value) {
      createNewChat()
    }

    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    // Create AI placeholder message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    addMessage(assistantMessage)

    isStreaming.value = true

    // Auto-title: first 40 chars of the first user prompt
    const chat = chats.value.find((c) => c.id === currentChatId.value)
    if (chat && chat.title === 'New Chat') {
      chat.title = prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt
    }

    // Stream AI response (pass history for multi-turn context)
    const history = messages.value.filter((m) => m.id !== assistantMessage.id)
    await streamSend(prompt, history)

    // Finalize assistant message
    const msg = messages.value.find((m) => m.id === assistantMessage.id)
    if (msg) {
      msg.content = streamResponse.value
      msg.isStreaming = false
    }

    isStreaming.value = false
    syncCurrentChat()
  }

  // Watch streaming response for token-by-token updates
  watch(streamResponse, (newContent) => {
    if (!isStreaming.value) return
    const streamingMsg = messages.value.find((m) => m.isStreaming)
    if (streamingMsg) {
      streamingMsg.content = newContent
    }
  })

  function createNewChat(): Chat {
    // Save current messages to existing chat before creating new
    syncCurrentChat()

    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    chats.value.push(newChat)
    currentChatId.value = newChat.id
    messages.value = []
    return newChat
  }

  function selectChat(chatId: string): void {
    // Save current messages before switching
    syncCurrentChat()

    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      currentChatId.value = chat.id
      messages.value = [...chat.messages]
    }
  }

  function clearChat(): void {
    messages.value = []
    syncCurrentChat()
  }

  function clearAllChats(): void {
    chats.value = []
    currentChatId.value = null
    messages.value = []
  }

  // ── Initialize: load messages from persisted current chat ──
  if (currentChat.value) {
    messages.value = [...currentChat.value.messages]
  }

  return {
    // State
    messages,
    isStreaming,
    currentChat,
    currentChatId,
    chats,
    // Getters
    currentMessages,
    hasMessages,
    sortedChats,
    // Stream state (exposed for components)
    streamError,
    // Actions
    sendMessage,
    addMessage,
    createNewChat,
    selectChat,
    clearChat,
    clearAllChats,
  }
})
