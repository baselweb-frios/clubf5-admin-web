<template>
  <div class="space-y-6">
    <!-- Alerta de programación no seleccionada -->
    <div
v-if="!codigoProgramacion"
class="alert alert-warning"
>
      <i class="fa fa-exclamation-triangle text-xl" />
      <div class="flex-1">
        <h4 class="font-semibold mb-1">
No hay programación seleccionada
</h4>
        <p class="text-sm opacity-90">
Debes seleccionar o crear una programación antes de poder programar spots.
</p>
      </div>
    </div>

    <!-- Panel de programación -->
    <div class="card">
      <div class="flex-between mb-6">
        <h3 class="text-xl font-semibold text-text-primary">
Pautar salidas de spots
</h3>
      </div>

      <!-- Selector de spots -->
      <div class="form-group mb-4">
        <div class="space-y-3">
          <!-- Spots seleccionados -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="spot in form.selectedSpots.value"
              :key="spot.spo_codigo"
              class="badge badge-primary inline-flex items-center gap-2"
            >
              {{ spot.spo_nombre }}
              <button
                class="hover:bg-white/20 rounded p-0.5 transition-colors"
                aria-label="Remover spot"
                @click="form.removeSpot(spot)"
              >
                ×
              </button>
            </span>
          </div>

          <!-- Indicador de spots seleccionados -->
          <div
            class="p-3 rounded-lg border transition-colors"
            :class="form.exceedsSpotLimit.value ? 'bg-danger-500/10 border-danger-500/30' : 'bg-dark-secondary border-dark-border'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-text-secondary">
                <i class="fa fa-list" />
                <span>Spots Seleccionados:</span>
              </div>
              <div class="flex items-center gap-1 font-semibold">
                <span :class="form.exceedsSpotLimit.value ? 'text-danger-400' : 'text-text-primary'">
                  {{ form.selectedSpots.value.length }}
                </span>
                <span class="text-text-tertiary">/</span>
                <span class="text-text-secondary">{{ form.maxSpotsAllowed }}</span>
              </div>
            </div>
            <div
v-if="!form.exceedsSpotLimit.value"
class="mt-2"
>
              <small class="text-success-400 flex items-center gap-1">
                <i class="fa fa-check-circle" />
                Puedes agregar {{ form.remainingSpots.value }} spot{{ form.remainingSpots.value !== 1 ? 's' : '' }} más
              </small>
            </div>
            <div
v-if="form.exceedsSpotLimit.value"
class="mt-2"
>
              <small class="text-danger-400 flex items-center gap-1">
                <i class="fa fa-exclamation-triangle" />
                Límite de spots alcanzado
              </small>
            </div>
          </div>

          <!-- Botón para abrir modal de selección de spots -->
          <button
            class="btn btn-secondary w-full flex items-center justify-center gap-2"
            @click="showSpotSelectorModal = true"
          >
            <i class="fa fa-plus-circle" />
            <span>Seleccionar Spots</span>
            <span class="badge badge-info ml-2">{{ spots.length }} disponibles</span>
          </button>
        </div>

        <!-- Selector de reproductor -->
        <div class="form-group mt-4">
          <label class="label">
            Reproductor
            <span
v-if="form.isReproductor()"
class="badge badge-info ml-2 text-xs"
>Bloqueado</span>
          </label>
          <select
            v-model="filters.selectedReproductor.value"
            class="select"
            aria-label="Seleccionar reproductor"
            :disabled="form.isReproductor()"
            :class="{ 'opacity-50 cursor-not-allowed': form.isReproductor() }"
          >
            <option value="">
Todos
</option>
            <option
              v-for="reproductor in reproductores"
              :key="reproductor.clisuc_nombre"
              :value="reproductor.clisuc_nombre"
            >
              {{ reproductor.clisuc_nombre }}
            </option>
          </select>
          <small
v-if="form.isReproductor()"
class="text-xs text-text-secondary mt-1 block"
>
            <i class="fa fa-info-circle mr-1" />
            Como reproductor solo se puede programar para si mismo
          </small>
        </div>

        <!-- Configuración de días de la semana -->
        <div class="form-group mt-4">
          <label class="label">
            Días de la Semana
            <span
v-if="clientConfig.diasHabiles.value.length > 0"
class="badge badge-info ml-2 text-xs"
>
              Días hábiles de tu comercio
            </span>
          </label>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="day in clientConfig.weekDays.value"
              :key="day.value"
              class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all"
              :class="getDayClass(day)"
              :title="!day.isHabil && clientConfig.diasHabiles.value.length > 0 ? 'Día no hábil según configuración del cliente' : ''"
              @click="filters.toggleDaySelection(day.value)"
            >
              <input
                type="checkbox"
                :checked="filters.isDaySelected(day.value)"
                :disabled="!day.isHabil && clientConfig.diasHabiles.value.length > 0"
                class="checkbox"
              >
              <span class="text-sm font-medium">{{ day.text }}</span>
              <i
v-if="!day.isHabil && clientConfig.diasHabiles.value.length > 0"
class="fa fa-ban text-xs opacity-70"
/>
            </div>
          </div>
          <div
v-if="filters.selectedDays.value.length > 0"
class="mt-2"
>
            <small class="text-text-secondary">
              Días seleccionados: {{ filters.getSelectedDaysText(clientConfig.weekDays.value) }}
            </small>
          </div>
          <!-- Advertencia de días inválidos -->
          <div
v-if="clientConfig.hasInvalidDays(filters.selectedDays.value)"
class="alert alert-warning mt-2"
>
            <i class="fa fa-exclamation-triangle" />
            <span>
              Has seleccionado días no hábiles:
              <strong>{{ clientConfig.getInvalidDays(filters.selectedDays.value).map(d => clientConfig.getWeekDayName(d)).join(', ') }}</strong>.
              Por favor, selecciona solo días hábiles configurados.
            </span>
          </div>
        </div>

        <!-- Selector de Minutos -->
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

      <!-- Botón Flotante para Programaciones Pendientes -->
      <button
        v-if="pending.hasPendingProgramaciones.value"
        class="fixed bottom-6 right-6 z-fixed flex flex-col items-center gap-1 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg transition-all animate-pulse"
        @click="showPendingModal = true"
      >
        <div class="flex items-center gap-2">
          <i class="fa fa-clock-o" />
          <span class="font-bold text-lg">{{ pending.pendingCount.value }}</span>
        </div>
        <span class="text-xs opacity-90">Pendientes</span>
      </button>
    </div>

    <!-- Modal de Programaciones Pendientes -->
    <PendingProgramacionesModal
      v-model="showPendingModal"
      :programaciones="pending.pendingProgramaciones.value"
      :is-saving="pending.isSaving.value"
      :has-valid-programacion="!!codigoProgramacion"
      :week-days="clientConfig.weekDays.value"
      @clear="handleClearPending"
      @confirm="handleConfirmProgramaciones"
    />

    <!-- Tabla de Programaciones -->
    <ProgramacionesTable
      class="mt-6"
      :programaciones="filteredProgramaciones"
      :displayed-programaciones="displayedProgramaciones"
      :loading="loading"
      :has-active-filters="filters.hasActiveFilters.value"
      :active-filters-count="filters.activeFiltersCount.value"
      :filter-start-time="filters.filterStartTime.value"
      :filter-end-time="filters.filterEndTime.value"
      :filter-spot-name="filters.filterSpotName.value"
      :filter-slot="filters.filterSlot.value"
      :filter-days="filters.selectedDays.value"
      :filter-reproductor="filters.selectedReproductor.value"
      :reproductores="reproductores"
      :current-page="filters.currentPage.value"
      :page-size="filters.pageSize.value"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      :pagination-info="paginationInfo"
      :week-days="clientConfig.weekDays.value"
      @update:filter-start-time="filters.filterStartTime.value = $event"
      @update:filter-end-time="filters.filterEndTime.value = $event"
      @update:filter-spot-name="filters.filterSpotName.value = $event"
      @update:filter-slot="filters.filterSlot.value = $event"
      @update:filter-days="filters.selectedDays.value = $event"
      @update:filter-reproductor="filters.selectedReproductor.value = $event"
      @update:page-size="handlePageSizeChange($event)"
      @go-to-page="filters.goToPage($event)"
      @clear-filters="filters.clearAllFilters()"
      @clear-time-filter="filters.clearTimeFilter()"
      @delete-selected="$emit('delete-programaciones', $event)"
    />

    <!-- Modal de Selección de Spots -->
    <SpotSelectorModal
      v-model="showSpotSelectorModal"
      :spots="spots"
      :selected-spots="form.selectedSpots.value"
      :max-allowed="form.maxSpotsAllowed"
      @update:selected-spots="form.selectedSpots.value = $event"
      @confirm="handleSpotSelectionConfirm"
    />

    <!-- Overlay de Progreso de Guardado -->
    <SavingProgressOverlay
      :is-saving="pending.isSaving.value"
      :progress="pending.savingProgress.value"
      :total-to-save="pending.totalToSave.value"
      :saved-count="pending.savedCount.value"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

// Composables
import { useClientConfig } from '@/composables/useClientConfig'
import { useProgramacionForm } from '@/composables/useProgramacionForm'
import { usePendingProgramaciones } from '@/composables/usePendingProgramaciones'
import { useProgramacionFilters } from '@/composables/useProgramacionFilters'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

// Components
import { SpotSelectorModal, MinuteSelectorPanel, PendingProgramacionesModal, ProgramacionesTable } from '@/components/spots'
import SavingProgressOverlay from '@/components/ui/SavingProgressOverlay.vue'

export default {
  name: 'ProgrammingInterface',
  components: {
    SpotSelectorModal,
    MinuteSelectorPanel,
    PendingProgramacionesModal,
    ProgramacionesTable,
    SavingProgressOverlay
  },
  props: {
    spots: {
      type: Array,
      default: () => []
    },
    programaciones: {
      type: Array,
      default: () => []
    },
    reproductores: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    codigoProgramacion: {
      type: [String, Number],
      default: null
    },
    initialReproductor: {
      type: String,
      default: ''
    },
    initialStartTime: {
      type: String,
      default: ''
    },
    initialEndTime: {
      type: String,
      default: ''
    },
    initialSelectedDays: {
      type: Array,
      default: () => []
    }
  },
  emits: ['delete-programaciones', 'refresh-programaciones', 'filter-change'],
  setup(props, { emit }) {
    // ===== COMPOSABLES =====
    const signalR = useSignalRAuth()
    const clientConfig = useClientConfig()
    const form = useProgramacionForm()
    const pending = usePendingProgramaciones()
    const filters = useProgramacionFilters()

    // ===== LOCAL STATE =====
    const showSpotSelectorModal = ref(false)
    const showPendingModal = ref(false)

    // ===== COMPUTED =====
    const filteredProgramaciones = computed(() => {
      return filters.filterProgramaciones(props.programaciones, {
        isReproductor: form.isReproductor()
      })
    })

    const displayedProgramaciones = computed(() => {
      return filters.getPaginatedProgramaciones(filteredProgramaciones.value)
    })

    const totalPages = computed(() => {
      return filters.getTotalPages(filteredProgramaciones.value.length)
    })

    const visiblePages = computed(() => {
      return filters.getVisiblePages(totalPages.value)
    })

    const paginationInfo = computed(() => {
      return filters.getPaginationInfo(filteredProgramaciones.value.length)
    })

    const availableMinutesInHour = computed(() => {
      const cliente = form.getCliente()
      const intervaloMinutos = cliente?.cli_frqspo != 0 ? cliente?.cli_frqspo : 5
      return form.getAvailableMinutesInHour(intervaloMinutos)
    })

    // ===== METHODS =====
    const getDayClass = (day) => {
      const isSelected = filters.isDaySelected(day.value)
      const isHabil = day.isHabil || clientConfig.diasHabiles.value.length === 0

      if (isSelected) {
        return 'bg-primary-500/20 border-primary-500 text-primary-400'
      }
      if (!isHabil) {
        return 'bg-dark-secondary/50 border-dark-border/50 text-text-tertiary cursor-not-allowed opacity-50'
      }
      return 'bg-dark-secondary border-dark-border text-text-secondary hover:border-dark-hover'
    }

    const handleProgramMinutes = (data) => {
      const { hours, minutes, days } = data

      const programaciones = []
      const reproductor = form.effectiveReproductor.value

      days.forEach(day => {
        hours.forEach(hour => {
          const hourNum = parseInt(hour.split(':')[0])
          minutes.forEach(minute => {
            const timeString = `${hourNum.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`

            // Calcular slots ocupados
            const ocupados = filteredProgramaciones.value.filter(prog => {
              return prog.clprsp_numeroDia == day && prog.clprsp_horaDesde == timeString
            })
            let slot = ocupados.length > 0 ? ocupados.length : 1

            form.selectedSpots.value.forEach(spot => {
              if (slot <= 5) {
                programaciones.push({
                  clprsp_numeroDia: day,
                  clprsp_horaDesde: timeString,
                  clprsp_codigoSpot: spot.spo_codigo,
                  clprsp_codigoReproductor: reproductor,
                  clprsp_orden: slot,
                  _spot: spot,
                  _isNew: true,
                  _isPending: true
                })
                slot++
              }
            })
          })
        })
      })

      pending.addPendingProgramaciones(programaciones)
    }

    const handleClearPending = () => {
      pending.clearPendingProgramaciones()
      showPendingModal.value = false
    }

    /**
     * Resuelve conflictos de slots antes de guardar.
     * - Si el slot ya está ocupado, busca el primer slot libre (1-5).
     * - Si no hay slots libres para ese horario/día, descarta la programación.
     * @param {Array} pendingList - Programaciones pendientes a resolver
     * @param {Array} existingList - Programaciones ya guardadas en el servidor
     * @returns {{ programaciones: Array, discarded: number }}
     */
    const resolveSlotConflicts = (pendingList, existingList) => {
      const MAX_SLOTS = 5

      // Mapa: "day_timeString" => Set de slots ocupados
      const occupiedSlots = new Map()

      // Cargar slots ya guardados
      existingList.forEach(prog => {
        const key = `${prog.clprsp_numeroDia}_${prog.clprsp_horaDesde}`
        if (!occupiedSlots.has(key)) {
          occupiedSlots.set(key, new Set())
        }
        const slot = prog.clprsp_orden
        if (slot != null) {
          occupiedSlots.get(key).add(Number(slot))
        }
      })

      const resolved = []
      let discarded = 0

      pendingList.forEach(prog => {
        const key = `${prog.clprsp_numeroDia}_${prog.clprsp_horaDesde}`
        if (!occupiedSlots.has(key)) {
          occupiedSlots.set(key, new Set())
        }
        const slots = occupiedSlots.get(key)

        // Buscar el primer slot libre entre 1 y MAX_SLOTS
        let freeSlot = null
        for (let s = 1; s <= MAX_SLOTS; s++) {
          if (!slots.has(s)) {
            freeSlot = s
            break
          }
        }

        if (freeSlot !== null) {
          slots.add(freeSlot)
          resolved.push({ ...prog, clprsp_orden: freeSlot })
        } else {
          discarded++
          console.warn(
            `[Slots] Descartada programación (sin slots libres): día=${prog.clprsp_numeroDia} hora=${prog.clprsp_horaDesde} spot=${prog.clprsp_codigoSpot}`
          )
        }
      })

      return { programaciones: resolved, discarded }
    }

    const handleConfirmProgramaciones = async () => {
      showPendingModal.value = false

      // Resolver conflictos de slots contra las programaciones existentes
      const { programaciones: resolved, discarded } = resolveSlotConflicts(
        pending.pendingProgramaciones.value,
        props.programaciones
      )

      if (discarded > 0) {
        console.warn(`[Slots] ${discarded} programación(es) descartada(s) por no tener slots disponibles.`)
      }

      // Actualizar la lista de pendientes con los slots resueltos
      pending.pendingProgramaciones.value = resolved

      if (pending.pendingProgramaciones.value.length === 0) {
        console.warn('[Slots] Todas las programaciones fueron descartadas por slots ocupados.')
        return
      }

      try {
        await pending.confirmAndSaveProgramaciones({
          codigoProgramacion: props.codigoProgramacion,
          effectiveReproductor: form.effectiveReproductor.value,
          onSuccess: async (count) => {
            // Recargar programaciones, notificar y emitir refresh
            await notifyReproductores(count)
            pending.reloadProgramacionesFromServer(props.codigoProgramacion)
            emit('refresh-programaciones')
          },
          onError: (error) => {
            console.error('Error guardando programaciones:', error)
          }
        })
      } catch (error) {
        console.error('Error confirmando programaciones:', error)
      }
    }

    const handleSpotSelectionConfirm = (spots) => {
      console.log(`${spots.length} spot(s) seleccionado(s)`)
    }

    const handlePageSizeChange = (newSize) => {
      filters.pageSize.value = newSize
      filters.handlePageSizeChange()
    }

    const notifyReproductores = async (count, action = 'spots_programmed') => {
      try {
        if (!signalR || !signalR.isConnected.value) {
          console.warn('[SignalR] No conectado, no se puede notificar reproductores')
          return
        }

        if (!props.reproductores || props.reproductores.length === 0) {
          console.warn('[SignalR] No hay reproductores disponibles para notificar')
          return
        }

        const currentUser = form.getUsuario()
        const cliente = form.getCliente()
        const effectiveReproductor = form.effectiveReproductor.value

        const notificationData = {
          type: 'SpotsUpdated',
          action,
          timestamp: new Date().toISOString(),
          source: {
            userId: currentUser.unique_name,
            clientId: cliente?.cli_codigo,
            clientName: cliente?.cli_nombre
          },
          data: {
            count,
            targetReproductor: effectiveReproductor || 'Todos'
          }
        }

        console.log(`[SignalR] Enviando notificación '${action}' a ${props.reproductores.length} reproductor(es):`, notificationData)

        // Siempre enviar a TODOS los reproductores para que cada uno actualice
        await Promise.all(
          props.reproductores.map(r =>
            signalR.sendToGroup(`player_${r.clisuc_nombre}`, 'SpotsUpdated', notificationData)
          )
        )

        console.log(`[SignalR] ✅ Notificación enviada a ${props.reproductores.length} reproductor(es)`)
      } catch (error) {
        console.warn('[SignalR] Error notificando reproductores:', error)
      }
    }

    const emitFilterChange = () => {
      emit('filter-change', filters.getFilterState())
    }

    // ===== WATCHERS =====
    watch([filters.selectedReproductor, filters.selectedDays, filters.filterStartTime, filters.filterEndTime, filters.filterSpotName, filters.filterSlot], () => {
      emitFilterChange()
    }, { deep: true })

    // Sincronizar el reproductor seleccionado en filtros con el del formulario
    // para que effectiveReproductor funcione correctamente al programar
    watch(
      () => filters.selectedReproductor.value,
      (newValue) => {
        form.selectedReproductor.value = newValue
      },
      { immediate: true }
    )

    // ===== LIFECYCLE =====
    onMounted(async () => {
      // Cargar configuración del cliente
      await clientConfig.loadClientConfiguration()

      // Inicializar filtros
      if (props.initialReproductor) {
        filters.selectedReproductor.value = props.initialReproductor
      }
      if (props.initialStartTime) {
        form.startTime.value = props.initialStartTime
      }
      if (props.initialEndTime) {
        form.endTime.value = props.initialEndTime
      }
      if (props.initialSelectedDays?.length > 0) {
        filters.selectedDays.value = [...props.initialSelectedDays]
      }

      // Si es reproductor, setear automáticamente
      if (form.isReproductor()) {
        filters.selectedReproductor.value = form.reproductorUsername()
      }
    })

    return {
      // Composables
      clientConfig,
      form,
      pending,
      filters,

      // Local state
      showSpotSelectorModal,
      showPendingModal,

      // Computed
      filteredProgramaciones,
      displayedProgramaciones,
      totalPages,
      visiblePages,
      paginationInfo,
      availableMinutesInHour,

      // Methods
      getDayClass,
      handleProgramMinutes,
      handleClearPending,
      handleConfirmProgramaciones,
      handleSpotSelectionConfirm,
      handlePageSizeChange
    }
  }
}
</script>
