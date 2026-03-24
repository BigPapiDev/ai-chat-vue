<script setup lang="ts">
/**
 * Root App Component
 * Following CLAUDE.md: Main layout with sidebar (260px) + main area
 */

import { ref, nextTick, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useChatStore } from '@/stores/chat.store'
import ConversationList from '@/components/ConversationList.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import HelpModal from '@/components/HelpModal.vue'

const store = useChatStore()
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const showSettings = ref(false)
const showHelp = ref(false)

// Sidebar toggle state - closed by default on mobile, open on desktop
const isMobile = useMediaQuery('(max-width: 768px)')
const sidebarOpen = ref(!isMobile.value)

// Send message handler
async function handleSend() {
  const prompt = inputMessage.value.trim()
  if (!prompt) return
  inputMessage.value = ''
  await store.sendMessage(prompt)
}

// Auto-scroll to bottom when messages change
watch(
  () => store.messages.length,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
)

// Also scroll during streaming (content updates)
watch(
  () => store.messages.find((m) => m.isStreaming)?.content,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
)

// Close sidebar on mobile when selecting a chat
function handleSelectChat(id: string) {
  store.selectChat(id)
  if (isMobile.value) sidebarOpen.value = false
}

// Close sidebar on mobile when creating new chat
function handleNewChat() {
  store.createNewChat()
  if (isMobile.value) sidebarOpen.value = false
}
</script>

<template>
  <div class="app" :class="{ 'sidebar-open': sidebarOpen }">
    <!-- Mobile overlay (click to close sidebar) -->
    <div
      v-if="sidebarOpen && isMobile"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar with slide transition -->
    <Transition name="sidebar-slide">
      <ConversationList
        v-show="sidebarOpen"
        :chats="store.sortedChats"
        :current-chat-id="store.currentChat?.id ?? null"
        @new-chat="handleNewChat"
        @select-chat="handleSelectChat"
        @open-settings="showSettings = true"
        @open-help="showHelp = true"
      />
    </Transition>

    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button class="menu-icon" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle sidebar">
          ☰
        </button>
        <h1>Intelligence Flux</h1>
      </div>

      <div class="header-right">
        <div class="engine-badge">
          <span class="pulse-dot"></span>
          Engine: Gemini Flash
        </div>
        <DarkModeToggle />
      </div>
    </header>

    <!-- Main Chat Canvas -->
    <main class="main">
      <!-- Empty State -->
      <div v-if="!store.hasMessages" class="empty-state">
        <h2>Hello, explorer.</h2>
        <p>How can I assist your cognitive journey today?</p>
      </div>

      <!-- Message Thread with TransitionGroup -->
      <div v-else ref="messagesContainer" class="messages custom-scrollbar">
        <TransitionGroup name="message" tag="div" class="flex flex-col gap-8">
          <ChatMessage
            v-for="message in store.currentMessages"
            :key="message.id"
            :message="message"
          />
        </TransitionGroup>
        <div class="h-24"></div>
      </div>

      <!-- Error display -->
      <div v-if="store.streamError" class="error-banner">
        <span>⚠ {{ store.streamError.message }}</span>
      </div>

      <!-- Command Bar -->
      <ChatInput
        v-model="inputMessage"
        :is-streaming="store.isStreaming"
        @send="handleSend"
      />
    </main>

    <!-- Visual Gradient Overlays -->
    <div class="gradient-1"></div>
    <div class="gradient-2"></div>

    <!-- Settings Panel -->
    <SettingsPanel :visible="showSettings" @close="showSettings = false" />

    <!-- Help Modal -->
    <HelpModal :visible="showHelp" @close="showHelp = false" />
  </div>
</template>

<style scoped>
.app {
  background-color: var(--app-bg);
  color: var(--app-text);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 64px;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 40;
  transition: left 0.3s ease, width 0.3s ease;
}

.sidebar-open .header {
  left: 260px;
  width: calc(100% - 260px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-icon {
  color: var(--accent-color);
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1.25rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  border-radius: 0.375rem;
}

.menu-icon:hover {
  background: var(--hover-bg-subtle);
}

.header-left h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-brand);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.engine-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--engine-badge-bg);
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-accent);
}

.pulse-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #df7412;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main {
  margin-left: 0;
  padding-top: 64px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: margin-left 0.3s ease;
}

.sidebar-open .main {
  margin-left: 260px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 2rem;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 10px;
}

.error-banner {
  padding: 0.5rem 1rem;
  margin: 0 2rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  color: var(--error-text);
  font-size: 0.8125rem;
}

/* TransitionGroup animations */
.message-enter-active {
  transition: all 0.3s ease-out;
}
.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.message-leave-active {
  transition: all 0.2s ease-in;
}
.message-leave-to {
  opacity: 0;
}

/* Sidebar slide animation */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

/* Mobile overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 45;
}

.gradient-1 {
  position: fixed;
  top: -10%;
  left: -10%;
  width: 40%;
  height: 40%;
  background: var(--gradient-1);
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.gradient-2 {
  position: fixed;
  bottom: -5%;
  right: -5%;
  width: 30%;
  height: 30%;
  background: var(--gradient-2);
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}

/* Responsive mobile */
@media (max-width: 768px) {
  .sidebar-open .header {
    left: 0;
    width: 100%;
  }

  .sidebar-open .main {
    margin-left: 0;
  }
}
</style>
