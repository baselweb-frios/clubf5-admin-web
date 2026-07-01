<template>
  <div class="base-input-wrapper">
    <label
v-if="label"
:for="inputId"
class="input-label"
:class="{ 'label-required': required }"
>
      {{ label }}
      <span
v-if="required"
class="required-mark"
>*</span>
    </label>

    <div class="input-container">
      <div
v-if="slots.prepend || icon"
class="input-prepend"
>
        <slot name="prepend">
          <i
v-if="icon"
:class="iconClass"
class="input-icon"
/>
        </slot>
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
        :autocomplete="autocomplete"
        :class="inputClasses"
        class="base-input"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <div
v-if="slots.append"
class="input-append"
>
        <slot name="append" />
      </div>
    </div>

    <p
v-if="error"
class="input-error"
>
      <i class="fas fa-exclamation-circle" />
      {{ error }}
    </p>
    <p
v-else-if="hint"
class="input-hint"
>
      <i class="fas fa-info-circle" />
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const slots = useSlots()

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'].includes(value)
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
  icon: {
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
  autocomplete: {
    type: String,
    default: 'off'
  },
  inputId: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputClasses = computed(() => {
  const classes = []

  if (props.error) {
    classes.push('input-error-state')
  }

  if (slots.prepend || props.icon) {
    classes.push('has-prepend')
  }

  if (slots.append) {
    classes.push('has-append')
  }

  return classes
})

const iconClass = computed(() => {
  const icons = {
    email: 'fas fa-envelope',
    search: 'fas fa-search',
    user: 'fas fa-user',
    lock: 'fas fa-lock',
    phone: 'fas fa-phone',
    calendar: 'fas fa-calendar-alt'
  }
  return icons[props.icon] || 'fas fa-circle'
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
</script>

<style scoped>
/* Wrapper */
.base-input-wrapper {
  @apply space-y-1.5;
}

/* Label */
.input-label {
  @apply block text-sm font-medium text-text-secondary;
}

.light .input-label {
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

/* Input Container */
.input-container {
  @apply relative flex items-center;
}

/* Base Input */
.base-input {
  @apply w-full px-4 py-2.5 rounded-lg text-sm;
  @apply bg-dark-secondary text-text-primary;
  @apply border border-dark-border;
  @apply placeholder:text-text-tertiary;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply read-only:bg-dark-tertiary read-only:cursor-default;
}

.light .base-input {
  @apply bg-light-secondary text-text-light-primary border-light-border;
  @apply placeholder:text-text-light-tertiary;
  @apply read-only:bg-light-tertiary;
}

/* Error State */
.base-input.input-error-state {
  @apply border-danger-500;
  @apply focus:border-danger-500 focus:ring-danger-500;
}

/* With Prepend/Append */
.base-input.has-prepend {
  @apply pl-10;
}

.base-input.has-append {
  @apply pr-10;
}

/* Prepend Slot */
.input-prepend {
  @apply absolute left-0 top-0 bottom-0;
  @apply flex items-center justify-center w-10;
  @apply pointer-events-none;
}

.input-icon {
  @apply text-text-tertiary text-sm;
}

.light .input-icon {
  @apply text-text-light-tertiary;
}

/* Append Slot */
.input-append {
  @apply absolute right-0 top-0 bottom-0;
  @apply flex items-center justify-center w-10;
}

/* Error Message */
.input-error {
  @apply flex items-center gap-1.5;
  @apply text-xs text-danger-400;
}

.input-error i {
  @apply text-danger-500;
}

/* Hint Message */
.input-hint {
  @apply flex items-center gap-1.5;
  @apply text-xs text-text-tertiary;
}

.light .input-hint {
  @apply text-text-light-tertiary;
}

.input-hint i {
  @apply text-info-500;
}
</style>

