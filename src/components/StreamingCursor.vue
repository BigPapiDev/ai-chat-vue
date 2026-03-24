<script setup lang="ts">
/**
 * StreamingCursor Component
 * Following CLAUDE.md: Blinking cursor indicator for AI streaming
 */

// No props needed
</script>

<template>
  <span class="cursor-blink">|</span>
</template>

<style scoped>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.cursor-blink {
  animation: blink 1s step-end infinite;
}
</style>
