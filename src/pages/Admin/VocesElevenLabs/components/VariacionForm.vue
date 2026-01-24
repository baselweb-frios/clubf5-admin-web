<template>
  <Modal
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    size="lg"
    :title="isEditing ? 'Editar Variacion' : 'Nueva Variacion'"
  >
    <form @submit.prevent="handleSubmit" class="variacion-form">
      <!-- Name -->
      <div class="form-group">
        <label class="form-label">Nombre de la Variacion *</label>
        <input
          v-model="form.nombre"
          type="text"
          class="form-input"
          placeholder="Ej: Voz suave para comerciales"
          required
        />
      </div>

      <!-- Model -->
      <div class="form-group">
        <label class="form-label">Modelo</label>
        <select v-model="form.modelId" class="form-select">
          <option
            v-for="modelo in modelos"
            :key="modelo.id"
            :value="modelo.id"
          >
            {{ modelo.nombre }}
          </option>
        </select>
        <p class="form-hint">{{ getModelDescription(form.modelId) }}</p>
      </div>

      <!-- Stability Slider -->
      <div class="form-group">
        <label class="form-label">
          Stability
          <span class="slider-value">{{ (form.stability * 100).toFixed(0) }}%</span>
        </label>
        <input
          v-model.number="form.stability"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="form-slider"
        />
        <p class="form-hint">
          Mayor estabilidad = voz mas consistente pero menos expresiva
        </p>
      </div>

      <!-- Similarity Slider -->
      <div class="form-group">
        <label class="form-label">
          Similarity Boost
          <span class="slider-value">{{ (form.similarity * 100).toFixed(0) }}%</span>
        </label>
        <input
          v-model.number="form.similarity"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="form-slider"
        />
        <p class="form-hint">
          Mayor similitud = mas parecido a la voz original
        </p>
      </div>

      <!-- Style Slider -->
      <div class="form-group">
        <label class="form-label">
          Style Exaggeration
          <span class="slider-value">{{ (form.style * 100).toFixed(0) }}%</span>
        </label>
        <input
          v-model.number="form.style"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="form-slider"
        />
        <p class="form-hint">
          Amplifica el estilo de la voz (puede aumentar inestabilidad)
        </p>
      </div>

      <!-- Speaker Boost -->
      <div class="form-group">
        <label class="form-checkbox">
          <input v-model="form.speakerBoost" type="checkbox" />
          <span class="checkbox-label">Speaker Boost</span>
        </label>
        <p class="form-hint">
          Mejora la claridad del hablante (recomendado)
        </p>
      </div>

      <!-- Preview Generator -->
      <div class="preview-section">
        <h4 class="preview-title">
          <i class="fas fa-play-circle mr-2"></i>
          Generar Preview
        </h4>

        <div class="form-group">
          <label class="form-label">Texto de prueba</label>
          <textarea
            v-model="previewText"
            class="form-textarea"
            rows="3"
            placeholder="Escribe el texto para generar el preview de audio..."
            maxlength="500"
          ></textarea>
          <p class="form-hint text-right">{{ previewText.length }}/500 caracteres</p>
        </div>

        <div class="preview-actions">
          <base-button
            variant="secondary"
            :loading="generatingPreview"
            :disabled="!previewText.trim() || !savedVariacionId"
            @click="generatePreview"
          >
            <i class="fas fa-magic mr-2"></i>
            Generar Preview
          </base-button>

          <div v-if="previewUrl" class="preview-player">
            <button type="button" class="btn-play" @click="playPreview">
              <i :class="isPlaying ? 'fas fa-stop' : 'fas fa-play'"></i>
            </button>
            <span class="text-sm text-green-400">
              <i class="fas fa-check mr-1"></i>
              Preview generado
            </span>
          </div>
        </div>

        <p v-if="!savedVariacionId" class="text-yellow-400 text-sm mt-2">
          <i class="fas fa-info-circle mr-1"></i>
          Guarda la variacion primero para poder generar el preview
        </p>
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <base-button variant="secondary" @click="$emit('update:show', false)">
          Cancelar
        </base-button>
        <base-button variant="primary" :loading="saving" @click="handleSubmit">
          {{ isEditing ? 'Guardar Cambios' : 'Crear Variacion' }}
        </base-button>
      </div>
    </template>

    <!-- Audio Player -->
    <audio ref="audioPlayer" @ended="isPlaying = false"></audio>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import VozElevenLabsServices from '@/services/VozElevenLabsServices'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  voz: {
    type: Object,
    default: null
  },
  variacion: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'saved'])

const toast = useToast()

// State
const form = ref({
  nombre: '',
  stability: 0.75,
  similarity: 0.75,
  style: 0.0,
  speakerBoost: true,
  modelId: 'eleven_multilingual_v2'
})

const saving = ref(false)
const savedVariacionId = ref(null)
const previewText = ref('Hola, este es un ejemplo de como suena esta voz con la configuracion actual.')
const generatingPreview = ref(false)
const previewUrl = ref(null)
const isPlaying = ref(false)
const audioPlayer = ref(null)

// Computed
const isEditing = computed(() => !!props.variacion)
const modelos = computed(() => VozElevenLabsServices.modelos)

// Methods
const resetForm = () => {
  const defaults = VozElevenLabsServices.defaultSettings
  form.value = {
    nombre: '',
    stability: defaults.stability,
    similarity: defaults.similarity,
    style: defaults.style,
    speakerBoost: defaults.speakerBoost,
    modelId: defaults.modelId
  }
  savedVariacionId.value = null
  previewUrl.value = null
  previewText.value = 'Hola, este es un ejemplo de como suena esta voz con la configuracion actual.'
}

const loadVariacion = () => {
  if (props.variacion) {
    form.value = {
      nombre: props.variacion.vva_nombre,
      stability: props.variacion.vva_stability,
      similarity: props.variacion.vva_similarity,
      style: props.variacion.vva_style,
      speakerBoost: props.variacion.vva_speaker_boost,
      modelId: props.variacion.vva_model_id
    }
    savedVariacionId.value = props.variacion.vva_codigo
    if (props.variacion.vva_preview_path) {
      previewUrl.value = VozElevenLabsServices.getPreviewUrl(props.variacion.vva_preview_path)
    }
    if (props.variacion.vva_preview_texto) {
      previewText.value = props.variacion.vva_preview_texto
    }
  } else {
    resetForm()
  }
}

const getModelDescription = (modelId) => {
  const model = modelos.value.find(m => m.id === modelId)
  return model ? model.descripcion : ''
}

const handleSubmit = async () => {
  if (!form.value.nombre.trim()) {
    toast('El nombre es requerido', 'error')
    return
  }

  try {
    saving.value = true

    const data = {
      nombre: form.value.nombre,
      stability: form.value.stability,
      similarity: form.value.similarity,
      style: form.value.style,
      speakerBoost: form.value.speakerBoost,
      modelId: form.value.modelId
    }

    if (isEditing.value) {
      await VozElevenLabsServices.modificarVariacion(props.variacion.vva_codigo, data)
      toast('Variacion actualizada', 'success')
    } else {
      const result = await VozElevenLabsServices.crearVariacion(props.voz.vel_codigo, data)
      savedVariacionId.value = result.variacion.vva_codigo
      toast('Variacion creada. Ahora puedes generar el preview.', 'success')
    }

    emit('saved', !isEditing.value)

    if (isEditing.value) {
      emit('update:show', false)
    }
  } catch (error) {
    console.error('Error guardando variacion:', error)
    toast(error.response?.data?.message || 'Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const generatePreview = async () => {
  if (!previewText.value.trim()) {
    toast('Escribe un texto para el preview', 'error')
    return
  }

  if (!savedVariacionId.value) {
    toast('Guarda la variacion primero', 'error')
    return
  }

  try {
    generatingPreview.value = true
    const result = await VozElevenLabsServices.generarPreview(
      savedVariacionId.value,
      previewText.value
    )

    previewUrl.value = VozElevenLabsServices.getPreviewUrl(result.previewPath)
    toast('Preview generado correctamente', 'success')

    // Auto-play
    setTimeout(() => playPreview(), 500)
  } catch (error) {
    console.error('Error generando preview:', error)
    toast(error.response?.data?.message || 'Error al generar preview', 'error')
  } finally {
    generatingPreview.value = false
  }
}

const playPreview = async () => {
  if (!previewUrl.value) return

  if (isPlaying.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    isPlaying.value = false
    return
  }

  try {
    isPlaying.value = true
    audioPlayer.value.src = previewUrl.value
    await audioPlayer.value.play()
  } catch (error) {
    console.error('Error playing preview:', error)
    isPlaying.value = false
  }
}

// Watch
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadVariacion()
  } else {
    if (audioPlayer.value) {
      audioPlayer.value.pause()
    }
    isPlaying.value = false
  }
})
</script>

<style scoped>
.variacion-form {
  @apply space-y-5;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-300 flex items-center justify-between;
}

.slider-value {
  @apply text-primary-400 font-mono;
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500;
}

.form-textarea {
  @apply resize-none;
}

.form-slider {
  @apply w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer;
}

.form-slider::-webkit-slider-thumb {
  @apply w-4 h-4 bg-primary-500 rounded-full appearance-none cursor-pointer hover:bg-primary-400;
}

.form-hint {
  @apply text-xs text-gray-500;
}

.form-checkbox {
  @apply flex items-center gap-2 cursor-pointer;
}

.form-checkbox input {
  @apply w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500;
}

.checkbox-label {
  @apply text-gray-300;
}

.preview-section {
  @apply p-4 bg-gray-800 rounded-lg space-y-4 border border-gray-700;
}

.preview-title {
  @apply text-sm font-medium text-gray-300;
}

.preview-actions {
  @apply flex items-center gap-4;
}

.preview-player {
  @apply flex items-center gap-3;
}

.btn-play {
  @apply w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center;
}

.modal-footer {
  @apply flex justify-end gap-3;
}
</style>
