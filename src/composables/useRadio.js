import { ref, onMounted, onUnmounted } from 'vue'
import RadioServiceNew from '@/services/RadioServiceNew'
import { useDispatcher } from './useDispatcher'
import { useSignalRAuth } from './useSignalRAuth'

/**
 * Composable para manejar operaciones de radios
 * @param {Object} [options={}] - Opciones de configuración
 * @param {boolean} [options.enableRealtime=false] - Habilita actualizaciones en tiempo real
 * @returns {Object} Estado y métodos para manejar radios
 */
export function useRadio(options = {}) {
  const radios = ref([])
  const selectedRadio = ref(null)
  const programaciones = ref([])
  const { loading, error, execute } = useDispatcher()

  /**
   * Carga radios desde OBS/Huawei Cloud
   * @param {number} clientCode - Código del cliente
   * @param {string} username - Username del usuario
   * @param {string} [market=''] - Market (spotify, local, huawei)
   * @returns {Promise<Array>} Lista de radios
   */
  const loadRadiosFromObs = async (clientCode, username, market = '') => {
    try {
      const result = await RadioServiceNew.getRadiosByCliente(clientCode, username, market)

      if (result) {
        radios.value = result
      }

      return result
    } catch (err) {
      console.error('[useRadio.loadRadiosFromObs]', err)
      throw err
    }
  }

  /**
   * Carga playlist actual del cliente
   * @param {number} clientCode - Código del cliente
   * @param {string} username - Username del usuario
   * @returns {Promise<Array>} Playlist actual
   */
  const loadCurrentPlaylist = async (clientCode, username) => {
    try {
      const result = await RadioServiceNew.getDescargaActual(clientCode, username)
      return result
    } catch (err) {
      console.error('[useRadio.loadCurrentPlaylist]', err)
      throw err
    }
  }

  /**
   * Carga radios programadas
   * @param {string} username - Username del usuario
   * @returns {Promise<Array>} Radios programadas
   */
  const loadProgrammedRadios = async (username) => {
    try {
      const result = await RadioServiceNew.getRadioProgramada(username)
      return result
    } catch (err) {
      console.error('[useRadio.loadProgrammedRadios]', err)
      throw err
    }
  }

  /**
   * Carga programaciones del cliente
   * @param {string} username - Username del usuario
   * @returns {Promise<Array>} Programaciones
   */
  const loadProgramaciones = async (username) => {
    try {
      const result = await RadioServiceNew.getProgramacionesByCliente(username)

      if (result) {
        programaciones.value = result
      }

      return result
    } catch (err) {
      console.error('[useRadio.loadProgramaciones]', err)
      throw err
    }
  }

  /**
   * Carga radios libres (sin programación)
   * @returns {Promise<Array>} Radios libres
   */
  const loadRadiosLibres = async () => {
    try {
      const result = await RadioServiceNew.getRadioLibre()

      if (result) {
        radios.value = result
      }

      return result
    } catch (err) {
      console.error('[useRadio.loadRadiosLibres]', err)
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
      const result = await RadioServiceNew.altaProgramacion(codigoProgramacion, nombreProgramacion)
      return result
    } catch (err) {
      console.error('[useRadio.createProgramacion]', err)
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
      const result = await RadioServiceNew.bajaProgramacion(codigoProgramacion)

      // Actualizar lista local
      if (result && programaciones.value) {
        programaciones.value = programaciones.value.filter(
          p => p.codigo !== codigoProgramacion
        )
      }

      return result
    } catch (err) {
      console.error('[useRadio.deleteProgramacion]', err)
      throw err
    }
  }

  /**
   * Obtiene programaciones por programa
   * @param {string} codigoProgramacion - Código de la programación
   * @returns {Promise<Array>} Programaciones del programa
   */
  const getProgramacionesByPrograma = async (codigoProgramacion) => {
    try {
      const result = await RadioServiceNew.getProgramacionesByPrograma(codigoProgramacion)
      return result
    } catch (err) {
      console.error('[useRadio.getProgramacionesByPrograma]', err)
      throw err
    }
  }

  /**
   * Guarda programación horaria
   * @param {Object} programacionData - Datos de la programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const saveProgramacionHorario = async (programacionData) => {
    try {
      const result = await RadioServiceNew.guardarProgramacionHorario(programacionData)
      return result
    } catch (err) {
      console.error('[useRadio.saveProgramacionHorario]', err)
      throw err
    }
  }

  /**
   * Edita programación horaria
   * @param {string} codigo - Código de la programación
   * @param {Object} programacionData - Datos de la programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateProgramacionHorario = async (codigo, programacionData) => {
    try {
      const result = await RadioServiceNew.editarProgramacionHorario(codigo, programacionData)
      return result
    } catch (err) {
      console.error('[useRadio.updateProgramacionHorario]', err)
      throw err
    }
  }

  /**
   * Elimina programación horaria
   * @param {string} codigo - Código de la programación
   * @returns {Promise<Object>} Resultado de la operación
   */
  const deleteProgramacionHorario = async (codigo) => {
    try {
      const result = await RadioServiceNew.bajaProgramacionHorario(codigo)
      return result
    } catch (err) {
      console.error('[useRadio.deleteProgramacionHorario]', err)
      throw err
    }
  }

  /**
   * Obtiene programación semanal
   * @param {string} codigoPrograma - Código del programa
   * @returns {Promise<Object>} Programación semanal
   */
  const getProgramacionSemanal = async (codigoPrograma) => {
    try {
      const result = await RadioServiceNew.getProgramacionSemanal(codigoPrograma)
      return result
    } catch (err) {
      console.error('[useRadio.getProgramacionSemanal]', err)
      throw err
    }
  }

  /**
   * Guarda programación semanal
   * @param {Object} programacionSemanal - Datos de la programación semanal
   * @returns {Promise<Object>} Resultado de la operación
   */
  const saveProgramacionSemanal = async (programacionSemanal) => {
    try {
      const result = await RadioServiceNew.guardarProgramacionSemanal(programacionSemanal)
      return result
    } catch (err) {
      console.error('[useRadio.saveProgramacionSemanal]', err)
      throw err
    }
  }

  // Escuchar actualizaciones en tiempo real si esta habilitado
  if (options.enableRealtime) {
    const signalR = useSignalRAuth()

    const handleRadioUpdated = (data) => {
      console.log('Radio actualizada:', data)
    }

    const handleNotification = (notification) => {
      console.log('Notificacion de radio:', notification)
    }

    // Registrar listeners
    onMounted(() => {
      signalR.on('radioUpdated', handleRadioUpdated)
      signalR.on('notification', handleNotification)
    })

    // Limpiar listeners
    onUnmounted(() => {
      signalR.off('radioUpdated', handleRadioUpdated)
      signalR.off('notification', handleNotification)
    })
  }

  return {
    // Estado
    radios,
    selectedRadio,
    programaciones,
    loading,
    error,

    // Métodos
    loadRadiosFromObs,
    loadCurrentPlaylist,
    loadProgrammedRadios,
    loadProgramaciones,
    loadRadiosLibres,
    createProgramacion,
    deleteProgramacion,
    getProgramacionesByPrograma,
    saveProgramacionHorario,
    updateProgramacionHorario,
    deleteProgramacionHorario,
    getProgramacionSemanal,
    saveProgramacionSemanal
  }
}
