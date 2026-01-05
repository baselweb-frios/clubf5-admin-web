import { ref } from 'vue'
import { useSignalRAuth } from './useSignalRAuth'

/**
 * Composable para controlar el reproductor de sucursales via SignalR
 * Implementa los 20 comandos remotos disponibles
 * @param {string|Object} sucursalTarget - Codigo de la sucursal o objeto con { sucursalCode }
 * @param {Object} [options={}] - Opciones de configuracion
 * @param {Function} [options.onCommandSuccess] - Callback cuando un comando se ejecuta correctamente
 * @param {Function} [options.onCommandError] - Callback cuando hay error en un comando
 * @returns {Object} Metodos de control del reproductor
 */
export function usePlayerControl(sucursalTarget, options = {}) {
  const executing = ref(false)
  const lastCommand = ref(null)
  const lastError = ref(null)
  const targetSucursal = ref(null)

  // Instancia de SignalR
  const signalR = useSignalRAuth()

  // Configurar la sucursal target
  if (typeof sucursalTarget === 'string') {
    targetSucursal.value = sucursalTarget
  } else if (sucursalTarget && typeof sucursalTarget === 'object') {
    // Soporte para diferentes formatos de objeto
    if (!options.onCommandSuccess && !options.onCommandError) {
      // Si el segundo parametro no tiene callbacks, es options
      options = sucursalTarget
      targetSucursal.value = null
    } else {
      targetSucursal.value = sucursalTarget.clisuc_nombre ||
                            sucursalTarget.sucursalCode ||
                            sucursalTarget.clisuc_codigo ||
                            sucursalTarget.nombre ||
                            sucursalTarget.codigo ||
                            sucursalTarget.id ||
                            null
    }
  }

  /**
   * Ejecuta un comando remoto via SignalR
   * @param {string} commandName - Nombre del comando SignalR (ej: 'RemotePlay')
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   * @param  {...any} params - Parametros del comando
   * @returns {Promise<any>} Resultado del comando
   */
  const executeCommand = async (commandName, sucursalCode = null, ...params) => {
    try {
      executing.value = true
      lastError.value = null
      lastCommand.value = commandName

      // Determinar codigo de sucursal
      const target = sucursalCode || targetSucursal.value

      if (!target) {
        throw new Error('Debe especificar el codigo de la sucursal')
      }

      // Preparar parametros: si hay params los usamos, sino enviamos null
      const commandParams = params.length > 0 ? (params.length === 1 ? params[0] : params) : null

      console.log(`[PlayerControl] Ejecutando comando: ${commandName}`, {
        sucursal: target,
        parametros: commandParams,
        tipo: typeof commandParams,
        esArray: Array.isArray(commandParams)
      })

      // Formato esperado por el servidor:
      // SendCommandToSucursal(sucursalCode, commandName, parameters)
      // SIEMPRE envia 3 parametros
      const result = await signalR.invoke(
        'SendCommandToSucursal',
        target,
        commandName,
        commandParams
      )

      console.log(`[PlayerControl] Comando ${commandName} ejecutado exitosamente`, result)

      if (options.onCommandSuccess) {
        options.onCommandSuccess(commandName, result)
      }

      return result
    } catch (error) {
      console.error(`[PlayerControl] Error en comando ${commandName}:`, error)
      lastError.value = error

      if (options.onCommandError) {
        options.onCommandError(commandName, error)
      }

      throw error
    } finally {
      executing.value = false
    }
  }

  /**
   * Cambiar la sucursal target para futuros comandos
   * @param {string} sucursalCode - Nuevo codigo de sucursal
   */
  const setTarget = (sucursalCode) => {
    targetSucursal.value = sucursalCode
    console.log(`[PlayerControl] Target cambiado a: ${sucursalCode}`)
  }

  // ==========================================
  // CONTROL DE REPRODUCCION BASICO (5 comandos)
  // ==========================================

  /**
   * Reproducir el item actual
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const RemoteGetErrorReportSummary = async (sucursalCode = null) => {
    return await executeCommand('RemoteGetErrorReportSummary', sucursalCode)
  }
  const play = async (sucursalCode = null) => {
    return await executeCommand('RemotePlay', sucursalCode)
  }

  /**
   * Pausar la reproduccion
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const pause = async (sucursalCode = null) => {
    return await executeCommand('RemotePause', sucursalCode)
  }

  /**
   * Alternar entre play y pause
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const togglePlay = async (sucursalCode = null) => {
    return await executeCommand('RemoteTogglePlay', sucursalCode)
  }

  /**
   * Detener completamente la reproduccion
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const stop = async (sucursalCode = null) => {
    return await executeCommand('RemoteStop', sucursalCode)
  }

  /**
   * Saltar al siguiente item (musica o spot)
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const skip = async (sucursalCode = null) => {
    return await executeCommand('RemoteSkip', sucursalCode)
  }

  // ==========================================
  // CONTROL DE AUDIO (3 comandos)
  // ==========================================

  /**
   * Cambiar el volumen
   * @param {number} volume - Volumen (0.0 a 1.0)
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const setVolume = async (volume, sucursalCode = null) => {
    if (volume < 0 || volume > 1) {
      throw new Error('El volumen debe estar entre 0 y 1')
    }
    return await executeCommand('RemoteSetVolume', sucursalCode, volume)
  }

  /**
   * Alternar mute/unmute
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const toggleMute = async (sucursalCode = null) => {
    return await executeCommand('RemoteMute', sucursalCode)
  }

  /**
   * Cambiar velocidad de reproduccion
   * @param {number} rate - Velocidad (0.25 a 2.0)
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const setPlaybackRate = async (rate, sucursalCode = null) => {
    if (rate < 0.25 || rate > 2.0) {
      throw new Error('La velocidad debe estar entre 0.25 y 2.0')
    }
    return await executeCommand('RemoteSetPlaybackRate', sucursalCode, rate)
  }

  // ==========================================
  // NAVEGACION Y POSICION (3 comandos)
  // ==========================================

  /**
   * Saltar a una posicion especifica
   * @param {Object} position - Posicion {percentage: number} o {seconds: number}
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const seek = async (position, sucursalCode = null) => {
    if (!position.percentage && !position.seconds) {
      throw new Error('Debe especificar percentage o seconds')
    }
    return await executeCommand('RemoteSeek', sucursalCode, position)
  }

  /**
   * Forzar reproduccion de la siguiente cancion
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const forceNextMusic = async (sucursalCode = null) => {
    return await executeCommand('RemoteForceNextMusic', sucursalCode)
  }

  /**
   * Forzar reproduccion del siguiente spot
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const forceNextSpot = async (sucursalCode = null) => {
    return await executeCommand('RemoteForceNextSpot', sucursalCode)
  }

  // ==========================================
  // CONTROL DE PLAYLISTS (3 comandos)
  // ==========================================

  /**
   * Recargar playlists
   * @param {number} type - 0=ambas, 1=musica, 2=spots
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const reloadPlaylist = async (type = 0, sucursalCode = null) => {
    if (type < 0 || type > 2) {
      throw new Error('El tipo debe ser 0 (ambas), 1 (musica) o 2 (spots)')
    }
    return await executeCommand('RemoteReloadPlaylist', sucursalCode, type)
  }

  /**
   * Reproducir cancion por indice
   * @param {number} index - Indice en la playlist
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const playMusicByIndex = async (index, sucursalCode = null) => {
    if (index < 0) {
      throw new Error('El indice debe ser mayor o igual a 0')
    }
    return await executeCommand('RemotePlayMusicByIndex', sucursalCode, index)
  }

  /**
   * Reproducir spot por indice
   * @param {number} index - Indice en la ventana de spots
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const playSpotByIndex = async (index, sucursalCode = null) => {
    if (index < 0) {
      throw new Error('El indice debe ser mayor o igual a 0')
    }
    return await executeCommand('RemotePlaySpotByIndex', sucursalCode, index)
  }

  // ==========================================
  // PERSONALIZACION Y UI (3 comandos)
  // ==========================================

  /**
   * Cambiar tema visual
   * @param {string} themeId - ID del tema
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const setTheme = async (themeId, sucursalCode = null) => {
    return await executeCommand('RemoteSetTheme', sucursalCode, themeId)
  }

  /**
   * Mostrar/ocultar tabla de spots
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const toggleSpotTable = async (sucursalCode = null) => {
    return await executeCommand('RemoteToggleSpotTable', sucursalCode)
  }

  /**
   * Activar/desactivar modo video
   * @param {boolean} enabled - True para activar
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const setVideoMode = async (enabled, sucursalCode = null) => {
    return await executeCommand('RemoteSetVideoMode', sucursalCode, enabled)
  }

  // ==========================================
  // CONFIGURACION Y ESTADO (3 comandos)
  // ==========================================

  /**
   * Cambiar modo de reproduccion de spots
   * @param {string} mode - 'neuro' o 'radio'
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const setMode = async (mode, sucursalCode = null) => {
    if (mode !== 'neuro' && mode !== 'radio') {
      throw new Error('El modo debe ser "neuro" o "radio"')
    }
    return await executeCommand('RemoteSetMode', sucursalCode, {mode:mode})
  }

  /**
   * Obtener estado actual del reproductor
   * Solicita un heartbeat inmediato
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const getStatus = async (sucursalCode = null) => {
    return await executeCommand('RemoteGetStatus', sucursalCode)
  }

  /**
   * Limpiar errores del reproductor
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const clearError = async (sucursalCode = null) => {
    return await executeCommand('RemoteClearError', sucursalCode)
  }

  // ==========================================
  // METODOS HELPERS
  // ==========================================

  /**
   * Aumentar volumen en un 10%
   * @param {number} currentVolume - Volumen actual
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const volumeUp = async (currentVolume, sucursalCode = null) => {
    const newVolume = Math.min(1, currentVolume + 0.1)
    return await setVolume(newVolume, sucursalCode)
  }

  /**
   * Disminuir volumen en un 10%
   * @param {number} currentVolume - Volumen actual
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const volumeDown = async (currentVolume, sucursalCode = null) => {
    const newVolume = Math.max(0, currentVolume - 0.1)
    return await setVolume(newVolume, sucursalCode)
  }

  /**
   * Saltar adelante X segundos
   * @param {number} currentTime - Tiempo actual
   * @param {number} seconds - Segundos a adelantar
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const seekForward = async (currentTime, seconds = 10, sucursalCode = null) => {
    return await seek({ seconds: currentTime + seconds }, sucursalCode)
  }

  /**
   * Saltar atras X segundos
   * @param {number} currentTime - Tiempo actual
   * @param {number} seconds - Segundos a retroceder
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const seekBackward = async (currentTime, seconds = 10, sucursalCode = null) => {
    return await seek({ seconds: Math.max(0, currentTime - seconds) }, sucursalCode)
  }

  /**
   * Saltar a un porcentaje especifico
   * @param {number} percentage - Porcentaje (0-100)
   * @param {string} [sucursalCode] - Codigo de la sucursal (opcional si se configuro en constructor)
   */
  const seekToPercentage = async (percentage, sucursalCode = null) => {
    if (percentage < 0 || percentage > 100) {
      throw new Error('El porcentaje debe estar entre 0 y 100')
    }
    return await seek({ percentage }, sucursalCode)
  }

  return {
    // Estado
    executing,
    lastCommand,
    lastError,
    signalR,

    // Control de reproduccion basico
    play,
    RemoteGetErrorReportSummary,
    pause,
    togglePlay,
    stop,
    skip,

    // Control de audio
    setVolume,
    toggleMute,
    setPlaybackRate,

    // Navegacion
    seek,
    forceNextMusic,
    forceNextSpot,

    // Playlists
    reloadPlaylist,
    playMusicByIndex,
    playSpotByIndex,

    // Personalizacion
    setTheme,
    toggleSpotTable,
    setVideoMode,

    // Configuracion
    setMode,
    getStatus,
    clearError,

    // Helpers
    volumeUp,
    volumeDown,
    seekForward,
    seekBackward,
    seekToPercentage,

    // Metodo generico
    executeCommand
  }
}

export default usePlayerControl
