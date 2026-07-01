<template>
  <div
v-if="loading"
class="loading-spinner-container"
>
    <div class="spinner-wrapper">
      <div
class="spinner"
:style="spinnerStyle"
>
        <div class="spinner-ring" />
        <div class="spinner-ring" />
        <div class="spinner-ring" />
        <div class="spinner-ring" />
      </div>
    </div>
    <p
v-if="text"
class="loading-text"
>
{{ text }}
</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  size: {
    type: String,
    default: '48px'
  },
  text: {
    type: String,
    default: ''
  }
})

const spinnerStyle = computed(() => {
  return {
    '--spinner-size': props.size,
    '--spinner-color': props.color
  }
})
</script>

<style scoped>
/* Container */
.loading-spinner-container {
  @apply flex flex-col items-center justify-center gap-4;
  @apply gpu-accelerated;
}

/* Wrapper for centering */
.spinner-wrapper {
  @apply flex items-center justify-center relative;
}

.spinner-wrapper::before {
  content: '';
  @apply absolute inset-0;
  @apply rounded-full blur-xl opacity-30;
  background: var(--spinner-color, theme('colors.primary.500'));
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Spinner */
.spinner {
  --spinner-size: 48px;
  --spinner-color: theme('colors.primary.500');

  width: var(--spinner-size);
  height: var(--spinner-size);
  @apply relative z-10;
  @apply gpu-accelerated;
}

/* Spinner Rings */
.spinner-ring {
  @apply absolute inset-0 rounded-full;
  border: calc(var(--spinner-size) * 0.08) solid transparent;
  border-top-color: var(--spinner-color);
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  @apply gpu-accelerated;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  @apply shadow-glow-primary;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  @apply opacity-80;
  transform: scale(0.85);
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  @apply opacity-60;
  transform: scale(0.7);
}

.spinner-ring:nth-child(4) {
  animation-delay: 0s;
  @apply opacity-40;
  transform: scale(0.55);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

/* Loading Text */
.loading-text {
  @apply text-sm font-medium text-text-secondary;
  @apply animate-pulse;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.light .loading-text {
  @apply text-text-light-secondary;
}
</style>

