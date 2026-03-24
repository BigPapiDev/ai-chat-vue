<script setup lang="ts">
/**
 * SettingsPanel Component
 * Slide-in panel from right with theme settings and app actions
 */

import { useDark } from '@vueuse/core'
import { useChatStore } from '@/stores/chat.store'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useChatStore()

// Theme handling with useDark
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'ai-chat-theme',
})

// Theme options
const themes = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'auto', label: 'System', icon: '💻' },
] as const

// Get current theme mode
const currentTheme = computed(() => {
  const html = document.documentElement
  if (html.classList.contains('dark')) return 'dark'
  if (html.classList.contains('light')) return 'light'
  return 'auto'
})

import { computed } from 'vue'

function setTheme(mode: 'light' | 'dark' | 'auto') {
  if (mode === 'auto') {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  } else {
    isDark.value = mode === 'dark'
  }
}

function handleClearAllChats() {
  if (confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
    store.clearAllChats()
    emit('close')
  }
}

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

import { onMounted, onUnmounted } from 'vue'
</script>

<template>
  <Teleport to="body">
    <Transition name="settings">
      <div v-if="visible" class="settings-overlay" @click="$emit('close')">
        <div class="settings-panel" @click.stop>
          <!-- Header -->
          <div class="settings-header">
            <h2>Settings</h2>
            <button class="close-btn" @click="$emit('close')" aria-label="Close settings">
              <span>✕</span>
            </button>
          </div>

          <!-- Content -->
          <div class="settings-content">
            <!-- Theme Section -->
            <section class="settings-section">
              <h3>Appearance</h3>
              <div class="theme-options">
                <button
                  v-for="theme in themes"
                  :key="theme.value"
                  class="theme-option"
                  :class="{ active: currentTheme === theme.value }"
                  @click="setTheme(theme.value)"
                >
                  <span class="theme-icon">{{ theme.icon }}</span>
                  <span class="theme-label">{{ theme.label }}</span>
                </button>
              </div>
            </section>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- Data Section -->
            <section class="settings-section">
              <h3>Data</h3>
              <button class="danger-btn" @click="handleClearAllChats">
                <span>🗑️</span>
                Clear All Conversations
              </button>
            </section>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- About Section -->
            <section class="settings-section">
              <h3>About</h3>
              <div class="about-info">
                <div class="about-row">
                  <span class="about-label">Version</span>
                  <span class="about-value">v1.0.0</span>
                </div>
                <div class="about-row">
                  <span class="about-label">Stack</span>
                  <span class="about-value">Vue 3.5 + Gemini Flash</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.settings-panel {
  width: 100%;
  max-width: 380px;
  height: 100%;
  background: var(--modal-bg);
  border-left: 1px solid var(--modal-border);
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--modal-border);
}

.settings-header h2 {
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

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.theme-options {
  display: flex;
  gap: 0.75rem;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--modal-border);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option:hover {
  background: var(--hover-bg-subtle);
}

.theme-option.active {
  border-color: var(--accent-color);
  background: var(--hover-bg);
}

.theme-icon {
  font-size: 1.5rem;
}

.theme-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.theme-option.active .theme-label {
  color: var(--text-accent);
}

.divider {
  height: 1px;
  background: var(--modal-border);
  margin: 1.5rem 0;
}

.danger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--error-border);
  background: var(--error-bg);
  color: var(--error-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover {
  opacity: 0.8;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.about-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.about-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Transitions */
.settings-enter-active,
.settings-leave-active {
  transition: all 0.3s ease;
}

.settings-enter-from,
.settings-leave-to {
  opacity: 0;
}

.settings-enter-from .settings-panel,
.settings-leave-to .settings-panel {
  transform: translateX(100%);
}

.settings-enter-active .settings-panel,
.settings-leave-active .settings-panel {
  transition: transform 0.3s ease;
}

.settings-enter-to .settings-panel,
.settings-leave-from .settings-panel {
  transform: translateX(0);
}
</style>
