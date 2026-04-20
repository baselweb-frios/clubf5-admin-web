<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    class="base-button group"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span
v-if="loading"
class="loading-spinner"
>
      <svg
class="animate-spin"
fill="none"
viewBox="0 0 24 24"
>
        <circle
class="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="4"
/>
        <path
class="opacity-75"
fill="currentColor"
d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
/>
      </svg>
    </span>

    <!-- Icon (prepend) -->
    <i
v-if="icon && !loading"
:class="icon"
class="button-icon"
/>

    <!-- Content -->
    <span class="button-content">
      <slot />
    </span>

    <!-- Icon (append) -->
    <i
v-if="iconRight && !loading"
:class="iconRight"
class="button-icon-right"
/>

    <!-- Shimmer Effect Overlay -->
    <span class="button-shimmer" />
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
/* Base Button */
.base-button {
  @apply inline-flex items-center justify-center gap-2;
  @apply font-medium rounded-lg;
  @apply transition-all duration-200 ease-apple;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply active:scale-[0.98];
  @apply relative overflow-hidden;
}

.light .base-button {
  @apply focus-visible:ring-offset-light-primary;
}

/* ===== VARIANTS ===== */

/* Primary */
.btn-primary {
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-500;
  @apply focus-visible:ring-primary-500;
}

/* Secondary */
.btn-secondary {
  @apply bg-dark-elevated text-text-primary border border-dark-border;
  @apply hover:bg-dark-hover hover:border-dark-hover;
  @apply focus-visible:ring-dark-border;
}

.light .btn-secondary {
  @apply bg-light-secondary text-text-light-primary border-light-border;
  @apply hover:bg-light-hover;
}

/* Success */
.btn-success {
  @apply bg-success-600 text-white;
  @apply hover:bg-success-500;
  @apply focus-visible:ring-success-500;
}

/* Danger */
.btn-danger {
  @apply bg-danger-600 text-white;
  @apply hover:bg-danger-500;
  @apply focus-visible:ring-danger-500;
}

/* Warning */
.btn-warning {
  @apply bg-warning-600 text-white;
  @apply hover:bg-warning-500;
  @apply focus-visible:ring-warning-500;
}

/* Info */
.btn-info {
  @apply bg-info-600 text-white;
  @apply hover:bg-info-500;
  @apply focus-visible:ring-info-500;
}

/* Ghost */
.btn-ghost {
  @apply bg-transparent text-text-secondary;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply focus-visible:ring-primary-500;
}

.light .btn-ghost {
  @apply text-text-light-secondary;
  @apply hover:bg-light-hover hover:text-text-light-primary;
}

/* Outline */
.btn-outline {
  @apply bg-transparent text-primary-400 border border-primary-500;
  @apply hover:bg-primary-500/10;
  @apply focus-visible:ring-primary-500;
}

.light .btn-outline {
  @apply text-primary-600 border-primary-500;
  @apply hover:bg-primary-500/10;
}

/* Glass */
.btn-glass {
  @apply bg-glass-light text-text-primary backdrop-blur-md;
  @apply border border-glass-border;
  @apply hover:bg-glass-medium;
  @apply focus-visible:ring-white/30;
}

/* ===== SIZES ===== */

.btn-xs {
  @apply px-2 py-1 text-xs rounded-md;
}

.btn-sm {
  @apply px-3 py-1.5 text-xs rounded-md;
}

.btn-md {
  @apply px-4 py-2.5 text-sm;
}

.btn-lg {
  @apply px-6 py-3 text-base rounded-xl;
}

.btn-xl {
  @apply px-8 py-4 text-lg rounded-xl;
}

/* ===== MODIFIERS ===== */

.btn-block {
  @apply w-full;
}

.btn-rounded {
  @apply rounded-full;
}

/* ===== ELEMENTS ===== */

/* Loading Spinner */
.loading-spinner {
  @apply w-4 h-4 flex-shrink-0;
}

.loading-spinner svg {
  @apply w-full h-full;
}

/* Icons */
.button-icon,
.button-icon-right {
  @apply text-current flex-shrink-0;
  @apply transition-transform duration-200;
}

.btn-xs .button-icon,
.btn-xs .button-icon-right,
.btn-sm .button-icon,
.btn-sm .button-icon-right {
  @apply text-xs;
}

.btn-md .button-icon,
.btn-md .button-icon-right {
  @apply text-sm;
}

.btn-lg .button-icon,
.btn-lg .button-icon-right,
.btn-xl .button-icon,
.btn-xl .button-icon-right {
  @apply text-base;
}

/* Content */
.button-content {
  @apply truncate;
}

/* Shimmer Effect */
.button-shimmer {
  @apply absolute inset-0 pointer-events-none;
  @apply opacity-0 transition-opacity duration-300;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
}

.base-button:hover:not(:disabled) .button-shimmer {
  @apply opacity-100;
  animation: shimmer 0.6s ease-out;
}

@keyframes shimmer {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
</style>

