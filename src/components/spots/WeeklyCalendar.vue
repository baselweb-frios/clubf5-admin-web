<template>
  <div class="weekly-calendar">
    <!-- Header del calendario -->
    <div class="calendar-header mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <i class="fa fa-calendar text-primary-400" />
          </div>
          Calendario de Salidas
        </h2>

        <div class="flex items-center gap-3">
          <!-- Filtro rápido por reproductor -->
          <select
            v-model="selectedReproductor"
            class="select select-sm"
          >
            <option value="">
              Todos los reproductores
            </option>
            <option
              v-for="rep in reproductores"
              :key="rep.clisuc_nombre"
              :value="rep.clisuc_nombre"
            >
              {{ rep.clisuc_nombre }}
            </option>
          </select>

          <!-- Selector de vista -->
          <div class="btn-group">
            <button
              class="btn btn-sm"
              :class="view === 'week' ? 'btn-primary' : 'btn-secondary'"
              @click="view = 'week'"
            >
              <i class="fa fa-th" />
              Semana
            </button>
            <button
              class="btn btn-sm"
              :class="view === 'day' ? 'btn-primary' : 'btn-secondary'"
              @click="view = 'day'"
            >
              <i class="fa fa-bars" />
              Día
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="stat-icon bg-primary-500/20">
            <i class="fa fa-calendar-check-o text-primary-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-text-primary">
              {{ totalProgramaciones }}
            </div>
            <div class="text-xs text-text-secondary">
              Total Salidas
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-success-500/20">
            <i class="fa fa-play-circle text-success-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-text-primary">
              {{ uniqueSpots }}
            </div>
            <div class="text-xs text-text-secondary">
              Spots Únicos
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-500/20">
            <i class="fa fa-clock-o text-purple-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-text-primary">
              {{ horariosActivos }}
            </div>
            <div class="text-xs text-text-secondary">
              Horarios Activos
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-info-500/20">
            <i class="fa fa-desktop text-info-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-text-primary">
              {{ reproductoresActivos }}
            </div>
            <div class="text-xs text-text-secondary">
              Reproductores
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Semanal -->
    <div v-if="view === 'week'" class="calendar-week">
      <div class="grid grid-cols-8 gap-2">
        <!-- Columna de horas -->
        <div class="time-column">
          <div class="time-header">
            Hora
          </div>
          <div
            v-for="hour in hours"
            :key="hour"
            class="time-cell"
          >
            {{ hour }}:00
          </div>
        </div>

        <!-- Columnas de días -->
        <div
          v-for="day in weekDays"
          :key="day.value"
          class="day-column"
        >
          <div class="day-header" :class="isToday(day.value) ? 'bg-primary-500/20' : ''">
            <div class="font-semibold">
              {{ day.text }}
            </div>
            <div class="text-xs opacity-70">
              {{ getProgramacionesForDay(day.value).length }} salidas
            </div>
          </div>

          <div
            v-for="hour in hours"
            :key="`${day.value}-${hour}`"
            class="day-cell group"
            @click="handleCellClick(day.value, hour)"
          >
            <div
              v-for="prog in getProgramacionesForDayAndHour(day.value, hour)"
              :key="prog.clprsp_codigo"
              class="program-item"
              :class="getSlotClass(prog.clprsp_orden)"
              :title="`${prog._spot?.spo_nombre || 'Spot'} - Slot ${prog.clprsp_orden}`"
              @click.stop="handleProgramClick(prog)"
            >
              <div class="program-content">
                <div class="program-time">
                  {{ prog.clprsp_horaDesde?.substring(0, 5) }}
                </div>
                <div class="program-name">
                  {{ prog._spot?.spo_nombre || 'Spot' }}
                </div>
                <div class="program-slot">
                  Slot {{ prog.clprsp_orden }}
                </div>
              </div>
            </div>

            <div
              v-if="getProgramacionesForDayAndHour(day.value, hour).length === 0"
              class="empty-slot"
            >
              <i class="fa fa-plus text-text-tertiary opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de Día -->
    <div v-else class="calendar-day">
      <div class="day-selector mb-4">
        <button
          v-for="day in weekDays"
          :key="day.value"
          class="btn btn-sm"
          :class="selectedDay === day.value ? 'btn-primary' : 'btn-secondary'"
          @click="selectedDay = day.value"
        >
          {{ day.text }}
        </button>
      </div>

      <div class="day-timeline">
        <div
          v-for="hour in hours"
          :key="hour"
          class="timeline-hour"
        >
          <div class="timeline-time">
            {{ hour }}:00
          </div>

          <div class="timeline-content">
            <div
              v-for="prog in getProgramacionesForDayAndHour(selectedDay, hour)"
              :key="prog.clprsp_codigo"
              class="timeline-item"
              :class="getSlotClass(prog.clprsp_orden)"
              @click="handleProgramClick(prog)"
            >
              <div class="flex items-center gap-3">
                <div class="timeline-marker">
                  {{ prog.clprsp_horaDesde?.substring(0, 5) }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-text-primary">
                    {{ prog._spot?.spo_nombre || 'Spot' }}
                  </div>
                  <div class="text-xs text-text-secondary">
                    Slot {{ prog.clprsp_orden }} • {{ prog.clprsp_codigoReproductor || 'Todos' }}
                  </div>
                </div>
                <div class="timeline-actions">
                  <button
                    class="btn btn-ghost btn-sm"
                    @click.stop="$emit('edit', prog)"
                  >
                    <i class="fa fa-edit" />
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-danger-400"
                    @click.stop="$emit('delete', [prog])"
                  >
                    <i class="fa fa-trash" />
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="getProgramacionesForDayAndHour(selectedDay, hour).length === 0"
              class="timeline-empty"
              @click="handleCellClick(selectedDay, hour)"
            >
              <i class="fa fa-plus text-text-tertiary" />
              <span class="text-xs text-text-secondary">Agregar salida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  programaciones: {
    type: Array,
    default: () => []
  },
  weekDays: {
    type: Array,
    default: () => []
  },
  reproductores: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cell-click', 'program-click', 'edit', 'delete'])

// State
const view = ref('week')
const selectedDay = ref(1) // Lunes por defecto
const selectedReproductor = ref('')

// Hours (0-23)
const hours = Array.from({ length: 24 }, (_, i) => i)

// Computed
const filteredProgramaciones = computed(() => {
  let progs = props.programaciones

  if (selectedReproductor.value) {
    progs = progs.filter(p => p.clprsp_codigoReproductor === selectedReproductor.value)
  }

  return progs
})

const totalProgramaciones = computed(() => filteredProgramaciones.value.length)

const uniqueSpots = computed(() => {
  const spotCodes = new Set(filteredProgramaciones.value.map(p => p.clprsp_codigoSpot))
  return spotCodes.size
})

const horariosActivos = computed(() => {
  const horarios = new Set(filteredProgramaciones.value.map(p => p.clprsp_horaDesde))
  return horarios.size
})

const reproductoresActivos = computed(() => {
  const reps = new Set(filteredProgramaciones.value.map(p => p.clprsp_codigoReproductor).filter(Boolean))
  return reps.size
})

// Methods
const getProgramacionesForDay = (dayValue) => {
  return filteredProgramaciones.value.filter(p => p.clprsp_numeroDia === dayValue)
}

const getProgramacionesForDayAndHour = (dayValue, hour) => {
  return filteredProgramaciones.value.filter(p => {
    if (p.clprsp_numeroDia !== dayValue) return false
    if (!p.clprsp_horaDesde) return false

    const progHour = parseInt(p.clprsp_horaDesde.split(':')[0])
    return progHour === hour
  }).sort((a, b) => a.clprsp_orden - b.clprsp_orden)
}

const getSlotClass = (slot) => {
  const colors = [
    'slot-1',
    'slot-2',
    'slot-3',
    'slot-4',
    'slot-5'
  ]
  return colors[(slot - 1) % 5]
}

const isToday = (dayValue) => {
  const today = new Date().getDay()
  return today === dayValue
}

const handleCellClick = (day, hour) => {
  emit('cell-click', { day, hour })
}

const handleProgramClick = (prog) => {
  emit('program-click', prog)
}
</script>

<style scoped>
.weekly-calendar {
  @apply w-full gpu-accelerated;
}

.calendar-header {
  @apply space-y-4 animate-fade-in;
}

.stat-card {
  @apply flex items-center gap-3 p-4 rounded-lg;
  @apply bg-dark-secondary border border-dark-border;
  @apply hover-lift transition-all duration-300;
  @apply glass cursor-default;
}

.stat-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0;
  @apply shadow-glow-primary animate-pulse-slow;
}

.calendar-week {
  @apply overflow-x-auto;
}

.time-column {
  @apply border-r border-dark-border;
}

.time-header {
  @apply h-16 flex items-center justify-center font-semibold text-text-primary bg-dark-secondary border-b-2 border-dark-border sticky top-0 z-10;
}

.time-cell {
  @apply h-20 flex items-center justify-center text-sm text-text-secondary border-b border-dark-border font-mono;
}

.day-column {
  @apply min-w-32;
}

.day-header {
  @apply h-16 flex flex-col items-center justify-center text-center bg-dark-secondary border-b-2 border-dark-border sticky top-0 z-10;
}

.day-cell {
  @apply h-20 border-b border-dark-border relative cursor-pointer;
  @apply transition-all duration-300 hover:bg-dark-hover hover:shadow-inner;
  @apply p-1 space-y-1 overflow-y-auto;
}

.program-item {
  @apply rounded px-2 py-1 text-xs cursor-pointer;
  @apply transition-all duration-300;
  @apply hover:scale-105 hover:shadow-lg hover-glow;
  @apply animate-slide-in-up;
}

.program-content {
  @apply space-y-0.5;
}

.program-time {
  @apply font-mono font-semibold;
}

.program-name {
  @apply font-medium truncate;
}

.program-slot {
  @apply text-xs opacity-75;
}

.empty-slot {
  @apply flex items-center justify-center h-full text-text-tertiary;
}

/* Colores por slot */
.slot-1 {
  @apply bg-primary-500/20 text-primary-300 border border-primary-500/30;
}

.slot-2 {
  @apply bg-success-500/20 text-success-300 border border-success-500/30;
}

.slot-3 {
  @apply bg-purple-500/20 text-purple-300 border border-purple-500/30;
}

.slot-4 {
  @apply bg-info-500/20 text-info-300 border border-info-500/30;
}

.slot-5 {
  @apply bg-warning-500/20 text-warning-300 border border-warning-500/30;
}

/* Vista de día */
.day-selector {
  @apply flex gap-2 overflow-x-auto pb-2;
}

.day-timeline {
  @apply space-y-4;
}

.timeline-hour {
  @apply flex gap-4;
}

.timeline-time {
  @apply w-20 text-sm font-mono text-text-secondary flex-shrink-0 pt-2;
}

.timeline-content {
  @apply flex-1 space-y-2;
}

.timeline-item {
  @apply p-3 rounded-lg border;
  @apply transition-all duration-300 hover:shadow-lg cursor-pointer;
  @apply hover-lift glass-hover;
  @apply animate-slide-in-up;
}

.timeline-marker {
  @apply w-16 h-16 rounded-full flex items-center justify-center;
  @apply font-mono font-semibold text-sm flex-shrink-0;
  @apply bg-dark-secondary border border-dark-border;
  @apply shadow-glow-primary;
}

.timeline-empty {
  @apply p-4 rounded-lg border-2 border-dashed border-dark-border;
  @apply flex items-center justify-center gap-2 cursor-pointer;
  @apply transition-all duration-300;
  @apply hover:border-primary-500/50 hover:bg-dark-hover hover:shadow-glow-primary;
}

.timeline-actions {
  @apply flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.timeline-item:hover .timeline-actions {
  @apply opacity-100;
}
</style>
