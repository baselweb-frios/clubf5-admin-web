import api from './api'

/**
 * Servicio para gestionar los logs de eventos y errores del sistema
 * Solo accesible para administradores
 */
const eventLogService = {}

// ===== CONSTANTES =====

/**
 * Tipos de eventos del sistema
 */
export const EventType = {
  Authentication: 1,
  DataAccess: 2,
  BusinessAction: 3,
  RealTimeConnection: 4,
  ExternalApiCall: 5,
  CacheOperation: 6,
  Security: 7,
  Performance: 8
}

/**
 * Etiquetas para tipos de eventos
 */
export const EventTypeLabels = {
  [EventType.Authentication]: 'Autenticaci\u00f3n',
  [EventType.DataAccess]: 'Acceso a Datos',
  [EventType.BusinessAction]: 'Acci\u00f3n de Negocio',
  [EventType.RealTimeConnection]: 'Conexi\u00f3n Tiempo Real',
  [EventType.ExternalApiCall]: 'API Externa',
  [EventType.CacheOperation]: 'Operaci\u00f3n Cache',
  [EventType.Security]: 'Seguridad',
  [EventType.Performance]: 'Rendimiento'
}

/**
 * Severidades de eventos
 */
export const EventSeverity = {
  Debug: 0,
  Info: 1,
  Warning: 2,
  Error: 3,
  Critical: 4
}

/**
 * Etiquetas para severidades
 */
export const EventSeverityLabels = {
  [EventSeverity.Debug]: 'Debug',
  [EventSeverity.Info]: 'Info',
  [EventSeverity.Warning]: 'Warning',
  [EventSeverity.Error]: 'Error',
  [EventSeverity.Critical]: 'Critical'
}

/**
 * Colores para severidades (clases CSS)
 */
export const EventSeverityColors = {
  [EventSeverity.Debug]: 'secondary',
  [EventSeverity.Info]: 'info',
  [EventSeverity.Warning]: 'warning',
  [EventSeverity.Error]: 'danger',
  [EventSeverity.Critical]: 'critical'
}

/**
 * Categorias de errores
 */
export const ErrorCategory = {
  Validation: 1,
  Authentication: 2,
  Authorization: 3,
  Database: 4,
  ExternalService: 5,
  Business: 6,
  Internal: 7,
  Network: 8,
  Timeout: 9,
  Unknown: 10
}

/**
 * Etiquetas para categorias de errores
 */
export const ErrorCategoryLabels = {
  [ErrorCategory.Validation]: 'Validaci\u00f3n',
  [ErrorCategory.Authentication]: 'Autenticaci\u00f3n',
  [ErrorCategory.Authorization]: 'Autorizaci\u00f3n',
  [ErrorCategory.Database]: 'Base de Datos',
  [ErrorCategory.ExternalService]: 'Servicio Externo',
  [ErrorCategory.Business]: 'Negocio',
  [ErrorCategory.Internal]: 'Interno',
  [ErrorCategory.Network]: 'Red',
  [ErrorCategory.Timeout]: 'Timeout',
  [ErrorCategory.Unknown]: 'Desconocido'
}

// ===== EVENTOS =====

/**
 * Obtiene la lista de eventos del sistema
 * @param {Object} params - Parametros de busqueda
 * @param {Date} params.from - Fecha desde
 * @param {Date} params.to - Fecha hasta
 * @param {number} params.eventType - Tipo de evento
 * @param {number} params.minSeverity - Severidad minima
 * @param {string} params.userId - ID del usuario
 * @param {string} params.actionCode - Codigo de accion
 * @param {string} params.controller - Nombre del controlador
 * @param {number} params.skip - Registros a omitir
 * @param {number} params.take - Registros a obtener
 * @returns {Promise<{data: Array, total: number, skip: number, take: number}>}
 */
eventLogService.getEvents = async function(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.from) queryParams.append('from', params.from.toISOString())
  if (params.to) queryParams.append('to', params.to.toISOString())
  if (params.eventType !== undefined && params.eventType !== null) queryParams.append('eventType', params.eventType)
  if (params.minSeverity !== undefined && params.minSeverity !== null) queryParams.append('minSeverity', params.minSeverity)
  if (params.userId) queryParams.append('userId', params.userId)
  if (params.actionCode) queryParams.append('actionCode', params.actionCode)
  if (params.controller) queryParams.append('controller', params.controller)
  if (params.skip !== undefined) queryParams.append('skip', params.skip)
  if (params.take !== undefined) queryParams.append('take', params.take)

  const url = `/EventLog/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  return api.get(url).then(res => res.data)
}

/**
 * Obtiene el conteo de eventos
 * @param {Object} params - Parametros de busqueda
 * @returns {Promise<{count: number}>}
 */
eventLogService.getEventCount = async function(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.from) queryParams.append('from', params.from.toISOString())
  if (params.to) queryParams.append('to', params.to.toISOString())
  if (params.eventType !== undefined && params.eventType !== null) queryParams.append('eventType', params.eventType)

  const url = `/EventLog/events/count${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  return api.get(url).then(res => res.data)
}

// ===== ERRORES =====

/**
 * Obtiene la lista de errores del sistema
 * @param {Object} params - Parametros de busqueda
 * @param {Date} params.from - Fecha desde
 * @param {Date} params.to - Fecha hasta
 * @param {number} params.category - Categoria del error
 * @param {number} params.minSeverity - Severidad minima
 * @param {string} params.userId - ID del usuario
 * @param {string} params.controller - Nombre del controlador
 * @param {boolean} params.isHandled - Si el error fue manejado
 * @param {number} params.skip - Registros a omitir
 * @param {number} params.take - Registros a obtener
 * @returns {Promise<{data: Array, total: number, skip: number, take: number}>}
 */
eventLogService.getErrors = async function(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.from) queryParams.append('from', params.from.toISOString())
  if (params.to) queryParams.append('to', params.to.toISOString())
  if (params.category !== undefined && params.category !== null) queryParams.append('category', params.category)
  if (params.minSeverity !== undefined && params.minSeverity !== null) queryParams.append('minSeverity', params.minSeverity)
  if (params.userId) queryParams.append('userId', params.userId)
  if (params.controller) queryParams.append('controller', params.controller)
  if (params.isHandled !== undefined && params.isHandled !== null) queryParams.append('isHandled', params.isHandled)
  if (params.skip !== undefined) queryParams.append('skip', params.skip)
  if (params.take !== undefined) queryParams.append('take', params.take)

  const url = `/EventLog/errors${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  return api.get(url).then(res => res.data)
}

/**
 * Obtiene el conteo de errores
 * @param {Object} params - Parametros de busqueda
 * @returns {Promise<{count: number}>}
 */
eventLogService.getErrorCount = async function(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.from) queryParams.append('from', params.from.toISOString())
  if (params.to) queryParams.append('to', params.to.toISOString())
  if (params.category !== undefined && params.category !== null) queryParams.append('category', params.category)

  const url = `/EventLog/errors/count${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  return api.get(url).then(res => res.data)
}

/**
 * Obtiene un resumen de errores agrupados por tipo
 * @param {Object} params - Parametros de busqueda
 * @returns {Promise<Array>}
 */
eventLogService.getErrorSummary = async function(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.from) queryParams.append('from', params.from.toISOString())
  if (params.to) queryParams.append('to', params.to.toISOString())

  const url = `/EventLog/errors/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  return api.get(url).then(res => res.data)
}

// ===== ESTADISTICAS =====

/**
 * Obtiene estadisticas generales del sistema de logs
 * @param {Object} params - Parametros de busqueda
 * @returns {Promise<Object>}
 */
eventLogService.getStats = async function(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.from) queryParams.append('from', params.from.toISOString())
  if (params.to) queryParams.append('to', params.to.toISOString())

  const url = `/EventLog/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  return api.get(url).then(res => res.data)
}

/**
 * Obtiene un dashboard con metricas clave
 * @returns {Promise<Object>}
 */
eventLogService.getDashboard = async function() {
  return api.get('/EventLog/dashboard').then(res => res.data)
}

// ===== LIMPIEZA DE LOGS =====

/**
 * Elimina eventos del sistema
 * @param {number|null} olderThanDays - Eliminar eventos anteriores a X dias. Si es null, elimina todos.
 * @returns {Promise<{message: string, deletedCount: number, filter: string}>}
 */
eventLogService.clearEvents = async function(olderThanDays = null) {
  const url = olderThanDays !== null
    ? `/EventLog/events?olderThanDays=${olderThanDays}`
    : '/EventLog/events'
  return api.delete(url).then(res => res.data)
}

/**
 * Elimina errores del sistema
 * @param {number|null} olderThanDays - Eliminar errores anteriores a X dias. Si es null, elimina todos.
 * @returns {Promise<{message: string, deletedCount: number, filter: string}>}
 */
eventLogService.clearErrors = async function(olderThanDays = null) {
  const url = olderThanDays !== null
    ? `/EventLog/errors?olderThanDays=${olderThanDays}`
    : '/EventLog/errors'
  return api.delete(url).then(res => res.data)
}

/**
 * Elimina todos los logs (eventos y errores) del sistema
 * @param {number|null} olderThanDays - Eliminar logs anteriores a X dias. Si es null, elimina todos.
 * @returns {Promise<{message: string, eventsDeleted: number, errorsDeleted: number, totalDeleted: number, filter: string}>}
 */
eventLogService.clearAllLogs = async function(olderThanDays = null) {
  const url = olderThanDays !== null
    ? `/EventLog/all?olderThanDays=${olderThanDays}`
    : '/EventLog/all'
  return api.delete(url).then(res => res.data)
}

export default eventLogService
