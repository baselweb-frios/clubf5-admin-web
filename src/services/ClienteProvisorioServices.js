import api from './api'

const ClienteProvisorioService = {}

/**
 * Obtener todos los clientes provisorios pendientes
 * @returns {Promise<Array>} Lista de clientes provisorios
 */
ClienteProvisorioService.getPendientes = async function () {
  return api.get('/ClienteProvisorio/pendientes').then(res => res.data)
}

/**
 * Obtener un cliente provisorio por su ID
 * @param {string} idProvisorio - ID del cliente provisorio
 * @returns {Promise<Object>} Cliente provisorio
 */
ClienteProvisorioService.getById = async function (idProvisorio) {
  return api.get(`/ClienteProvisorio/${idProvisorio}`).then(res => res.data)
}

/**
 * Aprobar un cliente provisorio
 * @param {string} idProvisorio - ID del cliente provisorio a aprobar
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise<Object>} Resultado de la operación
 */
ClienteProvisorioService.aprobar = async function (idProvisorio, observaciones = '') {
  return api.post(`/ClienteProvisorio/${idProvisorio}/aprobar`, { observaciones }).then(res => res.data)
}

/**
 * Rechazar un cliente provisorio
 * @param {string} idProvisorio - ID del cliente provisorio a rechazar
 * @param {string} observaciones - Motivo del rechazo
 * @returns {Promise<Object>} Resultado de la operación
 */
ClienteProvisorioService.rechazar = async function (idProvisorio, observaciones = '') {
  return api.post(`/ClienteProvisorio/${idProvisorio}/rechazar`, JSON.stringify(observaciones)).then(res => res.data)
}

/**
 * Eliminar un cliente provisorio
 * @param {string} idProvisorio - ID del cliente provisorio a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
ClienteProvisorioService.eliminar = async function (idProvisorio) {
  return api.delete(`/ClienteProvisorio/${idProvisorio}`).then(res => res.data)
}

export default ClienteProvisorioService
