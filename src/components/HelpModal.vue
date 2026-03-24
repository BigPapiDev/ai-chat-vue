<script setup lang="ts">
/**
 * HelpModal Component
 * Centered modal with keyboard shortcuts and app info
 */

import { onMounted, onUnmounted } from 'vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Keyboard shortcuts
const shortcuts = [
  { key: 'Enter', action: 'Send message' },
  { key: 'Shift + Enter', action: 'New line' },
  { key: 'Esc', action: 'Close panels / Stop streaming' },
]

// Tech stack
const stack = [
  { name: 'Vue', version: '3.5' },
  { name: 'Pinia', version: 'Latest' },
  { name: 'VueUse', version: 'Latest' },
  { name: 'TailwindCSS', version: 'v4' },
  { name: 'Gemini', version: 'Flash' },
]

// Close on Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

// Add/remove event listener
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="help">
      <div v-if="visible" class="help-overlay" @click="$emit('close')">
        <div class="help-modal" @click.stop>
          <!-- Header -->
          <div class="help-header">
            <h2>Help & Support</h2>
            <button class="close-btn" @click="$emit('close')" aria-label="Close help">
              <span>✕</span>
            </button>
          </div>

          <!-- Content -->
          <div class="help-content">
            <!-- How it Works -->
            <section class="help-section">
              <div class="section-icon">💡</div>
              <div class="section-body">
                <h3>How it works</h3>
                <p>
                  Intelligence Flux is an AI chat interface powered by Google's Gemini Flash.
                  Start a new conversation, type your question, and receive intelligent responses
                  streamed in real-time. Your conversations are saved locally in your browser.
                </p>
              </div>
            </section>

            <!-- Keyboard Shortcuts -->
            <section class="help-section">
              <div class="section-icon">⌨️</div>
              <div class="section-body">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                  <div v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-row">
                    <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
                    <span class="shortcut-action">{{ shortcut.action }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Tech Stack -->
            <section class="help-section">
              <div class="section-icon">🛠️</div>
              <div class="section-body">
                <h3>Tech Stack</h3>
                <div class="stack-grid">
                  <div v-for="item in stack" :key="item.name" class="stack-item">
                    <span class="stack-name">{{ item.name }}</span>
                    <span class="stack-version">{{ item.version }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Version -->
            <div class="version-footer">
              <span>Version v1.0.0</span>
              <span class="dot">•</span>
              <span>Built with ❤️ using Vue 3.5</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.help-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.help-modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: var(--modal-bg);
  border: 1px solid var(--modal-border);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--modal-border);
}

.help-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--hover-bg-subtle);
  color: var(--text-primary);
}

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.help-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.help-section:last-of-type {
  margin-bottom: 0;
}

.section-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hover-bg-subtle);
  border-radius: 0.75rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.section-body {
  flex: 1;
}

.section-body h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.section-body p {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shortcut-key {
  min-width: 6rem;
  padding: 0.25rem 0.5rem;
  background: var(--modal-input-bg);
  border: 1px solid var(--modal-input-border);
  border-radius: 0.375rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.shortcut-action {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stack-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--modal-input-bg);
  border: 1px solid var(--modal-input-border);
  border-radius: 0.5rem;
}

.stack-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stack-version {
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

.version-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--modal-border);
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.version-footer .dot {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Transitions */
.help-enter-active,
.help-leave-active {
  transition: all 0.2s ease;
}

.help-enter-from,
.help-leave-to {
  opacity: 0;
}

.help-enter-active .help-modal,
.help-leave-active .help-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.help-enter-from .help-modal,
.help-leave-to .help-modal {
  opacity: 0;
  transform: scale(0.95);
}

.help-enter-to .help-modal,
.help-leave-from .help-modal {
  opacity: 1;
  transform: scale(1);
}
</style>
