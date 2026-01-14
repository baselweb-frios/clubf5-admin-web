<template>
  <div class="space-y-4">
    <!-- Selected Tags -->
    <div class="flex flex-wrap gap-2">
      <span
        v-for="(option, index) in selectedOptions"
        :key="`selected-${option.codSpot}-${index}`"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="getTagClass(option.tipo)"
      >
        <span class="truncate max-w-[150px]">{{ option.nombreSpot }}</span>
        <span
          v-if="option.duracion"
          class="text-xs opacity-75"
        >{{ formatDuration(option.duracion) }}</span>
        <button
          class="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
          aria-label="Remover spot"
          @click="removeTag(index)"
        >
          <i class="fas fa-times text-xs" />
        </button>
      </span>
    </div>

    <!-- Available Tags -->
    <div class="card">
      <div class="flex-between mb-4">
        <h4 class="text-base font-semibold text-text-primary">Spots Disponibles</h4>
        <span class="badge badge-info">{{ options.length }} disponibles</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="spot in options"
          :key="spot.codSpot"
          class="btn btn-sm gap-2 transition-all duration-200"
          :class="[getButtonClass(spot.tipo), { 'opacity-50 cursor-not-allowed': isSelected(spot) }]"
          :disabled="isSelected(spot)"
          @click="addTag(spot)"
        >
          <i class="fas fa-plus text-xs" />
          <span class="truncate max-w-[120px]">{{ spot.nombreSpot }}</span>
          <span
            v-if="spot.duracion"
            class="text-xs opacity-75"
          >{{ formatDuration(spot.duracion) }}</span>
        </button>

        <div
          v-if="options.length === 0"
          class="alert alert-info w-full"
        >
          <i class="fas fa-info-circle" />
          <p>No hay spots disponibles de tipo {{ getTipoLabel(tipoSpot) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  tipoSpot: {
    type: String,
    default: 'inst'
  },
  horadesde: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['set-spot', 'remove-codspot', 'update-codspot', 'update:modelValue'])

// Reactive state
const selectedOptions = ref([])

// Methods
const addTag = (spot) => {
  if (isSelected(spot)) return

  const tagData = {
    codSpot: spot.codSpot || spot.spo_codigo,
    nombreSpot: spot.nombreSpot || spot.spo_nombre,
    tipo: spot.tipo || spot.spo_tipo,
    duracion: spot.duracion || spot.spo_dursec || 0,
    horadesde: props.horadesde
  }

  selectedOptions.value.push(tagData)
  emit('set-spot', tagData)
  emit('update-codspot', selectedOptions.value)
  emit('update:modelValue', selectedOptions.value)
}

const removeTag = (index) => {
  selectedOptions.value.splice(index, 1)
  emit('remove-codspot', index)
  emit('update-codspot', selectedOptions.value)
  emit('update:modelValue', selectedOptions.value)
}

const isSelected = (spot) => {
  const spotCode = spot.codSpot || spot.spo_codigo
  return selectedOptions.value.some(s => (s.codSpot || s.spo_codigo) === spotCode)
}

const getTagClass = (tipo) => {
  const classes = {
    inst: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    prom: 'bg-success-500/20 text-success-400 border border-success-500/30',
    noti: 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
  }
  return classes[tipo] || 'bg-dark-hover text-text-secondary border border-dark-border'
}

const getButtonClass = (tipo) => {
  const classes = {
    inst: 'bg-primary-600 text-white hover:bg-primary-500',
    prom: 'bg-success-600 text-white hover:bg-success-500',
    noti: 'bg-warning-600 text-white hover:bg-warning-500'
  }
  return classes[tipo] || 'btn-secondary'
}

const getTipoLabel = (tipo) => {
  const labels = {
    inst: 'Institucional',
    prom: 'Promocional',
    noti: 'Noticias'
  }
  return labels[tipo] || tipo
}

const formatDuration = (seconds) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Watchers
watch(() => props.modelValue, (newVal) => {
  selectedOptions.value = [...(newVal || [])]
}, { immediate: true, deep: true })
</script>

<style scoped>
/* ===== SELECTED TAGS ===== */
.tag-container {
  @apply flex flex-wrap gap-2;
}

.tag-item {
  @apply inline-flex items-center gap-2;
  @apply px-3 py-1.5 rounded-lg;
  @apply text-sm font-medium;
  @apply transition-all duration-200;
}

/* Tag Types */
.tag-inst {
  @apply bg-primary-500/20 text-primary-400;
  @apply border border-primary-500/30;
}

.tag-prom {
  @apply bg-success-500/20 text-success-400;
  @apply border border-success-500/30;
}

.tag-noti {
  @apply bg-warning-500/20 text-warning-400;
  @apply border border-warning-500/30;
}

.tag-default {
  @apply bg-dark-hover text-text-secondary;
  @apply border border-dark-border;
}

.light .tag-default {
  @apply bg-light-hover text-text-light-secondary;
  @apply border-light-border;
}

/* Tag Name */
.tag-name {
  @apply truncate max-w-[150px];
}

/* Tag Duration */
.tag-duration {
  @apply text-xs opacity-75;
}

/* Remove Button */
.tag-remove {
  @apply ml-1 p-0.5 rounded;
  @apply hover:bg-white/20;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50;
}

.tag-remove i {
  @apply text-xs;
}

/* ===== AVAILABLE SPOTS SECTION ===== */
.spots-header {
  @apply flex items-center justify-between mb-4;
}

.spots-title {
  @apply text-base font-semibold text-text-primary;
}

.light .spots-title {
  @apply text-text-light-primary;
}

.spots-grid {
  @apply flex flex-wrap gap-2;
}

/* ===== SPOT BUTTONS ===== */
.spot-btn {
  @apply inline-flex items-center gap-2;
  @apply px-3 py-1.5 rounded-lg;
  @apply text-sm font-medium;
  @apply transition-all duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary;
  @apply active:scale-[0.98];
}

.spot-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.spot-btn-inst {
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-500;
  @apply focus-visible:ring-primary-500;
}

.spot-btn-prom {
  @apply bg-success-600 text-white;
  @apply hover:bg-success-500;
  @apply focus-visible:ring-success-500;
}

.spot-btn-noti {
  @apply bg-warning-600 text-white;
  @apply hover:bg-warning-500;
  @apply focus-visible:ring-warning-500;
}

.spot-btn-default {
  @apply bg-dark-elevated text-text-primary;
  @apply border border-dark-border;
  @apply hover:bg-dark-hover;
  @apply focus-visible:ring-dark-border;
}

.light .spot-btn-default {
  @apply bg-light-secondary text-text-light-primary;
  @apply border-light-border;
  @apply hover:bg-light-hover;
}

.spot-btn-icon {
  @apply text-xs;
}

.spot-btn-name {
  @apply truncate max-w-[120px];
}

.spot-btn-duration {
  @apply text-xs opacity-75;
}

/* ===== EMPTY STATE ===== */
.spots-empty {
  @apply flex items-start gap-3;
  @apply w-full p-4 rounded-lg;
  @apply bg-info-500/10 border border-info-500/30;
  @apply text-info-300;
}

.spots-empty i {
  @apply text-info-400 mt-0.5;
}

.light .spots-empty {
  @apply text-info-700;
}

.light .spots-empty i {
  @apply text-info-600;
}
</style>

