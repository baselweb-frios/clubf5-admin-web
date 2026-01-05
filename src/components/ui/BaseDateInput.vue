<template>
  <div class="base-date-wrapper">
    <label v-if="label" :for="inputId" class="date-label" :class="{ 'label-required': required }">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="date-container">
      <!-- Calendar Icon -->
      <div class="date-icon">
        <svg v-if="type === 'date' || type === 'datetime-local' || type === 'month' || type === 'week'"
             width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <svg v-else-if="type === 'time'"
             width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleChange"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :class="dateClasses"
        class="base-date-input"
      />
    </div>

    <p v-if="error" class="date-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
    <p v-else-if="hint" class="date-hint">
      <i class="fas fa-info-circle"></i>
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
/* ===== BASE DATE INPUT - DARKLITE DESIGN SYSTEM ===== */
.base-date-wrapper {
  width: 100%;
  margin-bottom: 1.25rem;
}

/* ===== LABEL ===== */
.date-label {
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

/* ===== DATE CONTAINER ===== */
.date-container {
  position: relative;
  display: flex;
  align-items: center;
}

.date-icon {
  position: absolute;
  left: 0;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  color: #71717a;
  transition: color 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== BASE DATE INPUT ===== */
.base-date-input {
  position: relative;
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3.25rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: #ffffff;
  color-scheme: dark;
  font-size: 0.9375rem;
  font-weight: 400;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  letter-spacing: -0.01em;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Calendar Picker Indicator - Hidden but clickable */
.base-date-input::-webkit-calendar-picker-indicator {
  background: transparent;
  cursor: pointer;
  filter: invert(0.7);
  opacity: 0;
  position: absolute;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  z-index: 3;
}

/* Clear Button */
.base-date-input::-webkit-clear-button {
  display: none;
}

/* Inner Spin Button */
.base-date-input::-webkit-inner-spin-button {
  display: none;
}

/* Placeholder */
.base-date-input::placeholder {
  color: #52525b;
  opacity: 1;
  letter-spacing: -0.01em;
}

/* Placeholder for empty date/time */
.base-date-input::before {
  color: #52525b;
  content: attr(placeholder);
}

.base-date-input:focus::before,
.base-date-input:valid::before {
  content: "" !important;
}

/* Hover State */
.base-date-input:hover:not(:disabled):not(:readonly) {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.base-date-input:hover:not(:disabled):not(:readonly) ~ .date-icon {
  color: #a1a1aa;
}

/* Focus State */
.base-date-input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.base-date-input:focus ~ .date-icon {
  color: #3b82f6;
}

/* Disabled State */
.base-date-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

/* Read-only State */
.base-date-input:readonly {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  cursor: default;
}

/* Error State */
.base-date-input.date-error-state {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.base-date-input.date-error-state:focus {
  border-color: #ef4444;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.base-date-input.date-error-state:focus ~ .date-icon {
  color: #ef4444;
}

/* ===== ERROR & HINT MESSAGES ===== */
.date-error {
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

.date-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #71717a;
  letter-spacing: -0.01em;
}

.date-error i,
.date-hint i {
  font-size: 0.875rem;
  flex-shrink: 0;
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
  .base-date-input {
    font-size: 0.875rem;
    padding: 0.625rem 2.75rem 0.625rem 3rem;
  }

  .date-label {
    font-size: 0.75rem;
  }

  .date-error,
  .date-hint {
    font-size: 0.75rem;
  }
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  .base-date-input,
  .date-icon,
  .date-error {
    transition: none;
    animation: none;
  }

  .base-date-input:focus {
    transform: none;
  }
}
</style>
