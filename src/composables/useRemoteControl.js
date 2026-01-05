import { ref, computed } from 'vue'
import { useSignalRAuth } from './useSignalRAuth'

/**
 * Composable para controlar reproductores remotamente
 * Utiliza los metodos del DataHub para enviar comandos
 */
export function useRemoteControl() {
  const isConnected = ref(false)
  const activeReproductores = ref([])
  const selectedReproductor = ref(null)
  const commandHistory = ref([])
  const lastCommandResult = ref(null)
  const error = ref(null)

  // Instancia de SignalR
  const signalR = useSignalRAuth()

  /**
   * Inicializar y escuchar eventos
   */
  const init = async () => {
    try {
      // Verificar si ya esta conectado
      if (!signalR.connected()) {
        await signalR.connect()
      }

      isConnected.value = signalR.connected()

      // Escuchar actualizaciones de usuarios online (reproductores)
      signalR.on('onlineUsersUpdate', handleOnlineUsersUpdate)

      // Escuchar respuestas de comandos remotos
      signalR.on('remoteCommandResult', handleCommandResult)

      // Escuchar heartbeats de reproductores
      signalR.on('playerHeartbeat', handlePlayerHeartbeat)

      // Solicitar lista inicial de usuarios online
      await getConnectedReproductores()

      console.log('[RemoteControl] Inicializado correctamente')
    } catch (err) {
      error.value = err.message
      console.error('[RemoteControl] Error al inicializar:', err)
      throw err
    }
  }

  /**
   * Handler para actualizaciones de usuarios online
   */
  const handleOnlineUsersUpdate = (data) => {
    console.log('[RemoteControl] Usuarios online:', data)
    // Actualizar lista de reproductores activos
    // Filtrar solo los que son reproductores (tienen rol "Reproductor")
    activeReproductores.value = data.UserIds || data.userIds || []
  }

  /**
   * Handler para resultados de comandos
   */
  const handleCommandResult = (result) => {
    console.log('[RemoteControl] Resultado de comando:', result)
    lastCommandResult.value = result
    commandHistory.value.unshift({
      ...result,
      timestamp: new Date()
    })
  }

  /**
   * Handler para heartbeats de reproductores
   */
  const handlePlayerHeartbeat = (data) => {
    console.log('[RemoteControl] Heartbeat:', data)

    // Actualizar informacion del reproductor en la lista activa
    const index = activeReproductores.value.findIndex(r => r.sucursalId === data.sucursalId)
    if (index > -1) {
      activeReproductores.value[index] = {
        ...activeReproductores.value[index],
        ...data,
        lastHeartbeat: new Date()
      }
    }
  }

  // =====================================
  // COMANDOS DE CONTROL DE REPRODUCCION
  // =====================================

  /**
   * Reproducir
   */
  const play = async (sucursalId) => {
    try {
      await signalR.invoke('ControlPlayback', sucursalId || selectedReproductor.value, 'Play')
      addCommandToHistory('Play', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al reproducir: ${err.message}`
      throw err
    }
  }

  /**
   * Pausar
   */
  const pause = async (sucursalId) => {
    try {
      await signalR.invoke('ControlPlayback', sucursalId || selectedReproductor.value, 'Pause')
      addCommandToHistory('Pause', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al pausar: ${err.message}`
      throw err
    }
  }

  /**
   * Detener
   */
  const stop = async (sucursalId) => {
    try {
      await signalR.invoke('ControlPlayback', sucursalId || selectedReproductor.value, 'Stop')
      addCommandToHistory('Stop', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al detener: ${err.message}`
      throw err
    }
  }

  /**
   * Siguiente cancion
   */
  const skip = async (sucursalId) => {
    try {
      await signalR.invoke('ControlPlayback', sucursalId || selectedReproductor.value, 'Skip')
      addCommandToHistory('Skip', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al saltar cancion: ${err.message}`
      throw err
    }
  }

  /**
   * Cambiar volumen
   */
  const setVolume = async (sucursalId, volume) => {
    try {
      // Asegurar que el volumen este entre 0 y 1
      const normalizedVolume = Math.max(0, Math.min(1, volume))

      await signalR.invoke('SetSucursalVolume', sucursalId || selectedReproductor.value, normalizedVolume)
      addCommandToHistory('SetVolume', sucursalId, { volume: normalizedVolume })
      error.value = null
    } catch (err) {
      error.value = `Error al cambiar volumen: ${err.message}`
      throw err
    }
  }

  /**
   * Cambiar modo de reproduccion (neuro/radio)
   */
  const setMode = async (sucursalId, mode) => {
    try {
      if (mode !== 'neuro' && mode !== 'radio') {
        throw new Error('Modo debe ser "neuro" o "radio"')
      }

      await signalR.invoke('SetSucursalMode', sucursalId || selectedReproductor.value, mode)
      addCommandToHistory('SetMode', sucursalId, { mode })
      error.value = null
    } catch (err) {
      error.value = `Error al cambiar modo: ${err.message}`
      throw err
    }
  }

  /**
   * Recargar playlist
   */
  const reloadPlaylist = async (sucursalId, type = 0) => {
    try {
      await signalR.invoke('ReloadSucursalPlaylist', sucursalId || selectedReproductor.value, type)
      addCommandToHistory('ReloadPlaylist', sucursalId, { type })
      error.value = null
    } catch (err) {
      error.value = `Error al recargar playlist: ${err.message}`
      throw err
    }
  }

  /**
   * Cambiar tema
   */
  const setTheme = async (sucursalId, themeId) => {
    try {
      await signalR.invoke('SetSucursalTheme', sucursalId || selectedReproductor.value, themeId)
      addCommandToHistory('SetTheme', sucursalId, { themeId })
      error.value = null
    } catch (err) {
      error.value = `Error al cambiar tema: ${err.message}`
      throw err
    }
  }

  /**
   * Obtener estado del reproductor
   */
  const getStatus = async (sucursalId) => {
    try {
      await signalR.invoke('GetSucursalStatus', sucursalId || selectedReproductor.value)
      addCommandToHistory('GetStatus', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al obtener estado: ${err.message}`
      throw err
    }
  }

  /**
   * Seek a una posicion especifica
   */
  const seek = async (sucursalId, percentage = null, seconds = null) => {
    try {
      await signalR.invoke('SeekSucursal', sucursalId || selectedReproductor.value, percentage, seconds)
      addCommandToHistory('Seek', sucursalId, { percentage, seconds })
      error.value = null
    } catch (err) {
      error.value = `Error al hacer seek: ${err.message}`
      throw err
    }
  }

  // =====================================
  // COMANDOS MULTIPLES
  // =====================================

  /**
   * Enviar comando a multiples reproductores
   */
  const sendCommandToMultiple = async (sucursalIds, command, parameters = null) => {
    try {
      await signalR.invoke('SendCommandToMultipleSucursales', sucursalIds, command, parameters)
      addCommandToHistory(`Multiple:${command}`, sucursalIds.join(','), parameters)
      error.value = null
    } catch (err) {
      error.value = `Error al enviar comando multiple: ${err.message}`
      throw err
    }
  }

  /**
   * Controlar reproduccion de multiples reproductores
   */
  const controlMultiplePlayback = async (sucursalIds, action) => {
    try {
      await signalR.invoke('ControlMultiplePlayback', sucursalIds, action)
      addCommandToHistory(`MultiplePlayback:${action}`, sucursalIds.join(','))
      error.value = null
    } catch (err) {
      error.value = `Error al controlar multiples reproductores: ${err.message}`
      throw err
    }
  }

  /**
   * Cambiar volumen de multiples reproductores
   */
  const setMultipleVolume = async (sucursalIds, volume) => {
    try {
      const normalizedVolume = Math.max(0, Math.min(1, volume))
      await signalR.invoke('SetMultipleVolume', sucursalIds, normalizedVolume)
      addCommandToHistory('MultipleVolume', sucursalIds.join(','), { volume: normalizedVolume })
      error.value = null
    } catch (err) {
      error.value = `Error al cambiar volumen multiple: ${err.message}`
      throw err
    }
  }

  /**
   * Cambiar modo de multiples reproductores
   */
  const setMultipleMode = async (sucursalIds, mode) => {
    try {
      if (mode !== 'neuro' && mode !== 'radio') {
        throw new Error('Modo debe ser "neuro" o "radio"')
      }

      await signalR.invoke('SetMultipleMode', sucursalIds, mode)
      addCommandToHistory('MultipleMode', sucursalIds.join(','), { mode })
      error.value = null
    } catch (err) {
      error.value = `Error al cambiar modo multiple: ${err.message}`
      throw err
    }
  }

  // =====================================
  // COMANDOS DE EMERGENCIA
  // =====================================

  /**
   * EMERGENCIA: Pausar todos los reproductores
   */
  const emergencyPauseAll = async () => {
    try {
      await signalR.invoke('EmergencyPauseAll')
      addCommandToHistory('EMERGENCY:PauseAll', 'ALL')
      error.value = null
    } catch (err) {
      error.value = `Error en pausa de emergencia: ${err.message}`
      throw err
    }
  }

  /**
   * EMERGENCIA: Silenciar todos los reproductores
   */
  const emergencyMuteAll = async () => {
    try {
      await signalR.invoke('EmergencyMuteAll')
      addCommandToHistory('EMERGENCY:MuteAll', 'ALL')
      error.value = null
    } catch (err) {
      error.value = `Error en silencio de emergencia: ${err.message}`
      throw err
    }
  }

  /**
   * EMERGENCIA: Reanudar todos los reproductores
   */
  const emergencyResumeAll = async () => {
    try {
      await signalR.invoke('EmergencyResumeAll')
      addCommandToHistory('EMERGENCY:ResumeAll', 'ALL')
      error.value = null
    } catch (err) {
      error.value = `Error al reanudar todos: ${err.message}`
      throw err
    }
  }

  // =====================================
  // CONSULTAS
  // =====================================

  /**
   * Verificar si un reproductor esta online
   */
  const isSucursalOnline = async (sucursalId) => {
    try {
      await signalR.invoke('IsSucursalOnline', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al verificar estado: ${err.message}`
      throw err
    }
  }

  /**
   * Obtener lista de reproductores conectados
   */
  const getConnectedReproductores = async () => {
    try {
      await signalR.invoke('GetConnectedSucursales')
      error.value = null
    } catch (err) {
      error.value = `Error al obtener reproductores: ${err.message}`
      throw err
    }
  }

  /**
   * Verificar multiples reproductores
   */
  const checkMultiple = async (sucursalIds) => {
    try {
      await signalR.invoke('CheckMultipleSucursales', sucursalIds)
      error.value = null
    } catch (err) {
      error.value = `Error al verificar multiples: ${err.message}`
      throw err
    }
  }

  /**
   * Solicitar heartbeat de todos los reproductores
   */
  const requestAllHeartbeats = async () => {
    try {
      await signalR.invoke('RequestAllHeartbeats')
      error.value = null
    } catch (err) {
      error.value = `Error al solicitar heartbeats: ${err.message}`
      throw err
    }
  }

  /**
   * Ping a un reproductor especifico
   */
  const ping = async (sucursalId) => {
    try {
      await signalR.invoke('PingSucursal', sucursalId)
      error.value = null
    } catch (err) {
      error.value = `Error al hacer ping: ${err.message}`
      throw err
    }
  }

  // =====================================
  // UTILIDADES
  // =====================================

  /**
   * Agregar comando al historial
   */
  const addCommandToHistory = (command, target, parameters = null) => {
    commandHistory.value.unshift({
      command,
      target,
      parameters,
      timestamp: new Date(),
      success: true
    })

    // Mantener solo los ultimos 50 comandos
    if (commandHistory.value.length > 50) {
      commandHistory.value = commandHistory.value.slice(0, 50)
    }
  }

  /**
   * Limpiar historial de comandos
   */
  const clearHistory = () => {
    commandHistory.value = []
  }

  /**
   * Seleccionar un reproductor
   */
  const selectReproductor = (sucursalId) => {
    selectedReproductor.value = sucursalId
  }

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Obtener informacion del reproductor seleccionado
   */
  const selectedReproductorInfo = computed(() => {
    if (!selectedReproductor.value) return null
    return activeReproductores.value.find(r => r.sucursalId === selectedReproductor.value)
  })

  /**
   * Desconectar y limpiar
   */
  const cleanup = () => {
    signalR.off('onlineUsersUpdate', handleOnlineUsersUpdate)
    signalR.off('remoteCommandResult', handleCommandResult)
    signalR.off('playerHeartbeat', handlePlayerHeartbeat)
  }

  return {
    // Estado
    isConnected,
    activeReproductores,
    selectedReproductor,
    selectedReproductorInfo,
    commandHistory,
    lastCommandResult,
    error,
    signalR,

    // Inicializacion
    init,
    cleanup,

    // Control basico
    play,
    pause,
    stop,
    skip,
    setVolume,
    setMode,
    reloadPlaylist,
    setTheme,
    getStatus,
    seek,

    // Control multiple
    sendCommandToMultiple,
    controlMultiplePlayback,
    setMultipleVolume,
    setMultipleMode,

    // Emergencia
    emergencyPauseAll,
    emergencyMuteAll,
    emergencyResumeAll,

    // Consultas
    isSucursalOnline,
    getConnectedReproductores,
    checkMultiple,
    requestAllHeartbeats,
    ping,

    // Utilidades
    selectReproductor,
    clearHistory,
    clearError
  }
}

export default useRemoteControl
