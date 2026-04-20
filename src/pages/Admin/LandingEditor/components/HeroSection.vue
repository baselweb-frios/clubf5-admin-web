<template>
  <base-card
title="Hero Section"
subtitle="Configuracion de la seccion principal"
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
      <!-- Main Content -->
      <div class="main-content-fields">
        <base-input
          v-model="localData.title"
          label="Titulo Principal"
          placeholder="Ej: ClubF5"
          @input="emitUpdate"
        />
        <base-input
          v-model="localData.tagline"
          label="Tagline"
          placeholder="Ej: El placer de escuchar"
          @input="emitUpdate"
        />
        <base-input
          v-model="localData.subtitle"
          label="Subtitulo"
          placeholder="Descripcion mas detallada..."
          @input="emitUpdate"
        />
        <base-input
          v-model="localData.videoUrl"
          label="URL Video de Fondo"
          placeholder="https://ejemplo.com/video.mp4"
          hint="URL del video MP4 para el fondo"
          @input="emitUpdate"
        />
      </div>

      <div class="divider" />

      <!-- CTA Buttons -->
      <div class="cta-section">
        <div class="cta-header">
          <h4 class="cta-title">
Botones de Accion (CTA)
</h4>
          <base-button
            variant="outline"
            size="sm"
            @click="addButton"
          >
            <i class="fas fa-plus mr-1" />
            Agregar
          </base-button>
        </div>

        <div class="cta-list">
          <div
            v-for="(button, index) in localData.ctaButtons"
            :key="button.id"
            class="cta-item"
          >
            <div class="cta-item-header">
              <div class="cta-preview">
                <span
                  class="btn-preview"
                  :class="button.variant === 'primary' ? 'btn-primary' : 'btn-outline'"
                >
                  <i
v-if="button.icon"
:class="button.icon"
/>
                  {{ button.text || 'Boton' }}
                </span>
              </div>
              <button
                class="delete-btn"
                title="Eliminar boton"
                @click="removeButton(index)"
              >
                <i class="fas fa-trash" />
              </button>
            </div>

            <div class="cta-fields">
              <div class="field-row">
                <base-input
                  v-model="button.text"
                  label="Texto"
                  placeholder="Ej: Explorar"
                  class="flex-1"
                  @input="emitUpdate"
                />
                <base-input
                  v-model="button.link"
                  label="Enlace"
                  placeholder="Ej: #plataformas"
                  class="flex-1"
                  @input="emitUpdate"
                />
              </div>

              <div class="field-row">
                <div class="icon-field">
                  <label class="field-label">Icono</label>
                  <icon-picker
                    v-model="button.icon"
                    @update:model-value="emitUpdate"
                  />
                </div>
                <div class="variant-field">
                  <label class="field-label">Variante</label>
                  <div class="variant-buttons">
                    <button
                      class="variant-btn"
                      :class="{ active: button.variant === 'primary' }"
                      @click="setVariant(index, 'primary')"
                    >
                      <span class="variant-preview primary">Primary</span>
                    </button>
                    <button
                      class="variant-btn"
                      :class="{ active: button.variant === 'outline' }"
                      @click="setVariant(index, 'outline')"
                    >
                      <span class="variant-preview outline">Outline</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p
v-if="localData.ctaButtons.length === 0"
class="empty-state"
>
          No hay botones configurados. Agrega al menos uno.
        </p>
      </div>

      <!-- Hint -->
      <p class="hint-text">
        <i class="fas fa-info-circle mr-1" />
        Se recomienda tener 1-2 botones de accion. El primero debe ser "primary" para mayor destaque.
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

const addButton = () => {
  const newId = Math.max(0, ...localData.value.ctaButtons.map(b => b.id)) + 1
  localData.value.ctaButtons.push({
    id: newId,
    text: '',
    link: '',
    icon: 'fas fa-arrow-right',
    variant: 'outline'
  })
  emitUpdate()
}

const removeButton = (index) => {
  localData.value.ctaButtons.splice(index, 1)
  emitUpdate()
}

const setVariant = (index, variant) => {
  localData.value.ctaButtons[index].variant = variant
  emitUpdate()
}

const resetSection = () => {
  if (props.defaultData) {
    localData.value = JSON.parse(JSON.stringify(props.defaultData))
    emitUpdate()
  }
}
</script>

<style scoped>
.main-content-fields {
  @apply space-y-4;
}

.divider {
  @apply border-t border-dark-border;
}

.cta-section {
  @apply space-y-4;
}

.cta-header {
  @apply flex items-center justify-between;
}

.cta-title {
  @apply font-medium text-text-primary;
}

.cta-list {
  @apply space-y-4;
}

.cta-item {
  @apply p-4 rounded-lg bg-dark-secondary border border-dark-border;
  @apply transition-all duration-200;
  @apply hover:border-primary-500/30;
}

.cta-item-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-dark-border;
}

.cta-preview {
  @apply flex-1;
}

.btn-preview {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium;
}

.btn-preview.btn-primary {
  @apply bg-primary-600 text-white;
}

.btn-preview.btn-outline {
  @apply border border-white text-white bg-transparent;
}

.delete-btn {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-danger-500/20 hover:text-danger-400;
}

.cta-fields {
  @apply space-y-4;
}

.field-row {
  @apply flex flex-col sm:flex-row gap-4;
}

.icon-field,
.variant-field {
  @apply flex flex-col gap-1.5;
}

.field-label {
  @apply text-sm font-medium text-text-secondary;
}

.variant-buttons {
  @apply flex gap-2;
}

.variant-btn {
  @apply flex-1 p-2 rounded-lg border border-dark-border;
  @apply transition-all duration-200;
  @apply hover:border-primary-500/50;
}

.variant-btn.active {
  @apply border-primary-500 bg-primary-500/10;
}

.variant-preview {
  @apply block text-xs text-center py-1 px-2 rounded-full;
}

.variant-preview.primary {
  @apply bg-primary-600 text-white;
}

.variant-preview.outline {
  @apply border border-white text-white;
}

.empty-state {
  @apply text-center py-8 text-text-tertiary;
}

.hint-text {
  @apply text-xs text-text-tertiary p-3 rounded-lg bg-dark-secondary;
}
</style>
