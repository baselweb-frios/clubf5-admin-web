import api from './api'

const emailTestService = {}

/**
 * Envia un email de prueba
 * @param {Object} testData - Datos del email de prueba
 * @param {string} testData.toEmail - Email de destino
 * @param {string} [testData.subject] - Asunto del email
 * @param {string} [testData.testType] - Tipo de prueba: 'simple', 'html', 'reset'
 * @param {string} [testData.customMessage] - Mensaje personalizado
 * @returns {Promise<{success: boolean, message: string, elapsedMs: number}>}
 */
emailTestService.sendTestEmail = async function (testData) {
  return api.post('/EmailTest/send', testData).then(res => res.data)
}

/**
 * Obtiene la configuracion actual de email (sin datos sensibles)
 * @returns {Promise<Object>} Configuracion de email
 */
emailTestService.getEmailConfig = async function () {
  return api.get('/EmailTest/config').then(res => res.data)
}

export default emailTestService
