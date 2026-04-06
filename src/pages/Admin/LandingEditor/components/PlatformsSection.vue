<template>
  <base-card
title="Plataformas"
subtitle="Secciones de plataformas disponibles"
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
          placeholder="Ej: Nuestras Plataformas"
          @input="emitUpdate"
        />
        <base-input
          v-model="localData.description"
          label="Descripcion de Seccion"
          placeholder="Ej: Soluciones disenadas..."
          @input="emitUpdate"
        />
      </div>

      <div class="divider" />

      <!-- Platforms List -->
      <div class="platforms-list">
        <div
          v-for="(platform, index) in localData.items"
          :key="platform.id"
          class="platform-item"
        >
          <div class="platform-item-header">
            <div class="platform-icon-preview">
              <i :class="platform.icon || 'fas fa-desktop'" />
            </div>
            <span class="platform-title-preview">{{ platform.title || 'Nueva Plataforma' }}</span>
            <button
              class="delete-btn"
              title="Eliminar plataforma"
              @click="removePlatform(index)"
            >
              <i class="fas fa-trash" />
            </button>
          </div>

          <div class="platform-fields">
            <div class="field-row">
              <div class="icon-field">
                <label class="field-label">Icono</label>
                <icon-picker
                  v-model="platform.icon"
                  @update:model-value="emitUpdate"
                />
              </div>
              <base-input
                v-model="platform.title"
                label="Titulo"
                placeholder="Ej: Panel de Control"
                class="flex-1"
                @input="emitUpdate"
              />
            </div>

            <base-input
              v-model="platform.description"
              label="Descripcion"
              placeholder="Descripcion de la plataforma"
              @input="emitUpdate"
            />

            <!-- Features List -->
            <div class="features-section">
              <label class="field-label">Caracteristicas</label>
              <div class="features-list">
                <div
                  v-for="(feature, fIndex) in platform.features"
                  :key="fIndex"
                  class="feature-row"
                >
                  <i class="fas fa-check text-primary-400 text-sm" />
                  <input
                    v-model="platform.features[fIndex]"
                    type="text"
                    class="feature-input"
                    placeholder="Caracteristica..."
                    @input="emitUpdate"
                  >
                  <button
                    class="feature-delete"
                    title="Eliminar"
                    @click="removeFeature(index, fIndex)"
                  >
                    <i class="fas fa-times" />
                  </button>
                </div>
              </div>
              <button
                class="add-feature-btn"
                @click="addFeature(index)"
              >
                <i class="fas fa-plus mr-1" />
                Agregar caracteristica
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Button -->
      <base-button
        variant="outline"
        block
        @click="addPlatform"
      >
        <i class="fas fa-plus mr-2" />
        Agregar Plataforma
      </base-button>

      <!-- Hint -->
      <p class="hint-text">
        <i class="fas fa-info-circle mr-1" />
        Las plataformas se muestran en cards con lista de caracteristicas.
        Se recomienda tener 2-3 plataformas para mejor visualizacion.
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

const addPlatform = () => {
  const newId = Math.max(0, ...localData.value.items.map(i => i.id)) + 1
  localData.value.items.push({
    id: newId,
    icon: 'fas fa-desktop',
    title: '',
    description: '',
    features: ['']
  })
  emitUpdate()
}

const removePlatform = (index) => {
  if (localData.value.items.length > 1) {
    localData.value.items.splice(index, 1)
    emitUpdate()
  }
}

const addFeature = (platformIndex) => {
  localData.value.items[platformIndex].features.push('')
  emitUpdate()
}

const removeFeature = (platformIndex, featureIndex) => {
  if (localData.value.items[platformIndex].features.length > 1) {
    localData.value.items[platformIndex].features.splice(featureIndex, 1)
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

.platforms-list {
  @apply space-y-6;
}

.platform-item {
  @apply p-4 rounded-lg bg-dark-secondary border border-dark-border;
  @apply transition-all duration-200;
  @apply hover:border-primary-500/30;
}

.platform-item-header {
  @apply flex items-center gap-3 mb-4 pb-3 border-b border-dark-border;
}

.platform-icon-preview {
  @apply w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center;
}

.platform-icon-preview i {
  @apply text-xl text-primary-400;
}

.platform-title-preview {
  @apply flex-1 font-semibold text-text-primary truncate;
}

.delete-btn {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-danger-500/20 hover:text-danger-400;
}

.platform-fields {
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

.features-section {
  @apply space-y-2;
}

.features-list {
  @apply space-y-2;
}

.feature-row {
  @apply flex items-center gap-2;
}

.feature-input {
  @apply flex-1 px-3 py-2 rounded-lg text-sm;
  @apply bg-dark-primary border border-dark-border text-text-primary;
  @apply placeholder:text-text-tertiary;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary-500;
}

.feature-delete {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-danger-500/20 hover:text-danger-400;
}

.add-feature-btn {
  @apply text-xs text-primary-400 py-2;
  @apply transition-all duration-200;
  @apply hover:text-primary-300;
}

.hint-text {
  @apply text-xs text-text-tertiary p-3 rounded-lg bg-dark-secondary;
}
</style>
