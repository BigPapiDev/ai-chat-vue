<script setup lang="ts">
/**
 * ConversationList Component - Sidebar
 * Following CLAUDE.md: Presentational component
 * TODO Fase 4: useLocalStorage for persistence, click handlers
 */

import type { Chat } from '@/types/chat'

interface Props {
  chats: Chat[]
  currentChatId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'new-chat'): void
  (e: 'select-chat', chatId: string): void
  (e: 'open-settings'): void
  (e: 'open-help'): void
}>()

// TODO Fase 4: Implement click handlers, persist to localStorage
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo">
      <span class="brand">Intelligence Flux</span>
      <span class="subtitle">Architect Edition</span>
    </div>

    <!-- New Chat Button -->
    <button class="new-chat-btn" @click="$emit('new-chat')">
      <span>+</span>
      New Chat
    </button>

    <!-- Conversation History -->
    <div class="history">
      <label class="section-label">Recent Conversations</label>

      <div
        v-for="chat in chats"
        :key="chat.id"
        class="chat-item"
        :class="{ active: chat.id === currentChatId }"
        @click="$emit('select-chat', chat.id)"
      >
        <span class="chat-icon">💬</span>
        <span class="chat-title">{{ chat.title }}</span>
      </div>

      <!-- Empty state -->
      <div v-if="chats.length === 0" class="empty-state">
        <p>No conversations yet</p>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-section">
      <div class="nav-item" @click="$emit('open-settings')">
        <span>⚙️</span>
        <span>Settings</span>
      </div>
      <div class="nav-item" @click="$emit('open-help')">
        <span>❓</span>
        <span>Help</span>
      </div>

      <!-- Profile Section -->
      <div class="profile">
        <div class="avatar">👤</div>
        <div class="profile-info">
          <p class="name">Vue Architect</p>
          <p class="plan">Pro Plan • v3.5</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  z-index: 50;
}

.logo {
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-brand);
  display: block;
}

.subtitle {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-accent);
  opacity: 0.6;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--new-chat-bg);
  color: var(--new-chat-text);
  border-radius: 0.5rem;
  font-weight: 600;
}

.history {
  flex: 1;
  overflow-y: auto;
  margin-top: 1rem;
}

.section-label {
  display: block;
  padding-left: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.chat-item:hover,
.chat-item.active {
  background: var(--hover-bg);
  color: white;
}

.chat-title {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 2rem 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  opacity: 0.6;
}

.bottom-section {
  padding-top: 1rem;
  border-top: 1px solid var(--sidebar-border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.nav-item:hover {
  background: var(--hover-bg);
  color: white;
}

.profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-top: 1rem;
  background: var(--profile-bg);
  border-radius: 0.75rem;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(to bottom right, #adc6ff, #4d8eff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-brand);
}

.plan {
  font-size: 0.625rem;
  color: var(--text-secondary);
}
</style>
