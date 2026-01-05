<template>
  <div class="tag-spot-container">
    <div class="selected-tags">
      <span
        v-for="(option, index) in selectedOptions"
        :key="`selected-${option.codSpot}-${index}`"
        class="tag-spot"
        :class="getTagClass(option.tipo)"
      >
        <span class="tag-name">{{ option.nombreSpot }}</span>
        <span class="tag-duration" v-if="option.duracion">{{ formatDuration(option.duracion) }}</span>
        <button
          @click="removeTag(index)"
          class="tag-remove"
          aria-label="Remover spot"
        >
          <i class="fas fa-times"></i>
        </button>
      </span>
    </div>

    <div class="available-tags">
      <div class="tags-header">
        <h4>Spots Disponibles</h4>
        <span class="tags-count">{{ options.length }} disponibles</span>
      </div>

      <div class="tags-list">
        <button
          v-for="spot in options"
          :key="spot.codSpot"
          @click="addTag(spot)"
          class="tag-spot-btn"
          :class="getTagClass(spot.tipo)"
          :disabled="isSelected(spot)"
        >
          <i class="fas fa-plus"></i>
          <span class="spot-name">{{ spot.nombreSpot }}</span>
          <span class="spot-duration" v-if="spot.duracion">{{ formatDuration(spot.duracion) }}</span>
        </button>

        <div v-if="options.length === 0" class="no-spots">
          <i class="fas fa-info-circle"></i>
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
    inst: 'tag-inst',
    prom: 'tag-prom',
    noti: 'tag-noti'
  }
  return classes[tipo] || 'tag-default'
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
.tag-spot-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 50px;
  padding: 0.75rem;
  background-color: var(--color-surface-secondary, #f7fafc);
  border-radius: var(--border-radius-md, 8px);
  border: 2px dashed var(--color-border-primary, #e2e8f0);
}

.tag-spot {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-full, 9999px);
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  transition: all 0.2s;
}

.tag-inst {
  background-color: #3182ce;
}

.tag-prom {
  background-color: #38a169;
}

.tag-noti {
  background-color: #d69e2e;
}

.tag-default {
  background-color: #718096;
}

.tag-name {
  font-weight: 600;
}

.tag-duration {
  font-size: 0.75rem;
  opacity: 0.9;
  padding: 0.125rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-full, 9999px);
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tag-remove:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.available-tags {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border-primary, #e2e8f0);
}

.tags-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #1a202c);
}

.tags-count {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #718096);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-spot-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid currentColor;
  border-radius: var(--border-radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: transparent;
}

.tag-spot-btn.tag-inst {
  color: #3182ce;
}

.tag-spot-btn.tag-prom {
  color: #38a169;
}

.tag-spot-btn.tag-noti {
  color: #d69e2e;
}

.tag-spot-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tag-spot-btn.tag-inst:hover:not(:disabled) {
  background-color: #3182ce;
  color: white;
}

.tag-spot-btn.tag-prom:hover:not(:disabled) {
  background-color: #38a169;
  color: white;
}

.tag-spot-btn.tag-noti:hover:not(:disabled) {
  background-color: #d69e2e;
  color: white;
}

.tag-spot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spot-name {
  font-weight: 600;
}

.spot-duration {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius-full, 9999px);
}

.no-spots {
  width: 100%;
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary, #718096);
}

.no-spots i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.no-spots p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
