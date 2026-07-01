import { ref, computed } from 'vue'

/**
 * Composable para programación inteligente en lotes
 * Permite programar múltiples spots de forma automática en intervalos regulares
 */
export function useBatchProgramming() {
  // ===== STATE =====
  const batchConfig = ref({
    spotsPerSlot: 1,
    intervalMinutes: 60,
    startTime: '08:00',
    endTime: '22:00',
    selectedDays: [],
    selectedSpots: []
  })

  const isGenerating = ref(false)
  const generatedProgramaciones = ref([])
  const showPreview = ref(false)

  // ===== COMPUTED =====
  const totalSlots = computed(() => {
    if (!batchConfig.value.startTime || !batchConfig.value.endTime) return 0

    const [startHour, startMin] = batchConfig.value.startTime.split(':').map(Number)
    const [endHour, endMin] = batchConfig.value.endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const interval = batchConfig.value.intervalMinutes

    if (interval === 0 || endMinutes <= startMinutes) return 0

    return Math.floor((endMinutes - startMinutes) / interval) + 1
  })

  const totalProgramaciones = computed(() => {
    return totalSlots.value *
           batchConfig.value.selectedDays.length *
           batchConfig.value.spotsPerSlot
  })

  const previewStats = computed(() => {
    const stats = {
      totalSlots: totalSlots.value,
      daysCount: batchConfig.value.selectedDays.length,
      spotsPerSlot: batchConfig.value.spotsPerSlot,
      totalProgramaciones: totalProgramaciones.value,
      intervalDescription: getIntervalDescription(batchConfig.value.intervalMinutes)
    }
    return stats
  })

  // ===== METHODS =====
  const getIntervalDescription = (minutes) => {
    if (minutes < 60) return `${minutes} minutos`
    const hours = minutes / 60
    return hours === 1 ? '1 hora' : `${hours} horas`
  }

  const generateTimeSlots = () => {
    const slots = []
    const [startHour, startMin] = batchConfig.value.startTime.split(':').map(Number)
    const [endHour, endMin] = batchConfig.value.endTime.split(':').map(Number)

    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const interval = batchConfig.value.intervalMinutes

    while (currentMinutes <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const minute = currentMinutes % 60
      slots.push({
        hour,
        minute,
        timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`
      })
      currentMinutes += interval
    }

    return slots
  }

  const generateBatchProgramaciones = (existingProgramaciones = []) => {
    isGenerating.value = true
    const programaciones = []

    try {
      const timeSlots = generateTimeSlots()
      const MAX_SLOTS = 5

      // Crear mapa de slots ocupados
      const occupiedSlots = new Map()
      existingProgramaciones.forEach(prog => {
        const key = `${prog.clprsp_numeroDia}_${prog.clprsp_horaDesde}`
        if (!occupiedSlots.has(key)) {
          occupiedSlots.set(key, new Set())
        }
        occupiedSlots.get(key).add(Number(prog.clprsp_orden))
      })

      // Generar programaciones para cada día y slot de tiempo
      batchConfig.value.selectedDays.forEach(day => {
        timeSlots.forEach(timeSlot => {
          const key = `${day}_${timeSlot.timeString}`

          if (!occupiedSlots.has(key)) {
            occupiedSlots.set(key, new Set())
          }

          const slots = occupiedSlots.get(key)

          // Programar los spots para este horario
          for (let i = 0; i < batchConfig.value.spotsPerSlot; i++) {
            // Buscar el siguiente slot libre
            let freeSlot = null
            for (let s = 1; s <= MAX_SLOTS; s++) {
              if (!slots.has(s)) {
                freeSlot = s
                break
              }
            }

            if (freeSlot === null) {
              console.warn(`No hay slots libres para día=${day} hora=${timeSlot.timeString}`)
              break
            }

            // Seleccionar spot (rotar entre los spots seleccionados)
            const spot = batchConfig.value.selectedSpots[i % batchConfig.value.selectedSpots.length]

            programaciones.push({
              clprsp_numeroDia: day,
              clprsp_horaDesde: timeSlot.timeString,
              clprsp_codigoSpot: spot.spo_codigo,
              clprsp_orden: freeSlot,
              _spot: spot,
              _isNew: true,
              _isPending: true,
              _isBatch: true
            })

            // Marcar slot como ocupado
            slots.add(freeSlot)
          }
        })
      })

      generatedProgramaciones.value = programaciones
      showPreview.value = true

      return programaciones
    } finally {
      isGenerating.value = false
    }
  }

  const clearBatch = () => {
    generatedProgramaciones.value = []
    showPreview.value = false
  }

  const resetConfig = () => {
    batchConfig.value = {
      spotsPerSlot: 1,
      intervalMinutes: 60,
      startTime: '08:00',
      endTime: '22:00',
      selectedDays: [],
      selectedSpots: []
    }
    clearBatch()
  }

  const updateConfig = (config) => {
    batchConfig.value = { ...batchConfig.value, ...config }
  }

  const getPreviewGroupedByDay = () => {
    const grouped = {}

    generatedProgramaciones.value.forEach(prog => {
      const day = prog.clprsp_numeroDia
      if (!grouped[day]) {
        grouped[day] = []
      }
      grouped[day].push(prog)
    })

    // Ordenar por hora dentro de cada día
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        return a.clprsp_horaDesde.localeCompare(b.clprsp_horaDesde)
      })
    })

    return grouped
  }

  return {
    // State
    batchConfig,
    isGenerating,
    generatedProgramaciones,
    showPreview,

    // Computed
    totalSlots,
    totalProgramaciones,
    previewStats,

    // Methods
    generateBatchProgramaciones,
    clearBatch,
    resetConfig,
    updateConfig,
    getPreviewGroupedByDay,
    getIntervalDescription
  }
}
