<template>
  <div class="overlay-container">
    <transition name="fade">
      <div v-if="show" class="overlay" :style="overlayStyle">
        <div class="overlay-content">
          <slot name="overlay">
            <loading-spinner
              :loading="true"
              :color="color"
              :size="height"
              :text="text"
            />
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  opacity: {
    type: [String, Number],
    default: 0.9
  },
  noWrap: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  height: {
    type: String,
    default: '48px'
  },
  text: {
    type: String,
    default: 'Cargando...'
  }
})

const overlayStyle = computed(() => {
  return {
    opacity: props.opacity
  }
})
</script>

<style scoped>
/* ===== PREMIUM LOADING OVERLAY - DARK MODE ===== */
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  pointer-events: auto;
  animation: fadeIn 0.2s ease-out;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-2xl);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(59, 130, 246, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
