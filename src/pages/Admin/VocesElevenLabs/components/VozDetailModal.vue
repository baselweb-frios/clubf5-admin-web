<template>
  <Modal
    :model-value="show"
    size="xl"
    :title="voz ? `Voz: ${voz.vel_nombre}` : 'Detalle de Voz'"
    @update:model-value="$emit('update:show', $event)"
  >
    <div
v-if="voz"
class="voz-detail"
>
      <!-- Voice Info -->
      <div class="info-section">
        <h3 class="section-title">
          <i class="fas fa-info-circle mr-2" />
          Informacion de la Voz
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ID ElevenLabs</span>
            <span class="info-value font-mono text-xs">{{ voz.vel_voice_id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Categoria</span>
            <span class="info-value">{{ voz.vel_categoria || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Idioma</span>
            <span class="info-value">{{ voz.vel_idioma || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Genero</span>
            <span class="info-value">{{ voz.vel_genero || 'N/A' }}</span>
          </div>
          <div class="info-item col-span-2">
            <span class="info-label">Descripcion</span>
            <span class="info-value">{{ voz.vel_descripcion || 'Sin descripcion' }}</span>
          </div>
        </div>

        <!-- Original Preview -->
        <div
v-if="voz.vel_preview_url"
class="preview-section"
>
          <span class="info-label">Preview Original</span>
          <div class="audio-player">
            <button
class="btn-play"
@click="playOriginalPreview"
>
              <i :class="playingOriginal ? 'fas fa-stop' : 'fas fa-play'" />
            </button>
            <span class="text-sm text-gray-400">Reproducir preview de ElevenLabs</span>
          </div>
        </div>
      </div>

      <!-- Variations Section -->
      <div class="variations-section">
        <div class="section-header">
          <h3 class="section-title">
            <i class="fas fa-sliders-h mr-2" />
            Variaciones ({{ variaciones.length }})
          </h3>
          <base-button
variant="primary"
size="sm"
@click="openVariacionForm(null)"
>
            <i class="fas fa-plus mr-1" />
            Nueva Variacion
          </base-button>
        </div>

        <div
v-if="loadingVariaciones"
class="loading-state"
>
          <i class="fas fa-spinner fa-spin text-xl" />
          <span>Cargando variaciones...</span>
        </div>

        <div
v-else-if="variaciones.length === 0"
class="empty-state"
>
          <i class="fas fa-sliders-h text-2xl text-gray-500" />
          <p>No hay variaciones creadas</p>
          <p class="text-sm">
Crea una variacion para personalizar los parametros de la voz
</p>
        </div>

        <div
v-else
class="variations-list"
>
          <div
            v-for="variacion in variaciones"
            :key="variacion.vva_codigo"
            class="variation-card"
          >
            <div class="variation-header">
              <h4 class="variation-name">
{{ variacion.vva_nombre }}
</h4>
              <div class="variation-actions">
                <button
                  v-if="variacion.vva_preview_path"
                  class="btn-action btn-play-sm"
                  title="Reproducir preview"
                  @click="playVariacionPreview(variacion)"
                >
                  <i :class="playingVariacionId === variacion.vva_codigo ? 'fas fa-stop' : 'fas fa-play'" />
                </button>
                <button
                  class="btn-action btn-edit"
                  title="Editar variacion"
                  @click="openVariacionForm(variacion)"
                >
                  <i class="fas fa-edit" />
                </button>
                <button
                  class="btn-action btn-delete"
                  title="Eliminar variacion"
                  @click="deleteVariacion(variacion)"
                >
                  <i class="fas fa-trash" />
                </button>
              </div>
            </div>

            <div class="variation-settings">
              <div class="setting-item">
                <span class="setting-label">Stability</span>
                <div class="setting-bar">
                  <div
class="bar-fill"
:style="{ width: `${variacion.vva_stability * 100}%` }"
/>
                </div>
                <span class="setting-value">{{ (variacion.vva_stability * 100).toFixed(0) }}%</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">Similarity</span>
                <div class="setting-bar">
                  <div
class="bar-fill"
:style="{ width: `${variacion.vva_similarity * 100}%` }"
/>
                </div>
                <span class="setting-value">{{ (variacion.vva_similarity * 100).toFixed(0) }}%</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">Style</span>
                <div class="setting-bar">
                  <div
class="bar-fill"
:style="{ width: `${variacion.vva_style * 100}%` }"
/>
                </div>
                <span class="setting-value">{{ (variacion.vva_style * 100).toFixed(0) }}%</span>
              </div>
            </div>

            <div class="variation-meta">
              <span class="meta-item">
                <i class="fas fa-microchip mr-1" />
                {{ getModelName(variacion.vva_model_id) }}
              </span>
              <span class="meta-item">
                <i class="fas fa-volume-up mr-1" />
                Speaker Boost: {{ variacion.vva_speaker_boost ? 'Si' : 'No' }}
              </span>
            </div>

            <div
v-if="variacion.vva_preview_texto"
class="variation-preview-text"
>
              <i class="fas fa-quote-left text-gray-600 mr-1" />
              <span class="text-xs text-gray-500 italic">{{ variacion.vva_preview_texto }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Variacion Form Modal -->
    <variacion-form
      v-model:show="showVariacionForm"
      :voz="voz"
      :variacion="selectedVariacion"
      @saved="handleVariacionSaved"
    />

    <!-- Audio Player -->
    <audio
ref="audioPlayer"
@ended="stopAllPlayback"
/>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import VariacionForm from './VariacionForm.vue'
import VozElevenLabsServices from '@/services/VozElevenLabsServices'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  voz: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'variacion-created', 'variacion-updated', 'variacion-deleted'])

const toast = useToast()

// State
const variaciones = ref([])
const loadingVariaciones = ref(false)
const showVariacionForm = ref(false)
const selectedVariacion = ref(null)
const audioPlayer = ref(null)
const playingOriginal = ref(false)
const playingVariacionId = ref(null)

// Methods
const loadVariaciones = async () => {
  if (!props.voz) return

  try {
    loadingVariaciones.value = true
    const result = await VozElevenLabsServices.getVariaciones(props.voz.vel_codigo)
    variaciones.value = result.variaciones
  } catch (error) {
    console.error('Error cargando variaciones:', error)
    toast('Error al cargar variaciones', 'error')
  } finally {
    loadingVariaciones.value = false
  }
}

const openVariacionForm = (variacion) => {
  selectedVariacion.value = variacion
  showVariacionForm.value = true
}

const handleVariacionSaved = async (isNew) => {
  await loadVariaciones()
  if (isNew) {
    emit('variacion-created')
  } else {
    emit('variacion-updated')
  }
}

const deleteVariacion = async (variacion) => {
  if (!confirm(`Eliminar la variacion "${variacion.vva_nombre}"?`)) return

  try {
    await VozElevenLabsServices.eliminarVariacion(variacion.vva_codigo)
    toast('Variacion eliminada', 'success')
    await loadVariaciones()
    emit('variacion-deleted')
  } catch (error) {
    console.error('Error eliminando variacion:', error)
    toast('Error al eliminar variacion', 'error')
  }
}

const playOriginalPreview = async () => {
  if (playingOriginal.value) {
    stopAllPlayback()
    return
  }

  try {
    stopAllPlayback()
    playingOriginal.value = true
    audioPlayer.value.src = props.voz.vel_preview_url
    await audioPlayer.value.play()
  } catch (error) {
    console.error('Error playing preview:', error)
    playingOriginal.value = false
  }
}

const playVariacionPreview = async (variacion) => {
  if (playingVariacionId.value === variacion.vva_codigo) {
    stopAllPlayback()
    return
  }

  try {
    stopAllPlayback()
    playingVariacionId.value = variacion.vva_codigo
    const url = VozElevenLabsServices.getPreviewUrl(variacion.vva_preview_path)
    audioPlayer.value.src = url
    await audioPlayer.value.play()
  } catch (error) {
    console.error('Error playing variacion preview:', error)
    playingVariacionId.value = null
  }
}

const stopAllPlayback = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
  playingOriginal.value = false
  playingVariacionId.value = null
}

const getModelName = (modelId) => {
  const model = VozElevenLabsServices.modelos.find(m => m.id === modelId)
  return model ? model.nombre : modelId
}

// Watch
watch(() => props.show, (newVal) => {
  if (newVal && props.voz) {
    loadVariaciones()
  } else {
    stopAllPlayback()
    variaciones.value = []
  }
})
</script>

<style scoped>
.voz-detail {
  @apply space-y-6;
}

.info-section,
.variations-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-white;
}

.section-header {
  @apply flex items-center justify-between;
}

.info-grid {
  @apply grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg;
}

.info-item {
  @apply flex flex-col gap-1;
}

.info-label {
  @apply text-xs text-gray-500 uppercase tracking-wide;
}

.info-value {
  @apply text-gray-300;
}

.preview-section {
  @apply mt-4 p-4 bg-gray-800 rounded-lg;
}

.audio-player {
  @apply flex items-center gap-3 mt-2;
}

.btn-play {
  @apply w-10 h-10 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center justify-center;
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-8 text-gray-400 gap-2;
}

.variations-list {
  @apply space-y-3;
}

.variation-card {
  @apply p-4 bg-gray-800 rounded-lg space-y-3;
}

.variation-header {
  @apply flex items-center justify-between;
}

.variation-name {
  @apply font-medium text-white;
}

.variation-actions {
  @apply flex items-center gap-2;
}

.btn-action {
  @apply w-7 h-7 rounded flex items-center justify-center transition-colors;
}

.btn-play-sm {
  @apply bg-primary-500/20 text-primary-400 hover:bg-primary-500/40;
}

.btn-edit {
  @apply bg-blue-500/20 text-blue-400 hover:bg-blue-500/40;
}

.btn-delete {
  @apply bg-red-500/20 text-red-400 hover:bg-red-500/40;
}

.variation-settings {
  @apply space-y-2;
}

.setting-item {
  @apply flex items-center gap-2;
}

.setting-label {
  @apply w-20 text-xs text-gray-500;
}

.setting-bar {
  @apply flex-1 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.bar-fill {
  @apply h-full bg-primary-500 rounded-full transition-all;
}

.setting-value {
  @apply w-10 text-xs text-gray-400 text-right;
}

.variation-meta {
  @apply flex items-center gap-4 text-xs text-gray-500;
}

.meta-item {
  @apply flex items-center;
}

.variation-preview-text {
  @apply pt-2 border-t border-gray-700;
}
</style>
