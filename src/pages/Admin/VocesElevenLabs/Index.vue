<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-microphone-alt mr-3" />
          Voces ElevenLabs
        </h1>
        <p class="page-subtitle">
          Administra las voces de IA para generacion de audio
        </p>
      </div>
      <div class="header-actions">
        <base-button
          variant="primary"
          :loading="syncLoading"
          @click="sincronizarVoces"
        >
          <i class="fas fa-sync mr-2" />
          Sincronizar Voces
        </base-button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <base-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon bg-primary-500/20">
            <i class="fas fa-microphone text-primary-400" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ voces.length }}</span>
            <span class="stat-label">Total Voces</span>
          </div>
        </div>
      </base-card>
      <base-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon bg-green-500/20">
            <i class="fas fa-check-circle text-green-400" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ vocesActivas }}</span>
            <span class="stat-label">Voces Activas</span>
          </div>
        </div>
      </base-card>
      <base-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon bg-blue-500/20">
            <i class="fas fa-sliders-h text-blue-400" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ totalVariaciones }}</span>
            <span class="stat-label">Variaciones</span>
          </div>
        </div>
      </base-card>
    </div>

    <!-- Voces List -->
    <voces-list
      :voces="voces"
      :loading="loading"
      :variaciones-count="variacionesCount"
      @toggle-estado="handleToggleEstado"
      @ver-detalle="handleVerDetalle"
      @eliminar="handleEliminar"
    />

    <!-- Voz Detail Modal -->
    <voz-detail-modal
      v-model:show="showDetailModal"
      :voz="selectedVoz"
      @variacion-created="handleVariacionCreated"
      @variacion-updated="handleVariacionUpdated"
      @variacion-deleted="handleVariacionDeleted"
    />

    <!-- Loading Overlay -->
    <loading-overlay v-if="processing" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import VocesList from './components/VocesList.vue'
import VozDetailModal from './components/VozDetailModal.vue'
import VozElevenLabsServices from '@/services/VozElevenLabsServices'

const toast = useToast()

// State
const loading = ref(false)
const syncLoading = ref(false)
const processing = ref(false)
const voces = ref([])
const variacionesCount = ref({})
const showDetailModal = ref(false)
const selectedVoz = ref(null)

// Computed
const vocesActivas = computed(() =>
  voces.value.filter(v => v.vel_estado === 'A').length
)

const totalVariaciones = computed(() =>
  Object.values(variacionesCount.value).reduce((acc, count) => acc + count, 0)
)

// Methods
const loadVoces = async () => {
  try {
    loading.value = true
    voces.value = await VozElevenLabsServices.getAll()

    // Cargar conteo de variaciones para cada voz
    for (const voz of voces.value) {
      try {
        const {variaciones} = await VozElevenLabsServices.getVariaciones(voz.vel_codigo)
        variacionesCount.value[voz.vel_codigo] = variaciones.length
      } catch {
        variacionesCount.value[voz.vel_codigo] = 0
      }
    }
  } catch (error) {
    console.error('Error cargando voces:', error)
    toast('Error al cargar las voces', 'error')
  } finally {
    loading.value = false
  }
}

const sincronizarVoces = async () => {
  try {
    syncLoading.value = true
    const result = await VozElevenLabsServices.sincronizar()

    toast(
      `Sincronizacion completada: ${result.vocesNuevas} nuevas, ${result.vocesActualizadas} actualizadas`,
      'success'
    )

    await loadVoces()
  } catch (error) {
    console.error('Error sincronizando:', error)
    toast(error.response?.data?.message || 'Error al sincronizar voces', 'error')
  } finally {
    syncLoading.value = false
  }
}

const handleToggleEstado = async (voz) => {
  try {
    processing.value = true
    const nuevoEstado = voz.vel_estado === 'A' ? 'I' : 'A'
    await VozElevenLabsServices.cambiarEstado(voz.vel_codigo, nuevoEstado)

    toast(
      nuevoEstado === 'A' ? 'Voz activada' : 'Voz desactivada',
      'success'
    )

    await loadVoces()
  } catch (error) {
    console.error('Error cambiando estado:', error)
    toast('Error al cambiar estado', 'error')
  } finally {
    processing.value = false
  }
}

const handleVerDetalle = async (voz) => {
  selectedVoz.value = voz
  showDetailModal.value = true
}

const handleEliminar = async (voz) => {
  if (!confirm(`Esta seguro de eliminar la voz "${voz.vel_nombre}"?`)) {
    return
  }

  try {
    processing.value = true
    await VozElevenLabsServices.eliminar(voz.vel_codigo)
    toast('Voz eliminada correctamente', 'success')
    await loadVoces()
  } catch (error) {
    console.error('Error eliminando:', error)
    toast(error.response?.data?.message || 'Error al eliminar voz', 'error')
  } finally {
    processing.value = false
  }
}

const handleVariacionCreated = async () => {
  await loadVoces()
}

const handleVariacionUpdated = async () => {
  await loadVoces()
}

const handleVariacionDeleted = async () => {
  await loadVoces()
}

// Lifecycle
onMounted(() => {
  loadVoces()
})
</script>

<style scoped>
.page-wrapper {
  @apply space-y-6 p-6;
}

.page-header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between gap-4;
}

.header-content {
  @apply space-y-1;
}

.page-title {
  @apply text-2xl font-bold text-white flex items-center;
}

.page-subtitle {
  @apply text-gray-400 text-sm;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.stat-card {
  @apply p-4;
}

.stat-content {
  @apply flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;
}

.stat-icon i {
  @apply text-xl;
}

.stat-info {
  @apply flex flex-col;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-sm text-gray-400;
}
</style>
