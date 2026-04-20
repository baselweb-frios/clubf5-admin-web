import { dispatcherService } from './dispatcherService'

/**
 * Servicio para manejar operaciones de radios usando SignalR Dispatcher
 * @namespace RadioService
 */
const RadioService = {}

/**
 * Obtiene radios desde OBS/Huawei Cloud
 * @param {number} clientCode - Código del cliente
 * @param {string} username - Username del cliente
 * @param {string} [market=''] - Market (spotify, local, huawei, etc.)
 * @returns {Promise<Array>} Lista de radios disponibles
 */
RadioService.getRadiosByCliente = async function (clientCode, username, market = '') {
  try {
    return await dispatcherService.execute({
      controller: 'Radio',
      action: 'GetDescargaObs',
      parameters: {
        clientCode,
        username,
        market: market || ''
      }
    })
  } catch (error) {
    console.error('[RadioService.getRadiosByCliente]', error)
    // Fallback: retornar array vacío en caso de error
    return []
  }
}

/**
 * Obtiene la playlist actual del cliente
 * @param {number} clientCode - Código del cliente
 * @param {string} username - Username del cliente
 * @returns {Promise<Array>} Playlist actual
 */
RadioService.getDescargaActual = async function (clientCode, username) {
  return await dispatcherService.execute({
    controller: 'Radio',
    action: 'GetDescargaActual',
    parameters: {
      clientCode,
      username
    }
  })
}

/**
 * Obtiene radios programadas del usuario
 * @param {string} username - Username del cliente
 * @returns {Promise<Array>} Radios programadas
 */
RadioService.getRadioProgramada = async function (username) {
  return await dispatcherService.execute({
    controller: 'Radio',
    action: 'GetRadioProgramada',
    parameters: {
      username
    }
  })
}

/**
 * Obtiene programaciones del cliente
 * @param {string} username - Username del cliente
 * @returns {Promise<Array>} Programaciones
 */
RadioService.getProgramacionesByCliente = async function (username) {
  return await dispatcherService.execute({
    controller: 'Radio',
    action: 'GetProgramaciones',
    parameters: {
      username
    }
  })
}

/**
 * Obtiene todas las radios disponibles (modo libre)
 * @returns {Promise<Array>} Radios libres
 */
RadioService.getRadioLibre = async function () {
  return await dispatcherService.execute({
    controller: 'Radio',
    action: 'GetRadioLibre',
    parameters: {}
  })
}

/**
 * Crea una nueva programación de radio
 * @param {string} codigoProgramacion - Código de la programación
 * @param {string} nombreProgramacion - Nombre de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
RadioService.altaProgramacion = async function (codigoProgramacion, nombreProgramacion) {
  return await dispatcherService.execute({
    controller: 'Radio',
    action: 'CreateProgramacion',
    parameters: {
      codigoProgramacion,
      nombreProgramacion
    },
    broadcastResult: true
  })
}

/**
 * Elimina una programación de radio
 * @param {string} codigoProgramacion - Código de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
RadioService.bajaProgramacion = async function (codigoProgramacion) {
  return await dispatcherService.execute({
    controller: 'Radio',
    action: 'DeleteProgramacion',
    parameters: {
      codigoProgramacion
    },
    broadcastResult: true
  })
}

/**
 * Obtiene programaciones por programa
 * @param {string} codigoProgramacion - Código de la programación
 * @returns {Promise<Array>} Programaciones del programa
 */
RadioService.getProgramacionesByPrograma = async function (codigoProgramacion) {
  return await dispatcherService.execute({
    controller: 'ClienteProgramacionRadio',
    action: 'GetByPrograma',
    parameters: {
      codigoProgramacion
    }
  })
}

/**
 * Guarda programación horaria
 * @param {Object} programacionData - Datos de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
RadioService.guardarProgramacionHorario = async function (programacionData) {
  return await dispatcherService.execute({
    controller: 'ClienteProgramacionRadio',
    action: 'CreateProgramacionHorario',
    parameters: programacionData,
    broadcastResult: true
  })
}

/**
 * Edita programación horaria
 * @param {string} codigo - Código de la programación
 * @param {Object} programacionData - Datos de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
RadioService.editarProgramacionHorario = async function (codigo, programacionData) {
  return await dispatcherService.execute({
    controller: 'ClienteProgramacionRadio',
    action: 'UpdateProgramacionHorario',
    parameters: {
      codigo,
      ...programacionData
    },
    broadcastResult: true
  })
}

/**
 * Elimina programación horaria
 * @param {string} codigo - Código de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
RadioService.bajaProgramacionHorario = async function (codigo) {
  return await dispatcherService.execute({
    controller: 'ClienteProgramacionRadio',
    action: 'DeleteProgramacionHorario',
    parameters: {
      codigo
    },
    broadcastResult: true
  })
}

/**
 * Obtiene programación semanal
 * @param {string} codigoPrograma - Código del programa
 * @returns {Promise<Object>} Programación semanal
 */
RadioService.getProgramacionSemanal = async function (codigoPrograma) {
  return await dispatcherService.execute({
    controller: 'ClienteProgramacionRadio',
    action: 'GetProgramacionSemanal',
    parameters: {
      codigoPrograma
    }
  })
}

/**
 * Guarda programación semanal
 * @param {Object} programacionSemanal - Datos de la programación semanal
 * @returns {Promise<Object>} Resultado de la operación
 */
RadioService.guardarProgramacionSemanal = async function (programacionSemanal) {
  return await dispatcherService.execute({
    controller: 'ClienteProgramacionRadio',
    action: 'CreateProgramacionSemanal',
    parameters: programacionSemanal,
    broadcastResult: true
  })
}

export default RadioService
