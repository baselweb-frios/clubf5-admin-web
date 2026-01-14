<template>
  <div class="base-date-wrapper">
    <label
v-if="label"
:for="inputId"
class="date-label"
:class="{ 'label-required': required }"
>
      {{ label }}
      <span
v-if="required"
class="required-mark"
>*</span>
    </label>

    <div class="date-container">
      <!-- Calendar Icon -->
      <div class="date-icon">
        <svg
v-if="type === 'date' || type === 'datetime-local' || type === 'month' || type === 'week'"
             width="20"
height="20"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
>
          <rect
x="3"
y="4"
width="18"
height="18"
rx="2"
ry="2"
/>
          <line
x1="16"
y1="2"
x2="16"
y2="6"
/>
          <line
x1="8"
y1="2"
x2="8"
y2="6"
/>
          <line
x1="3"
y1="10"
x2="21"
y2="10"
/>
        </svg>
        <svg
v-else-if="type === 'time'"
             width="20"
height="20"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
>
          <circle
cx="12"
cy="12"
r="10"
/>
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :class="dateClasses"
        class="base-date-input"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleChange"
      >
    </div>

    <p
v-if="error"
class="date-error"
>
      <i class="fas fa-exclamation-circle" />
      {{ error }}
    </p>
    <p
v-else-if="hint"
class="date-hint"
>
      <i class="fas fa-info-circle" />
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'date',
    validator: (value) => ['date', 'time', 'datetime-local', 'month', 'week'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  min: {
    type: [String, Number],
    default: undefined
  },
  max: {
    type: [String, Number],
    default: undefined
  },
  step: {
    type: [String, Number],
    default: undefined
  },
  inputId: {
    type: String,
    default: () => `date-input-${Math.random().toString(36).substr(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change'])

const dateClasses = computed(() => {
  const classes = []

  if (props.error) {
    classes.push('date-error-state')
  }

  return classes
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleChange = (event) => {
  emit('change', event.target.value)
}
</script>

<style scoped>
/* Wrapper */
.base-date-wrapper {
  @apply space-y-1.5;
}

/* Label */
.date-label {
  @apply block text-sm font-medium text-text-secondary;
}

.light .date-label {
  @apply text-text-light-secondary;
}

.label-required {
  @apply text-text-primary;
}

.light .label-required {
  @apply text-text-light-primary;
}

.required-mark {
  @apply text-danger-500 ml-0.5;
}

/* Date Container */
.date-container {
  @apply relative flex items-center;
}

/* Date Icon */
.date-icon {
  @apply absolute left-0 top-0 bottom-0;
  @apply flex items-center justify-center w-10;
  @apply pointer-events-none;
  @apply text-text-tertiary;
}

.light .date-icon {
  @apply text-text-light-tertiary;
}

/* Base Date Input */
.base-date-input {
  @apply w-full pl-10 pr-4 py-2.5 rounded-lg text-sm;
  @apply bg-dark-secondary text-text-primary;
  @apply border border-dark-border;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply read-only:bg-dark-tertiary read-only:cursor-default;
}

.light .base-date-input {
  @apply bg-light-secondary text-text-light-primary border-light-border;
  @apply read-only:bg-light-tertiary;
}

/* Custom date picker styling */
.base-date-input::-webkit-calendar-picker-indicator {
  @apply cursor-pointer opacity-60 hover:opacity-100;
  @apply transition-opacity duration-200;
  filter: invert(1);
}

.light .base-date-input::-webkit-calendar-picker-indicator {
  filter: invert(0);
}

/* Error State */
.base-date-input.date-error-state {
  @apply border-danger-500;
  @apply focus:border-danger-500 focus:ring-danger-500;
}

/* Error Message */
.date-error {
  @apply flex items-center gap-1.5;
  @apply text-xs text-danger-400;
}

.date-error i {
  @apply text-danger-500;
}

/* Hint Message */
.date-hint {
  @apply flex items-center gap-1.5;
  @apply text-xs text-text-tertiary;
}

.light .date-hint {
  @apply text-text-light-tertiary;
}

.date-hint i {
  @apply text-info-500;
}
</style>

