<template>
  <Modal
    :model-value="modelValue"
    size="xl"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <i class="fa fa-magic text-primary-400" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-text-primary">
            Programación Inteligente en Lotes
          </h3>
          <p class="text-sm text-text-secondary">
            Programa múltiples spots de forma automática
          </p>
        </div>
      </div>
    </template>

    <template #default>
      <div class="space-y-6">
        <!-- Vista de configuración -->
        <div v-if="!showPreview">
          <!-- Sección: Spots -->
          <div class="card mb-6">
            <h4 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <i class="fa fa-bullhorn text-primary-400" />
              Spots a Programar
            </h4>

            <div v-if="selectedSpots.length === 0" class="text-center py-8 text-text-secondary">
              <i class="fa fa-info-circle text-4xl mb-3 opacity-50" />
              <p>Selecciona al menos un spot para comenzar</p>
            </div>

            <div v-else class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="spot in selectedSpots"
                  :key="spot.spo_codigo"
                  class="badge badge-lg badge-primary"
                >
                  {{ spot.spo_nombre }}
                </span>
              </div>

              <div class="form-group">
                <label class="label">
                  Spots por salida
                  <span class="badge badge-info ml-2 text-xs">{{ batchConfig.spotsPerSlot }}</span>
                </label>
                <input
                  v-model.number="batchConfig.spotsPerSlot"
                  type="range"
                  min="1"
                  :max="Math.min(5, selectedSpots.length)"
                  class="range range-primary"
                >
                <div class="flex justify-between text-xs text-text-secondary mt-1">
                  <span>1 spot</span>
                  <span>{{ Math.min(5, selectedSpots.length) }} spots</span>
                </div>
                <small class="text-text-secondary mt-2 block">
                  <i class="fa fa-info-circle mr-1" />
                  Cada salida incluirá {{ batchConfig.spotsPerSlot }} spot{{ batchConfig.spotsPerSlot > 1 ? 's' : '' }}
                </small>
              </div>
            </div>
          </div>

          <!-- Sección: Horario -->
          <div class="card mb-6">
            <h4 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <i class="fa fa-clock-o text-primary-400" />
              Configuración de Horario
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="form-group">
                <label class="label">Hora de inicio</label>
                <input
                  v-model="batchConfig.startTime"
                  type="time"
                  class="input"
                >
              </div>

              <div class="form-group">
                <label class="label">Hora de fin</label>
                <input
                  v-model="batchConfig.endTime"
                  type="time"
                  class="input"
                >
              </div>
            </div>

            <div class="form-group">
              <label class="label">
                Intervalo entre salidas
                <span class="badge badge-info ml-2 text-xs">{{ getIntervalDescription(batchConfig.intervalMinutes) }}</span>
              </label>
              <select
                v-model.number="batchConfig.intervalMinutes"
                class="select"
              >
                <option :value="15">
                  Cada 15 minutos
                </option>
                <option :value="30">
                  Cada 30 minutos
                </option>
                <option :value="60">
                  Cada 1 hora
                </option>
                <option :value="120">
                  Cada 2 horas
                </option>
                <option :value="180">
                  Cada 3 horas
                </option>
              </select>
            </div>

            <!-- Preview de horarios -->
            <div v-if="totalSlots > 0" class="mt-4 p-3 bg-dark-secondary rounded-lg border border-dark-border">
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-secondary">
                  <i class="fa fa-calendar-check-o mr-2" />
                  Salidas por día:
                </span>
                <span class="font-semibold text-primary-400">{{ totalSlots }} salidas</span>
              </div>
            </div>
          </div>

          <!-- Sección: Días -->
          <div class="card">
            <h4 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <i class="fa fa-calendar text-primary-400" />
              Días de la Semana
            </h4>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="day in weekDays"
                :key="day.value"
                type="button"
                class="px-4 py-3 rounded-lg border transition-all font-medium"
                :class="isDaySelected(day.value) ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-dark-secondary border-dark-border text-text-secondary hover:border-primary-500/50'"
                :disabled="!day.isHabil && diasHabiles.length > 0"
                @click="toggleDay(day.value)"
              >
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm">{{ day.text }}</span>
                  <i
                    v-if="isDaySelected(day.value)"
                    class="fa fa-check-circle text-xs"
                  />
                </div>
              </button>
            </div>

            <div v-if="batchConfig.selectedDays.length > 0" class="mt-4 p-3 bg-success-500/10 border border-success-500/30 rounded-lg">
              <div class="flex items-center justify-between text-sm">
                <span class="text-success-400">
                  <i class="fa fa-check-circle mr-2" />
                  Días seleccionados: {{ batchConfig.selectedDays.length }}
                </span>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div v-if="canGenerate" class="card mt-6 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/30">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                <i class="fa fa-chart-bar text-2xl text-primary-400" />
              </div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-text-primary mb-1">
                  Resumen de Programación
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <div class="text-2xl font-bold text-primary-400">
                      {{ totalProgramaciones }}
                    </div>
                    <div class="text-xs text-text-secondary">
                      Total salidas
                    </div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-primary-400">
                      {{ batchConfig.selectedDays.length }}
                    </div>
                    <div class="text-xs text-text-secondary">
                      Días
                    </div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-primary-400">
                      {{ totalSlots }}
                    </div>
                    <div class="text-xs text-text-secondary">
                      Salidas/día
                    </div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-primary-400">
                      {{ batchConfig.spotsPerSlot }}
                    </div>
                    <div class="text-xs text-text-secondary">
                      Spots/salida
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista de preview -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold text-text-primary">
              Vista Previa de Programaciones
            </h4>
            <button
              class="btn btn-ghost btn-sm"
              @click="showPreview = false"
            >
              <i class="fa fa-arrow-left mr-2" />
              Volver a configuración
            </button>
          </div>

          <div class="alert alert-info">
            <i class="fa fa-info-circle" />
            <div>
              <p class="font-semibold">
                Se generarán {{ totalProgramaciones }} programaciones
              </p>
              <p class="text-sm opacity-90">
                Revisa la vista previa antes de confirmar
              </p>
            </div>
          </div>

          <!-- Preview agrupado por día -->
          <div class="max-h-96 overflow-y-auto space-y-4">
            <div
              v-for="(progs, day) in previewGroupedByDay"
              :key="day"
              class="card"
            >
              <h5 class="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <i class="fa fa-calendar text-primary-400" />
                {{ getWeekDayName(Number(day)) }}
                <span class="badge badge-primary">{{ progs.length }} salidas</span>
              </h5>

              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(prog, idx) in progs"
                  :key="idx"
                  class="flex items-center gap-3 p-2 bg-dark-secondary rounded border border-dark-border text-sm"
                >
                  <span class="font-mono text-primary-400">{{ prog.clprsp_horaDesde }}</span>
                  <span class="text-text-secondary">Slot {{ prog.clprsp_orden }}</span>
                  <span class="flex-1 text-text-primary">{{ prog._spot.spo_nombre }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center gap-4 w-full">
        <button
          class="btn btn-ghost"
          @click="handleCancel"
        >
          Cancelar
        </button>

        <div class="flex gap-2">
          <button
            v-if="!showPreview"
            class="btn btn-primary"
            :disabled="!canGenerate"
            @click="handleGenerate"
          >
            <i class="fa fa-eye mr-2" />
            Generar Vista Previa
          </button>

          <button
            v-else
            class="btn btn-success"
            @click="handleConfirm"
          >
            <i class="fa fa-check mr-2" />
            Confirmar Programaciones
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { useBatchProgramming } from '@/composables/ui/useBatchProgramming'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedSpots: {
    type: Array,
    default: () => []
  },
  weekDays: {
    type: Array,
    default: () => []
  },
  diasHabiles: {
    type: Array,
    default: () => []
  },
  existingProgramaciones: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const {
  batchConfig,
  showPreview,
  totalSlots,
  totalProgramaciones,
  previewStats,
  generateBatchProgramaciones,
  clearBatch,
  resetConfig,
  getPreviewGroupedByDay,
  getIntervalDescription
} = useBatchProgramming()

// Computed
const canGenerate = computed(() => {
  return batchConfig.value.selectedSpots.length > 0 &&
         batchConfig.value.selectedDays.length > 0 &&
         totalSlots.value > 0
})

const previewGroupedByDay = computed(() => {
  return getPreviewGroupedByDay()
})

// Methods
const isDaySelected = (dayValue) => {
  return batchConfig.value.selectedDays.includes(dayValue)
}

const toggleDay = (dayValue) => {
  const index = batchConfig.value.selectedDays.indexOf(dayValue)
  if (index > -1) {
    batchConfig.value.selectedDays.splice(index, 1)
  } else {
    batchConfig.value.selectedDays.push(dayValue)
  }
}

const getWeekDayName = (dayValue) => {
  const day = props.weekDays.find(d => d.value === dayValue)
  return day ? day.text : `Día ${dayValue}`
}

const handleGenerate = () => {
  generateBatchProgramaciones(props.existingProgramaciones)
}

const handleConfirm = () => {
  emit('confirm', previewGroupedByDay.value)
  handleCancel()
}

const handleCancel = () => {
  clearBatch()
  resetConfig()
  emit('update:modelValue', false)
}

// Watchers
watch(() => props.selectedSpots, (newSpots) => {
  batchConfig.value.selectedSpots = [...newSpots]
}, { immediate: true })

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    clearBatch()
  }
})
</script>
