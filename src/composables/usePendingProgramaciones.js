import { ref, computed } from 'vue'
import { useProgramacionSpotsStore } from '@/stores/programacionSpots'

/**
 * Composable para manejar programaciones pendientes (preview antes de guardar)
 * Incluye guardado en lotes, progreso y notificaciones SignalR
 */
export function usePendingProgramaciones(options = {}) {
  const {
    initialDisplayCount = 20,
    incrementCount = 20
  } = options

  // ===== STATE =====
  const pendingProgramaciones = ref([])
  const isSaving = ref(false)
  const savingProgress = ref(0)
  const totalToSave = ref(0)
  const savedCount = ref(0)
  const displayedPendingCount = ref(initialDisplayCount)

  // ===== COMPUTED =====

  /**
   * Programaciones pendientes visibles según scroll infinito
   */
  const displayedPendingProgramaciones = computed(() => {
    return pendingProgramaciones.value.slice(0, displayedPendingCount.value)
  })

  /**
   * Verifica si hay más items pendientes para cargar
   */
  const hasMorePendingItems = computed(() => {
    return displayedPendingCount.value < pendingProgramaciones.value.length
  })

  /**
   * Verifica si hay programaciones pendientes
   */
  const hasPendingProgramaciones = computed(() => {
    return pendingProgramaciones.value.length > 0
  })

  /**
   * Cuenta de programaciones pendientes
   */
  const pendingCount = computed(() => {
    return pendingProgramaciones.value.length
  })

  // ===== METHODS: PENDIENTES =====

  /**
   * Agrega programaciones a pendientes
   * @param {Array} programaciones
   */
  const addPendingProgramaciones = (programaciones) => {
    pendingProgramaciones.value.push(...programaciones)
  }

  /**
   * Remueve una programación pendiente
   * @param {number} index
   */
  const removePendingProgramacion = (index) => {
    pendingProgramaciones.value.splice(index, 1)
  }

  /**
   * Limpia todas las programaciones pendientes
   */
  const clearPendingProgramaciones = () => {
    pendingProgramaciones.value = []
    displayedPendingCount.value = initialDisplayCount
  }

  /**
   * Obtiene conteo de días únicos en programaciones pendientes
   * @returns {number}
   */
  const getPendingDaysCount = () => {
    const uniqueDays = new Set(pendingProgramaciones.value.map(p => p.clprsp_numeroDia))
    return uniqueDays.size
  }

  /**
   * Obtiene conteo de spots únicos en programaciones pendientes
   * @returns {number}
   */
  const getPendingSpotsCount = () => {
    const uniqueSpots = new Set(pendingProgramaciones.value.map(p => p.clprsp_codigoSpot))
    return uniqueSpots.size
  }

  /**
   * Maneja el scroll infinito del modal de pendientes
   * @param {Event} event
   */
  const handlePendingScroll = (event) => {
    const container = event.target
    const scrollPosition = container.scrollTop + container.clientHeight
    const scrollHeight = container.scrollHeight

    // Cargar más items cuando estamos cerca del final
    const threshold = Math.min(scrollHeight * 0.8, scrollHeight - 50)
    if (scrollPosition >= threshold && hasMorePendingItems.value) {
      displayedPendingCount.value += incrementCount
    }
  }

  /**
   * Resetea el contador de items mostrados
   */
  const resetDisplayedCount = () => {
    displayedPendingCount.value = initialDisplayCount
  }

  // ===== METHODS: GUARDADO =====

  /**
   * Obtiene el código de programación actual
   * @param {number|string} propCodigoProgramacion - Código desde props
   * @returns {number}
   */
  const getCurrentProgramacionCode = (propCodigoProgramacion) => {
    try {
      // Primero intentar usar la prop si está disponible
      if (propCodigoProgramacion) {
        console.log('✅ Código de programación obtenido desde prop:', propCodigoProgramacion)
        return propCodigoProgramacion
      }

      // Fallback 1: buscar en localStorage.selectedProgramacion
      console.log('⚠️ Prop codigoProgramacion no disponible, buscando en localStorage...')
      const selectedProgData = localStorage.getItem('selectedProgramacion')
      if (selectedProgData) {
        try {
          const selectedProg = JSON.parse(selectedProgData)
          if (selectedProg && selectedProg.clipro_codigo) {
            console.log('✅ Código obtenido desde localStorage.selectedProgramacion:', selectedProg.clipro_codigo)
            return selectedProg.clipro_codigo
          }
        } catch (e) {
          console.warn('Error parseando selectedProgramacion:', e)
        }
      }

      // Fallback 2: buscar en localStorage.listProgSpot
      const progSpotsData = localStorage.getItem('listProgSpot')
      if (!progSpotsData) {
        console.warn('No se encontraron datos de programación en localStorage')
        return 0
      }

      const progSpots = JSON.parse(progSpotsData)
      if (!Array.isArray(progSpots) || progSpots.length === 0) {
        console.warn('El array de programación está vacío o no es válido')
        return 0
      }

      const codigo = progSpots[0].clipro_codigo
      return codigo || 0
    } catch (error) {
      console.error('Error obteniendo código de programación:', error)
      return 0
    }
  }

  /**
   * Normaliza programaciones al formato esperado por la API
   * @param {Array} programaciones
   * @param {number} codigoProgramacion
   * @param {string} effectiveReproductor
   * @returns {Array}
   */
  const normalizeProgramaciones = (programaciones, codigoProgramacion, effectiveReproductor) => {
    return programaciones
      .map(prog => {
        let normalized = {}

        // Formato 1: Sistema de calendario
        if (prog.codigoProgramacion && prog.codigoSpot && prog.horaDesde !== undefined && prog.numeroDia !== undefined) {
          normalized = {
            codigoProgramacion: prog.codigoProgramacion,
            codigoSpot: prog.codigoSpot,
            horaDesde: prog.horaDesde.length === 5 ? `${prog.horaDesde}:00` : prog.horaDesde,
            numeroDia: prog.numeroDia,
            slot: prog.slot || 0,
            codigoProgSpotDestino: prog.codigoProgSpotDestino || 0,
            for: prog.for || effectiveReproductor || 'Todos'
          }
        }
        // Formato 2: Sistema de programación manual (clprsp_*)
        else if (prog.clprsp_numeroDia !== undefined && prog.clprsp_horaDesde && prog.clprsp_codigoSpot) {
          normalized = {
            codigoProgramacion: codigoProgramacion,
            codigoSpot: prog.clprsp_codigoSpot,
            horaDesde: prog.clprsp_horaDesde.length === 5 ? `${prog.clprsp_horaDesde}:00` : prog.clprsp_horaDesde,
            numeroDia: prog.clprsp_numeroDia,
            slot: prog.clprsp_orden || 0,
            codigoProgSpotDestino: 0,
            for: prog.clprsp_codigoReproductor || effectiveReproductor || 'Todos'
          }
        }
        else {
          console.error('Formato de programación desconocido:', prog)
          return null
        }

        return normalized
      })
      .filter(p => p !== null)
  }

  /**
   * Guarda programaciones directamente en el servidor
   * @param {Array} programaciones
   * @param {boolean} updateProgress
   * @returns {Promise}
   */
  const saveProgramacionesDirect = async (programaciones, updateProgress = false) => {
    const programacionSpotsStore = useProgramacionSpotsStore()

    if (!programacionSpotsStore) {
      throw new Error('No se pudo acceder al store de programaciones')
    }

    console.log('💾 Guardando programaciones en el servidor...', programaciones.length)
    const result = await programacionSpotsStore.saveProgramacionesSpot(programaciones)
    console.log('✅ Programaciones guardadas en servidor:', result)

    if (updateProgress) {
      savedCount.value = programaciones.length
      savingProgress.value = 100
    }

    return result
  }

  /**
   * Guarda programaciones en lotes
   * @param {Array} programaciones
   * @param {number} batchSize
   * @param {boolean} updateProgress
   * @returns {Promise}
   */
  const saveProgramacionesInBatches = async (programaciones, batchSize, updateProgress = false) => {
    const totalBatches = Math.ceil(programaciones.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, programaciones.length)
      const batch = programaciones.slice(start, end)

      console.log(`📤 Lote ${i + 1}/${totalBatches}: ${batch.length} registros`)

      try {
        await saveProgramacionesDirect(batch, false)

        if (updateProgress) {
          savedCount.value += batch.length
          savingProgress.value = Math.round((savedCount.value / totalToSave.value) * 100)
        }

        // Pausa entre lotes
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (error) {
        console.error(`❌ Error en lote ${i + 1}:`, error)
        throw error
      }
    }
  }

  /**
   * Envía programaciones al servidor
   * @param {Array} programaciones
   * @param {Object} options
   * @returns {Promise}
   */
  const sendProgramacionesToServer = async (programaciones, {
    codigoProgramacion,
    effectiveReproductor,
    showProgress = false,
    clearPending = false,
    onSuccess = null,
    onError = null
  }) => {
    try {
      // Validaciones
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (!currentUser || !currentUser.unique_name) {
        throw new Error('Debe estar logueado para guardar programaciones')
      }

      const codigo = getCurrentProgramacionCode(codigoProgramacion)
      if (!codigo || codigo === 0) {
        throw new Error('No hay una programación seleccionada. Por favor, seleccione una programación antes de guardar.')
      }

      if (!programaciones || !Array.isArray(programaciones) || programaciones.length === 0) {
        throw new Error('No hay programaciones para guardar')
      }

      console.log('📤 Enviando programaciones al servidor:', {
        total: programaciones.length,
        codigoProgramacion: codigo,
        usuario: currentUser.unique_name
      })

      // Normalizar datos
      const normalizedProgramaciones = normalizeProgramaciones(programaciones, codigo, effectiveReproductor)

      if (normalizedProgramaciones.length === 0) {
        throw new Error('No se pudieron normalizar las programaciones al formato esperado')
      }

      // Configurar progreso
      if (showProgress) {
        isSaving.value = true
        savedCount.value = 0
        totalToSave.value = normalizedProgramaciones.length
        savingProgress.value = 0
      }

      let result

      try {
        // Guardar según cantidad
        if (normalizedProgramaciones.length > 50) {
          console.log(`📦 Guardando ${normalizedProgramaciones.length} programaciones en lotes...`)
          result = await saveProgramacionesInBatches(normalizedProgramaciones, 10, showProgress)
        } else {
          console.log(`💾 Guardando ${normalizedProgramaciones.length} programaciones directamente...`)
          result = await saveProgramacionesDirect(normalizedProgramaciones, showProgress)
        }

        console.log('✅ Programaciones guardadas exitosamente:', result)

        // Limpiar pendientes si se solicitó
        if (clearPending) {
          clearPendingProgramaciones()
        }

        // Callback de éxito
        if (onSuccess) {
          await onSuccess(normalizedProgramaciones.length)
        }

      } finally {
        if (showProgress) {
          isSaving.value = false
          savingProgress.value = 0
          totalToSave.value = 0
          savedCount.value = 0
        }
      }

      return result
    } catch (error) {
      console.error('❌ Error enviando programaciones al servidor:', error)

      if (showProgress) {
        isSaving.value = false
        savingProgress.value = 0
        totalToSave.value = 0
        savedCount.value = 0
      }

      if (onError) {
        onError(error)
      }

      throw error
    }
  }

  /**
   * Confirma y guarda las programaciones pendientes
   * @param {Object} options
   * @returns {Promise}
   */
  const confirmAndSaveProgramaciones = async (options) => {
    if (pendingProgramaciones.value.length === 0) {
      throw new Error('No hay programaciones para guardar')
    }

    return sendProgramacionesToServer(pendingProgramaciones.value, {
      ...options,
      showProgress: true,
      clearPending: true
    })
  }

  /**
   * Recarga las programaciones desde el servidor
   * @param {number} codigoProgramacion
   * @returns {Promise}
   */
  const reloadProgramacionesFromServer = async (codigoProgramacion) => {
    try {
      const programacionSpotsStore = useProgramacionSpotsStore()
      const codigo = getCurrentProgramacionCode(codigoProgramacion)

      if (!programacionSpotsStore || !codigo) {
        console.warn('No se puede recargar programaciones: store o código no disponible')
        return
      }

      console.log('🔄 Recargando programaciones para código:', codigo)
      await programacionSpotsStore.loadProgramacionesByPrograma(codigo, '00:00')
      console.log('✅ Programaciones recargadas correctamente')
    } catch (error) {
      console.error('❌ Error recargando programaciones:', error)
    }
  }

  // ===== METHODS: RESET =====

  /**
   * Resetea todo el estado
   */
  const reset = () => {
    clearPendingProgramaciones()
    isSaving.value = false
    savingProgress.value = 0
    totalToSave.value = 0
    savedCount.value = 0
  }

  return {
    // State
    pendingProgramaciones,
    isSaving,
    savingProgress,
    totalToSave,
    savedCount,
    displayedPendingCount,

    // Computed
    displayedPendingProgramaciones,
    hasMorePendingItems,
    hasPendingProgramaciones,
    pendingCount,

    // Pending methods
    addPendingProgramaciones,
    removePendingProgramacion,
    clearPendingProgramaciones,
    getPendingDaysCount,
    getPendingSpotsCount,
    handlePendingScroll,
    resetDisplayedCount,

    // Save methods
    getCurrentProgramacionCode,
    normalizeProgramaciones,
    sendProgramacionesToServer,
    confirmAndSaveProgramaciones,
    reloadProgramacionesFromServer,
    saveProgramacionesDirect,
    saveProgramacionesInBatches,

    // Reset
    reset
  }
}
