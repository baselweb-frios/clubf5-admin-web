<template>
  <teleport to="body">
    <transition name="modal">
      <div
v-if="modelValue"
class="modal-container"
>
        <!-- Overlay -->
        <div
class="modal-overlay"
@click="handleOverlayClick"
/>

        <!-- Modal content -->
        <div class="modal-wrapper">
          <div
class="modal-content"
:class="sizeClasses"
@click.stop
>
            <!-- Header -->
            <div
v-if="$slots.header || title"
class="modal-header"
>
              <div class="modal-header-content">
                <slot name="header">
                  <h3 class="modal-title">
{{ title }}
</h3>
                </slot>

                <button
                  v-if="closable"
                  type="button"
                  class="modal-close"
                  @click="close"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <slot />
            </div>

            <!-- Footer -->
            <div
v-if="$slots.footer"
class="modal-footer"
>
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'

// Contador global de modales abiertos para manejar múltiples modales
let openModalsCount = 0

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    full: 'modal-full'
  }
  return sizes[props.size]
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay && props.closable) {
    close()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.closable && props.modelValue) {
    close()
  }
}

// Funciones para manejar el overflow del body
const lockBodyScroll = () => {
  openModalsCount++
  if (openModalsCount === 1) {
    document.body.style.overflow = 'hidden'
  }
}

const unlockBodyScroll = () => {
  openModalsCount = Math.max(0, openModalsCount - 1)
  if (openModalsCount === 0) {
    document.body.style.overflow = ''
  }
}

// Track si este modal ya bloqueó el scroll
let hasLockedScroll = false

// Add/remove escape key listener and handle body scroll
watch(() => props.modelValue, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    // Modal se abre
    document.addEventListener('keydown', handleEscape)
    if (!hasLockedScroll) {
      lockBodyScroll()
      hasLockedScroll = true
    }
  } else if (!newValue && oldValue) {
    // Modal se cierra
    document.removeEventListener('keydown', handleEscape)
    if (hasLockedScroll) {
      unlockBodyScroll()
      hasLockedScroll = false
    }
  }
}, { immediate: true })

// Si el modal está abierto al montar, bloquear scroll
onMounted(() => {
  if (props.modelValue && !hasLockedScroll) {
    document.addEventListener('keydown', handleEscape)
    lockBodyScroll()
    hasLockedScroll = true
  }
})

// Limpiar al desmontar - MUY IMPORTANTE para evitar que quede bloqueado
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  if (hasLockedScroll) {
    unlockBodyScroll()
    hasLockedScroll = false
  }
})
</script>

<style scoped>
/* Modal Container */
.modal-container {
  @apply fixed inset-0 z-modal flex items-center justify-center;
}

/* Backdrop/Overlay */
.modal-overlay {
  @apply fixed inset-0 z-modal-backdrop;
  @apply bg-black/60 backdrop-blur-sm;
}

/* Wrapper for centering */
.modal-wrapper {
  @apply relative z-modal w-full max-h-[90vh] p-4;
  @apply flex items-center justify-center;
}

/* Modal Content Box */
.modal-content {
  @apply w-full bg-dark-tertiary rounded-2xl;
  @apply border border-dark-border shadow-2xl;
  @apply overflow-hidden flex flex-col max-h-[85vh];
}

.light .modal-content {
  @apply bg-light-elevated border-light-border;
}

/* Size variants */
.modal-sm {
  @apply max-w-sm;
}

.modal-md {
  @apply max-w-lg;
}

.modal-lg {
  @apply max-w-2xl;
}

.modal-xl {
  @apply max-w-4xl;
}

.modal-full {
  @apply max-w-[95vw] h-[90vh];
}

/* Header */
.modal-header {
  @apply px-6 py-4 border-b border-dark-border flex-shrink-0;
}

.light .modal-header {
  @apply border-light-border;
}

.modal-header-content {
  @apply flex items-center justify-between w-full;
}

.modal-title {
  @apply text-lg font-semibold text-text-primary;
}

.light .modal-title {
  @apply text-text-light-primary;
}

/* Close button */
.modal-close {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.light .modal-close {
  @apply text-text-light-tertiary;
  @apply hover:bg-light-hover hover:text-text-light-primary;
}

/* Body */
.modal-body {
  @apply px-6 py-4 overflow-y-auto flex-1;
}

/* Footer */
.modal-footer {
  @apply px-6 py-4 border-t border-dark-border flex-shrink-0;
  @apply flex items-center justify-end gap-3;
}

.light .modal-footer {
  @apply border-light-border;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300 ease-apple;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  @apply scale-95 opacity-0;
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  @apply scale-100 opacity-100;
}
</style>

