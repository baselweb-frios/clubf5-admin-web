import { ref, computed, watch } from 'vue'

/**
 * Composable para manejar filtros y paginación de programaciones
 */
export function useProgramacionFilters(options = {}) {
  const {
    initialPageSize = 25,
    storageKey = 'programacionesPageSize'
  } = options

  // ===== STATE =====
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const filterStartTime = ref('')
  const filterEndTime = ref('')
  const filterSpotName = ref('')
  const filterSlot = ref('')
  const selectedReproductor = ref('')
  const selectedDays = ref([])
  const selectedProgramaciones = ref([])

  // Cargar preferencia de tamaño de página guardada
  const savedPageSize = localStorage.getItem(storageKey)
  if (savedPageSize) {
    pageSize.value = parseInt(savedPageSize)
  }

  // ===== COMPUTED =====

  /**
   * Verifica si hay filtros activos
   */
  const hasActiveFilters = computed(() => {
    const hasDaysFilter = selectedDays.value.length > 0 && selectedDays.value.length < 7
    return !!(
      selectedReproductor.value ||
      hasDaysFilter ||
      filterSpotName.value ||
      filterSlot.value ||
      (filterStartTime.value && filterEndTime.value)
    )
  })

  /**
   * Cuenta los filtros activos
   */
  const activeFiltersCount = computed(() => {
    let count = 0
    if (selectedReproductor.value) count++
    if (selectedDays.value.length > 0 && selectedDays.value.length < 7) count++
    if (filterSpotName.value) count++
    if (filterSlot.value) count++
    if (filterStartTime.value && filterEndTime.value) count++
    return count
  })

  // ===== METHODS =====

  /**
   * Filtra las programaciones según los criterios establecidos
   * @param {Array} programaciones - Lista de programaciones a filtrar
   * @param {Object} options - Opciones adicionales
   * @returns {Array} Programaciones filtradas y ordenadas
   */
  const filterProgramaciones = (programaciones, { isReproductor = false } = {}) => {
    let filtered = [...programaciones]

    // Filtro por reproductor (no aplicar si el usuario es reproductor)
    if (selectedReproductor.value && !isReproductor) {
      filtered = filtered.filter(
        prog =>
          prog.clprsp_usuario === selectedReproductor.value ||
          (prog.clprsp_usuario === null && selectedReproductor.value === 'Todos')
      )
    }

    // Filtro por días de la semana (no aplicar si todos los días)
    if (selectedDays.value.length > 0 && selectedDays.value.length < 7) {
      filtered = filtered.filter(prog => selectedDays.value.includes(prog.clprsp_numeroDia))
    }

    // Filtro por nombre de spot
    if (filterSpotName.value) {
      const searchTerm = filterSpotName.value.toLowerCase().trim()
      filtered = filtered.filter(prog =>
        prog.spo_nombre && prog.spo_nombre.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por slot
    if (filterSlot.value) {
      const slotNum = parseInt(filterSlot.value)
      filtered = filtered.filter(prog => prog.clprsp_orden === slotNum)
    }

    // Filtro por rango horario
    if (filterStartTime.value && filterEndTime.value) {
      filtered = filtered.filter(prog => {
        const progTime = prog.clprsp_horaDesde.slice(0, 5)
        return progTime >= filterStartTime.value && progTime <= filterEndTime.value
      })
    }

    // Ordenar: día → horario → slot
    filtered.sort((a, b) => {
      if (a.clprsp_numeroDia !== b.clprsp_numeroDia) {
        return a.clprsp_numeroDia - b.clprsp_numeroDia
      }
      if (a.clprsp_horaDesde !== b.clprsp_horaDesde) {
        return a.clprsp_horaDesde.localeCompare(b.clprsp_horaDesde)
      }
      return (a.clprsp_orden || 0) - (b.clprsp_orden || 0)
    })

    return filtered
  }

  /**
   * Obtiene programaciones paginadas
   * @param {Array} filteredProgramaciones
   * @returns {Array}
   */
  const getPaginatedProgramaciones = (filteredProgramaciones) => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredProgramaciones.slice(start, end)
  }

  /**
   * Calcula el total de páginas
   * @param {number} totalItems
   * @returns {number}
   */
  const getTotalPages = (totalItems) => {
    return Math.ceil(totalItems / pageSize.value) || 1
  }

  /**
   * Genera las páginas visibles en el paginador
   * @param {number} totalPages
   * @returns {Array}
   */
  const getVisiblePages = (totalPages) => {
    const pages = []
    const current = currentPage.value

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (current >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages)
      }
    }

    return pages
  }

  /**
   * Obtiene información de paginación
   * @param {number} totalItems
   * @returns {Object}
   */
  const getPaginationInfo = (totalItems) => {
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, totalItems)
    return { start, end, total: totalItems }
  }

  /**
   * Ir a una página específica
   * @param {number|string} page
   */
  const goToPage = (page) => {
    if (page === '...') return
    currentPage.value = page
  }

  const goToFirstPage = () => {
    currentPage.value = 1
  }

  const goToLastPage = (totalPages) => {
    currentPage.value = totalPages
  }

  const goToNextPage = (totalPages) => {
    if (currentPage.value < totalPages) {
      currentPage.value++
    }
  }

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  /**
   * Maneja el cambio de tamaño de página
   */
  const handlePageSizeChange = () => {
    currentPage.value = 1
    localStorage.setItem(storageKey, pageSize.value)
  }

  /**
   * Resetea la paginación a la primera página
   */
  const resetPagination = () => {
    currentPage.value = 1
  }

  /**
   * Limpia el filtro de horario
   */
  const clearTimeFilter = () => {
    filterStartTime.value = ''
    filterEndTime.value = ''
    resetPagination()
  }

  /**
   * Limpia todos los filtros
   */
  const clearAllFilters = () => {
    selectedReproductor.value = ''
    selectedDays.value = []
    filterStartTime.value = ''
    filterEndTime.value = ''
    filterSpotName.value = ''
    filterSlot.value = ''
    selectedProgramaciones.value = []
    resetPagination()
  }

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
    resetPagination()
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
   * Obtiene texto descriptivo de los días seleccionados
   * @param {Array} weekDays - Configuración de días de la semana
   * @returns {string}
   */
  const getSelectedDaysText = (weekDays) => {
    if (selectedDays.value.length === 0) return 'Ninguno'
    if (selectedDays.value.length === 7) return 'Todos los días'
    return selectedDays.value
      .map(day => weekDays.find(d => d.value === day)?.text)
      .join(', ')
  }

  /**
   * Alterna la selección de una programación
   * @param {Object} programacion
   */
  const toggleProgramacionSelection = (programacion) => {
    const index = selectedProgramaciones.value.findIndex(
      p => p.clprsp_codigo === programacion.clprsp_codigo
    )
    if (index > -1) {
      selectedProgramaciones.value.splice(index, 1)
    } else {
      selectedProgramaciones.value.push(programacion)
    }
  }

  /**
   * Verifica si una programación está seleccionada
   * @param {Object} programacion
   * @returns {boolean}
   */
  const isProgramacionSelected = (programacion) => {
    return selectedProgramaciones.value.some(
      p => p.clprsp_codigo === programacion.clprsp_codigo
    )
  }

  /**
   * Selecciona o deselecciona todas las programaciones visibles
   * @param {Array} displayedProgramaciones
   */
  const toggleSelectAll = (displayedProgramaciones) => {
    const allSelected = displayedProgramaciones.every(prog =>
      selectedProgramaciones.value.some(
        selected => selected.clprsp_codigo === prog.clprsp_codigo
      )
    )

    if (allSelected) {
      selectedProgramaciones.value = []
    } else {
      selectedProgramaciones.value = [...displayedProgramaciones]
    }
  }

  /**
   * Verifica si todas las programaciones visibles están seleccionadas
   * @param {Array} displayedProgramaciones
   * @returns {boolean}
   */
  const isAllSelected = (displayedProgramaciones) => {
    return (
      displayedProgramaciones.length > 0 &&
      selectedProgramaciones.value.length > 0 &&
      displayedProgramaciones.every(prog =>
        selectedProgramaciones.value.some(
          selected => selected.clprsp_codigo === prog.clprsp_codigo
        )
      )
    )
  }

  /**
   * Limpia la selección de programaciones
   */
  const clearSelection = () => {
    selectedProgramaciones.value = []
  }

  /**
   * Obtiene el estado actual de los filtros
   * @returns {Object}
   */
  const getFilterState = () => {
    return {
      reproductor: selectedReproductor.value,
      startTime: filterStartTime.value,
      endTime: filterEndTime.value,
      spotName: filterSpotName.value,
      slot: filterSlot.value,
      selectedDays: [...selectedDays.value]
    }
  }

  /**
   * Establece el estado de los filtros
   * @param {Object} state
   */
  const setFilterState = (state) => {
    if (state.reproductor !== undefined) selectedReproductor.value = state.reproductor
    if (state.selectedDays) selectedDays.value = [...state.selectedDays]
    if (state.startTime !== undefined) filterStartTime.value = state.startTime
    if (state.endTime !== undefined) filterEndTime.value = state.endTime
    if (state.spotName !== undefined) filterSpotName.value = state.spotName
    if (state.slot !== undefined) filterSlot.value = state.slot
  }

  // Auto-reset pagination when filters change
  watch([selectedReproductor, filterStartTime, filterEndTime, filterSpotName, filterSlot], () => {
    selectedProgramaciones.value = []
    resetPagination()
  })

  watch(selectedDays, () => {
    selectedProgramaciones.value = []
    resetPagination()
  }, { deep: true })

  return {
    // State
    currentPage,
    pageSize,
    filterStartTime,
    filterEndTime,
    filterSpotName,
    filterSlot,
    selectedReproductor,
    selectedDays,
    selectedProgramaciones,

    // Computed
    hasActiveFilters,
    activeFiltersCount,

    // Filter methods
    filterProgramaciones,
    getPaginatedProgramaciones,
    
    // Pagination methods
    getTotalPages,
    getVisiblePages,
    getPaginationInfo,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    handlePageSizeChange,
    resetPagination,

    // Day selection
    toggleDaySelection,
    isDaySelected,
    getSelectedDaysText,

    // Programacion selection
    toggleProgramacionSelection,
    isProgramacionSelected,
    toggleSelectAll,
    isAllSelected,
    clearSelection,

    // Filter controls
    clearTimeFilter,
    clearAllFilters,
    getFilterState,
    setFilterState
  }
}
