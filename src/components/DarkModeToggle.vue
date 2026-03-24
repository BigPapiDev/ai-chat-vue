<script setup lang="ts">
/**
 * DarkModeToggle Component
 * Following CLAUDE.md: usePreferredDark from VueUse
 * Uses useDark (combines usePreferredDark + localStorage + class toggle)
 */

import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'ai-chat-theme',
})

const toggleDark = useToggle(isDark)
</script>

<template>
  <button
    class="toggle-btn"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleDark()"
  >
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>

<style scoped>
.toggle-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.125rem;
  transition: background-color 0.2s;
  color: var(--text-secondary);
}

.toggle-btn:hover {
  background-color: var(--hover-bg-subtle);
}
</style>
