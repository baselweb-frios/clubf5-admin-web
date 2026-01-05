import axios from 'axios'

/**
 * Servicio centralizado para el SignalR Dispatcher
 * @class DispatcherService
 */
class DispatcherService {
  constructor() {
    this.baseURL = 'signalrdispatcher'
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL + this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Interceptor para agregar token automáticamente
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptor para manejo de respuestas
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Dispatcher Error:', error)

        // Manejo de errores 401 (token inválido o expirado)
        if (error.response?.status === 401) {
          console.warn('Token inválido o expirado. Redirigiendo al login...')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('refresh_token')

          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Ejecuta un comando en el dispatcher
   * @param {Object} command - Comando a ejecutar
   * @param {string} command.controller - Nombre del controlador
   * @param {string} command.action - Acción a ejecutar
   * @param {Object} command.parameters - Parámetros de la acción
   * @param {boolean} [command.broadcastResult] - Si true, envía resultado a todos por SignalR
   * @param {string[]} [command.targetUserIds] - IDs de usuarios específicos
   * @param {string} [command.targetGroup] - Grupo específico
   * @returns {Promise<*>} Datos de respuesta
   * @throws {Error} Si la operación falla
   */
  async execute(command) {
    try {
      const response = await this.axiosInstance.post('dispatch', command)

      if (response.data.success) {
        return response.data.data // Retorna solo los datos
      } else {
        throw new Error(response.data.message || 'Error en la operación')
      }
    } catch (error) {
      // Manejo de errores mejorado
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message)
      }
      throw error
    }
  }

  /**
   * Ejecuta un comando y retorna la respuesta completa
   * @param {Object} command - Comando a ejecutar
   * @returns {Promise<Object>} Respuesta completa del servidor
   */
  async executeWithFullResponse(command) {
    const response = await this.axiosInstance.post('dispatch', command)
    return response.data
  }

  /**
   * Envía un mensaje a todos los clientes
   * @param {string} message - Mensaje a enviar
   * @param {*} [data] - Datos adicionales
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async broadcast(message, data = null) {
    const response = await this.axiosInstance.post('broadcast', {
      message,
      data
    })
    return response.data
  }

  /**
   * Envía un mensaje a un usuario específico
   * @param {string} targetUserId - ID del usuario destino
   * @param {string} message - Mensaje a enviar
   * @param {*} [data] - Datos adicionales
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async sendToUser(targetUserId, message, data = null) {
    const response = await this.axiosInstance.post('send-to-user', {
      targetUserId,
      message,
      data
    })
    return response.data
  }

  /**
   * Envía un mensaje a un grupo
   * @param {string} groupName - Nombre del grupo
   * @param {string} message - Mensaje a enviar
   * @param {*} [data] - Datos adicionales
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async sendToGroup(groupName, message, data = null) {
    const response = await this.axiosInstance.post('send-to-group', {
      groupName,
      message,
      data
    })
    return response.data
  }

  /**
   * Obtiene usuarios online
   * @returns {Promise<Object>} Información de usuarios online
   */
  async getOnlineUsers() {
    const response = await this.axiosInstance.get('online-users')
    return response.data
  }

  /**
   * Verifica si existe un handler
   * @param {string} controller - Nombre del controlador
   * @param {string} action - Nombre de la acción
   * @returns {Promise<boolean>} True si existe el handler
   */
  async hasHandler(controller, action) {
    const response = await this.axiosInstance.get(
      `has-handler/${controller}/${action}`
    )
    return response.data
  }

  /**
   * Health check
   * @returns {Promise<Object>} Estado del servicio
   */
  async health() {
    const response = await this.axiosInstance.get('health')
    return response.data
  }
}

// Exportar instancia singleton
export const dispatcherService = new DispatcherService()
export default dispatcherService
