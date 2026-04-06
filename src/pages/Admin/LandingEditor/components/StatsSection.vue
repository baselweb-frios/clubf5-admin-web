<template>
  <base-card
title="Estadisticas"
subtitle="Numeros destacados de la plataforma"
>
    <template #actions>
      <base-button
        variant="ghost"
        size="sm"
        @click="resetSection"
      >
        <i class="fas fa-undo mr-2" />
        Restaurar
      </base-button>
    </template>

    <div class="space-y-6">
      <!-- Stats List -->
      <div class="stats-list">
        <div
          v-for="(stat, index) in localData.items"
          :key="stat.id"
          class="stat-item"
        >
          <div class="stat-item-header">
            <span class="stat-number-badge">#{{ index + 1 }}</span>
            <button
              class="delete-btn"
              title="Eliminar estadistica"
              @click="removeStat(index)"
            >
              <i class="fas fa-trash" />
            </button>
          </div>

          <div class="stat-fields">
            <base-input
              v-model="stat.number"
              label="Numero/Valor"
              placeholder="Ej: 100+, 24/7, PWA"
              @input="emitUpdate"
            />
            <base-input
              v-model="stat.label"
              label="Etiqueta"
              placeholder="Ej: Usuarios Activos"
              @input="emitUpdate"
            />
          </div>

          <div class="stat-preview">
            <span class="preview-number">{{ stat.number }}</span>
            <span class="preview-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Add Button -->
      <base-button
        variant="outline"
        block
        @click="addStat"
      >
        <i class="fas fa-plus mr-2" />
        Agregar Estadistica
      </base-button>

      <!-- Hint -->
      <p class="hint-text">
        <i class="fas fa-info-circle mr-1" />
        Las estadisticas se muestran en una fila horizontal en la landing page.
        Se recomienda tener entre 3 y 5 items.
      </p>
    </div>
  </base-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  defaultData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const localData = ref(JSON.parse(JSON.stringify(props.modelValue)))

watch(() => props.modelValue, (newVal) => {
  localData.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })

const emitUpdate = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)))
}

const addStat = () => {
  const newId = Math.max(0, ...localData.value.items.map(i => i.id)) + 1
  localData.value.items.push({
    id: newId,
    number: '',
    label: ''
  })
  emitUpdate()
}

const removeStat = (index) => {
  if (localData.value.items.length > 1) {
    localData.value.items.splice(index, 1)
    emitUpdate()
  }
}

const resetSection = () => {
  if (props.defaultData) {
    localData.value = JSON.parse(JSON.stringify(props.defaultData))
    emitUpdate()
  }
}
</script>

<style scoped>
.stats-list {
  @apply space-y-4;
}

.stat-item {
  @apply p-4 rounded-lg bg-dark-secondary border border-dark-border;
  @apply transition-all duration-200;
  @apply hover:border-primary-500/30;
}

.stat-item-header {
  @apply flex items-center justify-between mb-4;
}

.stat-number-badge {
  @apply px-2 py-1 rounded-md bg-primary-500/20 text-primary-400 text-xs font-medium;
}

.delete-btn {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-danger-500/20 hover:text-danger-400;
}

.stat-fields {
  @apply grid grid-cols-2 gap-4 mb-4;
}

.stat-preview {
  @apply flex flex-col items-center p-3 rounded-lg bg-dark-primary/50;
}

.preview-number {
  @apply text-2xl font-bold text-primary-400;
}

.preview-label {
  @apply text-sm text-text-secondary;
}

.hint-text {
  @apply text-xs text-text-tertiary p-3 rounded-lg bg-dark-secondary;
}
</style>
