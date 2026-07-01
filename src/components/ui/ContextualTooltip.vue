<template>
  <div class="contextual-tooltip-wrapper">
    <!-- Slot para el elemento trigger -->
    <div ref="triggerRef">
      <slot name="trigger" />
    </div>

    <!-- Tooltip -->
    <teleport to="body">
      <transition name="tooltip-fade">
        <div
          v-if="isVisible"
          ref="tooltipRef"
          class="contextual-tooltip"
          :class="[`tooltip-${position}`, variantClass]"
          :style="tooltipStyle"
          role="tooltip"
          :aria-hidden="!isVisible"
        >
          <!-- Flecha -->
          <div class="tooltip-arrow" />

          <!-- Contenido -->
          <div class="tooltip-content">
            <div
              v-if="title"
              class="tooltip-title"
            >
              <i
                v-if="icon"
                :class="icon"
                class="tooltip-icon"
                aria-hidden="true"
              />
              {{ title }}
            </div>

            <div class="tooltip-body">
              <slot />
            </div>

            <!-- Botón de acción (opcional) -->
            <div
              v-if="actionText"
              class="tooltip-actions"
            >
              <button
                type="button"
                class="tooltip-action-btn"
                @click="handleAction"
              >
                {{ actionText }}
              </button>
              <button
                type="button"
                class="tooltip-dismiss-btn"
                @click="dismiss"
              >
                {{ dismissText }}
              </button>
            </div>

            <!-- Solo botón de cerrar -->
            <button
              v-else
              type="button"
              class="tooltip-close"
              aria-label="Cerrar tooltip"
              @click="dismiss"
            >
              <i
                class="fas fa-times"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useContextualTooltip } from '@/composables/ui/useContextualTours'

const props = defineProps({
  // ID único del tooltip (para tracking)
  tooltipId: {
    type: String,
    required: true
  },
  // Contenido
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  // Posición
  position: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  // Variante visual
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'info', 'warning'].includes(value)
  },
  // Condición para mostrar
  condition: {
    type: Function,
    default: () => true
  },
  // Auto-mostrar
  autoShow: {
    type: Boolean,
    default: true
  },
  // Delay antes de mostrar (ms)
  delay: {
    type: Number,
    default: 500
  },
  // Botón de acción
  actionText: {
    type: String,
    default: ''
  },
  dismissText: {
    type: String,
    default: 'Entendido'
  }
})

const emit = defineEmits(['action', 'dismiss'])

const triggerRef = ref(null)
const tooltipRef = ref(null)
const tooltipStyle = ref({})

const { isVisible, show, hide, dismiss: dismissTooltip } = useContextualTooltip(
  props.tooltipId,
  {
    condition: props.condition,
    autoShow: props.autoShow,
    delay: props.delay
  }
)

const variantClass = computed(() => `tooltip-${props.variant}`)

const handleAction = () => {
  emit('action')
  dismiss()
}

const dismiss = () => {
  dismissTooltip()
  emit('dismiss')
}

// Calcular posición del tooltip
const calculatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()

  let top = 0
  let left = 0

  const offset = 12 // Espacio entre trigger y tooltip

  switch (props.position) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      break
    case 'bottom':
      top = triggerRect.bottom + offset
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      left = triggerRect.left - tooltipRect.width - offset
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      left = triggerRect.right + offset
      break
  }

  // Ajustar si se sale de la pantalla
  const padding = 16
  if (left < padding) left = padding
  if (left + tooltipRect.width > window.innerWidth - padding) {
    left = window.innerWidth - tooltipRect.width - padding
  }
  if (top < padding) top = padding
  if (top + tooltipRect.height > window.innerHeight - padding) {
    top = window.innerHeight - tooltipRect.height - padding
  }

  tooltipStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999
  }
}

watch(isVisible, (visible) => {
  if (visible) {
    // Esperar siguiente tick para que el tooltip esté en el DOM
    setTimeout(calculatePosition, 10)
  }
})

onMounted(() => {
  // Recalcular posición en resize/scroll
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
})

// Exponer métodos
defineExpose({
  show,
  hide,
  dismiss
})
</script>

<style scoped>
/* Wrapper */
.contextual-tooltip-wrapper {
  @apply inline-block;
}

/* Tooltip */
.contextual-tooltip {
  @apply bg-dark-elevated border border-dark-border;
  @apply rounded-xl shadow-2xl;
  @apply max-w-sm;
  @apply backdrop-blur-md;
}

.light .contextual-tooltip {
  @apply bg-light-elevated border-light-border;
}

/* Variantes */
.tooltip-primary {
  @apply border-primary-500/30;
}

.tooltip-success {
  @apply border-success-500/30;
}

.tooltip-info {
  @apply border-info-500/30;
}

.tooltip-warning {
  @apply border-warning-500/30;
}

/* Arrow */
.tooltip-arrow {
  @apply absolute w-3 h-3 bg-dark-elevated border-dark-border;
  transform: rotate(45deg);
}

.light .tooltip-arrow {
  @apply bg-light-elevated border-light-border;
}

.tooltip-bottom .tooltip-arrow {
  @apply top-0 left-1/2 -translate-x-1/2 -translate-y-1/2;
  @apply border-t border-l;
  @apply border-r-0 border-b-0;
}

.tooltip-top .tooltip-arrow {
  @apply bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2;
  @apply border-r border-b;
  @apply border-l-0 border-t-0;
}

/* Content */
.tooltip-content {
  @apply p-4 relative;
}

.tooltip-title {
  @apply flex items-center gap-2;
  @apply text-sm font-semibold text-text-primary mb-2;
}

.light .tooltip-title {
  @apply text-text-light-primary;
}

.tooltip-icon {
  @apply text-primary-500;
}

.tooltip-body {
  @apply text-sm text-text-secondary leading-relaxed;
}

.light .tooltip-body {
  @apply text-text-light-secondary;
}

/* Actions */
.tooltip-actions {
  @apply flex gap-2 mt-3;
}

.tooltip-action-btn {
  @apply px-3 py-1.5 text-xs font-medium rounded-lg;
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-500;
  @apply transition-colors;
}

.tooltip-dismiss-btn {
  @apply px-3 py-1.5 text-xs font-medium rounded-lg;
  @apply bg-transparent text-text-secondary;
  @apply hover:bg-dark-hover;
  @apply transition-colors;
}

.light .tooltip-dismiss-btn {
  @apply hover:bg-light-hover;
}

/* Close button */
.tooltip-close {
  @apply absolute top-2 right-2;
  @apply p-1.5 rounded-lg;
  @apply text-text-tertiary;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply transition-colors;
}

.light .tooltip-close {
  @apply hover:bg-light-hover;
}

/* Transition */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  @apply transition-all duration-200;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  @apply opacity-0 scale-95;
}

.tooltip-fade-enter-to,
.tooltip-fade-leave-from {
  @apply opacity-100 scale-100;
}
</style>
