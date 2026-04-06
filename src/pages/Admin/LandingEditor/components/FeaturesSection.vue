<template>
  <base-card
title="Caracteristicas"
subtitle="Funcionalidades destacadas de la plataforma"
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
      <!-- Section Title -->
      <div class="section-config">
        <base-input
          v-model="localData.title"
          label="Titulo de Seccion"
          placeholder="Ej: Caracteristicas Destacadas"
          @input="emitUpdate"
        />
        <base-input
          v-model="localData.description"
          label="Descripcion de Seccion"
          placeholder="Ej: Tecnologia de vanguardia..."
          @input="emitUpdate"
        />
      </div>

      <div class="divider" />

      <!-- Features List -->
      <div class="features-list">
        <div
          v-for="(feature, index) in localData.items"
          :key="feature.id"
          class="feature-item"
        >
          <div class="feature-item-header">
            <div class="feature-icon-preview">
              <i :class="feature.icon || 'fas fa-star'" />
            </div>
            <span class="feature-title-preview">{{ feature.title || 'Nueva Caracteristica' }}</span>
            <button
              class="delete-btn"
              title="Eliminar caracteristica"
              @click="removeFeature(index)"
            >
              <i class="fas fa-trash" />
            </button>
          </div>

          <div class="feature-fields">
            <div class="field-row">
              <div class="icon-field">
                <label class="field-label">Icono</label>
                <icon-picker
                  v-model="feature.icon"
                  @update:model-value="emitUpdate"
                />
              </div>
              <base-input
                v-model="feature.title"
                label="Titulo"
                placeholder="Ej: Streaming en Tiempo Real"
                class="flex-1"
                @input="emitUpdate"
              />
            </div>
            <base-input
              v-model="feature.description"
              label="Descripcion"
              placeholder="Descripcion breve de la caracteristica"
              @input="emitUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Add Button -->
      <base-button
        variant="outline"
        block
        @click="addFeature"
      >
        <i class="fas fa-plus mr-2" />
        Agregar Caracteristica
      </base-button>

      <!-- Hint -->
      <p class="hint-text">
        <i class="fas fa-info-circle mr-1" />
        Las caracteristicas se muestran en una grilla de 4 columnas en pantallas grandes.
        Se recomienda tener 4 u 8 items para mejor visualizacion.
      </p>
    </div>
  </base-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconPicker from './IconPicker.vue'

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

const addFeature = () => {
  const newId = Math.max(0, ...localData.value.items.map(i => i.id)) + 1
  localData.value.items.push({
    id: newId,
    icon: 'fas fa-star',
    title: '',
    description: ''
  })
  emitUpdate()
}

const removeFeature = (index) => {
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
.section-config {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.divider {
  @apply border-t border-dark-border;
}

.features-list {
  @apply space-y-4;
}

.feature-item {
  @apply p-4 rounded-lg bg-dark-secondary border border-dark-border;
  @apply transition-all duration-200;
  @apply hover:border-primary-500/30;
}

.feature-item-header {
  @apply flex items-center gap-3 mb-4 pb-3 border-b border-dark-border;
}

.feature-icon-preview {
  @apply w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center;
}

.feature-icon-preview i {
  @apply text-primary-400;
}

.feature-title-preview {
  @apply flex-1 font-medium text-text-primary truncate;
}

.delete-btn {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-danger-500/20 hover:text-danger-400;
}

.feature-fields {
  @apply space-y-4;
}

.field-row {
  @apply flex flex-col sm:flex-row gap-4;
}

.icon-field {
  @apply flex flex-col gap-1.5;
}

.field-label {
  @apply text-sm font-medium text-text-secondary;
}

.hint-text {
  @apply text-xs text-text-tertiary p-3 rounded-lg bg-dark-secondary;
}
</style>
