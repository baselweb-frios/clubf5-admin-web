<template>
  <div class="base-select-wrapper">
    <label v-if="label" :for="selectId" class="select-label" :class="{ 'label-required': required }">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="select-container">
      <!-- Icon (prepend) -->
      <div v-if="icon" class="select-prepend">
        <i :class="iconClass" class="select-icon"></i>
      </div>

      <select
        :id="selectId"
        :value="modelValue"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
        :disabled="disabled"
        :required="required"
        :class="selectClasses"
        class="base-select"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
          :disabled="option.disabled"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>

      <!-- Dropdown Icon -->
      <div class="select-chevron">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <p v-if="error" class="select-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </p>
    <p v-else-if="hint" class="select-hint">
      <i class="fas fa-info-circle"></i>
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Selecciona una opción'
  },
  disabled: {
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
  selectId: {
    type: String,
    default: () => `select-${Math.random().toString(36).substr(2, 9)}`
  },
  // Para options como array de objetos
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const selectClasses = computed(() => {
  const classes = []

  if (props.error) {
    classes.push('select-error-state')
  }

  if (props.icon) {
    classes.push('has-icon')
  }

  return classes
})

const iconClass = computed(() => {
  const icons = {
    category: 'fas fa-layer-group',
    user: 'fas fa-user',
    building: 'fas fa-building',
    tag: 'fas fa-tag',
    list: 'fas fa-list',
    filter: 'fas fa-filter'
  }
  return icons[props.icon] || `fas fa-${props.icon}`
})

const getOptionValue = (option) => {
  if (typeof option === 'object') {
    return option[props.valueKey]
  }
  return option
}

const getOptionLabel = (option) => {
  if (typeof option === 'object') {
    return option[props.labelKey] || option.texto || option.name
  }
  return option
}

const handleChange = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
/* ===== BASE SELECT - DARKLITE DESIGN SYSTEM ===== */
.base-select-wrapper {
  width: 100%;
  margin-bottom: 1.25rem;
}

/* ===== LABEL ===== */
.select-label {
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

/* ===== SELECT CONTAINER ===== */
.select-container {
  position: relative;
  display: flex;
  align-items: center;
}

.select-prepend {
  position: absolute;
  left: 0;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  transition: all 200ms ease;
}

.select-icon {
  color: #71717a;
  font-size: 1rem;
  transition: color 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.select-chevron {
  position: absolute;
  right: 0;
  padding-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  color: #71717a;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== BASE SELECT ===== */
.base-select {
  position: relative;
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
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
  cursor: pointer;
  appearance: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.base-select.has-icon {
  padding-left: 3rem;
}

/* Hover State */
.base-select:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.base-select:hover:not(:disabled) ~ .select-chevron {
  color: #a1a1aa;
}

/* Focus State */
.base-select:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.base-select:focus ~ .select-prepend .select-icon {
  color: #3b82f6;
}

.base-select:focus ~ .select-chevron {
  color: #3b82f6;
  transform: translateY(-1px);
}

/* Disabled State */
.base-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

/* Error State */
.base-select.select-error-state {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.base-select.select-error-state:focus {
  border-color: #ef4444;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.base-select.select-error-state:focus ~ .select-prepend .select-icon {
  color: #ef4444;
}

.base-select.select-error-state:focus ~ .select-chevron {
  color: #ef4444;
}

/* ===== OPTIONS STYLES - DARK BACKGROUND ===== */
.base-select option {
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 0.75rem 1rem;
  font-weight: 400;
  font-size: 0.9375rem;
}

.base-select option:hover,
.base-select option:focus {
  background-color: #2563eb;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
}

.base-select option:checked {
  background-color: #2563eb;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 600;
}

.base-select option:disabled {
  color: #52525b;
  background-color: #0a0a0a;
  cursor: not-allowed;
}

.base-select option[value=""] {
  color: #71717a;
}

/* ===== ERROR & HINT MESSAGES ===== */
.select-error {
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

.select-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #71717a;
  letter-spacing: -0.01em;
}

.select-error i,
.select-hint i {
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
  .base-select {
    font-size: 0.875rem;
    padding: 0.625rem 2.75rem 0.625rem 0.875rem;
  }

  .base-select.has-icon {
    padding-left: 2.75rem;
  }

  .select-label {
    font-size: 0.75rem;
  }

  .select-error,
  .select-hint {
    font-size: 0.75rem;
  }
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  .base-select,
  .select-icon,
  .select-chevron,
  .select-error {
    transition: none;
    animation: none;
  }

  .base-select:focus {
    transform: none;
  }

  .base-select:focus ~ .select-chevron {
    transform: none;
  }
}
</style>
