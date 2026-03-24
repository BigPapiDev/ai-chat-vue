<script setup lang="ts">
/**
 * ChatMessage Component
 * Following CLAUDE.md: Presentational component, receives state via props
 * Uses marked for markdown rendering, StreamingCursor for typing effect
 */

import { computed } from 'vue'
import { marked } from 'marked'
import type { Message } from '@/types/chat'
import StreamingCursor from './StreamingCursor.vue'

interface Props {
  message: Message
}

const props = defineProps<Props>()

// Markdown rendering for assistant messages
const renderedContent = computed(() => {
  if (props.message.role === 'assistant' && props.message.content) {
    return marked.parse(props.message.content) as string
  }
  return ''
})

// Safe timestamp formatting (handles both Date objects and ISO strings from localStorage)
const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <!-- User message (right aligned) -->
  <div v-if="message.role === 'user'" class="flex flex-col items-end space-y-2 max-w-[85%] ml-auto">
    <div class="bubble-user">
      <p class="text-sm leading-relaxed">{{ message.content }}</p>
    </div>
    <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
      {{ formattedTime }}
    </span>
  </div>

  <!-- AI message (left aligned) -->
  <div v-else class="flex flex-col items-start space-y-3 max-w-[90%]">
    <div class="flex items-center gap-3">
      <div class="avatar">
        <span class="text-sm font-bold">AI</span>
      </div>
      <span class="text-xs font-bold text-blue-100 tracking-tight">Intelligence Flux</span>
    </div>
    <div class="bubble-assistant ml-4">
      <div class="prose prose-invert prose-sm">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="renderedContent"></span><StreamingCursor v-if="message.isStreaming" />
      </div>
    </div>
    <span class="ml-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
      {{ formattedTime }}
    </span>
  </div>
</template>

<style scoped>
.bubble-user {
  background: var(--bubble-user-bg);
  padding: 1rem 1.25rem;
  border-radius: 1rem 1rem 0 1rem;
  backdrop-filter: blur(8px);
}

.bubble-assistant {
  background: var(--bubble-ai-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--bubble-ai-border);
  padding: 1.5rem;
  border-radius: 1rem 1rem 1rem 0;
  box-shadow: var(--bubble-shadow);
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #adc6ff, #4d8eff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00285d;
}

/* Markdown content styling */
.prose :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  font-size: 0.875rem;
}
.prose :deep(p:last-child) {
  margin-bottom: 0;
}
.prose :deep(code) {
  background: var(--code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  color: var(--code-color);
}
.prose :deep(pre) {
  background: var(--pre-bg);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--pre-border);
  overflow-x: auto;
  margin: 0.75rem 0;
}
.prose :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
}
.prose :deep(ul), .prose :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
.prose :deep(li) {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}
.prose :deep(strong) {
  color: var(--strong-color);
  font-weight: 600;
}
.prose :deep(a) {
  color: var(--link-color);
  text-decoration: underline;
}
</style>
