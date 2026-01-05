import api from './api'

/**
 * Service to validate and check client configuration status
 *
 * Required items (mandatory for setup completion):
 * - horarios: Business hours
 * - dias: Working days
 * - tipoEmpresa: Business type
 *
 * Optional items (informative, not required for completion):
 * - programacionRadio: Music programming
 * - programacionSpot: Spot programming
 */
class ConfigValidationService {
  constructor() {
    this.configStatus = null
    this.lastCheck = null
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes cache

    // Define required vs optional configuration items
    this.requiredItems = ['horarios', 'dias', 'tipoEmpresa']
    this.optionalItems = ['programacionRadio', 'programacionSpot']
  }

  /**
   * Check if all required configuration is complete
   * @returns {Promise<{isComplete: boolean, missing: string[], optional: string[], details: object}>}
   */
  async checkConfigurationStatus() {
    // Return cached result if available and fresh
    if (this.configStatus && this.lastCheck && (Date.now() - this.lastCheck < this.cacheTimeout)) {
      return this.configStatus
    }

    const status = {
      isComplete: false,
      missing: [],      // Required items that are missing
      optional: [],     // Optional items that are not configured
      details: {
        hasHorario: false,
        hasDias: false,
        hasTipoEmpresa: false,
        hasProgramacionRadio: false,
        hasProgramacionSpot: false,
        horario: null,
        dias: [],
        tiposEmpresa: [],
        programacionesRadio: [],
        programacionesSpot: []
      }
    }

    try {
      // Check Horario (REQUIRED)
      try {
        const horarioData = await api.get('/ClienteHorario').then(res => res.data)
        if (horarioData && horarioData.cliHor_horaDesde && horarioData.cliHor_horaHasta) {
          status.details.hasHorario = true
          status.details.horario = horarioData
        } else {
          status.missing.push('horarios')
        }
      } catch (error) {
        status.missing.push('horarios')
      }

      // Check Días Hábiles (REQUIRED)
      try {
        const diasData = await api.get('/DiaHabil').then(res => res.data)
        if (Array.isArray(diasData) && diasData.length > 0) {
          status.details.hasDias = true
          status.details.dias = diasData
        } else {
          status.missing.push('dias')
        }
      } catch (error) {
        status.missing.push('dias')
      }

      // Check Tipo de Empresa (REQUIRED)
      try {
        const tiposData = await api.get('/TipoEmpresa').then(res => res.data)
        if (Array.isArray(tiposData) && tiposData.length > 0) {
          status.details.hasTipoEmpresa = true
          status.details.tiposEmpresa = tiposData
        } else {
          status.missing.push('tipoEmpresa')
        }
      } catch (error) {
        status.missing.push('tipoEmpresa')
      }

      // Check Programación de Radio - Música (OPTIONAL)
      try {
        const progRadioData = await api.get('/clienteProgramacion/Radio/').then(res => res.data)
        if (Array.isArray(progRadioData) && progRadioData.length > 0) {
          status.details.hasProgramacionRadio = true
          status.details.programacionesRadio = progRadioData
        } else {
          status.optional.push('programacionRadio')
        }
      } catch (error) {
        status.optional.push('programacionRadio')
      }

      // Check Programación de Spots (OPTIONAL)
      try {
        const progSpotData = await api.get('/clienteProgramacion/Spot/').then(res => res.data)
        if (Array.isArray(progSpotData) && progSpotData.length > 0) {
          status.details.hasProgramacionSpot = true
          status.details.programacionesSpot = progSpotData
        } else {
          status.optional.push('programacionSpot')
        }
      } catch (error) {
        status.optional.push('programacionSpot')
      }

      // Configuration is complete when all REQUIRED items are configured
      // Optional items don't block completion
      status.isComplete = status.missing.length === 0

      // Cache the result
      this.configStatus = status
      this.lastCheck = Date.now()

      return status
    } catch (error) {
      console.error('Error checking configuration status:', error)
      return status
    }
  }

  /**
   * Clear cached configuration status
   */
  clearCache() {
    this.configStatus = null
    this.lastCheck = null
  }

  /**
   * Get human-readable missing configuration items
   * @param {string[]} missing - Array of missing items
   * @returns {string[]}
   */
  getMissingLabels(missing) {
    const labels = {
      'horarios': 'Horarios Disponibles',
      'dias': 'Días Hábiles',
      'tipoEmpresa': 'Tipo de Empresa',
      'programacionRadio': 'Programación de Música',
      'programacionSpot': 'Programación de Spots'
    }
    return missing.map(item => labels[item] || item)
  }

  /**
   * Get configuration completion percentage based on REQUIRED items only
   * @param {object} status - Configuration status object
   * @returns {number}
   */
  getCompletionPercentage(status) {
    // Only count required items (horarios, dias, tipoEmpresa)
    const total = this.requiredItems.length // 3 required items
    const completed = total - status.missing.length
    return Math.round((completed / total) * 100)
  }

  /**
   * Get full completion percentage including optional items
   * @param {object} status - Configuration status object
   * @returns {number}
   */
  getFullCompletionPercentage(status) {
    const total = this.requiredItems.length + this.optionalItems.length // 5 total items
    const missingCount = status.missing.length + (status.optional?.length || 0)
    const completed = total - missingCount
    return Math.round((completed / total) * 100)
  }
}

export default new ConfigValidationService()
