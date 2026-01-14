<template>
  <div class="overlay-container">
    <transition name="fade">
      <div
v-if="show"
class="overlay"
:style="overlayStyle"
>
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
/* Container */
.overlay-container {
  @apply relative;
}

/* Overlay */
.overlay {
  @apply absolute inset-0 z-50;
  @apply bg-dark-primary/90 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply rounded-xl;
}

.light .overlay {
  @apply bg-light-primary/90;
}

/* Content */
.overlay-content {
  @apply flex flex-col items-center justify-center gap-3;
  @apply p-4;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300 ease-apple;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.fade-enter-to,
.fade-leave-from {
  @apply opacity-100;
}
</style>

