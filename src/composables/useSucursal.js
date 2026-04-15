import { ref, computed, onMounted, onUnmounted } from 'vue'
import SucursalServiceNew from '@/services/SucursalServiceNew'
import { useDispatcher } from './useDispatcher'
import { useSignalRAuth } from './useSignalRAuth'
import { useConnectionMonitor } from './useConnectionMonitor'
import moment from 'moment/moment'

/**
 * Composable para manejar operaciones de sucursales
 * @param {Object} [options={}] - Opciones de configuración
 * @param {boolean} [options.enableRealtime=false] - Habilita actualizaciones en tiempo real
 * @param {boolean} [options.enableConnectionMonitor=true] - Habilita monitor de conexiones mejorado
 * @returns {Object} Estado y métodos para manejar sucursales
 */
export function useSucursal(options = {}) {
  const sucursales = ref([])
  const selectedSucursal = ref(null)
  const sucursalesOnline = ref([])
  const currentClientCode = ref(null)
  const { loading, error } = useDispatcher()

  // Monitor de conexiones (si está habilitado)
  const connectionMonitor = options.enableConnectionMonitor !== false
    ? useConnectionMonitor()
    : null

  // Computed: Sucursales conectadas según el monitor
  const sucursalesConnected = computed(() => {
    if (!connectionMonitor) return []

    return sucursales.value.map(sucursal => {
      const isConnected = connectionMonitor.isConnectedByUsername(sucursal.username)
      const info = connectionMonitor.getBranchInfo(sucursal.username)
      const logs = connectionMonitor.getBranchLogs(sucursal.username)

      return {
        ...sucursal,
        ...info,
        conected: isConnected ? 1 : 0,
        event: isConnected ? 'conectado' : 'desconectado',
        connectionLogs: logs?.messages || [],
        connectionStatus: info?.status || (isConnected ? 'connected' : 'disconnected'),
        lastLogUpdate: logs?.lastUpdate || null
      }
    })
  })

  // Computed: Conteo de sucursales conectadas
  const connectedCount = computed(() => {
    return connectionMonitor ? connectionMonitor.getConnectedCount() : 0
  })

  // Computed: Logs globales del monitor
  const globalConnectionLogs = computed(() => {
    return connectionMonitor?.globalLogs?.value || []
  })

  /**
   * Carga sucursales del cliente
   * @param {number} [clientCode] - Código del cliente (opcional)
   * @returns {Promise<Array>} Lista de sucursales
   */
  const loadSucursales = async (clientCode) => {
    try {
      // Guardar el clientCode para futuros usos
      if (clientCode) {
        currentClientCode.value = clientCode
      }

      // Si no hay clientCode guardado, intentar obtenerlo del usuario actual
      if (!currentClientCode.value && !clientCode) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}')
          if (user.Cliente) {
            currentClientCode.value = JSON.parse(user.Cliente).cli_codigo
          }
        } catch (e) {
          console.warn('[useSucursal] No se pudo obtener clientCode del usuario:', e)
        }
      }

      const result = await SucursalServiceNew.getcliSucursalByCliente(clientCode || currentClientCode.value)

      if (result) {
        sucursales.value = result
      }

      return result
    } catch (err) {
      console.error('[useSucursal.loadSucursales]', err)
      throw err
    }
  }

  /**
   * Carga sucursales online
   * @returns {Promise<Array>} Lista de sucursales online
   */
  const loadSucursalesOnline = async () => {
    try {
      const result = await SucursalServiceNew.getSucursalesOnline()

      if (result) {
        sucursalesOnline.value = result
      }

      return result
    } catch (err) {
      console.error('[useSucursal.loadSucursalesOnline]', err)
      return []
    }
  }

  /**
   * Obtiene la programación de spot de una sucursal
   * @param {string} nombreSucursal - Nombre de la sucursal
   * @returns {Promise<Object>} Programación de spot
   */
  const getProgramacionSpot = async (nombreSucursal) => {
    try {
      const result = await SucursalServiceNew.getprogSpotBySuc(nombreSucursal)
      return result
    } catch (err) {
      console.error('[useSucursal.getProgramacionSpot]', err)
      throw err
    }
  }

  /**
   * Crea una nueva sucursal
   * @param {Object} sucursalData - Datos de la sucursal
   * @returns {Promise<Object>} Resultado de la operación
   */
  const createSucursal = async (sucursalData) => {
    try {
      const result = await SucursalServiceNew.altaSucursal(sucursalData)

      // Recargar sucursales después de crear usando el clientCode guardado
      if (result) {
        await loadSucursales(currentClientCode.value)
      }

      return result
    } catch (err) {
      console.error('[useSucursal.createSucursal]', err)
      throw err
    }
  }

  /**
   * Actualiza una sucursal existente
   * @param {Object} sucursalData - Datos de la sucursal
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateSucursal = async (sucursalData) => {
    try {
      const result = await SucursalServiceNew.put(sucursalData)

      // Actualizar sucursal en lista local
      if (result && sucursales.value) {
        const index = sucursales.value.findIndex(
          s => s.idSucursal === sucursalData.idSucursal
        )
        if (index !== -1) {
          // Recargar para obtener datos actualizados usando el clientCode guardado
          await loadSucursales(currentClientCode.value)
        }
      }

      return result
    } catch (err) {
      console.error('[useSucursal.updateSucursal]', err)
      throw err
    }
  }

  /**
   * Elimina sucursales
   * @param {Array<Object>} sucursalesToDelete - Array de sucursales a eliminar
   * @returns {Promise<Array>} Resultados de las eliminaciones
   */
  const deleteSucursales = async (sucursalesToDelete) => {
    try {
      const result = await SucursalServiceNew.bajaSucursal(sucursalesToDelete)

      // Actualizar lista local
      if (result && sucursales.value) {
        const deletedCodes = sucursalesToDelete.map(s => s.clisuc_codigo)
        sucursales.value = sucursales.value.filter(
          s => !deletedCodes.includes(s.clisuc_codigo)
        )
      }

      return result
    } catch (err) {
      console.error('[useSucursal.deleteSucursales]', err)
      throw err
    }
  }

  /**
   * Cambia el modo de reproducción de una sucursal
   * @param {string} sucursalCode - Código de la sucursal
   * @param {number} modo - Modo de reproducción (1: Radio, 2: Spots, 3: Mixto)
   * @returns {Promise<Object>} Resultado de la operación
   */
  const setModoReprod = async (sucursalCode, modo) => {
    try {
      const result = await SucursalServiceNew.setModoReprod(sucursalCode, modo)

      // Actualizar modo en lista local
      if (result && sucursales.value) {
        const index = sucursales.value.findIndex(
          s => s.clisuc_codigo === sucursalCode
        )
        if (index !== -1) {
          sucursales.value[index].modoActual = modo
        }
      }

      return result
    } catch (err) {
      console.error('[useSucursal.setModoReprod]', err)
      throw err
    }
  }

  /**
   * Verifica el estado de conexión de una sucursal
   * @param {string} username - Username de la sucursal
   * @returns {Promise<Object>} Estado de la sucursal
   */
  const verificarEstado = async (username) => {
    try {
      const result = await SucursalServiceNew.estadoSucursal(username)
      return result
    } catch (err) {
      console.error('[useSucursal.verificarEstado]', err)
      throw err
    }
  }

  /**
   * Actualiza la programación de una sucursal
   * @param {string} sucursalCode - Código de la sucursal
   * @param {string} programacionRadio - Programación de radio
   * @param {string} programacionSpot - Programación de spot
   * @returns {Promise<Object>} Resultado de la operación
   */
  const updateProgramacion = async (sucursalCode, programacionRadio, programacionSpot) => {
    try {
      const result = await SucursalServiceNew.updateProgramacion(
        sucursalCode,
        programacionRadio,
        programacionSpot
      )

      // Actualizar sucursal en lista local
      if (result && sucursales.value) {
        const index = sucursales.value.findIndex(
          s => s.clisuc_codigo === sucursalCode
        )
        if (index !== -1) {
          sucursales.value[index].programacionRadio = programacionRadio
          sucursales.value[index].programacionSpot = programacionSpot
        }
      }

      return result
    } catch (err) {
      console.error('[useSucursal.updateProgramacion]', err)
      throw err
    }
  }

  /**
   * Verifica si una sucursal está online
   * @param {string} sucursalCode - Código de la sucursal
   * @returns {boolean} True si está online
   */
  const isOnline = (sucursalCode) => {
    return sucursalesOnline.value.some(s => s.codigo === sucursalCode)
  }

  /**
   * Obtiene el estado de conexión de una sucursal
   * @param {string} sucursalCode - Código de la sucursal
   * @returns {string} Estado de conexión
   */
  const getEstadoConexion = (sucursalCode) => {
    const sucursal = sucursales.value.find(s => s.clisuc_codigo === sucursalCode)
    return sucursal?.event || 'desconectado'
  }

  // Escuchar actualizaciones en tiempo real si esta habilitado
  if (options.enableRealtime) {
    const signalR = useSignalRAuth()

    const handleSucursalModoChanged = (data) => {
      console.log('Modo de sucursal cambiado:', data)
      if (data?.sucursalCode && sucursales.value) {
        const index = sucursales.value.findIndex(
          s => s.clisuc_codigo === data.sucursalCode
        )
        if (index !== -1) {
          sucursales.value[index].modoActual = data.nuevoModo
        }
      }
    }

    const handleSucursalCreated = (data) => {
      console.log('Sucursal creada:', data)
      loadSucursales(currentClientCode.value)
    }

    const handleUserConnected = (data) => {
      console.log('Usuario conectado:', data)
      const userName = data?.userName || data?.UserName || data?.username
      const userId = data?.userId || data?.UserId
      if (userName && sucursales.value) {
        const index = sucursales.value.findIndex(
          s => s.username === userName || s.cli_usuari === userName
        )
        if (index !== -1) {
          const now = new Date()
          sucursales.value[index].event = 'conectado'
          sucursales.value[index].conected = 1
          sucursales.value[index].userId = userId
          sucursales.value[index].lastConnection = now.toISOString()
          sucursales.value[index].ultimaConexion = moment().format('HH:mm:ss [del] DD/MM/YYYY')
        }
      }
    }

    const handleUserDisconnected = (data) => {
      console.log('Usuario desconectado:', data)
      const userName = data?.userName || data?.UserName || data?.username
      if (userName && sucursales.value) {
        const index = sucursales.value.findIndex(
          s => s.username === userName || s.cli_usuari === userName
        )
        if (index !== -1) {
          const now = new Date()
          sucursales.value[index].event = 'desconectado'
          sucursales.value[index].conected = 0
          sucursales.value[index].lastConnection = now.toISOString()
          sucursales.value[index].ultimaConexion = 'Desconectado hace instantes'
        }
      }
    }

    const handleNotification = (notification) => {
      if (notification) {
        let userMessage = notification.user
        let message = null

        try {
          message = notification
        } catch (e) {
          console.warn('[notification] Error parsing message:', e)
          return
        }

        if (message.event === 'player_heartbeat') {
          console.log('[notification] Player heartbeat detectado de:', userMessage)

          const index = sucursales.value.findIndex(
            s => s.clisuc_nombre === userMessage ||
                 s.clisuc_nombre.toLowerCase() === userMessage.toLowerCase() ||
                 s.cli_usuari === userMessage ||
                 s.username === userMessage
          )

          if (index !== -1) {
            const status = message.status
            const now = new Date()

            sucursales.value[index] = {
              ...sucursales.value[index],
              conected: 1,
              userId: notification.userId,
              playerStatus: status,
              lastHeartbeat: message.timestamp,
              lastConnection: now.toISOString(),
              ultimaConexion: moment().format('HH:mm:ss [del] DD/MM/YYYY'),
              isPlaying: status.isPlaying || false,
              currentSong: status.currentItem?.title || '',
              activePlayer: status.activePlayer || status.mode || 'music',
              playbackProgress: status.playback ? {
                currentTime: status.playback.currentTime,
                duration: status.playback.duration,
                percentage: ((status.playback.currentTime / status.playback.duration) * 100).toFixed(1)
              } : null,
              musicRemaining: status.playlists?.musicRemaining || 0,
              totalSpots: status.playlists?.totalSpots || 0,
              spotsInWindow: status.playlists?.spotsInWindow || 0
            }
          }
        } else {
          sucursales.value.map(sucu => {
            if (sucu.clisuc_nombre.toLowerCase() == userMessage.toLowerCase()) {
              sucu.conected = 1
              sucu.detalle = message.title
            }
            return sucu
          })
        }
      }
      console.log('Notificacion de sucursal:', notification)
    }

    const handlePlayerHeartbeat = (data) => {
      console.log('[playerHeartbeat] Evento recibido:', JSON.stringify(data, null, 2))

      if (!data) {
        console.warn('[playerHeartbeat] No hay datos en el evento')
        return
      }

      let sucursalIndex = -1
      let identifiedBy = ''

      if (sucursales.value && sucursales.value.length > 0) {
        if (data.username || data.userName || data.user) {
          const username = data.username || data.userName || data.user
          sucursalIndex = sucursales.value.findIndex(
            s => s.cli_usuari === username || s.username === username || s.clisuc_nombre === username
          )
          identifiedBy = `username: ${username}`
        }

        if (sucursalIndex === -1 && data.userId) {
          sucursalIndex = sucursales.value.findIndex(s => s.userId === data.userId)
          identifiedBy = `userId: ${data.userId}`
        }

        if (sucursalIndex === -1 && data.connectionId) {
          sucursalIndex = sucursales.value.findIndex(s => s.connectionId === data.connectionId)
          identifiedBy = `connectionId: ${data.connectionId}`
        }

        if (sucursalIndex === -1) {
          const sucursalesConectadas = sucursales.value.filter(s => s.conected === 1)
          if (sucursalesConectadas.length === 1) {
            sucursalIndex = sucursales.value.findIndex(s => s === sucursalesConectadas[0])
            identifiedBy = 'unica sucursal conectada'
          }
        }

        if (sucursalIndex !== -1) {
          console.log(`[playerHeartbeat] Sucursal identificada por ${identifiedBy}:`, sucursales.value[sucursalIndex].clisuc_nombre)

          const status = data.status || data
          const now = new Date()
          sucursales.value[sucursalIndex] = {
            ...sucursales.value[sucursalIndex],
            playerStatus: status,
            lastHeartbeat: data.timestamp || now.toISOString(),
            lastConnection: now.toISOString(),
            ultimaConexion: 'Conectado ahora',
            isPlaying: status.isPlaying || false,
            currentSong: status.currentItem?.title || '',
            activePlayer: status.activePlayer || status.mode || 'music',
            playbackProgress: status.playback ? {
              currentTime: status.playback.currentTime,
              duration: status.playback.duration,
              percentage: ((status.playback.currentTime / status.playback.duration) * 100).toFixed(1)
            } : null,
            musicRemaining: status.playlists?.musicRemaining || 0,
            totalSpots: status.playlists?.totalSpots || 0,
            spotsInWindow: status.playlists?.spotsInWindow || 0
          }
        }
      }
    }

    // Registrar listeners
    onMounted(() => {
      signalR.on('sucursalModoChanged', handleSucursalModoChanged)
      signalR.on('sucursalCreated', handleSucursalCreated)
      signalR.on('userConnected', handleUserConnected)
      signalR.on('userDisconnected', handleUserDisconnected)
      signalR.on('notification', handleNotification)
      signalR.on('playerHeartbeat', handlePlayerHeartbeat)
    })

    // Limpiar listeners
    onUnmounted(() => {
      signalR.off('sucursalModoChanged', handleSucursalModoChanged)
      signalR.off('sucursalCreated', handleSucursalCreated)
      signalR.off('userConnected', handleUserConnected)
      signalR.off('userDisconnected', handleUserDisconnected)
      signalR.off('notification', handleNotification)
      signalR.off('playerHeartbeat', handlePlayerHeartbeat)
    })
  }

  return {
    // Estado
    sucursales,
    selectedSucursal,
    sucursalesOnline,
    currentClientCode,
    loading,
    error,

    // Estado de conexión (mejorado)
    sucursalesConnected,
    connectedCount,
    connectionMonitor,
    globalConnectionLogs,

    // Métodos - CRUD básico
    loadSucursales,
    loadSucursalesOnline,
    createSucursal,
    updateSucursal,
    deleteSucursales,

    // Métodos - Configuración
    setModoReprod,
    updateProgramacion,
    getProgramacionSpot,

    // Métodos - Estado
    verificarEstado,
    isOnline,
    getEstadoConexion
  }
}
