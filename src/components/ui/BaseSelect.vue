<template>
  <div class="base-select-wrapper">
    <label
v-if="label"
:for="selectId"
class="select-label"
:class="{ 'label-required': required }"
>
      {{ label }}
      <span
v-if="required"
class="required-mark"
>*</span>
    </label>

    <div class="select-container">
      <!-- Icon (prepend) -->
      <div
v-if="icon"
class="select-prepend"
>
        <i
:class="iconClass"
class="select-icon"
/>
      </div>

      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="selectClasses"
        class="base-select"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option
v-if="placeholder"
value=""
disabled
:selected="!modelValue"
>
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
        <svg
width="20"
height="20"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>

    <p
v-if="error"
class="select-error"
>
      <i class="fas fa-exclamation-circle" />
      {{ error }}
    </p>
    <p
v-else-if="hint"
class="select-hint"
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
/* Wrapper */
.base-select-wrapper {
  @apply space-y-1.5;
}

/* Label */
.select-label {
  @apply block text-sm font-medium text-text-secondary;
}

.light .select-label {
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

/* Select Container */
.select-container {
  @apply relative flex items-center;
}

/* Base Select */
.base-select {
  @apply w-full px-4 py-2.5 rounded-lg text-sm;
  @apply bg-dark-secondary text-text-primary;
  @apply border border-dark-border;
  @apply appearance-none cursor-pointer;
  @apply pr-10;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.light .base-select {
  @apply bg-light-secondary text-text-light-primary border-light-border;
}

/* Placeholder option */
.base-select option[disabled] {
  @apply text-text-tertiary;
}

.light .base-select option[disabled] {
  @apply text-text-light-tertiary;
}

/* Error State */
.base-select.select-error-state {
  @apply border-danger-500;
  @apply focus:border-danger-500 focus:ring-danger-500;
}

/* With Icon */
.base-select.has-icon {
  @apply pl-10;
}

/* Prepend Icon */
.select-prepend {
  @apply absolute left-0 top-0 bottom-0;
  @apply flex items-center justify-center w-10;
  @apply pointer-events-none;
}

.select-icon {
  @apply text-text-tertiary text-sm;
}

.light .select-icon {
  @apply text-text-light-tertiary;
}

/* Chevron Icon */
.select-chevron {
  @apply absolute right-0 top-0 bottom-0;
  @apply flex items-center justify-center w-10;
  @apply pointer-events-none;
  @apply text-text-tertiary;
  @apply transition-transform duration-200;
}

.light .select-chevron {
  @apply text-text-light-tertiary;
}

.base-select:focus + .select-chevron,
.select-container:focus-within .select-chevron {
  @apply text-primary-500;
}

/* Error Message */
.select-error {
  @apply flex items-center gap-1.5;
  @apply text-xs text-danger-400;
}

.select-error i {
  @apply text-danger-500;
}

/* Hint Message */
.select-hint {
  @apply flex items-center gap-1.5;
  @apply text-xs text-text-tertiary;
}

.light .select-hint {
  @apply text-text-light-tertiary;
}

.select-hint i {
  @apply text-info-500;
}
</style>

