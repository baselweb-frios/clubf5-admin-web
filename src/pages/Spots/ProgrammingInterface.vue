<template>
  <div class="space-y-4">
    <!-- Header compacto -->
    <div class="flex items-center gap-3 mb-2">
      <div class="w-9 h-9 rounded-lg bg-primary-500/20 flex-center shrink-0">
        <i class="fa fa-calendar-check-o text-primary-400" />
      </div>
      <div>
        <h2 class="text-lg font-bold text-text-primary">Programacion Manual</h2>
        <p class="text-xs text-text-tertiary">Selecciona spots, dia y horario</p>
      </div>
      <!-- <div class="ml-auto">
        <button class="btn btn-primary btn-sm" :disabled="!codigoProgramacion || form.selectedSpots.value.length === 0" @click="showBatchModal = true">
          <i class="fa fa-magic" /> Inteligente
        </button>
      </div> -->
    </div>

    <div class="card p-4 sm:p-5 space-y-5">
      <!-- ===== PASO 1: SPOTS (siempre visible) ===== -->
      <div>
        <div class="flex-between mb-3">
          <span class="text-sm font-semibold text-text-primary flex items-center gap-2">
            <i class="fa fa-bullhorn text-primary-400" /> Spots
          </span>
          <span class="badge badge-primary text-xs">{{ form.selectedSpots.value.length }}/{{ form.maxSpotsAllowed }}</span>
        </div>

        <div v-if="form.selectedSpots.value.length > 0" class="flex flex-wrap gap-1.5 mb-3">
          <span v-for="spot in form.selectedSpots.value" :key="spot.spo_codigo" class="badge badge-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-2.5">
            {{ spot.spo_nombre }}
            <button class="hover:bg-white/20 rounded-full p-0.5" @click="form.removeSpot(spot)"><i class="fa fa-times text-[10px]" /></button>
          </span>
        </div>

        <button class="btn btn-secondary btn-sm w-full" @click="showSpotSelectorModal = true">
          <i class="fa fa-plus-circle" /> Seleccionar spots
        </button>
      </div>

      <!-- ===== PASO 2: DIA + REPRODUCTOR ===== -->
      <div class="border-t border-dark-border pt-5">
        <span class="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
          <i class="fa fa-calendar text-primary-400" /> Dia y Reproductor
        </span>

        <!-- Dias como botones grandes -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button v-for="day in clientConfig.weekDays.value" :key="day.value" type="button"
            class="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border min-w-[48px] min-h-[48px] transition-all"
            :class="getDayClass(day)"
            :disabled="!day.isHabil && clientConfig.diasHabiles.value.length > 0"
            @click="filters.toggleDaySelection(day.value)">
            <span class="text-xs font-semibold">{{ day.text.substring(0,2) }}</span>
            <i v-if="filters.isDaySelected(day.value)" class="fa fa-check text-[10px]" />
          </button>
        </div>

        <!-- Reproductor -->
        <select v-model="filters.selectedReproductor.value" class="select select-sm"
          :disabled="form.isReproductor()">
          <option value="">Todos los reproductores</option>
          <option v-for="rep in reproductores" :key="rep.clisuc_nombre" :value="rep.clisuc_nombre">{{ rep.clisuc_nombre }}</option>
        </select>
        <small v-if="form.isReproductor()" class="text-xs text-text-tertiary mt-1 block"><i class="fa fa-info-circle" /> Bloqueado como reproductor</small>
      </div>

      <!-- ===== PASO 3: HORARIO + MINUTOS ===== -->
      <div class="border-t border-dark-border pt-5">
        <span class="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
          <i class="fa fa-clock-o text-primary-400" /> Horario
        </span>

        <MinuteSelectorPanel
          :available-minutes="availableMinutesInHour"
          :programaciones="filteredProgramaciones"
          :selected-days="filters.selectedDays.value"
          :spots-count="form.selectedSpots.value.length"
          :selected-days-text="filters.getSelectedDaysText(clientConfig.weekDays.value)"
          :codigo-programacion="codigoProgramacion"
          @program="handleProgramMinutes"
        />
      </div>

      <!-- Boton pendientes -->
      <button v-if="pending.hasPendingProgramaciones.value"
        class="fixed bottom-6 right-6 z-fixed flex flex-col items-center gap-1 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg transition-all animate-pulse"
        @click="showPendingModal = true">
        <div class="flex items-center gap-2"><i class="fa fa-clock-o" /><span class="font-bold text-lg">{{ pending.pendingCount.value }}</span></div>
        <span class="text-xs opacity-90">Pendientes</span>
      </button>
    </div>

    <!-- Modales -->
    <PendingProgramacionesModal v-model="showPendingModal" :programaciones="pending.pendingProgramaciones.value" :is-saving="pending.isSaving.value" :has-valid-programacion="!!codigoProgramacion" :week-days="clientConfig.weekDays.value" @clear="handleClearPending" @confirm="handleConfirmProgramaciones" />
    <SpotSelectorModal v-model="showSpotSelectorModal" :spots="spots" :selected-spots="form.selectedSpots.value" :max-allowed="form.maxSpotsAllowed" @update:selected-spots="form.selectedSpots.value = $event" @confirm="handleSpotSelectionConfirm" />
    <BatchProgrammingModal v-model="showBatchModal" :selected-spots="form.selectedSpots.value" :week-days="clientConfig.weekDays.value" :dias-habiles="clientConfig.diasHabiles.value" :existing-programaciones="programaciones" @confirm="handleBatchConfirm" />
    <SavingProgressOverlay :is-saving="pending.isSaving.value" :progress="pending.savingProgress.value" :total-to-save="pending.totalToSave.value" :saved-count="pending.savedCount.value" />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useClientConfig } from '@/composables/useClientConfig'
import { useProgramacionForm } from '@/composables/useProgramacionForm'
import { usePendingProgramaciones } from '@/composables/usePendingProgramaciones'
import { useProgramacionFilters } from '@/composables/useProgramacionFilters'
import { useSignalRAuth } from '@/composables/useSignalRAuth'
import { SpotSelectorModal, MinuteSelectorPanel, PendingProgramacionesModal, BatchProgrammingModal } from '@/components/spots'
import SavingProgressOverlay from '@/components/ui/SavingProgressOverlay.vue'

export default {
  name: 'ProgrammingInterface',
  components: { SpotSelectorModal, MinuteSelectorPanel, PendingProgramacionesModal, BatchProgrammingModal, SavingProgressOverlay },
  props: {
    spots: { type: Array, default: () => [] },
    programaciones: { type: Array, default: () => [] },
    reproductores: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    codigoProgramacion: { type: [String, Number], default: null },
    initialReproductor: { type: String, default: '' },
    initialStartTime: { type: String, default: '' },
    initialEndTime: { type: String, default: '' },
    initialSelectedDays: { type: Array, default: () => [] },
    initialSpotCode: { type: Number, default: null }
  },
  emits: ['delete-programaciones', 'refresh-programaciones', 'filter-change'],
  setup(props, { emit }) {
    const signalR = useSignalRAuth()
    const clientConfig = useClientConfig()
    const form = useProgramacionForm()
    const pending = usePendingProgramaciones()
    const filters = useProgramacionFilters()

    const showSpotSelectorModal = ref(false)
    const showPendingModal = ref(false)
    const showBatchModal = ref(false)

    const filteredProgramaciones = computed(() => filters.filterProgramaciones(props.programaciones, { isReproductor: form.isReproductor() }))
    const availableMinutesInHour = computed(() => {
      const cliente = form.getCliente()
      return form.getAvailableMinutesInHour(cliente?.cli_frqspo != 0 ? cliente?.cli_frqspo : 5)
    })

    const getDayClass = (day) => {
      const sel = filters.isDaySelected(day.value)
      const hab = day.isHabil || clientConfig.diasHabiles.value.length === 0
      if (sel) return 'bg-primary-500/20 border-primary-500 text-primary-400'
      if (!hab) return 'bg-dark-secondary/50 border-dark-border/50 text-text-tertiary cursor-not-allowed opacity-40'
      return 'bg-dark-secondary border-dark-border text-text-secondary hover:border-primary-500/50'
    }

    const handleProgramMinutes = (data) => {
      const { hours, minutes, days } = data
      const progs = []
      const rep = form.effectiveReproductor.value
      days.forEach(day => {
        hours.forEach(hour => {
          const h = parseInt(hour.split(':')[0])
          minutes.forEach(minute => {
            const ts = `${String(h).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`
            const ocupados = filteredProgramaciones.value.filter(p => p.clprsp_numeroDia == day && p.clprsp_horaDesde == ts)
            let slot = ocupados.length || 1
            form.selectedSpots.value.forEach(spot => {
              if (slot <= 5) {
                progs.push({ clprsp_numeroDia: day, clprsp_horaDesde: ts, clprsp_codigoSpot: spot.spo_codigo, clprsp_codigoReproductor: rep, clprsp_orden: slot, _spot: spot, _isNew: true, _isPending: true })
                slot++
              }
            })
          })
        })
      })
      pending.addPendingProgramaciones(progs)
    }

    const handleClearPending = () => { pending.clearPendingProgramaciones(); showPendingModal.value = false }

    const resolveSlotConflicts = (pendingList, existingList) => {
      const occupied = new Map()
      existingList.forEach(p => { const k = `${p.clprsp_numeroDia}_${p.clprsp_horaDesde}`; if (!occupied.has(k)) occupied.set(k, new Set()); occupied.get(k).add(Number(p.clprsp_orden)) })
      const resolved = []; let discarded = 0
      pendingList.forEach(p => {
        const k = `${p.clprsp_numeroDia}_${p.clprsp_horaDesde}`; if (!occupied.has(k)) occupied.set(k, new Set())
        const slots = occupied.get(k); let free = null
        for (let s = 1; s <= 5; s++) { if (!slots.has(s)) { free = s; break } }
        if (free) { slots.add(free); resolved.push({ ...p, clprsp_orden: free }) } else { discarded++ }
      })
      return { programaciones: resolved, discarded }
    }

    const handleConfirmProgramaciones = async () => {
      showPendingModal.value = false
      const { programaciones: resolved, discarded } = resolveSlotConflicts(pending.pendingProgramaciones.value, props.programaciones)
      if (discarded) console.warn(`[Slots] ${discarded} descartadas`)
      pending.pendingProgramaciones.value = resolved
      if (!resolved.length) return
      try {
        await pending.confirmAndSaveProgramaciones({
          codigoProgramacion: props.codigoProgramacion,
          effectiveReproductor: form.effectiveReproductor.value,
          onSuccess: async (count) => { await notifyReproductores(count); pending.reloadProgramacionesFromServer(props.codigoProgramacion); emit('refresh-programaciones') },
          onError: (err) => console.error('Error guardando:', err)
        })
      } catch (err) { console.error('Error confirmando:', err) }
    }

    const handleSpotSelectionConfirm = (spots) => { console.log(`${spots.length} spot(s) seleccionados`) }
    const handleBatchConfirm = (grouped) => {
      const all = []; Object.values(grouped).forEach(dayProgs => all.push(...dayProgs))
      pending.addPendingProgramaciones(all); showBatchModal.value = false; showPendingModal.value = true
    }

    const notifyReproductores = async (count) => {
      try {
        if (!signalR?.isConnected.value || !props.reproductores?.length) return
        await Promise.all(props.reproductores.map(r => signalR.sendToGroup(`player_${r.clisuc_nombre}`, 'SpotsUpdated', { type: 'SpotsUpdated', action: 'spots_programmed', timestamp: new Date().toISOString(), data: { count, targetReproductor: form.effectiveReproductor.value || 'Todos' } })))
      } catch (err) { console.warn('[SignalR] Error notificando:', err) }
    }

    const emitFilterChange = () => emit('filter-change', filters.getFilterState())
    watch([filters.selectedReproductor, filters.selectedDays, filters.filterStartTime, filters.filterEndTime, filters.filterSpotName, filters.filterSlot], () => emitFilterChange(), { deep: true })
    watch(() => filters.selectedReproductor.value, (v) => { form.selectedReproductor.value = v }, { immediate: true })

    onMounted(async () => {
      await clientConfig.loadClientConfiguration()
      if (props.initialReproductor) filters.selectedReproductor.value = props.initialReproductor
      if (props.initialSelectedDays?.length) filters.selectedDays.value = [...props.initialSelectedDays]

      // Si llega initialSpotCode (edicion desde calendario), precargar ese spot
      if (props.initialSpotCode) {
        const spot = props.spots.find(s => s.spo_codigo === props.initialSpotCode)
        if (spot) form.selectedSpots.value = [spot]
      }

      if (form.isReproductor()) filters.selectedReproductor.value = form.reproductorUsername()
    })

    return {
      clientConfig, form, pending, filters,
      showSpotSelectorModal, showPendingModal, showBatchModal,
      filteredProgramaciones, availableMinutesInHour,
      getDayClass, handleProgramMinutes, handleClearPending, handleConfirmProgramaciones, handleSpotSelectionConfirm, handleBatchConfirm
    }
  }
}
</script>