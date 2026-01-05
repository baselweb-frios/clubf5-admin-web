<template>
  <div v-if="loading" class="loading-spinner-container">
    <div class="spinner-wrapper">
      <div class="spinner" :style="spinnerStyle">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
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
/* ===== PREMIUM LOADING SPINNER - DARK MODE ===== */
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.spinner-wrapper {
  position: relative;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
}

.spinner {
  width: var(--spinner-size, 48px);
  height: var(--spinner-size, 48px);
  position: relative;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spinner-rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-top-color: var(--spinner-color, var(--color-primary-500));
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  border-top-color: var(--spinner-color, var(--color-primary-500));
  border-width: 3px;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: var(--spinner-color, var(--color-primary-400));
  opacity: 0.7;
  border-width: 3px;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: var(--spinner-color, var(--color-primary-400));
  opacity: 0.5;
  border-width: 2.5px;
}

.spinner-ring:nth-child(4) {
  border-top-color: var(--spinner-color, var(--color-primary-500));
  opacity: 0.3;
  border-width: 2px;
}

@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  letter-spacing: var(--letter-spacing-wide);
}
</style>
