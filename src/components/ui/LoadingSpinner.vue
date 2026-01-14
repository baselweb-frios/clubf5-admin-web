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
  @apply flex flex-col items-center justify-center gap-3;
}

/* Wrapper for centering */
.spinner-wrapper {
  @apply flex items-center justify-center;
}

/* Spinner */
.spinner {
  --spinner-size: 48px;
  --spinner-color: theme('colors.primary.500');

  width: var(--spinner-size);
  height: var(--spinner-size);
  @apply relative;
}

/* Spinner Rings */
.spinner-ring {
  @apply absolute inset-0 rounded-full;
  border: calc(var(--spinner-size) * 0.08) solid transparent;
  border-top-color: var(--spinner-color);
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  @apply opacity-80;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  @apply opacity-60;
}

.spinner-ring:nth-child(4) {
  animation-delay: 0s;
  @apply opacity-40;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Loading Text */
.loading-text {
  @apply text-sm text-text-secondary;
  @apply animate-pulse;
}

.light .loading-text {
  @apply text-text-light-secondary;
}
</style>

