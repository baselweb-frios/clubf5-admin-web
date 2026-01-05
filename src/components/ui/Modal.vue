<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="modal-container">
        <!-- Overlay -->
        <div class="modal-overlay" @click="handleOverlayClick"></div>

        <!-- Modal content -->
        <div class="modal-wrapper">
          <div class="modal-content" :class="sizeClasses" @click.stop>
            <!-- Header -->
            <div v-if="$slots.header || title" class="modal-header">
              <div class="modal-header-content">
                <slot name="header">
                  <h3 class="modal-title">{{ title }}</h3>
                </slot>

                <button
                  v-if="closable"
                  @click="close"
                  type="button"
                  class="modal-close"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

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

// Add/remove escape key listener
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1;
}

.modal-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem 0;
  z-index: 2;
}

.modal-content {
  position: relative;
  width: 100%;
  background: #16181d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8),
              0 10px 20px -5px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
  margin: auto;
}

/* Size variants */
.modal-sm {
  max-width: 28rem;
}

.modal-md {
  max-width: 40rem;
}

.modal-lg {
  max-width: 56rem;
}

.modal-xl {
  max-width: 75rem;
}

.modal-full {
  max-width: calc(100vw - 4rem);
  max-height: calc(100vh - 4rem);
}

.modal-header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, #1c1f26 0%, #1a1d24 100%);
  flex-shrink: 0;
}

.modal-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.modal-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.3;
}

.modal-close {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #f3f4f6;
  transform: rotate(90deg);
}

.modal-close:active {
  transform: rotate(90deg) scale(0.95);
}

.modal-close i {
  font-size: 1.125rem;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  color: #e5e7eb;
  line-height: 1.6;
}

.modal-body::-webkit-scrollbar {
  width: 10px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(15, 20, 25, 0.5);
  border-radius: 5px;
  margin: 4px 0;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
  background-clip: padding-box;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, #1a1d24 0%, #16181d 100%);
  display: flex;
  align-items: center;
  gap: 0.875rem;
  justify-content: flex-end;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-content {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.modal-enter-from .modal-content {
  transform: scale(0.92) translateY(-30px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .modal-container {
    padding: 0.75rem;
  }

  .modal-wrapper {
    padding: 1.5rem 0;
  }

  .modal-lg,
  .modal-xl {
    max-width: calc(100vw - 1.5rem);
  }
}

@media (max-width: 768px) {
  .modal-container {
    padding: 0.5rem;
    align-items: flex-start;
  }

  .modal-wrapper {
    padding: 1rem 0;
  }

  .modal-content {
    max-height: calc(100vh - 2rem);
    border-radius: 0.75rem;
  }

  .modal-sm,
  .modal-md,
  .modal-lg,
  .modal-xl {
    max-width: 100%;
  }

  .modal-header,
  .modal-footer {
    padding: 1.25rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-close {
    width: 2rem;
    height: 2rem;
  }

  .modal-close i {
    font-size: 1rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer > * {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-container {
    padding: 0.25rem;
  }

  .modal-header,
  .modal-footer {
    padding: 1rem;
  }

  .modal-body {
    padding: 1.25rem 1rem;
  }
}

/* Utility classes for modal content */
.modal-body .modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-body .modal-title-group i {
  font-size: 1.5rem;
  color: #0189dd;
}

.modal-body .modal-title-group h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-footer .modal-actions-right {
  display: flex;
  gap: 0.875rem;
  margin-left: auto;
}

/* Ensure buttons in footer have proper styling */
.modal-footer .btn {
  min-width: auto;
}

@media (max-width: 768px) {
  .modal-footer .modal-actions-right {
    width: 100%;
    flex-direction: column-reverse;
  }

  .modal-footer .modal-actions-right .btn {
    width: 100%;
  }
}
</style>
