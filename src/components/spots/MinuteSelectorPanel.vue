<template>
  <div class="form-group mt-4 p-4 bg-dark-secondary rounded-lg border border-dark-border">
    <!-- Header con toggle -->
    <div class="flex items-center justify-between mb-3">
      <label class="label mb-0">
        <i class="fa fa-clock-o mr-2" />
        Seleccionar hora y minuto de salidas
      </label>
      <button
        class="btn btn-ghost btn-sm"
        :class="{ 'bg-dark-elevated': expanded }"
        @click="expanded = !expanded"
      >
        <i
          class="fa"
          :class="expanded ? 'fa-chevron-up' : 'fa-chevron-down'"
        />
        {{ expanded ? 'Ocultar' : 'Mostrar' }}
      </button>
    </div>

    <!-- Descripción colapsada -->
    <p
v-if="!expanded"
class="text-sm text-text-secondary"
>
      Selecciona una hora específica y múltiples minutos para programar spots.
    </p>

    <!-- Contenido expandido -->
    <div
v-if="expanded"
class="space-y-4"
>
      <!-- Selector de Hora -->
      <div class="form-group">
        <div class="flex items-center justify-between mb-2">
          <label class="label mb-0">Horas disponibles:</label>
          <span
            v-if="selectedHour"
            class="flex items-center gap-1 text-sm text-primary-400"
          >
            <i class="fa fa-clock-o" />
            Hora seleccionada: <strong>{{ selectedHour }}</strong>
          </span>
        </div>
        <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          <div
            v-for="hour in 24"
            :key="hour - 1"
            class="flex items-center justify-center px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all border"
            :class="getHourClass(hour - 1)"
            @click="selectHour(hour - 1)"
          >
            <span>{{ (hour - 1).toString().padStart(2, '0') }}:00</span>
          </div>
        </div>
      </div>

      <!-- Información de días seleccionados -->
      <div
v-if="selectedDays.length > 0"
class="flex items-center gap-2 text-sm text-info-400 bg-info-500/10 p-2 rounded-lg"
>
        <i class="fa fa-calendar" />
        <span>Se programará en: <strong>{{ selectedDaysText }}</strong></span>
      </div>

      <!-- Grid de Minutos -->
      <div
        v-if="selectedHour && selectedDays.length > 0"
        class="space-y-4"
      >
        <!-- Indicadores -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-text-primary">Minutos disponibles:</span>
          <div class="flex items-center gap-4 text-sm">
            <span class="flex items-center gap-1 text-success-400">
              <i class="fa fa-check-circle" />
              Disponibles: <strong>{{ availableCount }}</strong>
            </span>
            <span class="flex items-center gap-1 text-primary-400">
              <i class="fa fa-calendar-check-o" />
              Seleccionados: <strong>{{ selectedMinutes.length }}</strong>
            </span>
          </div>
        </div>

        <!-- Grid de minutos -->
        <div class="grid grid-cols-6 sm:grid-cols-10 gap-2">
          <div
            v-for="minute in availableMinutes"
            :key="minute"
            class="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all border"
            :class="getMinuteClass(minute)"
            @click="toggleMinute(minute)"
          >
            <span>:{{ minute.toString().padStart(2, '0') }}</span>
            <i
v-if="isProgrammed(minute)"
class="fa fa-ban text-xs"
/>
            <i
v-else-if="isSelected(minute)"
class="fa fa-check-circle text-xs"
/>
          </div>
        </div>

        <!-- Controles de selección -->
        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-secondary btn-sm"
            :disabled="availableCount === 0"
            @click="selectAll"
          >
            <i class="fa fa-check-square-o" />
            Seleccionar Todos Disponibles
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="selectedMinutes.length === 0"
            @click="clearSelection"
          >
            <i class="fa fa-times" />
            Limpiar Selección
          </button>
        </div>

        <!-- Preview de programaciones -->
        <div
v-if="selectedMinutes.length > 0"
class="p-4 bg-dark-tertiary rounded-lg border border-dark-border"
>
          <div class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
            <i class="fa fa-eye" />
            <span>Vista previa</span>
          </div>
          <p class="text-sm text-text-secondary mb-2">
            Se programarán <strong class="text-text-primary">{{ spotsCount }}</strong> spot(s) en
            <strong class="text-text-primary">{{ selectedMinutes.length }}</strong> minuto(s) para
            <strong class="text-text-primary">{{ selectedDays.length }}</strong> día(s) seleccionado(s) 
            (<strong class="text-text-primary">{{ selectedDaysText }}</strong>) 
            a las <strong class="text-text-primary">{{ selectedHour }}</strong>.
          </p>
          <p class="text-sm text-text-secondary flex items-center gap-2 mb-3">
            <i class="fa fa-calculator" />
            Total de programaciones:
            <strong class="text-primary-400">{{ totalProgramaciones }}</strong>
          </p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="minute in selectedMinutes.slice(0, 6)"
              :key="minute"
              class="badge badge-primary"
            >
              {{ selectedHour.split(':')[0] }}:{{ minute.toString().padStart(2, '0') }}
            </span>
            <span
v-if="selectedMinutes.length > 6"
class="badge badge-info"
>
              +{{ selectedMinutes.length - 6 }} más
            </span>
          </div>
        </div>

        <!-- Botón de programar -->
        <button
          :disabled="!canProgram"
          class="btn btn-primary w-full"
          @click="programMinutes"
        >
          <i class="fa fa-calendar-plus-o" />
          Agregar {{ totalProgramaciones }} pautas 
        </button>
      </div>

      <!-- Mensaje cuando no hay día/hora seleccionados -->
      <div
v-else
class="text-center py-8 text-text-secondary"
>
        <i class="fa fa-hand-pointer-o text-3xl mb-3 opacity-50" />
        <p
v-if="selectedDays.length === 0"
class="text-sm"
>
          Primero selecciona al menos un día en los filtros globales
        </p>
        <p
v-else
class="text-sm"
>
Selecciona una hora para ver los minutos disponibles
</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'MinuteSelectorPanel',
  props: {
    // Minutos disponibles (intervalos según configuración del cliente)
    availableMinutes: {
      type: Array,
      default: () => {
        // Default: cada 5 minutos
        const minutes = []
        for (let min = 0; min < 60; min += 5) {
          minutes.push(min)
        }
        return minutes
      }
    },
    // Programaciones existentes para verificar slots ocupados
    programaciones: {
      type: Array,
      default: () => []
    },
    // Días seleccionados
    selectedDays: {
      type: Array,
      default: () => []
    },
    // Cantidad de spots seleccionados
    spotsCount: {
      type: Number,
      default: 0
    },
    // Texto descriptivo de los días seleccionados
    selectedDaysText: {
      type: String,
      default: ''
    },
    // Si hay código de programación válido
    codigoProgramacion: {
      type: [String, Number],
      default: null
    },
    // Estado inicial expandido
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  emits: ['program'],
  setup(props, { emit }) {
    // ===== STATE =====
    const expanded = ref(props.initialExpanded)
    const selectedHour = ref('')
    const selectedMinutes = ref([])

    // ===== COMPUTED =====
    const availableCount = computed(() => {
      return props.availableMinutes.filter(min => !isProgrammed(min)).length
    })

    const totalProgramaciones = computed(() => {
      return selectedMinutes.value.length * props.selectedDays.length
    })

    const canProgram = computed(() => {
      return (
        props.codigoProgramacion &&
        selectedMinutes.value.length > 0 &&
        props.spotsCount > 0 &&
        selectedHour.value &&
        props.selectedDays.length > 0
      )
    })

    // ===== METHODS =====
    const isProgrammed = (minute) => {
      if (!selectedHour.value || props.selectedDays.length === 0) {
        return false
      }

      const hour = parseInt(selectedHour.value.split(':')[0])
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      // Contar slots ocupados para este horario
      const slotsOcupados = props.programaciones.filter(prog =>
        props.selectedDays.includes(prog.clprsp_numeroDia) &&
        prog.clprsp_horaDesde.slice(0, 5) === timeString
      ).length

      // Programado si ya hay 5 slots ocupados
      return (slotsOcupados / props.selectedDays.length) >= 5
    }

    const isSelected = (minute) => {
      return selectedMinutes.value.includes(minute)
    }

    const getMinuteClass = (minute) => {
      if (isProgrammed(minute)) {
        return 'bg-dark-hover border-dark-border text-text-tertiary cursor-not-allowed'
      }
      if (isSelected(minute)) {
        return 'bg-primary-500/20 border-primary-500 text-primary-400'
      }
      return 'bg-dark-secondary border-dark-border text-text-secondary hover:border-primary-500/50'
    }

    const toggleMinute = (minute) => {
      if (isProgrammed(minute)) return

      const index = selectedMinutes.value.indexOf(minute)
      if (index > -1) {
        selectedMinutes.value.splice(index, 1)
      } else {
        selectedMinutes.value.push(minute)
      }
      selectedMinutes.value.sort((a, b) => a - b)
    }

    const selectAll = () => {
      selectedMinutes.value = props.availableMinutes.filter(min => !isProgrammed(min))
    }

    const clearSelection = () => {
      selectedMinutes.value = []
    }

    const onHourChange = () => {
      selectedMinutes.value = []
    }

    const selectHour = (hour) => {
      const newValue = `${hour.toString().padStart(2, '0')}:00`
      if (selectedHour.value !== newValue) {
        selectedHour.value = newValue
        onHourChange()
      }
    }

    const getHourClass = (hour) => {
      const hourValue = `${hour.toString().padStart(2, '0')}:00`
      if (selectedHour.value === hourValue) {
        return 'bg-primary-500/20 border-primary-500 text-primary-400'
      }
      return 'bg-dark-secondary border-dark-border text-text-secondary hover:border-primary-500/50'
    }

    const programMinutes = () => {
      if (!canProgram.value) return

      emit('program', {
        hour: selectedHour.value,
        minutes: [...selectedMinutes.value],
        days: [...props.selectedDays]
      })

      // Limpiar selección después de programar
      clearSelection()
    }

    // Limpiar selección si cambian los días
    watch(() => props.selectedDays, () => {
      selectedMinutes.value = []
    }, { deep: true })

    return {
      // State
      expanded,
      selectedHour,
      selectedMinutes,

      // Computed
      availableCount,
      totalProgramaciones,
      canProgram,

      // Methods
      isProgrammed,
      isSelected,
      getMinuteClass,
      getHourClass,
      toggleMinute,
      selectAll,
      clearSelection,
      onHourChange,
      selectHour,
      programMinutes
    }
  }
}
</script>
