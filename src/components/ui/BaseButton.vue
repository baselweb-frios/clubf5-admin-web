<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
    :class="buttonClasses"
    class="base-button group"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="loading-spinner">
      <svg class="animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>

    <!-- Icon (prepend) -->
    <i v-if="icon && !loading" :class="icon" class="button-icon"></i>

    <!-- Content -->
    <span class="button-content">
      <slot></slot>
    </span>

    <!-- Icon (append) -->
    <i v-if="iconRight && !loading" :class="iconRight" class="button-icon-right"></i>

    <!-- Shimmer Effect Overlay -->
    <span class="button-shimmer"></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost', 'outline', 'glass'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  iconRight: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  return [
    // Variant classes
    `btn-${props.variant}`,
    // Size classes
    `btn-${props.size}`,
    // Block class
    { 'btn-block': props.block },
    // Rounded class
    { 'btn-rounded': props.rounded }
  ]
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* ===== BASE BUTTON - DARKLITE DESIGN SYSTEM ===== */
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  border: 1px solid transparent;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  outline: none;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
}

/* Shimmer Effect (Subtle Highlight on Hover) */
.button-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 300ms ease;
}

.base-button:hover .button-shimmer {
  opacity: 1;
}

/* Focus State - Premium Ring */
.base-button:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 3px;
}

/* Disabled State */
.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  transform: none !important;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-flex;
  width: 1em;
  height: 1em;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
}

/* Button Content */
.button-content {
  position: relative;
  z-index: 1;
}

/* Icons */
.button-icon,
.button-icon-right {
  position: relative;
  z-index: 1;
  font-size: 0.9em;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.base-button:hover .button-icon {
  transform: translateX(-2px);
}

.base-button:hover .button-icon-right {
  transform: translateX(2px);
}

/* ===== BUTTON VARIANTS - DARKLITE THEME ===== */

/* Primary - Electric Blue with Glow */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    0 0 0 0 rgba(59, 130, 246, 0);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: rgba(96, 165, 250, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 4px 6px -2px rgba(0, 0, 0, 0.12),
    0 0 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 10px rgba(59, 130, 246, 0.2);
}

/* Secondary - Glass Effect */
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.btn-secondary:active:not(:disabled) {
  transform: scale(0.98);
}

/* Success - Mint Green */
.btn-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  border: 1px solid rgba(34, 197, 94, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    0 0 0 0 rgba(34, 197, 94, 0);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border-color: rgba(74, 222, 128, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(34, 197, 94, 0.4);
}

.btn-success:active:not(:disabled) {
  transform: scale(0.98);
}

/* Danger - Vibrant Red */
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    0 0 0 0 rgba(239, 68, 68, 0);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  border-color: rgba(248, 113, 113, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(239, 68, 68, 0.4);
}

.btn-danger:active:not(:disabled) {
  transform: scale(0.98);
}

/* Warning - Amber */
.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: rgba(251, 191, 36, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(245, 158, 11, 0.3);
}

.btn-warning:active:not(:disabled) {
  transform: scale(0.98);
}

/* Info - Cyan */
.btn-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: #ffffff;
  border: 1px solid rgba(14, 165, 233, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
}

.btn-info:hover:not(:disabled) {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(14, 165, 233, 0.3);
}

.btn-info:active:not(:disabled) {
  transform: scale(0.98);
}

/* Ghost - Transparent */
.btn-ghost {
  background: transparent;
  color: #a1a1aa;
  border: 1px solid transparent;
  box-shadow: none;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-ghost:active:not(:disabled) {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.03);
}

/* Outline - Bordered */
.btn-outline {
  background: transparent;
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-outline:active:not(:disabled) {
  transform: scale(0.98);
}

/* Glass - Premium Glassmorphism */
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px) saturate(180%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-glass:active:not(:disabled) {
  transform: scale(0.98);
}

/* ===== SIZE VARIANTS ===== */
.btn-xs {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  gap: 0.375rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  border-radius: 0.625rem;
  gap: 0.375rem;
}

.btn-md {
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  border-radius: 0.75rem;
  gap: 0.5rem;
}

.btn-lg {
  padding: 0.875rem 1.75rem;
  font-size: 1.0625rem;
  border-radius: 1rem;
  gap: 0.625rem;
}

.btn-xl {
  padding: 1.125rem 2.25rem;
  font-size: 1.1875rem;
  border-radius: 1.25rem;
  gap: 0.75rem;
}

/* ===== MODIFIERS ===== */

/* Block - Full Width */
.btn-block {
  width: 100%;
  display: flex;
}

/* Rounded - Pill Shape */
.btn-rounded {
  border-radius: 9999px;
}

/* ===== RESPONSIVE ADJUSTMENTS ===== */
@media (max-width: 768px) {
  .btn-xs {
    padding: 0.375rem 0.625rem;
    font-size: 0.6875rem;
  }

  .btn-sm {
    padding: 0.5rem 0.875rem;
    font-size: 0.75rem;
  }

  .btn-md {
    padding: 0.625rem 1.125rem;
    font-size: 0.875rem;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .btn-xl {
    padding: 1rem 2rem;
    font-size: 1.0625rem;
  }
}
</style>
