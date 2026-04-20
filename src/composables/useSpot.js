import { ref, onMounted, onUnmounted } from 'vue'
import SpotServiceNew from '@/services/SpotServiceNew'
import { useDispatcher } from './useDispatcher'
import { useSignalRAuth } from './useSignalRAuth'

/**
 * Composable para manejar operaciones de spots
 * @param {Object} [options={}] - Opciones de configuración
 * @param {boolean} [options.enableRealtime=false] - Habilita actualizaciones en tiempo real
 * @returns {Object} Estado y métodos para manejar spots
 */
export function useSpot(options = {}) {
  const spots = ref([])
  const selectedSpot = ref(null)
  const programaciones = ref([])
  const { loading, error } = useDispatcher()

  /**
   * Carga spots del cliente actual
   * @param {boolean} [viewvencidos=false] - Incluir spots vencidos
   * @returns {Promise<Array>} Lista de spots
   */
  const loadSpotsByCliente = async (viewvencidos = false) => {
    try {
      const result = await SpotServiceNew.getSpotsBycodCliente(viewvencidos)

      if (result) {
        spots.value = result
      }

      return result
    } catch (err) {
      console.error('[useSpot.loadSpotsByCliente]', err)
      throw err
    }
  }

  /**
   * Carga todos los spots (admin)
   * @returns {Promise<Array>} Todos los spots
   */
  const loadAllSpots = async () => {
    try {
      const result = await SpotServiceNew.getSpots()

      if (result) {
        spots.value = result
      }

      return result
    } catch (err) {
      console.error('[useSpot.loadAllSpots]', err)
      throw err
    }
  }

  /**
   * Carga spots con caché
   * @param {boolean} [forceRefresh=false] - Forzar recarga desde API
   * @returns {Promise<Array>} Lista de spots
   */
  const loadSpotsCached = async (forceRefresh = false) => {
    try {
      const result = await SpotServiceNew.getSpotsCached(forceRefresh)

      if (result) {
        spots.value = result
      }

      return result
    } catch (err) {
      console.error('[useSpot.loadSpotsCached]', err)
      throw err
    }
  }

  /**
   * Crea un nuevo spot
   * @param {FormData} formData - Datos del spot
   * @returns {Promise<Object>} Resultado de la operación
   */
  const createSpot = async (formData) => {
    try {
      const result = await SpotServiceNew.guardarSpot(formData)
      return result
    } catch (err) {
      console.error('[useSpot.createSpot]', err)
      throw err
    }
  }

  /**
   * Actualiza un spot existente
   * @param {Object} formData - Datos del spot
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateSpot = async (formData) => {
    try {
      const result = await SpotServiceNew.editarSpot(formData)
      return result
    } catch (err) {
      console.error('[useSpot.updateSpot]', err)
      throw err
    }
  }

  /**
   * Elimina un spot
   * @param {string} spotCode - Código del spot
   * @returns {Promise<Object>} Resultado de la operación
   */
  const deleteSpot = async (spotCode) => {
    try {
      const result = await SpotServiceNew.bajaSpot(spotCode)

      // Actualizar lista local
      if (result && spots.value) {
        spots.value = spots.value.filter(s => s.spo_codigo !== spotCode)
      }

      return result
    } catch (err) {
      console.error('[useSpot.deleteSpot]', err)
      throw err
    }
  }

  /**
   * Sube un archivo de spot
   * @param {FormData} formData - Archivo a subir
   * @param {string} tipo - Tipo de archivo
   * @returns {Promise<Object>} Resultado de la operación
   */
  const uploadSpot = async (formData, tipo) => {
    try {
      const result = await SpotServiceNew.uploadSpot(formData, tipo)
      return result
    } catch (err) {
      console.error('[useSpot.uploadSpot]', err)
      throw err
    }
  }

  /**
   * Cambia el vencimiento de un spot
   * @param {string} spotCode - Código del spot
   * @param {string} fecha - Nueva fecha de vencimiento
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateVencimiento = async (spotCode, fecha) => {
    try {
      const result = await SpotServiceNew.cambiarVencimiento(spotCode, fecha)

      // Actualizar spot en lista local
      if (result && spots.value) {
        const index = spots.value.findIndex(s => s.spo_codigo === spotCode)
        if (index !== -1) {
          spots.value[index].spo_fecfin = SpotServiceNew.formatDate(fecha)
        }
      }

      return result
    } catch (err) {
      console.error('[useSpot.updateVencimiento]', err)
      throw err
    }
  }

  /**
   * Obtiene programaciones de spots
   * @returns {Promise<Array>} Programaciones
   */
  const loadProgramaciones = async () => {
    try {
      const result = await SpotServiceNew.getProgramacionesByCliente()

      if (result) {
        programaciones.value = result
      }

      return result
    } catch (err) {
      console.error('[useSpot.loadProgramaciones]', err)
      throw err
    }
  }

  /**
   * Crea una nueva programación
   * @param {string} codigoProgramacion - Código de la programación
   * @param {string} nombreProgramacion - Nombre de la programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const createProgramacion = async (codigoProgramacion, nombreProgramacion) => {
    try {
      const result = await SpotServiceNew.altaProgramacion(codigoProgramacion, nombreProgramacion)
      return result
    } catch (err) {
      console.error('[useSpot.createProgramacion]', err)
      throw err
    }
  }

  /**
   * Elimina una programación
   * @param {string} codigoProgramacion - Código de la programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const deleteProgramacion = async (codigoProgramacion) => {
    try {
      const result = await SpotServiceNew.bajaProgramacion(codigoProgramacion)

      // Actualizar lista local
      if (result && programaciones.value) {
        programaciones.value = programaciones.value.filter(
          p => p.codigo !== codigoProgramacion
        )
      }

      return result
    } catch (err) {
      console.error('[useSpot.deleteProgramacion]', err)
      throw err
    }
  }

  /**
   * Obtiene spots pautados (programados)
   * @returns {Promise<Array>} Spots programados
   */
  const loadSpotsPautados = async () => {
    try {
      const result = await SpotServiceNew.getSpotsPautados()
      return result
    } catch (err) {
      console.error('[useSpot.loadSpotsPautados]', err)
      return []
    }
  }

  /**
   * Reemplaza spots pautados
   * @param {string} codigoSpotIn - Código del spot entrante
   * @param {string} codigoSpot - Código del spot
   * @param {number} [codigoProg=0] - Código de programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const reemplazarPautados = async (codigoSpotIn, codigoSpot, codigoProg = 0) => {
    try {
      const result = await SpotServiceNew.ReemplazarPautados(codigoSpotIn, codigoSpot, codigoProg)
      return result
    } catch (err) {
      console.error('[useSpot.reemplazarPautados]', err)
      throw err
    }
  }

  /**
   * Borra spots pautados
   * @param {string} codigoSpot - Código del spot
   * @param {number} [codigoProg=0] - Código de programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const borrarPautados = async (codigoSpot, codigoProg = 0) => {
    try {
      const result = await SpotServiceNew.BorrarPautados(codigoSpot, codigoProg)
      return result
    } catch (err) {
      console.error('[useSpot.borrarPautados]', err)
      throw err
    }
  }

  /**
   * Obtiene link de compartir
   * @param {string} spotCode - Código del spot
   * @returns {Promise<string>} URL del link
   */
  const getLinkShare = async (spotCode) => {
    try {
      const result = await SpotServiceNew.getLinkShare(spotCode)
      return result
    } catch (err) {
      console.error('[useSpot.getLinkShare]', err)
      throw err
    }
  }

  /**
   * Refresca la lista de spots limpiando caché
   * @returns {Promise<void>}
   */
  const refreshSpots = async () => {
    try {
      await SpotServiceNew.refreshSpots()
    } catch (err) {
      console.error('[useSpot.refreshSpots]', err)
      throw err
    }
  }

  // Escuchar actualizaciones en tiempo real si esta habilitado
  if (options.enableRealtime) {
    const signalR = useSignalRAuth()

    const handleSpotDeleted = (data) => {
      console.log('Spot eliminado:', data)
      if (data?.spotCode && spots.value) {
        spots.value = spots.value.filter(s => s.spo_codigo !== data.spotCode)
      }
    }

    const handleSpotCreated = (data) => {
      console.log('Spot creado:', data)
    }

    const handleSpotUpdated = (data) => {
      console.log('Spot actualizado:', data)
    }

    const handleNotification = (notification) => {
      console.log('Notificacion de spot:', notification)
    }

    // Registrar listeners
    onMounted(() => {
      signalR.on('spotDeleted', handleSpotDeleted)
      signalR.on('spotCreated', handleSpotCreated)
      signalR.on('spotUpdated', handleSpotUpdated)
      signalR.on('notification', handleNotification)
    })

    // Limpiar listeners
    onUnmounted(() => {
      signalR.off('spotDeleted', handleSpotDeleted)
      signalR.off('spotCreated', handleSpotCreated)
      signalR.off('spotUpdated', handleSpotUpdated)
      signalR.off('notification', handleNotification)
    })
  }

  return {
    // Estado
    spots,
    selectedSpot,
    programaciones,
    loading,
    error,

    // Métodos - CRUD básico
    loadSpotsByCliente,
    loadAllSpots,
    loadSpotsCached,
    createSpot,
    updateSpot,
    deleteSpot,

    // Métodos - Archivos
    uploadSpot,

    // Métodos - Vencimiento
    updateVencimiento,

    // Métodos - Programación
    loadProgramaciones,
    createProgramacion,
    deleteProgramacion,

    // Métodos - Pautados
    loadSpotsPautados,
    reemplazarPautados,
    borrarPautados,

    // Métodos - Utilidades
    getLinkShare,
    refreshSpots
  }
}
