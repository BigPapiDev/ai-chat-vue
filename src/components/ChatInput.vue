<script setup lang="ts">
/**
 * ChatInput Component - Command Bar
 * Following CLAUDE.md: Use defineModel for two-way binding
 * Features: useSpeechRecognition, keyboard handling, auto-resize
 */

import { ref, watch, nextTick } from 'vue'
import { useSpeechRecognition } from '@vueuse/core'

// Vue 3.5 defineModel for two-way binding
const modelValue = defineModel<string>('modelValue', { required: true })

interface Props {
  isStreaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
})

const emit = defineEmits<{
  (e: 'send'): void
}>()

// Textarea ref for auto-resize
const textareaRef = ref<HTMLTextAreaElement>()

// Speech Recognition (VueUse)
const {
  isListening,
  result: speechResult,
  start: startSpeech,
  stop: stopSpeech,
  isSupported: isSpeechSupported,
} = useSpeechRecognition({
  continuous: false,
  interimResults: true,
  lang: 'en-US',
})

// Watch speech result and append to input
watch(speechResult, (newResult) => {
  if (newResult) {
    modelValue.value = (modelValue.value || '') + newResult
    nextTick(() => autoResize())
  }
})

// Mic toggle
function toggleMic() {
  if (isListening.value) {
    stopSpeech()
  } else {
    startSpeech()
  }
}

// Auto-resize textarea
function autoResize() {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }
}

// Keyboard handling: Enter sends, Shift+Enter newline
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (modelValue.value?.trim() && !props.isStreaming) {
      emit('send')
      // Reset textarea height after send
      nextTick(() => {
        if (textareaRef.value) {
          textareaRef.value.style.height = 'auto'
        }
      })
    }
  }
}
</script>

<template>
  <div class="command-bar">
    <div class="input-container" :class="{ 'ring-1 ring-[#adc6ff]/30': false }">
      <!-- Mic button (only if supported) -->
      <button
        v-if="isSpeechSupported"
        class="icon-btn"
        :class="{ 'mic-active': isListening }"
        :disabled="props.isStreaming"
        @click="toggleMic"
      >
        <span>{{ isListening ? '🔴' : '🎤' }}</span>
      </button>

      <!-- Textarea input -->
      <textarea
        ref="textareaRef"
        v-model="modelValue"
        rows="1"
        class="input-textarea"
        placeholder="Ask about Vue 3.5, Vapor Mode, or Reactive Props..."
        :disabled="props.isStreaming"
        @input="autoResize"
        @keydown="handleKeydown"
      ></textarea>

      <!-- Action buttons -->
      <div class="actions">
        <!-- Send button -->
        <button
          class="send-btn"
          :disabled="props.isStreaming || !modelValue?.trim()"
          @click="emit('send')"
        >
          <span>↑</span>
        </button>
      </div>
    </div>

    <p class="disclaimer">AI can make mistakes. Verify critical code before implementation.</p>
  </div>
</template>

<style scoped>
.command-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  padding-top: 0;
  pointer-events: none;
}

.input-container {
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  background: var(--input-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--input-border);
  border-radius: 2rem;
  padding: 0.5rem;
  box-shadow: var(--input-shadow);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.input-container:focus-within {
  border-color: var(--input-focus-border);
}

.icon-btn {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.125rem;
  transition: all 0.2s;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.icon-btn:hover {
  background: var(--hover-bg-subtle);
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.mic-active {
  animation: mic-pulse 1.5s infinite;
}

@keyframes mic-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.input-textarea {
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
  color: var(--input-text);
  font-family: 'Inter', sans-serif;
  max-height: 200px;
}

.input-textarea::placeholder {
  color: var(--input-placeholder);
}

.input-textarea:focus {
  outline: none;
}

.input-textarea:disabled {
  opacity: 0.5;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.25rem;
  padding-bottom: 0.125rem;
}

.send-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--send-btn-bg);
  color: #00285d;
  border: none;
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: 700;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  background: var(--send-btn-disabled-bg);
  color: var(--send-btn-disabled-color);
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  font-size: 0.625rem;
  opacity: 0.4;
  margin-top: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  pointer-events: auto;
}
</style>
