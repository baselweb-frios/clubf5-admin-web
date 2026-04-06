import { ref, computed } from 'vue'

/**
 * Composable para manejar el formulario de programación de spots
 * Gestiona selección de spots, minutos, hora y reproductor
 */
export function useProgramacionForm(options = {}) {
  const {
    maxSpotsAllowed = 5,
    defaultStartTime = '06:00',
    defaultEndTime = '23:00'
  } = options

  // ===== STATE =====
  const selectedSpots = ref([])
  const selectedMinutes = ref([])
  const selectedHourForMultiMinute = ref('')
  const selectedDays = ref([])
  const selectedReproductor = ref('')
  const startTime = ref(defaultStartTime)
  const endTime = ref(defaultEndTime)
  const showMultiMinuteSelector = ref(true)

  // ===== COMPUTED =====

  /**
   * Verifica si excede el límite de spots
   */
  const exceedsSpotLimit = computed(() => {
    return selectedSpots.value.length > maxSpotsAllowed
  })

  /**
   * Spots restantes que se pueden agregar
   */
  const remainingSpots = computed(() => {
    return Math.max(0, maxSpotsAllowed - selectedSpots.value.length)
  })

  /**
   * Verifica si puede agregar más spots
   */
  const canAddMoreSpots = computed(() => {
    return selectedSpots.value.length < maxSpotsAllowed
  })

  /**
   * Cuenta de minutos seleccionados
   */
  const selectedMinutesCount = computed(() => {
    return selectedMinutes.value.length
  })

  /**
   * Verifica si se puede programar los minutos seleccionados
   * @param {number|string} codigoProgramacion - Código de programación activa
   * @returns {boolean}
   */
  const canProgramSelectedMinutes = (codigoProgramacion) => {
    return (
      codigoProgramacion &&
      selectedMinutes.value.length > 0 &&
      selectedSpots.value.length > 0 &&
      selectedHourForMultiMinute.value &&
      selectedDays.value.length > 0
    )
  }

  /**
   * Calcula la duración total de los spots seleccionados
   * @returns {number} Duración en segundos
   */
  const totalDuration = computed(() => {
    return selectedSpots.value.reduce((total, spot) => {
      const duration = spot.spo_duracion || 0
      return total + (typeof duration === 'string' ? parseInt(duration) : duration)
    }, 0)
  })

  // ===== METHODS: SPOTS =====

  /**
   * Verifica si un spot está seleccionado
   * @param {Object} spot
   * @returns {boolean}
   */
  const isSpotSelected = (spot) => {
    return selectedSpots.value.some(s => s.spo_codigo === spot.spo_codigo)
  }

  /**
   * Agrega un spot a la selección
   * @param {Object} spot
   * @returns {boolean} True si se agregó
   */
  const addSpot = (spot) => {
    if (!canAddMoreSpots.value && !isSpotSelected(spot)) {
      return false
    }

    if (!isSpotSelected(spot)) {
      selectedSpots.value.push(spot)
      return true
    }
    return false
  }

  /**
   * Remueve un spot de la selección
   * @param {Object} spot
   */
  const removeSpot = (spot) => {
    const index = selectedSpots.value.findIndex(s => s.spo_codigo === spot.spo_codigo)
    if (index > -1) {
      selectedSpots.value.splice(index, 1)
    }
  }

  /**
   * Alterna la selección de un spot
   * @param {Object} spot
   * @returns {boolean} True si quedó seleccionado
   */
  const toggleSpotSelection = (spot) => {
    if (isSpotSelected(spot)) {
      removeSpot(spot)
      return false
    } else {
      return addSpot(spot)
    }
  }

  /**
   * Limpia la selección de spots
   */
  const clearSpotSelection = () => {
    selectedSpots.value = []
  }

  // ===== METHODS: MINUTOS =====

  /**
   * Genera array de minutos disponibles basado en intervalo del cliente
   * @param {number} intervaloMinutos - Intervalo en minutos (default: 5)
   * @returns {number[]}
   */
  const getAvailableMinutesInHour = (intervaloMinutos = 5) => {
    const minutes = []
    const interval = intervaloMinutos !== 0 ? intervaloMinutos : 5
    for (let min = 0; min < 60; min += interval) {
      minutes.push(min)
    }
    return minutes
  }

  /**
   * Verifica si un minuto está seleccionado
   * @param {number} minute
   * @returns {boolean}
   */
  const isMinuteSelected = (minute) => {
    return selectedMinutes.value.includes(minute)
  }

  /**
   * Verifica si un minuto específico ya está programado (para un día y hora específicos)
   * @param {number} minute - Minuto a verificar
   * @param {Array} filteredProgramaciones - Lista de programaciones filtradas
   * @param {number[]} days - Días seleccionados
   * @returns {boolean}
   */
  const isMinuteProgrammed = (minute, filteredProgramaciones, days) => {
    if (!selectedHourForMultiMinute.value || !days || days.length === 0) {
      return false
    }

    const hour = parseInt(selectedHourForMultiMinute.value.split(':')[0])
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

    // Contar cuántos slots están ocupados en este horario para los días seleccionados
    const slotsOcupados = filteredProgramaciones.filter(prog =>
      days.includes(prog.clprsp_numeroDia) &&
      prog.clprsp_horaDesde.slice(0, 5) === timeString
    ).length

    // Marcar como programado si ya hay 5 slots ocupados (máximo permitido)
    return (slotsOcupados / days.length) >= 5
  }

  /**
   * Obtiene el número de slots disponibles para un minuto específico
   * @param {number} minute
   * @param {Array} filteredProgramaciones
   * @param {number} day
   * @returns {number}
   */
  const getSlotsDisponiblesEnMinuto = (minute, filteredProgramaciones, day) => {
    if (!selectedHourForMultiMinute.value || !day) {
      return 5
    }

    const hour = parseInt(selectedHourForMultiMinute.value.split(':')[0])
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`

    const slotsOcupados = filteredProgramaciones.filter(prog =>
      prog.clprsp_numeroDia === day &&
      prog.clprsp_horaDesde === timeString
    ).length

    return Math.max(0, 5 - slotsOcupados)
  }

  /**
   * Alterna la selección de un minuto
   * @param {number} minute
   * @param {Object} options
   * @param {Array} options.filteredProgramaciones
   * @param {number[]} options.days
   * @returns {boolean} True si cambió la selección
   */
  const toggleMinuteSelection = (minute, { filteredProgramaciones = [], days = [] } = {}) => {
    // No permitir seleccionar minutos ya programados
    if (isMinuteProgrammed(minute, filteredProgramaciones, days)) {
      return false
    }

    const index = selectedMinutes.value.indexOf(minute)
    if (index > -1) {
      selectedMinutes.value.splice(index, 1)
    } else {
      selectedMinutes.value.push(minute)
    }

    // Ordenar para mantener orden cronológico
    selectedMinutes.value.sort((a, b) => a - b)
    return true
  }

  /**
   * Selecciona todos los minutos disponibles
   * @param {number[]} availableMinutes
   * @param {Array} filteredProgramaciones
   * @param {number[]} days
   */
  const selectAllAvailableMinutes = (availableMinutes, filteredProgramaciones, days) => {
    selectedMinutes.value = availableMinutes.filter(
      min => !isMinuteProgrammed(min, filteredProgramaciones, days)
    )
  }

  /**
   * Limpia la selección de minutos
   */
  const clearMinuteSelection = () => {
    selectedMinutes.value = []
  }

  /**
   * Limpia selección cuando cambia día u hora
   */
  const onDayHourChange = () => {
    selectedMinutes.value = []
  }

  // ===== METHODS: DÍAS =====

  /**
   * Alterna la selección de un día
   * @param {number} dayValue
   */
  const toggleDaySelection = (dayValue) => {
    const index = selectedDays.value.indexOf(dayValue)
    if (index > -1) {
      selectedDays.value.splice(index, 1)
    } else {
      selectedDays.value.push(dayValue)
    }
    selectedDays.value.sort((a, b) => a - b)
  }

  /**
   * Verifica si un día está seleccionado
   * @param {number} dayValue
   * @returns {boolean}
   */
  const isDaySelected = (dayValue) => {
    return selectedDays.value.includes(dayValue)
  }

  /**
   * Establece los días seleccionados
   * @param {number[]} days
   */
  const setSelectedDays = (days) => {
    selectedDays.value = [...days].sort((a, b) => a - b)
  }

  // ===== METHODS: REPRODUCTOR =====

  /**
   * Obtiene el usuario actual desde localStorage
   * @returns {Object}
   */
  const getUsuario = () => {
    return JSON.parse(localStorage.getItem('user') || '{}')
  }

  /**
   * Obtiene el cliente actual desde localStorage
   * @returns {Object}
   */
  const getCliente = () => {
    try {
      const usuario = getUsuario()
      return usuario && usuario.Cliente ? JSON.parse(usuario.Cliente) : {}
    } catch (error) {
      console.error('Error parsing cliente:', error)
      return {}
    }
  }

  /**
   * Verifica si el usuario actual es un reproductor
   * @returns {boolean}
   */
  const isReproductor = () => {
    const currentUser = getUsuario()
    return currentUser?.role === 'Reproductor'
  }

  /**
   * Obtiene el username del reproductor logeado
   * @returns {string}
   */
  const reproductorUsername = () => {
    const currentUser = getUsuario()
    return currentUser?.unique_name || ''
  }

  /**
   * Obtiene el reproductor efectivo (el que se usa en las programaciones)
   * @returns {string|null}
   */
  const effectiveReproductor = computed(() => {
    if (isReproductor()) {
      return reproductorUsername()
    }
    return selectedReproductor.value || null
  })

  // ===== METHODS: TIME SLOTS =====

  /**
   * Genera los slots de tiempo disponibles
   * @returns {Array}
   */
  const getTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({
          value: timeString,
          label: timeString,
          hour,
          minute
        })
      }
    }
    return slots
  }

  // ===== METHODS: PROGRAMACIÓN =====

  /**
   * Genera las programaciones a partir de la selección actual
   * @param {Object} options
   * @param {number|string} options.codigoProgramacion
   * @param {Array} options.filteredProgramaciones
   * @returns {Array} Array de programaciones listas para enviar
   */
  const generateProgramaciones = ({ filteredProgramaciones = [] }) => {
    const programaciones = []
    const hour = parseInt(selectedHourForMultiMinute.value.split(':')[0])
    const reproductor = effectiveReproductor.value

    selectedDays.value.forEach(day => {
      selectedMinutes.value.forEach(minute => {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`

        // Calcular slots ocupados
        const ocupados = filteredProgramaciones.filter(prog => {
          return prog.clprsp_numeroDia == day && prog.clprsp_horaDesde == timeString
        })
        let slot = ocupados.length > 0 ? ocupados.length : 1

        selectedSpots.value.forEach(spot => {
          if (slot <= 5) {
            programaciones.push({
              clprsp_numeroDia: day,
              clprsp_horaDesde: timeString,
              clprsp_codigoSpot: spot.spo_codigo,
              clprsp_codigoReproductor: reproductor,
              clprsp_orden: slot,
              // Datos adicionales para visualización
              _spot: spot,
              _isNew: true,
              _isPending: true
            })
            slot++
          }
        })
      })
    })

    return programaciones
  }

  // ===== METHODS: RESET =====

  /**
   * Resetea todo el formulario
   */
  const resetForm = () => {
    selectedSpots.value = []
    selectedMinutes.value = []
    selectedHourForMultiMinute.value = ''
    selectedDays.value = []
    selectedReproductor.value = ''
    startTime.value = defaultStartTime
    endTime.value = defaultEndTime
  }

  /**
   * Inicializa el formulario con valores
   * @param {Object} values
   */
  const initializeForm = (values = {}) => {
    if (values.reproductor) selectedReproductor.value = values.reproductor
    if (values.startTime) startTime.value = values.startTime
    if (values.endTime) endTime.value = values.endTime
    if (values.selectedDays) selectedDays.value = [...values.selectedDays]
  }

  return {
    // State
    selectedSpots,
    selectedMinutes,
    selectedHourForMultiMinute,
    selectedDays,
    selectedReproductor,
    startTime,
    endTime,
    showMultiMinuteSelector,

    // Computed
    exceedsSpotLimit,
    remainingSpots,
    canAddMoreSpots,
    selectedMinutesCount,
    totalDuration,
    effectiveReproductor,

    // Constants
    maxSpotsAllowed,

    // Spot methods
    isSpotSelected,
    addSpot,
    removeSpot,
    toggleSpotSelection,
    clearSpotSelection,

    // Minute methods
    getAvailableMinutesInHour,
    isMinuteSelected,
    isMinuteProgrammed,
    getSlotsDisponiblesEnMinuto,
    toggleMinuteSelection,
    selectAllAvailableMinutes,
    clearMinuteSelection,
    onDayHourChange,

    // Day methods
    toggleDaySelection,
    isDaySelected,
    setSelectedDays,

    // User methods
    getUsuario,
    getCliente,
    isReproductor,
    reproductorUsername,

    // Time methods
    getTimeSlots,
    canProgramSelectedMinutes,

    // Programación
    generateProgramaciones,

    // Reset
    resetForm,
    initializeForm
  }
}
