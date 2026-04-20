import { ref, computed } from 'vue'
import configValidationService from '@/services/ConfigValidationService'

/**
 * Composable para manejar la configuración del cliente
 * Incluye días hábiles, horarios hábiles y validaciones relacionadas
 */
export function useClientConfig() {
  // ===== STATE =====
  const clientConfig = ref(null)
  const configLoading = ref(false)
  const configError = ref(null)

  // ===== COMPUTED =====

  /**
   * Días hábiles configurados por el cliente
   */
  const diasHabiles = computed(() => {
    return clientConfig.value?.details?.dias || []
  })

  /**
   * Horario hábil configurado por el cliente
   */
  const horarioHabil = computed(() => {
    return clientConfig.value?.details?.horario || null
  })

  /**
   * Verifica si un día específico es hábil
   * @param {number} dayValue - Valor del día (0=Dom, 1=Lun, ..., 6=Sáb)
   * @returns {boolean}
   */
  const isDiaHabil = (dayValue) => {
    if (!diasHabiles.value || diasHabiles.value.length === 0) return true
    return diasHabiles.value.some(d => d.cliDha_codigoDia === dayValue)
  }

  /**
   * Días de la semana con indicador de si son hábiles
   */
  const weekDays = computed(() => {
    return [
      { text: 'Lun', value: 1, isHabil: isDiaHabil(1) },
      { text: 'Mar', value: 2, isHabil: isDiaHabil(2) },
      { text: 'Mié', value: 3, isHabil: isDiaHabil(3) },
      { text: 'Jue', value: 4, isHabil: isDiaHabil(4) },
      { text: 'Vie', value: 5, isHabil: isDiaHabil(5) },
      { text: 'Sáb', value: 6, isHabil: isDiaHabil(6) },
      { text: 'Dom', value: 0, isHabil: isDiaHabil(0) }
    ]
  })

  /**
   * Valida si un rango horario está dentro del horario hábil
   * @param {string} startTime - Hora de inicio (HH:mm)
   * @param {string} endTime - Hora de fin (HH:mm)
   * @returns {boolean}
   */
  const isTimeRangeValid = (startTime, endTime) => {
    if (!horarioHabil.value || !startTime || !endTime) return true

    const horaDesdeHabil = horarioHabil.value.cliHor_horaDesde
    const horaHastaHabil = horarioHabil.value.cliHor_horaHasta

    if (!horaDesdeHabil || !horaHastaHabil) return true

    // Comparar solo HH:MM
    const startTimeStr = startTime.slice(0, 5)
    const endTimeStr = endTime.slice(0, 5)
    const horaDesdeStr = horaDesdeHabil.slice(0, 5)
    const horaHastaStr = horaHastaHabil.slice(0, 5)

    return startTimeStr >= horaDesdeStr && endTimeStr <= horaHastaStr
  }

  /**
   * Obtiene el mensaje de validación para un rango horario
   * @param {string} startTime
   * @param {string} endTime
   * @returns {string}
   */
  const getTimeRangeValidationMessage = (startTime, endTime) => {
    if (!isTimeRangeValid(startTime, endTime) && horarioHabil.value) {
      const horaDesde = horarioHabil.value.cliHor_horaDesde?.slice(0, 5) || ''
      const horaHasta = horarioHabil.value.cliHor_horaHasta?.slice(0, 5) || ''
      return `El horario debe estar entre ${horaDesde} y ${horaHasta} (horario hábil configurado)`
    }
    return ''
  }

  /**
   * Verifica si hay días inválidos en una selección
   * @param {number[]} selectedDays - Array de días seleccionados
   * @returns {boolean}
   */
  const hasInvalidDays = (selectedDays) => {
    if (!clientConfig.value || diasHabiles.value.length === 0) return false
    return selectedDays.some(day => !isDiaHabil(day))
  }

  /**
   * Obtiene los días inválidos de una selección
   * @param {number[]} selectedDays
   * @returns {number[]}
   */
  const getInvalidDays = (selectedDays) => {
    if (!hasInvalidDays(selectedDays)) return []
    return selectedDays.filter(day => !isDiaHabil(day))
  }

  /**
   * Obtiene el nombre de un día de la semana
   * @param {number} dayValue
   * @returns {string}
   */
  const getWeekDayName = (dayValue) => {
    const day = weekDays.value.find(d => d.value === dayValue)
    return day ? day.text : ''
  }

  /**
   * Verifica si un día es fin de semana
   * @param {number} dayValue
   * @returns {boolean}
   */
  const isWeekend = (dayValue) => {
    return dayValue === 0 || dayValue === 6
  }

  // ===== METHODS =====

  /**
   * Carga la configuración del cliente desde el servidor
   */
  const loadClientConfiguration = async () => {
    try {
      configLoading.value = true
      configError.value = null
      clientConfig.value = await configValidationService.checkConfigurationStatus()
      console.log('[useClientConfig] ✅ Configuración cargada:', {
        diasHabiles: diasHabiles.value.length,
        tieneHorario: !!horarioHabil.value
      })
      return clientConfig.value
    } catch (error) {
      console.error('[useClientConfig] ❌ Error cargando configuración:', error)
      configError.value = error.message || 'Error cargando configuración'
      throw error
    } finally {
      configLoading.value = false
    }
  }

  /**
   * Obtiene los valores por defecto de horario basados en la configuración
   * @returns {{ startTime: string, endTime: string }}
   */
  const getDefaultTimeRange = () => {
    if (horarioHabil.value) {
      return {
        startTime: horarioHabil.value.cliHor_horaDesde?.slice(0, 5) || '06:00',
        endTime: horarioHabil.value.cliHor_horaHasta?.slice(0, 5) || '23:00'
      }
    }
    return { startTime: '06:00', endTime: '23:00' }
  }

  return {
    // State
    clientConfig,
    configLoading,
    configError,
    
    // Computed
    diasHabiles,
    horarioHabil,
    weekDays,
    
    // Methods
    loadClientConfiguration,
    isDiaHabil,
    isTimeRangeValid,
    getTimeRangeValidationMessage,
    hasInvalidDays,
    getInvalidDays,
    getWeekDayName,
    isWeekend,
    getDefaultTimeRange
  }
}
