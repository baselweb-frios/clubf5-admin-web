<template>
  <button
    v-if="show"
    class="tour-button"
    :class="[
      `tour-button--${variant}`,
      `tour-button--${size}`,
      { 'tour-button--pulse': pulse && !tourViewed }
    ]"
    :title="title"
    @click="handleClick"
  >
    <i v-if="icon" :class="icon" />
    <svg
      v-else
      class="tour-button__icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span v-if="label" class="tour-button__label">{{ label }}</span>
  </button>
</template>

<script setup>
/**
 * TourButton - Botón para iniciar tours guiados
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'floating'
 * - size: 'sm' | 'md' | 'lg'
 * - label: Texto opcional del botón
 * - icon: Clase de icono personalizado (ej: 'fas fa-question')
 * - title: Tooltip del botón
 * - pulse: Mostrar animación de pulso si el tour no ha sido visto
 * - show: Mostrar/ocultar el botón
 *
 * Events:
 * - @click: Emitido al hacer clic
 * - @tour-start: Emitido cuando se inicia el tour
 */

import { computed } from 'vue'
import { useDriverTour } from '@/composables/useDriverTour'

const props = defineProps({
  variant: {
    type: String,
    default: 'floating',
    validator: (v) => ['primary', 'secondary', 'ghost', 'floating'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Ver tour guiado'
  },
  pulse: {
    type: Boolean,
    default: true
  },
  show: {
    type: Boolean,
    default: true
  },
  customSteps: {
    type: Array,
    default: null
  }
})

const emit = defineEmits(['click', 'tour-start'])

const { startTour, startCustomTour, hasTour, isTourViewed } = useDriverTour()

const tourViewed = computed(() => isTourViewed())

const handleClick = async () => {
  emit('click')

  let started = false

  if (props.customSteps) {
    started = await startCustomTour(props.customSteps)
  } else if (hasTour()) {
    started = await startTour()
  }

  if (started) {
    emit('tour-start')
  }
}
</script>

<style scoped>
.tour-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

/* Variantes */
.tour-button--primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
}

.tour-button--primary:hover {
  background: linear-gradient(135deg, #9d74f8 0%, #7c7ef5 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.tour-button--secondary {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.tour-button--secondary:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
}

.tour-button--ghost {
  background: transparent;
  color: #94a3b8;
}

.tour-button--ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.tour-button--floating {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border-radius: 50%;
  box-shadow:
    0 4px 14px rgba(139, 92, 246, 0.4),
    0 0 0 0 rgba(139, 92, 246, 0.4);
  z-index: 1000;
}

.tour-button--floating:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

/* Tamaños */
.tour-button--sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.tour-button--sm.tour-button--floating {
  width: 40px;
  height: 40px;
  padding: 0;
}

.tour-button--md {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.tour-button--md.tour-button--floating {
  width: 48px;
  height: 48px;
  padding: 0;
}

.tour-button--lg {
  padding: 12px 24px;
  font-size: 1rem;
}

.tour-button--lg.tour-button--floating {
  width: 56px;
  height: 56px;
  padding: 0;
}

/* Icono */
.tour-button__icon {
  width: 20px;
  height: 20px;
}

.tour-button--sm .tour-button__icon {
  width: 16px;
  height: 16px;
}

.tour-button--lg .tour-button__icon {
  width: 24px;
  height: 24px;
}

/* Label */
.tour-button__label {
  white-space: nowrap;
}

.tour-button--floating .tour-button__label {
  display: none;
}

/* Animación pulse */
.tour-button--pulse {
  animation: tour-pulse 2s infinite;
}

@keyframes tour-pulse {
  0% {
    box-shadow:
      0 4px 14px rgba(139, 92, 246, 0.4),
      0 0 0 0 rgba(139, 92, 246, 0.4);
  }
  70% {
    box-shadow:
      0 4px 14px rgba(139, 92, 246, 0.4),
      0 0 0 12px rgba(139, 92, 246, 0);
  }
  100% {
    box-shadow:
      0 4px 14px rgba(139, 92, 246, 0.4),
      0 0 0 0 rgba(139, 92, 246, 0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .tour-button--floating {
    bottom: 16px;
    right: 16px;
  }

  .tour-button--floating.tour-button--lg {
    width: 48px;
    height: 48px;
  }
}
</style>
