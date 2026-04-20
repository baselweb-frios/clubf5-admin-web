<template>
  <div
class="base-card group"
:class="cardClasses"
>
    <!-- Card Header -->
    <div
v-if="$slots.header || title || subtitle"
class="card-header"
>
      <div class="card-header-content">
        <div class="card-header-text">
          <slot name="header">
            <h3
v-if="title"
class="card-title"
>
{{ title }}
</h3>
            <p
v-if="subtitle"
class="card-subtitle"
>
{{ subtitle }}
</p>
          </slot>
        </div>
        <div
v-if="$slots.actions"
class="card-header-actions"
>
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div
class="card-body"
:class="bodyClasses"
>
      <slot />
    </div>

    <!-- Card Footer -->
    <div
v-if="$slots.footer"
class="card-footer"
>
      <slot name="footer" />
    </div>

    <!-- Glass Shine Effect -->
    <div
v-if="glass"
class="card-shine"
/>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  hover: {
    type: Boolean,
    default: true
  },
  shadow: {
    type: String,
    default: 'lg',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  glass: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: true
  }
})

const cardClasses = computed(() => {
  return [
    `card-shadow-${props.shadow}`,
    {
      'card-hover': props.hover,
      'card-glass': props.glass,
      'card-bordered': props.bordered
    }
  ]
})

const bodyClasses = computed(() => {
  return {
    'no-padding': props.noPadding
  }
})
</script>

<style scoped>
/* Base Card */
.base-card {
  @apply bg-dark-tertiary rounded-xl;
  @apply transition-all duration-200;
  @apply relative overflow-hidden;
}

.light .base-card {
  @apply bg-light-elevated;
}

/* Bordered variant */
.card-bordered {
  @apply border border-dark-border;
}

.light .card-bordered {
  @apply border-light-border;
}

/* Hover effect */
.card-hover:hover {
  @apply bg-dark-elevated border-dark-hover;
}

.light .card-hover:hover {
  @apply bg-white border-light-hover;
}

/* Glass effect */
.card-glass {
  @apply bg-glass-medium backdrop-blur-xl;
  @apply border-glass-border;
}

/* Shadow variants */
.card-shadow-none {
  @apply shadow-none;
}

.card-shadow-sm {
  @apply shadow-sm;
}

.card-shadow-md {
  @apply shadow-md;
}

.card-shadow-lg {
  @apply shadow-lg;
}

.card-shadow-xl {
  @apply shadow-xl;
}

.card-shadow-2xl {
  @apply shadow-2xl;
}

/* Card Header */
.card-header {
  @apply px-4 sm:px-6 py-4 border-b border-dark-border;
}

.light .card-header {
  @apply border-light-border;
}

.card-header-content {
  @apply flex items-start justify-between gap-4;
}

.card-header-text {
  @apply flex-1 min-w-0;
}

.card-title {
  @apply text-lg font-semibold text-text-primary truncate;
}

.light .card-title {
  @apply text-text-light-primary;
}

.card-subtitle {
  @apply text-sm text-text-secondary mt-1;
}

.light .card-subtitle {
  @apply text-text-light-secondary;
}

.card-header-actions {
  @apply flex items-center gap-2 flex-shrink-0;
}

/* Card Body */
.card-body {
  @apply p-4 sm:p-6;
}

.card-body.no-padding {
  @apply p-0;
}

/* Card Footer */
.card-footer {
  @apply px-4 sm:px-6 py-4 border-t border-dark-border;
  @apply flex items-center justify-end gap-3;
}

.light .card-footer {
  @apply border-light-border;
}

/* Glass shine effect */
.card-shine {
  @apply absolute inset-0 pointer-events-none;
  @apply opacity-0 transition-opacity duration-300;
  background: linear-gradient(
    135deg,
    transparent 40%,
    rgba(255, 255, 255, 0.03) 50%,
    transparent 60%
  );
}

.card-hover:hover .card-shine {
  @apply opacity-100;
}
</style>

