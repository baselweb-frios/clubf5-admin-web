<template>
  <div class="music-weekly">
    <!-- Cabecera: columnas de dias -->
    <div class="weekly-header">
      <div class="time-corner" />
      <div v-for="day in days" :key="day.value" class="day-col-header" :class="{ today: isToday(day.value) }">
        <span class="text-xs font-semibold">{{ day.short }}</span>
        <span class="text-[10px] opacity-70">{{ dayCount(day.value) }}</span>
      </div>
    </div>

    <!-- Cuerpo: filas de horarios con bloques -->
    <div class="weekly-body">
      <div class="flex">
        <!-- Columna de horas -->
        <div class="time-gutter shrink-0">
          <div v-for="h in hourSlots" :key="h.hour" class="time-row-label" :style="{ height: (h.heightMinutes * PX_PER_MINUTE) + 'px' }">
            <span class="time-text">{{ h.label }}</span>
          </div>
        </div>

        <!-- Columnas de dias con bloques posicionados -->
        <div class="flex-1 flex">
          <div v-for="day in days" :key="day.value" class="day-col relative flex-1 border-r border-dark-border/20 last:border-r-0 min-w-[60px]">
            <!-- Bloques de programaciones -->
            <div v-for="prog in getDayPrograms(day.value)" :key="prog.cod"
              class="music-block absolute left-1 right-1 rounded-md overflow-hidden cursor-pointer z-10"
              :style="blockStyle(prog)"
              @click.stop="selectBlock(prog)">
              <div class="block-fill" :style="{ backgroundColor: getColor(prog.codRadio) }">
                <p class="block-name truncate text-[11px] font-semibold text-white leading-tight">{{ prog.radioNombre }}</p>
                <p class="block-range text-[9px] text-white/70 leading-tight">{{ prog.horaInicio }} - {{ prog.horaFin }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['select'])

const props = defineProps({
  programaciones: { type: Array, default: () => [] },
  days: { type: Array, required: true },        // [{ value: 0, short: 'Dom', ... }, ...]
  horarioCliente: { type: Object, default: () => ({ horaDesde: '00:00', horaHasta: '23:59' }) },
  getColor: { type: Function, default: () => '#3b82f6' }
})

const PX_PER_MINUTE = 2.2

const timeToMinutes = (t) => { if(!t) return 0; const [h,m='0'] = t.split(':'); return parseInt(h)*60+parseInt(m) }

// Genera slots de hora para las filas (cada 60 min)
const hourSlots = computed(() => {
  const start = timeToMinutes(props.horarioCliente.horaDesde)
  const end = timeToMinutes(props.horarioCliente.horaHasta)
  const slots = []
  for (let m = Math.ceil(start/60)*60; m <= end; m += 60) {
    const nextM = Math.min(m + 60, end)
    slots.push({ hour: Math.floor(m/60), label: String(Math.floor(m/60)).padStart(2,'0')+':00', heightMinutes: nextM - m })
  }
  return slots
})

const getDayPrograms = (dv) => props.programaciones.filter(p => p.numeroDia === dv)
const dayCount = (dv) => getDayPrograms(dv).length
const isToday = (dv) => new Date().getDay() === dv

const blockStyle = (prog) => {
  const start = timeToMinutes(props.horarioCliente.horaDesde)
  const inicio = timeToMinutes(prog.horaInicio) - start
  const fin = timeToMinutes(prog.horaFin) - start
  return { top: (inicio * PX_PER_MINUTE) + 'px', height: Math.max(28, (fin - inicio) * PX_PER_MINUTE) + 'px' }
}

const selectBlock = (prog) => emit('select', prog)
</script>

<style scoped>
.music-weekly { @apply rounded-xl border border-dark-border overflow-hidden; }
.weekly-header { @apply flex bg-dark-secondary border-b border-dark-border sticky top-0 z-20; }
.time-corner { @apply w-12 shrink-0; }
.day-col-header { @apply flex-1 py-2 text-center border-r border-dark-border/20 min-w-[60px]; }
.day-col-header.today { @apply bg-primary-500/10 text-primary-400; }

.weekly-body { @apply overflow-y-auto; max-height: calc(100vh - 300px); }
.time-gutter { @apply border-r border-dark-border; }
.time-row-label { @apply flex items-start justify-end pr-1.5; }
.time-text { @apply text-[10px] text-text-tertiary font-mono leading-none pt-0.5; }

.day-col { @apply min-h-[200px]; }

.music-block { transition: transform 0.15s, box-shadow 0.15s; }
.music-block:hover { @apply shadow-lg scale-[1.01] z-20; }
.block-fill { @apply h-full px-1.5 py-1 flex flex-col justify-center border border-white/10 rounded-md; }
</style>