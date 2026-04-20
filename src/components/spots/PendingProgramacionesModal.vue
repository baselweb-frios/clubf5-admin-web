<template>
  <Modal
:model-value="modelValue"
size="lg"
:closable="true"
@update:model-value="$emit('update:modelValue', $event)"
>
    <template #header>
      <div class="flex items-center gap-3">
        <i class="fas fa-clock text-primary-400" />
        <h3 class="text-lg font-semibold text-text-primary">
Salidas pautadas pendientes
</h3>
        <span class="badge badge-primary">{{ programaciones.length }}</span>
      </div>
    </template>

    <template #default>
      <div
v-if="programaciones.length > 0"
class="space-y-4"
>
        <div class="alert alert-info">
          <i class="fas fa-info-circle" />
          <p>Las salidas pautadas se guardarán en el servidor al confirmar.</p>
        </div>

        <!-- Lista de salidas pautadas pendientes -->
        <div>
          <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
            <i class="fas fa-list-ul" />
            Todas las salidas pautadas ({{ programaciones.length }})
          </h4>
          <div
class="max-h-64 overflow-y-auto space-y-2"
@scroll="handleScroll"
>
            <div
              v-for="(prog, index) in displayedProgramaciones"
              :key="`pending-${index}`"
              class="flex items-center gap-3 p-3 bg-dark-secondary rounded-lg border border-dark-border"
            >
              <div class="w-8 h-8 flex items-center justify-center bg-dark-tertiary rounded-full text-xs font-bold text-text-secondary">
                {{ index + 1 }}
              </div>
              <div class="flex items-center gap-3 flex-1">
                <span class="badge badge-info">{{ getWeekDayName(prog.clprsp_numeroDia) }}</span>
                <span class="flex items-center gap-1 text-sm text-text-secondary">
                  <i class="fas fa-clock" />
                  {{ prog.clprsp_horaDesde.slice(0, 5) }}
                </span>
                <span
v-if="prog.clprsp_orden"
class="flex items-center gap-1 text-xs text-text-tertiary"
>
                  <i class="fas fa-layer-group" />
                  Slot {{ prog.clprsp_orden }}
                </span>
                <span
                  class="flex items-center gap-1 text-xs"
                  :class="prog.clprsp_codigoReproductor ? 'text-primary-400' : 'text-text-tertiary'"
                >
                  <i class="fas fa-desktop" />
                  {{ prog.clprsp_codigoReproductor || 'Todos' }}
                </span>
              </div>
              <div class="text-sm font-medium text-text-primary truncate max-w-[150px]">
                {{ prog._spot?.spo_nombre || 'Spot' }}
              </div>
            </div>

            <!-- Indicador de carga de más items -->
            <div
v-if="hasMoreItems"
class="flex items-center justify-center gap-2 py-3 text-text-secondary"
>
              <div class="spinner" />
              <span class="text-sm">Cargando más programaciones...</span>
            </div>

            <!-- Mensaje cuando se han cargado todos los items -->
            <div
v-else-if="programaciones.length > 0"
class="flex items-center justify-center gap-2 py-3 text-success-400"
>
              <i class="fas fa-check-circle" />
              <span class="text-sm">Has visto todas las {{ programaciones.length }} salidas pautadas pendientes</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="btn btn-secondary"
        @click="$emit('clear')"
      >
        <i class="fas fa-trash" />
        Limpiar Todo
      </button>
      <button
        class="btn btn-primary"
        :disabled="isSaving || !hasValidProgramacion"
        @click="$emit('confirm')"
      >
        <i class="fas fa-check" />
        Confirmar y Guardar ({{ programaciones.length }} salidas pautadas)
      </button>
    </template>
  </Modal>
</template>

<script>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'

export default {
  name: 'PendingProgramacionesModal',
  components: {
    Modal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    programaciones: {
      type: Array,
      default: () => []
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    hasValidProgramacion: {
      type: Boolean,
      default: false
    },
    weekDays: {
      type: Array,
      default: () => [
        { text: 'Lun', value: 1 },
        { text: 'Mar', value: 2 },
        { text: 'Mié', value: 3 },
        { text: 'Jue', value: 4 },
        { text: 'Vie', value: 5 },
        { text: 'Sáb', value: 6 },
        { text: 'Dom', value: 0 }
      ]
    }
  },
  emits: ['update:modelValue', 'clear', 'confirm'],
  setup(props) {
    // ===== STATE =====
    const displayedCount = ref(20)
    const incrementCount = 20

    // ===== COMPUTED =====
    const displayedProgramaciones = computed(() => {
      return props.programaciones.slice(0, displayedCount.value)
    })

    const hasMoreItems = computed(() => {
      return displayedCount.value < props.programaciones.length
    })

    const daysCount = computed(() => {
      const uniqueDays = new Set(props.programaciones.map(p => p.clprsp_numeroDia))
      return uniqueDays.size
    })

    const spotsCount = computed(() => {
      const uniqueSpots = new Set(props.programaciones.map(p => p.clprsp_codigoSpot))
      return uniqueSpots.size
    })

    // ===== METHODS =====
    const getWeekDayName = (dayValue) => {
      const day = props.weekDays.find(d => d.value === dayValue)
      return day ? day.text : ''
    }

    const handleScroll = (event) => {
      const container = event.target
      const scrollPosition = container.scrollTop + container.clientHeight
      const scrollHeight = container.scrollHeight

      const threshold = Math.min(scrollHeight * 0.8, scrollHeight - 50)
      if (scrollPosition >= threshold && hasMoreItems.value) {
        displayedCount.value += incrementCount
      }
    }

    // Reset count when modal opens
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        displayedCount.value = 20
      }
    })

    return {
      // Computed
      displayedProgramaciones,
      hasMoreItems,
      daysCount,
      spotsCount,

      // Methods
      getWeekDayName,
      handleScroll
    }
  }
}
</script>

<style scoped>
.stat-card {
  @apply flex items-center gap-3 p-4 bg-dark-tertiary rounded-lg border border-dark-border;
}

.stat-value {
  @apply text-xl font-bold text-text-primary;
}

.stat-label {
  @apply text-xs text-text-tertiary;
}

.spinner {
  @apply w-4 h-4 border-2 border-t-transparent border-primary-400 rounded-full animate-spin;
}
</style>
