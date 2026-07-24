<template>
  <div class="weekly-calendar">
    <!-- Stats header -->
    <div class="calendar-header mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-primary-500/20 flex-center"><i class="fa fa-calendar text-primary-400" /></div>
          Calendario de Salidas
        </h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card"><div class="stat-icon bg-primary-500/20"><i class="fa fa-calendar-check text-primary-400" /></div><div><div class="text-xl font-bold text-text-primary">{{ totalProgramaciones }}</div><div class="text-xs text-text-secondary">Salidas</div></div></div>
        <div class="stat-card"><div class="stat-icon bg-success-500/20"><i class="fa fa-play-circle text-success-400" /></div><div><div class="text-xl font-bold text-text-primary">{{ uniqueSpots }}</div><div class="text-xs text-text-secondary">Spots</div></div></div>
        <div class="stat-card"><div class="stat-icon bg-purple-500/20"><i class="fa fa-clock text-purple-400" /></div><div><div class="text-xl font-bold text-text-primary">{{ horariosActivos }}</div><div class="text-xs text-text-secondary">Horarios</div></div></div>
        <div class="stat-card"><div class="stat-icon bg-info-500/20"><i class="fa fa-desktop text-info-400" /></div><div><div class="text-xl font-bold text-text-primary">{{ reproductoresActivos }}</div><div class="text-xs text-text-secondary">Reprod.</div></div></div>
      </div>
    </div>

    <!-- Barra de filtros -->
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <i class="fa fa-filter text-text-tertiary text-xs shrink-0" />
      <select v-model="selectedReproductor" class="select select-sm text-xs w-auto min-w-[100px]" @change="emitFilterChange">
        <option value="">Reproductor</option>
        <option v-for="rep in reproductores" :key="rep.clisuc_nombre" :value="rep.clisuc_nombre">{{ rep.clisuc_nombre }}</option>
      </select>
      <input v-model="filterStartTime" type="time" class="input input-sm w-[72px] text-xs px-1 py-1" />
      <span class="text-text-tertiary text-xs">-</span>
      <input v-model="filterEndTime" type="time" class="input input-sm w-[72px] text-xs px-1 py-1" />
      <input v-model="filterSpotName" type="text" class="input input-sm flex-1 min-w-[80px] text-xs px-2 py-1" placeholder="Spot..." />
      <button v-if="hasActiveFilters" class="btn btn-ghost btn-xs text-danger-400 flex-shrink-0" @click="clearFilters">
        <i class="fa fa-times" />
      </button>
    </div>

    <!-- Tabs de dias -->
    <div class="day-tabs mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      <button v-for="day in visibleDays" :key="day.value" class="day-tab"
        :class="selectedDay === day.value ? 'bg-primary-500 text-white shadow-md' : 'bg-dark-secondary text-text-secondary hover:bg-dark-hover'"
        :disabled="!day.isHabil"
        @click="selectDay(day.value)">
        <span class="text-xs font-semibold">{{ day.text.substring(0,2) }}</span>
        <span class="text-[10px] opacity-70">{{ getDayCount(day.value) }}</span>
      </button>
    </div>

    <!-- Cabecera del dia seleccionado -->
    <div class="flex items-center justify-between mb-2 px-1">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-bold text-text-primary">{{ getDayFullName(selectedDay) }}</h3>
        <span v-if="isToday(selectedDay)" class="badge badge-primary text-xs">Hoy</span>
      </div>
      <div class="text-xs text-text-tertiary">{{ getDayCount(selectedDay) }} salidas programadas</div>
    </div>

    <!-- Grilla del dia -->
    <DayScheduleGrid
      :programaciones="filteredProgramaciones"
      :selected-day="selectedDay"
      :spots="spots"
      @cell-click="handleGridCellClick"
      @program-click="handleGridProgramClick"
      
      @delete="progs => emit('delete', progs)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DayScheduleGrid from './DayScheduleGrid.vue'

const props = defineProps({
  programaciones: { type: Array, default: () => [] },
  weekDays: { type: Array, default: () => [] },
  reproductores: { type: Array, default: () => [] },
  spots: { type: Array, default: () => [] }
})

const emit = defineEmits(['cell-click', 'program-click', 'edit', 'delete', 'filter-change'])

const selectedReproductor = ref('')
const filterStartTime = ref('')
const filterEndTime = ref('')
const filterSpotName = ref('')
const selectedDay = ref((new Date().getDay() + 6) % 7 || getTodayFromWeekDays()) // Lunes=1

// Intenta seleccionar hoy si existe en weekDays
function getTodayFromWeekDays() {
  const today = new Date().getDay()
  const found = props.weekDays.find(d => d.value === today && d.isHabil)
  if (found) return found.value
  const firstHabil = props.weekDays.find(d => d.isHabil)
  return firstHabil ? firstHabil.value : (props.weekDays[0]?.value || 1)
}
onMounted(() => { selectedDay.value = getTodayFromWeekDays() })

const visibleDays = computed(() => {
  return props.weekDays.filter(d => d.isHabil)
})

const filteredProgramaciones = computed(() => {
  let p = props.programaciones
  if (selectedReproductor.value) p = p.filter(x => x.clprsp_usuario === selectedReproductor.value)
  if (filterStartTime.value) p = p.filter(x => x.clprsp_horaDesde && x.clprsp_horaDesde >= filterStartTime.value + ':00')
  if (filterEndTime.value) p = p.filter(x => x.clprsp_horaDesde && x.clprsp_horaDesde <= filterEndTime.value + ':59')
  if (filterSpotName.value) {
    const q = filterSpotName.value.toLowerCase()
    p = p.filter(x => (x._spot?.spo_nombre || '').toLowerCase().includes(q))
  }
  return p
})
const hasActiveFilters = computed(() => selectedReproductor.value || filterStartTime.value || filterEndTime.value || filterSpotName.value)
const clearFilters = () => {
  selectedReproductor.value = ''
  filterStartTime.value = ''
  filterEndTime.value = ''
  filterSpotName.value = ''
}

const totalProgramaciones = computed(() => filteredProgramaciones.value.length)
const uniqueSpots = computed(() => new Set(filteredProgramaciones.value.map(p=>p.clprsp_codigoSpot)).size)
const horariosActivos = computed(() => new Set(filteredProgramaciones.value.map(p=>p.clprsp_horaDesde)).size)
const reproductoresActivos = computed(() => new Set(filteredProgramaciones.value.map(p=>p.clprsp_usuario).filter(Boolean)).size)

const getDayCount = (dv) => filteredProgramaciones.value.filter(p => p.clprsp_numeroDia === dv).length
const getDayFullName = (dv) => props.weekDays.find(d => d.value === dv)?.text || ''
const isToday = (dv) => new Date().getDay() === dv
const selectDay = (dv) => { selectedDay.value = dv }

const handleGridCellClick = ({ day, time, slot }) => {
  emit('cell-click', { day, hour: time, slot })
}
const handleGridProgramClick = (prog) => {
  emit('program-click', prog)
}
const emitFilterChange = () => {
  emit('filter-change', { reproductor: selectedReproductor.value })
}
</script>

<style scoped>
.weekly-calendar { @apply gpu-accelerated; }
.calendar-header { @apply space-y-3; }
.stat-card { @apply flex items-center gap-2.5 p-3 rounded-lg bg-dark-secondary border border-dark-border hover-lift transition-all duration-300 cursor-default; }
.stat-icon { @apply w-10 h-10 rounded-full flex-center flex-shrink-0 shadow-glow-primary; }

/* Day tabs */
.day-tab {
  @apply flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl min-w-[52px] min-h-[48px];
  @apply transition-all duration-200 border border-transparent;
  @apply disabled:opacity-30 disabled:cursor-not-allowed;
}
.day-tab:not(:disabled):hover { @apply -translate-y-0.5; }

.scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
.scrollbar-hide::-webkit-scrollbar { display:none; }
</style>