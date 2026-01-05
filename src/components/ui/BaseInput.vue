<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="inputId" class="input-label" :class="{ 'label-required': required }">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="input-container">
      <div v-if="slots.prepend || icon" class="input-prepend">
        <slot name="prepend">
          <i v-if="icon" :class="iconClass" class="input-icon"></i>
        </slot>
      </div>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
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
      />

      <div v-if="slots.append" class="input-append">
        <slot name="append"></slot>
      </div>
    </div>

    <p v-if="error" class="input-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
    <p v-else-if="hint" class="input-hint">
      <i class="fas fa-info-circle"></i>
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
/* ===== BASE INPUT - DARKLITE DESIGN SYSTEM ===== */
.base-input-wrapper {
  width: 100%;
  margin-bottom: 1.25rem;
}

/* ===== LABEL ===== */
.input-label {
  display: block;
  margin-bottom: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #a1a1aa;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  transition: color 200ms ease;
}

.label-required .required-mark {
  color: #ef4444;
  margin-left: 0.25rem;
  font-weight: 700;
}

/* ===== INPUT CONTAINER ===== */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prepend,
.input-append {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  transition: all 200ms ease;
}

.input-prepend {
  left: 0;
  padding-left: 1rem;
}

.input-append {
  right: 0;
  padding-right: 1rem;
  pointer-events: all;
}

.input-icon {
  color: #71717a;
  font-size: 1rem;
  transition: color 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== BASE INPUT ===== */
.base-input {
  position: relative;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 400;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  letter-spacing: -0.01em;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.base-input.has-prepend {
  padding-left: 3rem;
}

.base-input.has-append {
  padding-right: 3rem;
}

/* Placeholder */
.base-input::placeholder {
  color: #52525b;
  opacity: 1;
  letter-spacing: -0.01em;
}

/* Hover State */
.base-input:hover:not(:disabled):not(:readonly) {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

/* Focus State */
.base-input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.base-input:focus ~ .input-prepend .input-icon,
.base-input:focus + .input-prepend .input-icon {
  color: #3b82f6;
}

/* Disabled State */
.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

/* Read-only State */
.base-input:readonly {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  cursor: default;
}

/* Error State */
.base-input.input-error-state {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.base-input.input-error-state:focus {
  border-color: #ef4444;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.base-input.input-error-state:focus ~ .input-prepend .input-icon,
.base-input.input-error-state:focus + .input-prepend .input-icon {
  color: #ef4444;
}

/* ===== ERROR & HINT MESSAGES ===== */
.input-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #f87171;
  letter-spacing: -0.01em;
  animation: slideInUp 200ms ease-out;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #71717a;
  letter-spacing: -0.01em;
}

.input-error i,
.input-hint i {
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* ===== NUMBER INPUT - Remove Arrows ===== */
.base-input[type="number"]::-webkit-inner-spin-button,
.base-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.base-input[type="number"] {
  -moz-appearance: textfield;
}

/* ===== DATE/TIME INPUTS ===== */
.base-input[type="date"],
.base-input[type="time"],
.base-input[type="datetime-local"],
.base-input[type="month"],
.base-input[type="week"] {
  color-scheme: dark;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  cursor: pointer;
  padding-right: 3rem;
}

.base-input[type="time"] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
}

/* Calendar Picker Indicator */
.base-input[type="date"]::-webkit-calendar-picker-indicator,
.base-input[type="time"]::-webkit-calendar-picker-indicator,
.base-input[type="datetime-local"]::-webkit-calendar-picker-indicator,
.base-input[type="month"]::-webkit-calendar-picker-indicator,
.base-input[type="week"]::-webkit-calendar-picker-indicator {
  background: transparent;
  cursor: pointer;
  filter: invert(0.7);
  opacity: 0;
  position: absolute;
  right: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
}

/* Clear Button */
.base-input[type="date"]::-webkit-clear-button,
.base-input[type="time"]::-webkit-clear-button,
.base-input[type="datetime-local"]::-webkit-clear-button {
  display: none;
}

/* Inner Spin Button */
.base-input[type="time"]::-webkit-inner-spin-button,
.base-input[type="datetime-local"]::-webkit-inner-spin-button {
  display: none;
}

/* Placeholder for Date/Time */
.base-input[type="date"]::before,
.base-input[type="time"]::before,
.base-input[type="datetime-local"]::before {
  color: #52525b;
  content: attr(placeholder);
}

.base-input[type="date"]:focus::before,
.base-input[type="time"]:focus::before,
.base-input[type="datetime-local"]:focus::before,
.base-input[type="date"]:valid::before,
.base-input[type="time"]:valid::before,
.base-input[type="datetime-local"]:valid::before {
  content: "" !important;
}

/* ===== ANIMATIONS ===== */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .base-input {
    font-size: 0.875rem;
    padding: 0.625rem 0.875rem;
  }

  .base-input.has-prepend {
    padding-left: 2.75rem;
  }

  .base-input.has-append {
    padding-right: 2.75rem;
  }

  .input-label {
    font-size: 0.75rem;
  }

  .input-error,
  .input-hint {
    font-size: 0.75rem;
  }
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  .base-input,
  .input-icon,
  .input-error {
    transition: none;
    animation: none;
  }

  .base-input:focus {
    transform: none;
  }
}
</style>
