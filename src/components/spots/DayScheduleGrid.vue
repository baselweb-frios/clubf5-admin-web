<template>
  <div class="schedule-grid" ref="gridRef">
    <div class="grid-table">
      <div class="grid-header">
        <div class="grid-header-time" />
        <div v-for="slot in MAX_SLOTS" :key="slot" class="grid-header-slot" :class="getSlotHeaderClass(slot)">
          <span class="text-xs font-semibold">Slot {{ slot }}</span>
        </div>
      </div>

      <!-- Solo filas con programaciones -->
      <div v-for="si in activeSlots" :key="si" class="grid-row grid-row-label">
        <div class="grid-time grid-time-label">
          <span class="time-text">{{ slotIndexToTime(si) }}</span>
        </div>
        <div v-for="sn in MAX_SLOTS" :key="sn" class="grid-cell grid-cell-label" :class="{ 'grid-cell-occupied': hasProgram(si, sn) }">
          <div v-if="hasProgram(si, sn)" class="cell-chip group/chip" :class="getSlotClass(sn)" @click.stop="handleChipClick(si, sn)">
            <span class="cell-chip-name truncate">{{ getProgramName(si, sn) }}</span>
            <span class="cell-chip-time">{{ getProgramTime(si, sn) }}</span>
            <div class="cell-chip-actions">
              <button class="btn btn-ghost btn-icon btn-xs" @click.stop="handleDeleteClick(si, sn)" title="Eliminar">
                <i class="fa fa-trash text-[10px] text-danger-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin programaciones -->
      <div v-if="activeSlots.length === 0" class="text-center py-12 text-text-tertiary text-sm">
        Sin programaciones para este dia
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  programaciones: { type: Array, default: () => [] },
  selectedDay: { type: Number, required: true },
  spots: { type: Array, default: () => [] }
})

const emit = defineEmits(['program-click', 'delete'])

const MAX_SLOTS = 5
const SLOT_MINUTES = 5

const gridRef = ref(null)

const slotIndexToTime = (si) => {
  const m = si * SLOT_MINUTES
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')
}

// Solo slots que tienen al menos una programacion
const activeSlots = computed(() => {
  const used = new Set()
  const dayProgs = props.programaciones.filter(p => p.clprsp_numeroDia === props.selectedDay)
  dayProgs.forEach(p => {
    if (!p.clprsp_horaDesde) return
    const [h, m = '0'] = p.clprsp_horaDesde.split(':')
    const si = Math.floor((parseInt(h) * 60 + parseInt(m)) / SLOT_MINUTES)
    used.add(si)
  })
  return [...used].sort((a, b) => a - b)
})

const programsBySlot = computed(() => {
  const map = new Map()
  const dayProgs = props.programaciones.filter(p => p.clprsp_numeroDia === props.selectedDay)
  dayProgs.forEach(prog => {
    if (!prog.clprsp_horaDesde) return
    const [h, m = '0'] = prog.clprsp_horaDesde.split(':')
    const si = Math.floor((parseInt(h) * 60 + parseInt(m)) / SLOT_MINUTES)
    const sn = prog.clprsp_orden || 1
    if (!map.has(si)) map.set(si, new Map())
    map.get(si).set(sn, prog)
  })
  return map
})

const hasProgram = (si, sn) => programsBySlot.value.get(si)?.has(sn) || false
const getProgramName = (si, sn) => {
  const prog = programsBySlot.value.get(si)?.get(sn)
  const spot = props.spots?.find(s => s.spo_codigo === prog?.clprsp_codigoSpot)
  return spot?.spo_nombre || prog?._spot?.spo_nombre || 'Spot'
}
const getProgramTime = (si, sn) => {
  const prog = programsBySlot.value.get(si)?.get(sn)
  return prog?.clprsp_horaDesde?.substring(0, 5) || ''
}

const handleChipClick = (si, sn) => {
  const prog = programsBySlot.value.get(si)?.get(sn)
  if (prog) emit('program-click', prog)
}
const handleDeleteClick = (si, sn) => {
  const prog = programsBySlot.value.get(si)?.get(sn)
  if (prog) emit('delete', [prog])
}

const getSlotClass = (s) => ['slot-1','slot-2','slot-3','slot-4','slot-5'][((s||1)-1)%5]
const getSlotHeaderClass = (s) => ['slot-header-1','slot-header-2','slot-header-3','slot-header-4','slot-header-5'][((s||1)-1)%5]
</script>

<style scoped>
.schedule-grid { @apply overflow-y-auto rounded-xl border border-dark-border bg-dark-secondary/20; max-height: calc(100vh - 280px); }
.grid-table { @apply w-full; }
.grid-header { @apply flex sticky top-0 z-20 bg-dark-secondary border-b-2 border-dark-border; }
.grid-header-time { @apply w-14 shrink-0; }
.grid-header-slot { @apply flex-1 py-2 text-center border-r border-dark-border last:border-r-0; }
.slot-header-1 { @apply bg-primary-500/10 text-primary-300; }
.slot-header-2 { @apply bg-success-500/10 text-success-300; }
.slot-header-3 { @apply bg-purple-500/10 text-purple-300; }
.slot-header-4 { @apply bg-info-500/10 text-info-300; }
.slot-header-5 { @apply bg-warning-500/10 text-warning-300; }
.grid-row { @apply flex border-b border-dark-border/20; }
.grid-row-label { min-height: 38px; }
.grid-time { @apply w-14 shrink-0 flex items-center justify-end pr-2 border-r border-dark-border/30; }
.grid-time-label { @apply py-1; }
.time-text { @apply text-[10px] font-mono text-text-tertiary leading-none; }
.grid-cell { @apply flex-1 border-r border-dark-border/20 last:border-r-0; @apply flex items-center py-0.5; }
.grid-cell-occupied { @apply cursor-pointer; }

.cell-chip { @apply w-full mx-0.5 rounded px-1.5 py-0.5 flex items-center justify-between gap-1 transition-all duration-150 hover:shadow-md cursor-pointer border-l-2 overflow-hidden; min-height: 32px; }
.cell-chip-name { @apply text-[11px] font-medium leading-tight flex-1; }
.cell-chip-time { @apply text-[9px] font-mono opacity-70 shrink-0; }
.cell-chip-actions { @apply flex gap-0.5 shrink-0 opacity-0 group-hover/chip:opacity-100 transition-opacity; }

.slot-1 { @apply bg-primary-500/25 text-primary-200 border-primary-400; }
.slot-2 { @apply bg-success-500/25 text-success-200 border-success-400; }
.slot-3 { @apply bg-purple-500/25 text-purple-200 border-purple-400; }
.slot-4 { @apply bg-info-500/25 text-info-200 border-info-400; }
.slot-5 { @apply bg-warning-500/25 text-warning-200 border-warning-400; }
</style>