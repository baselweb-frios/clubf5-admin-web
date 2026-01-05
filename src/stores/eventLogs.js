import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import eventLogService, {
  EventType,
  EventTypeLabels,
  EventSeverity,
  EventSeverityLabels,
  EventSeverityColors,
  ErrorCategory,
  ErrorCategoryLabels
} from '@/services/EventLogServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useEventLogsStore = defineStore('eventLogs', () => {
  // ===== STATE =====

  // Eventos
  const events = ref([])
  const eventsTotal = ref(0)
  const eventsLoading = ref(false)
  const eventsError = ref(null)

  // Errores
  const errors = ref([])
  const errorsTotal = ref(0)
  const errorsLoading = ref(false)
  const errorsError = ref(null)
  const errorSummary = ref([])

  // Dashboard
  const dashboard = ref(null)
  const dashboardLoading = ref(false)
  const dashboardError = ref(null)

  // Stats
  const stats = ref(null)
  const statsLoading = ref(false)

  // Filtros actuales
  const currentFilters = ref({
    from: null,
    to: null,
    eventType: null,
    minSeverity: null,
    category: null,
    userId: null,
    controller: null,
    skip: 0,
    take: 50
  })

  // ===== GETTERS =====

  const eventsCount = computed(() => events.value.length)
  const errorsCount = computed(() => errors.value.length)
  const hasEvents = computed(() => eventsCount.value > 0)
  const hasErrors = computed(() => errorsCount.value > 0)

  const isLoading = computed(() =>
    eventsLoading.value || errorsLoading.value || dashboardLoading.value || statsLoading.value
  )

  // Estadisticas rapidas del dashboard
  const healthStatus = computed(() => dashboard.value?.health?.status || 'unknown')
  const errorRate = computed(() => dashboard.value?.health?.errorRate || 0)
  const last24HoursEvents = computed(() => dashboard.value?.last24Hours?.totalEvents || 0)
  const last24HoursErrors = computed(() => dashboard.value?.last24Hours?.totalErrors || 0)
  const lastHourEvents = computed(() => dashboard.value?.lastHour?.events || 0)
  const lastHourErrors = computed(() => dashboard.value?.lastHour?.errors || 0)

  // Top errores
  const topErrors = computed(() => dashboard.value?.last24Hours?.topErrors || [])

  // ===== ACTIONS =====

  /**
   * Carga el dashboard con metricas clave
   */
  const loadDashboard = async () => {
    if (!requireAuth('EventLogsStore', 'loadDashboard')) {
      return null
    }

    dashboardLoading.value = true
    dashboardError.value = null

    try {
      const data = await eventLogService.getDashboard()
      dashboard.value = data
      console.log('[EventLogsStore] Dashboard cargado:', data)
      return data
    } catch (err) {
      dashboardError.value = err.message || 'Error al cargar dashboard'
      console.error('[EventLogsStore] Error cargando dashboard:', err)
      return null
    } finally {
      dashboardLoading.value = false
    }
  }

  /**
   * Carga eventos del sistema
   */
  const loadEvents = async (params = {}) => {
    if (!requireAuth('EventLogsStore', 'loadEvents')) {
      events.value = []
      return { data: [], total: 0 }
    }

    eventsLoading.value = true
    eventsError.value = null

    try {
      const queryParams = {
        ...currentFilters.value,
        ...params
      }

      const response = await eventLogService.getEvents(queryParams)
      events.value = response.data || []
      eventsTotal.value = response.total || 0

      console.log(`[EventLogsStore] ${events.value.length} eventos cargados de ${eventsTotal.value} total`)
      return response
    } catch (err) {
      eventsError.value = err.message || 'Error al cargar eventos'
      console.error('[EventLogsStore] Error cargando eventos:', err)
      events.value = []
      return { data: [], total: 0 }
    } finally {
      eventsLoading.value = false
    }
  }

  /**
   * Carga errores del sistema
   */
  const loadErrors = async (params = {}) => {
    if (!requireAuth('EventLogsStore', 'loadErrors')) {
      errors.value = []
      return { data: [], total: 0 }
    }

    errorsLoading.value = true
    errorsError.value = null

    try {
      const queryParams = {
        ...currentFilters.value,
        ...params
      }

      const response = await eventLogService.getErrors(queryParams)
      errors.value = response.data || []
      errorsTotal.value = response.total || 0

      console.log(`[EventLogsStore] ${errors.value.length} errores cargados de ${errorsTotal.value} total`)
      return response
    } catch (err) {
      errorsError.value = err.message || 'Error al cargar errores'
      console.error('[EventLogsStore] Error cargando errores:', err)
      errors.value = []
      return { data: [], total: 0 }
    } finally {
      errorsLoading.value = false
    }
  }

  /**
   * Carga resumen de errores agrupados
   */
  const loadErrorSummary = async (params = {}) => {
    if (!requireAuth('EventLogsStore', 'loadErrorSummary')) {
      errorSummary.value = []
      return []
    }

    try {
      const data = await eventLogService.getErrorSummary(params)
      errorSummary.value = data || []
      console.log(`[EventLogsStore] ${errorSummary.value.length} grupos de errores cargados`)
      return data
    } catch (err) {
      console.error('[EventLogsStore] Error cargando resumen de errores:', err)
      errorSummary.value = []
      return []
    }
  }

  /**
   * Carga estadisticas generales
   */
  const loadStats = async (params = {}) => {
    if (!requireAuth('EventLogsStore', 'loadStats')) {
      stats.value = null
      return null
    }

    statsLoading.value = true

    try {
      const data = await eventLogService.getStats(params)
      stats.value = data
      console.log('[EventLogsStore] Estadisticas cargadas:', data)
      return data
    } catch (err) {
      console.error('[EventLogsStore] Error cargando estadisticas:', err)
      stats.value = null
      return null
    } finally {
      statsLoading.value = false
    }
  }

  /**
   * Actualiza los filtros actuales
   */
  const setFilters = (filters) => {
    currentFilters.value = {
      ...currentFilters.value,
      ...filters
    }
  }

  /**
   * Resetea los filtros a valores por defecto
   */
  const resetFilters = () => {
    currentFilters.value = {
      from: null,
      to: null,
      eventType: null,
      minSeverity: null,
      category: null,
      userId: null,
      controller: null,
      skip: 0,
      take: 50
    }
  }

  /**
   * Carga mas eventos (paginacion)
   */
  const loadMoreEvents = async () => {
    if (events.value.length >= eventsTotal.value) {
      return // No hay mas eventos
    }

    currentFilters.value.skip = events.value.length
    const response = await loadEvents()

    if (response.data?.length > 0) {
      events.value = [...events.value, ...response.data]
    }
  }

  /**
   * Carga mas errores (paginacion)
   */
  const loadMoreErrors = async () => {
    if (errors.value.length >= errorsTotal.value) {
      return // No hay mas errores
    }

    currentFilters.value.skip = errors.value.length
    const response = await loadErrors()

    if (response.data?.length > 0) {
      errors.value = [...errors.value, ...response.data]
    }
  }

  /**
   * Refresca todos los datos
   */
  const refreshAll = async () => {
    currentFilters.value.skip = 0
    await Promise.all([
      loadDashboard(),
      loadEvents(),
      loadErrors(),
      loadErrorSummary()
    ])
  }

  // ===== LIMPIEZA DE LOGS =====

  const clearingLogs = ref(false)
  const clearError = ref(null)

  /**
   * Elimina eventos del sistema
   * @param {number|null} olderThanDays - Eliminar eventos anteriores a X dias
   */
  const clearEvents = async (olderThanDays = null) => {
    if (!requireAuth('EventLogsStore', 'clearEvents')) {
      return null
    }

    clearingLogs.value = true
    clearError.value = null

    try {
      const result = await eventLogService.clearEvents(olderThanDays)
      console.log('[EventLogsStore] Eventos eliminados:', result)

      // Recargar datos despues de limpiar
      await refreshAll()

      return result
    } catch (err) {
      clearError.value = err.message || 'Error al eliminar eventos'
      console.error('[EventLogsStore] Error eliminando eventos:', err)
      throw err
    } finally {
      clearingLogs.value = false
    }
  }

  /**
   * Elimina errores del sistema
   * @param {number|null} olderThanDays - Eliminar errores anteriores a X dias
   */
  const clearErrors = async (olderThanDays = null) => {
    if (!requireAuth('EventLogsStore', 'clearErrors')) {
      return null
    }

    clearingLogs.value = true
    clearError.value = null

    try {
      const result = await eventLogService.clearErrors(olderThanDays)
      console.log('[EventLogsStore] Errores eliminados:', result)

      // Recargar datos despues de limpiar
      await refreshAll()

      return result
    } catch (err) {
      clearError.value = err.message || 'Error al eliminar errores'
      console.error('[EventLogsStore] Error eliminando errores:', err)
      throw err
    } finally {
      clearingLogs.value = false
    }
  }

  /**
   * Elimina todos los logs del sistema
   * @param {number|null} olderThanDays - Eliminar logs anteriores a X dias
   */
  const clearAllLogs = async (olderThanDays = null) => {
    if (!requireAuth('EventLogsStore', 'clearAllLogs')) {
      return null
    }

    clearingLogs.value = true
    clearError.value = null

    try {
      const result = await eventLogService.clearAllLogs(olderThanDays)
      console.log('[EventLogsStore] Todos los logs eliminados:', result)

      // Recargar datos despues de limpiar
      await refreshAll()

      return result
    } catch (err) {
      clearError.value = err.message || 'Error al eliminar logs'
      console.error('[EventLogsStore] Error eliminando logs:', err)
      throw err
    } finally {
      clearingLogs.value = false
    }
  }

  // ===== HELPERS =====

  /**
   * Obtiene la etiqueta de un tipo de evento
   */
  const getEventTypeLabel = (type) => EventTypeLabels[type] || 'Desconocido'

  /**
   * Obtiene la etiqueta de una severidad
   */
  const getSeverityLabel = (severity) => EventSeverityLabels[severity] || 'Desconocido'

  /**
   * Obtiene el color de una severidad
   */
  const getSeverityColor = (severity) => EventSeverityColors[severity] || 'secondary'

  /**
   * Obtiene la etiqueta de una categoria de error
   */
  const getErrorCategoryLabel = (category) => ErrorCategoryLabels[category] || 'Desconocido'

  return {
    // State
    events,
    eventsTotal,
    eventsLoading,
    eventsError,
    errors,
    errorsTotal,
    errorsLoading,
    errorsError,
    errorSummary,
    dashboard,
    dashboardLoading,
    dashboardError,
    stats,
    statsLoading,
    currentFilters,
    clearingLogs,
    clearError,

    // Getters
    eventsCount,
    errorsCount,
    hasEvents,
    hasErrors,
    isLoading,
    healthStatus,
    errorRate,
    last24HoursEvents,
    last24HoursErrors,
    lastHourEvents,
    lastHourErrors,
    topErrors,

    // Actions
    loadDashboard,
    loadEvents,
    loadErrors,
    loadErrorSummary,
    loadStats,
    setFilters,
    resetFilters,
    loadMoreEvents,
    loadMoreErrors,
    refreshAll,
    clearEvents,
    clearErrors,
    clearAllLogs,

    // Helpers
    getEventTypeLabel,
    getSeverityLabel,
    getSeverityColor,
    getErrorCategoryLabel,

    // Constants (re-export)
    EventType,
    EventTypeLabels,
    EventSeverity,
    EventSeverityLabels,
    EventSeverityColors,
    ErrorCategory,
    ErrorCategoryLabels
  }
})
