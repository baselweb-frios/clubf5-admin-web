<template>
  <Modal
:model-value="modelValue"
size="xl"
:closable="true"
@update:model-value="$emit('update:modelValue', $event)"
>
    <template #header>
      <div class="flex items-center gap-3">
        <i class="fa fa-music text-primary-400" />
        <h3 class="text-lg font-semibold text-text-primary">
Seleccionar Spots
</h3>
        <span class="badge badge-primary">{{ selectedSpots.length }}/{{ maxAllowed }}</span>
      </div>
    </template>

    <template #default>
      <div class="space-y-4">
        <!-- Filtros -->
        <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
          <div class="flex items-center gap-2 mb-3">
            <i class="fa fa-filter text-text-secondary" />
            <span class="text-sm font-semibold text-text-primary">Filtros</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Filtro por nombre -->
            <div class="form-group">
              <label class="label text-xs">Buscar por nombre</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="input pl-9"
                  placeholder="Nombre del spot..."
                >
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

            <!-- Filtro por tipo de spot -->
            <div class="form-group">
              <label class="label text-xs">Tipo de Spot</label>
              <select
v-model="filterTipo"
class="select"
>
                <option value="">
Todos los tipos
</option>
                <option value="inst">
Institucional
</option>
                <option value="prom">
Promocional
</option>
                <option value="noti">
Noticias
</option>
              </select>
            </div>

            <!-- Filtro por tipo de media -->
            <div class="form-group">
              <label class="label text-xs">Tipo de Media</label>
              <select
v-model="filterMedia"
class="select"
>
                <option value="">
Todos los medios
</option>
                <option value="audio">
Audio
</option>
                <option value="video">
Video
</option>
                <option value="streaming">
Streaming
</option>
              </select>
            </div>
          </div>

          <!-- Botón limpiar filtros -->
          <div
v-if="hasFilters"
class="mt-3 flex justify-end"
>
            <button
class="btn btn-ghost btn-sm"
@click="clearFilters"
>
              <i class="fa fa-times" />
              Limpiar filtros
            </button>
          </div>
        </div>

        <!-- Contador de resultados -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-text-secondary">
            Mostrando <strong class="text-text-primary">{{ filteredSpots.length }}</strong> spots
          </span>
          <div
v-if="selectedSpots.length > 0"
class="flex items-center gap-2"
>
            <span class="text-success-400">
              <i class="fa fa-check-circle" />
              {{ selectedSpots.length }} seleccionado{{ selectedSpots.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Grid de Cards de Spots -->
        <div class="max-h-[50vh] overflow-y-auto pr-2">
          <div
v-if="filteredSpots.length === 0"
class="text-center py-12"
>
            <i class="fa fa-search text-4xl text-text-tertiary mb-3" />
            <p class="text-text-secondary">
No se encontraron spots con los filtros aplicados
</p>
          </div>

          <div
v-else
class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
>
            <div
              v-for="spot in filteredSpots"
              :key="spot.spo_codigo"
              class="spot-card p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
              :class="{
                'border-primary-500 bg-primary-500/10 shadow-primary-500/20': isSelected(spot),
                'border-dark-border bg-dark-tertiary hover:border-dark-hover': !isSelected(spot),
                'opacity-50 cursor-not-allowed': !canAddMore && !isSelected(spot)
              }"
              @click="toggleSelection(spot)"
            >
              <!-- Header de la card -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <!-- Icono según tipo de media -->
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    :class="getMediaTypeIconClass(spot.spo_mediaTipo)"
                  >
                    <i :class="getMediaTypeIcon(spot.spo_mediaTipo)" />
                  </div>
                  <div>
                    <span
                      class="badge text-xs"
                      :class="`badge-${getCategoryVariant(spot.spo_tipo)}`"
                    >
                      {{ getCategoryLabel(spot.spo_tipo) }}
                    </span>
                  </div>
                </div>
                <!-- Checkbox de selección -->
                <div
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="{
                    'border-primary-500 bg-primary-500 text-white': isSelected(spot),
                    'border-dark-border': !isSelected(spot)
                  }"
                >
                  <i
v-if="isSelected(spot)"
class="fa fa-check text-xs"
/>
                </div>
              </div>

              <!-- Nombre del spot -->
              <h4 class="font-semibold text-text-primary mb-2 line-clamp-2">
                {{ spot.spo_nombre }}
              </h4>

              <!-- Información adicional -->
              <div class="flex items-center gap-3 text-xs text-text-tertiary">
                <span class="flex items-center gap-1">
                  <i :class="getMediaTypeIcon(spot.spo_mediaTipo)" />
                  {{ getMediaTypeLabel(spot.spo_mediaTipo) }}
                </span>
                <span
v-if="spot.spo_duracion"
class="flex items-center gap-1"
>
                  <i class="fa fa-clock-o" />
                  {{ formatDuration(spot.spo_duracion) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="text-sm text-text-secondary">
          <span
v-if="!canAddMore && selectedSpots.length >= maxAllowed"
class="text-warning-400"
>
            <i class="fa fa-exclamation-triangle" />
            Límite de spots alcanzado
          </span>
          <span v-else>
            Puedes seleccionar hasta {{ maxAllowed }} spots
          </span>
        </div>
        <div class="flex gap-2">
          <button
class="btn btn-ghost"
@click="$emit('update:modelValue', false)"
>
            Cancelar
          </button>
          <button
            class="btn btn-primary"
            :disabled="selectedSpots.length === 0"
            @click="confirmSelection"
          >
            <i class="fa fa-check" />
            Confirmar Selección ({{ selectedSpots.length }})
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'

export default {
  name: 'SpotSelectorModal',
  components: {
    Modal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    spots: {
      type: Array,
      default: () => []
    },
    selectedSpots: {
      type: Array,
      default: () => []
    },
    maxAllowed: {
      type: Number,
      default: 5
    }
  },
  emits: ['update:modelValue', 'update:selectedSpots', 'confirm'],
  setup(props, { emit }) {
    // ===== STATE =====
    const searchQuery = ref('')
    const filterTipo = ref('')
    const filterMedia = ref('')

    // ===== COMPUTED =====
    const hasFilters = computed(() => {
      return !!(searchQuery.value || filterTipo.value || filterMedia.value)
    })

    const filteredSpots = computed(() => {
      let filtered = [...props.spots]

      // Filtro por nombre
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(spot =>
          spot.spo_nombre.toLowerCase().includes(query)
        )
      }

      // Filtro por tipo
      if (filterTipo.value) {
        filtered = filtered.filter(spot => spot.spo_tipo === filterTipo.value)
      }

      // Filtro por media
      if (filterMedia.value) {
        filtered = filtered.filter(spot => spot.spo_mediaTipo === filterMedia.value)
      }

      return filtered
    })

    const canAddMore = computed(() => {
      return props.selectedSpots.length < props.maxAllowed
    })

    // ===== METHODS =====
    const isSelected = (spot) => {
      return props.selectedSpots.some(s => s.spo_codigo === spot.spo_codigo)
    }

    const toggleSelection = (spot) => {
      const newSelection = [...props.selectedSpots]
      const index = newSelection.findIndex(s => s.spo_codigo === spot.spo_codigo)

      if (index > -1) {
        newSelection.splice(index, 1)
      } else if (canAddMore.value) {
        newSelection.push(spot)
      }

      emit('update:selectedSpots', newSelection)
    }

    const clearFilters = () => {
      searchQuery.value = ''
      filterTipo.value = ''
      filterMedia.value = ''
    }

    const confirmSelection = () => {
      emit('confirm', props.selectedSpots)
      emit('update:modelValue', false)
      clearFilters()
    }

    // Helpers
    const getMediaTypeIcon = (mediaTipo) => {
      const icons = {
        audio: 'fa fa-volume-up',
        video: 'fa fa-film',
        streaming: 'fa fa-wifi'
      }
      return icons[mediaTipo] || 'fa fa-file'
    }

    const getMediaTypeIconClass = (mediaTipo) => {
      const classes = {
        audio: 'bg-primary-500/20 text-primary-400',
        video: 'bg-success-500/20 text-success-400',
        streaming: 'bg-info-500/20 text-info-400'
      }
      return classes[mediaTipo] || 'bg-dark-secondary text-text-secondary'
    }

    const getMediaTypeLabel = (mediaTipo) => {
      const labels = {
        audio: 'Audio',
        video: 'Video',
        streaming: 'Streaming'
      }
      return labels[mediaTipo] || mediaTipo || 'Media'
    }

    const getCategoryVariant = (tipo) => {
      const variants = {
        inst: 'primary',
        prom: 'warning',
        noti: 'info'
      }
      return variants[tipo] || 'secondary'
    }

    const getCategoryLabel = (tipo) => {
      const labels = {
        inst: 'Institucional',
        prom: 'Promocional',
        noti: 'Noticias'
      }
      return labels[tipo] || tipo
    }

    const formatDuration = (duration) => {
      if (!duration) return '--:--'
      const totalSeconds = typeof duration === 'string' ? parseInt(duration) : duration
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // Reset filters when modal closes
    watch(() => props.modelValue, (newVal) => {
      if (!newVal) {
        clearFilters()
      }
    })

    return {
      // State
      searchQuery,
      filterTipo,
      filterMedia,
      
      // Computed
      hasFilters,
      filteredSpots,
      canAddMore,
      
      // Methods
      isSelected,
      toggleSelection,
      clearFilters,
      confirmSelection,
      getMediaTypeIcon,
      getMediaTypeIconClass,
      getMediaTypeLabel,
      getCategoryVariant,
      getCategoryLabel,
      formatDuration
    }
  }
}
</script>

<style scoped>
.spot-card:hover:not(.opacity-50) {
  transform: translateY(-2px);
}

.spot-card.border-primary-500 {
  box-shadow: 0 0 0 1px rgba(var(--color-primary-500), 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.max-h-\[50vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[50vh\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[50vh\]::-webkit-scrollbar-thumb {
  background: var(--color-dark-border);
  border-radius: 3px;
}

.max-h-\[50vh\]::-webkit-scrollbar-thumb:hover {
  background: var(--color-dark-hover);
}
</style>
