import { ref } from 'vue'
import { dispatcherService } from '@/services/dispatcherService'

/**
 * Composable para ejecutar comandos del dispatcher
 * @returns {Object} Objeto con métodos y estado
 */
export function useDispatcher() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  /**
   * Ejecuta un comando
   * @param {Object} command - Comando a ejecutar
   * @param {string} command.controller - Nombre del controlador
   * @param {string} command.action - Acción a ejecutar
   * @param {Object} command.parameters - Parámetros de la acción
   * @param {boolean} [command.broadcastResult] - Si true, envía resultado a todos
   * @returns {Promise<*>} Datos de respuesta
   */
  const execute = async (command) => {
    loading.value = true
    error.value = null

    try {
      const result = await dispatcherService.execute(command)
      data.value = result
      return result
    } catch (err) {
      error.value = err.message || 'Error en la operación'
      console.error('[useDispatcher]', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Ejecuta un comando y retorna la respuesta completa
   * @param {Object} command - Comando a ejecutar
   * @returns {Promise<Object>} Respuesta completa
   */
  const executeWithFullResponse = async (command) => {
    loading.value = true
    error.value = null

    try {
      const result = await dispatcherService.executeWithFullResponse(command)
      data.value = result.data
      return result
    } catch (err) {
      error.value = err.message || 'Error en la operación'
      console.error('[useDispatcher]', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Resetea el estado
   */
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    executeWithFullResponse,
    reset
  }
}
