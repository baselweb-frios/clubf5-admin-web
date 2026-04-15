import { ref, onMounted, onUnmounted } from 'vue'
import { useSignalRAuth } from './useSignalRAuth'

/**
 * Composable para monitorear el estado de conexion de sucursales
 * Mantiene un registro actualizado de que sucursales estan conectadas
 *
 * @returns {Object} Estado y metodos de monitoreo
 */
export function useConnectionMonitor() {
  const connectedBranches = ref(new Map()) // userId -> branchInfo
  const lastHeartbeats = ref(new Map()) // userId -> timestamp
  const reconnectionAttempts = ref(new Map()) // userId -> { attempts: number, lastAttempt: timestamp }
  const branchLogs = ref(new Map()) // userId -> { messages: Array, lastUpdate: timestamp }
  const globalLogs = ref([]) // Logs globales del monitor
  const heartbeatTimeout = 45000 // 45 segundos (30s heartbeat + 15s margen)
  const maxReconnectionAttempts = 5 // Intentos máximos antes de marcar como desconectado
  const maxLogsPerBranch = 10 // Máximo de logs por sucursal

  let heartbeatCheckInterval = null

  // Instancia de SignalR
  const signalR = useSignalRAuth()

  /**
   * Agrega un mensaje de log para una sucursal específica
   * @param {string} userId - ID del usuario
   * @param {string} message - Mensaje a registrar
   * @param {string} [type='info'] - Tipo de log: 'info', 'success', 'warning', 'error'
   */
  const addBranchLog = (userId, message, type = 'info') => {
    if (!userId) return
    
    const now = new Date()
    const logEntry = {
      message,
      type,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    if (!branchLogs.value.has(userId)) {
      branchLogs.value.set(userId, { messages: [], lastUpdate: now.toISOString() })
    }

    const userLogs = branchLogs.value.get(userId)
    userLogs.messages.unshift(logEntry)
    
    // Mantener solo los últimos N logs
    if (userLogs.messages.length > maxLogsPerBranch) {
      userLogs.messages = userLogs.messages.slice(0, maxLogsPerBranch)
    }
    
    userLogs.lastUpdate = now.toISOString()
    branchLogs.value.set(userId, userLogs)
    
    console.log(`[ConnectionMonitor] ${message}`)
  }

  /**
   * Agrega un log global del monitor
   * @param {string} message - Mensaje a registrar
   * @param {string} [type='info'] - Tipo de log
   */
  const addGlobalLog = (message, type = 'info') => {
    const now = new Date()
    globalLogs.value.unshift({
      message,
      type,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    })
    
    // Mantener solo los últimos 50 logs globales
    if (globalLogs.value.length > 50) {
      globalLogs.value = globalLogs.value.slice(0, 50)
    }
    
    console.log(`[ConnectionMonitor] ${message}`)
  }

  /**
   * Obtiene los logs de una sucursal específica
   * @param {string} userId - ID del usuario
   * @returns {Object|null}
   */
  const getBranchLogs = (userId) => {
    return branchLogs.value.get(userId) || null
  }

  /**
   * Limpia los logs de una sucursal
   * @param {string} userId - ID del usuario
   */
  const clearBranchLogs = (userId) => {
    branchLogs.value.delete(userId)
  }

  /**
   * Verifica si una sucursal esta conectada por userId
   * @param {string} userId - ID del usuario de la sucursal
   * @returns {boolean}
   */
  const isConnected = (userId) => {
    if (!userId) return false
    return connectedBranches.value.has(userId)
  }

  /**
   * Verifica si una sucursal esta conectada por username
   * @param {string} username - Username de la sucursal
   * @returns {boolean}
   */
  const isConnectedByUsername = (username) => {
    if (!username) return false
    for (const [, info] of connectedBranches.value) {
      if (info.username === username || info.branchName === username) {
        return true
      }
    }
    return false
  }

  /**
   * Obtiene informacion de una sucursal conectada
   * @param {string} userId - ID del usuario
   * @returns {Object|null}
   */
  const getBranchInfo = (userId) => {
    return connectedBranches.value.get(userId) || null
  }

  /**
   * Obtiene todas las sucursales conectadas
   * @returns {Array}
   */
  const getAllConnected = () => {
    return Array.from(connectedBranches.value.values())
  }

  /**
   * Obtiene el conteo de sucursales conectadas
   * @returns {number}
   */
  const getConnectedCount = () => {
    return connectedBranches.value.size
  }

  /**
   * Registra una conexion de REPRODUCTOR
   * Solo se llama cuando detectamos un reproductor (via heartbeat)
   * @param {Object} data - Datos de conexion del reproductor
   */
  const registerConnection = async (data) => {
    // Soportar tanto camelCase como PascalCase
    const userId = data.userId || data.UserId || data.sucursalId || data.id
    const username = data.userName || data.UserName || data.username || data.user
    const branchName = data.branchName || data.BranchName || data.sucursalName || username
    const connectionId = data.connectionId || data.ConnectionId
    const sucursalId = data.sucursalId || data.SucursalId

    if (!userId) {
      addGlobalLog(`No se pudo registrar reproductor: userId faltante`, 'warning')
      return
    }

    const connectionInfo = {
      userId,
      username,
      branchName,
      sucursalId,
      connectionId,
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'connected',
      isPlayer: true, // Marcador de que es un reproductor
      // Datos del reproductor (del heartbeat)
      isPlaying: data.isPlaying,
      mode: data.mode,
      currentSong: data.currentSong || data.status?.currentItem?.title,
      activePlayer: data.activePlayer
    }

    connectedBranches.value.set(userId, connectionInfo)
    lastHeartbeats.value.set(userId, Date.now())

    // Unirse al grupo del usuario para recibir sus heartbeats y eventos
    if (username && signalR.connected()) {
      try {
        const groupName = `user_${username}`
        await signalR.joinGroup(groupName)
        addBranchLog(userId, `Unido al grupo: ${groupName}`, 'info')
      } catch (error) {
        addBranchLog(userId, `Error al unir al grupo user_${username}`, 'warning')
      }
    }

    addBranchLog(userId, `Reproductor conectado`, 'success')
    addGlobalLog(`Reproductor registrado: ${branchName} (${userId})`, 'success')
  }

  /**
   * Registra una desconexion de REPRODUCTOR
   * Solo afecta a reproductores que estaban registrados
   * @param {Object} data - Datos de desconexion
   */
  const registerDisconnection = async (data) => {
    // Soportar tanto camelCase como PascalCase
    const userId = data.userId || data.UserId || data.sucursalId || data.id
    const username = data.userName || data.UserName || data.username || data.user
    let usernameToLeave = username

    if (userId && connectedBranches.value.has(userId)) {
      const info = connectedBranches.value.get(userId)
      usernameToLeave = info.username || username
      addBranchLog(userId, `Sucursal desconectada`, 'error')
      connectedBranches.value.delete(userId)
      lastHeartbeats.value.delete(userId)
      reconnectionAttempts.value.delete(userId)
    } else if (username) {
      // Buscar por username si no tenemos userId
      for (const [uId, info] of connectedBranches.value) {
        if (info.username === username || info.branchName === username) {
          usernameToLeave = info.username || username
          addBranchLog(uId, `Sucursal desconectada`, 'error')
          connectedBranches.value.delete(uId)
          lastHeartbeats.value.delete(uId)
          reconnectionAttempts.value.delete(uId)
          break
        }
      }
    }

    // Salir del grupo del usuario desconectado
    if (usernameToLeave && signalR.connected()) {
      try {
        const groupName = `user_${usernameToLeave}`
        await signalR.leaveGroup(groupName)
        addGlobalLog(`Salido del grupo: ${groupName}`, 'info')
      } catch (error) {
        addGlobalLog(`Error al salir del grupo: ${usernameToLeave}`, 'warning')
      }
    }

    addGlobalLog(`Total conectadas: ${connectedBranches.value.size}`, 'info')
  }

  /**
   * Actualiza el timestamp del ultimo heartbeat
   * El cliente envia heartbeat con: userId, username, sucursalId, isPlaying, mode, currentSong, status, etc.
   * @param {string} userId - ID del usuario
   * @param {Object} [data] - Datos adicionales del heartbeat
   */
  const updateHeartbeat = (userId, data = {}) => {
    if (!userId) return

    const now = Date.now()
    lastHeartbeats.value.set(userId, now)

    // Resetear contador de reintentos al recibir heartbeat válido
    if (reconnectionAttempts.value.has(userId)) {
      addBranchLog(userId, `Reconexión exitosa`, 'success')
      reconnectionAttempts.value.delete(userId)
    }

    if (connectedBranches.value.has(userId)) {
      const info = connectedBranches.value.get(userId)
      info.lastSeen = new Date(now).toISOString()
      info.status = 'connected'

      // Actualizar datos del reproductor (soportar ambos formatos)
      if (data.isPlaying !== undefined) info.isPlaying = data.isPlaying
      if (data.currentSong) info.currentSong = data.currentSong
      if (data.mode) info.mode = data.mode
      if (data.activePlayer) info.activePlayer = data.activePlayer

      // Datos anidados en status (formato del cliente)
      if (data.status) {
        if (data.status.isPlaying !== undefined) info.isPlaying = data.status.isPlaying
        if (data.status.mode) info.mode = data.status.mode
        if (data.status.activePlayer) info.activePlayer = data.status.activePlayer
        if (data.status.currentItem?.title) info.currentSong = data.status.currentItem.title
        if (data.status.playback) info.playback = data.status.playback
        if (data.status.playlists) info.playlists = data.status.playlists
      }

      connectedBranches.value.set(userId, info)
      // Log silencioso para heartbeat normal (no saturar logs)
      console.log(`[ConnectionMonitor] Heartbeat: ${info.branchName || userId}`)
    } else {
      // Si no esta registrada, registrarla ahora
      registerConnection({
        userId,
        userName: data.username || data.user,
        branchName: data.branchName || data.sucursalName || data.username,
        connectionId: data.connectionId,
        ...data
      })
    }
  }

  /**
   * Verifica heartbeats expirados e intenta reconexión antes de marcar como desconectadas
   * Realiza hasta 5 intentos de verificación antes de desconectar definitivamente
   */
  const checkHeartbeatTimeouts = async () => {
    const now = Date.now()
    const expiredUsers = []
    const usersToDisconnect = []

    for (const [userId, lastHeartbeat] of lastHeartbeats.value) {
      if (now - lastHeartbeat > heartbeatTimeout) {
        expiredUsers.push(userId)
      }
    }

    if (expiredUsers.length === 0) return

    addGlobalLog(`Verificando ${expiredUsers.length} heartbeats expirados...`, 'warning')

    for (const userId of expiredUsers) {
      const info = connectedBranches.value.get(userId)
      if (!info) continue

      // Obtener o inicializar contador de reintentos
      let attemptInfo = reconnectionAttempts.value.get(userId)
      if (!attemptInfo) {
        attemptInfo = { attempts: 0, lastAttempt: now }
        reconnectionAttempts.value.set(userId, attemptInfo)
      }

      attemptInfo.attempts += 1
      attemptInfo.lastAttempt = now

      if (attemptInfo.attempts < maxReconnectionAttempts) {
        // Marcar como "verificando" pero no desconectar aún
        info.status = 'verifying'
        connectedBranches.value.set(userId, info)
        
        addBranchLog(userId, `Verificando conexión (${attemptInfo.attempts}/${maxReconnectionAttempts})`, 'warning')
        
        // Intentar solicitar actualización del servidor
        try {
          if (signalR.connected()) {
            await signalR.getOnlineUsers()
          }
        } catch (error) {
          addBranchLog(userId, `Error verificando estado`, 'error')
        }
      } else {
        // Máximos intentos alcanzados, marcar para desconexión
        addBranchLog(userId, `Sin respuesta después de ${maxReconnectionAttempts} intentos`, 'error')
        usersToDisconnect.push(userId)
      }
    }

    // Desconectar usuarios que agotaron sus intentos
    for (const userId of usersToDisconnect) {
      const info = connectedBranches.value.get(userId)
      if (info) {
        addBranchLog(userId, `Desconectado por timeout`, 'error')
        registerDisconnection({ userId })
        reconnectionAttempts.value.delete(userId)
      }
    }
  }

  /**
   * Solicita actualizacion de usuarios online al servidor
   */
  const requestOnlineUsersUpdate = async () => {
    try {
      if (signalR.connected()) {
        await signalR.getOnlineUsers()
        addGlobalLog('Solicitada actualización de usuarios online', 'info')
      }
    } catch (error) {
      addGlobalLog('Error solicitando usuarios online', 'error')
    }
  }

  /**
   * Sincroniza el estado desde la respuesta de OnlineUsersUpdate
   * El servidor envia: { TotalUsers, UserIds: ["id1", "id2"], Timestamp }
   * @param {Object} data - Datos del servidor
   */
  const syncFromOnlineUsers = (data) => {
    // Soportar ambas estructuras:
    // - Nueva del servidor: { TotalUsers, UserIds: [...], Timestamp }
    // - Anterior esperada: { onlineUsers: [{userId, ...}, ...] }
    const userIds = data?.UserIds || data?.userIds || []
    const onlineUsers = data?.onlineUsers || []

    // Si no hay datos, salir
    if (userIds.length === 0 && onlineUsers.length === 0) {
      addGlobalLog('OnlineUsersUpdate recibido sin usuarios', 'warning')
      return
    }

    const totalUsers = data?.TotalUsers || data?.totalUsers || userIds.length || onlineUsers.length
    addGlobalLog(`Sincronizando ${totalUsers} usuarios online`, 'info')

    // Crear set de userIds que estan online segun el servidor
    const serverOnlineUsers = new Set()

    // Procesar UserIds (array de strings) - formato actual del servidor
    userIds.forEach(userId => {
      if (userId) {
        serverOnlineUsers.add(userId)

        // Si ya esta registrado, actualizar heartbeat
        if (connectedBranches.value.has(userId)) {
          updateHeartbeat(userId)
        } else {
          // Registrar nueva conexion con datos minimos
          registerConnection({ userId, username: userId })
        }
      }
    })

    // Procesar onlineUsers (array de objetos) - formato alternativo
    onlineUsers.forEach(user => {
      const userId = user.userId || user.UserId || user.id
      if (userId) {
        serverOnlineUsers.add(userId)

        if (connectedBranches.value.has(userId)) {
          updateHeartbeat(userId, user)
        } else {
          registerConnection(user)
        }
      }
    })

    // Remover sucursales que estan en local pero no en el servidor
    for (const userId of connectedBranches.value.keys()) {
      if (!serverOnlineUsers.has(userId)) {
        addBranchLog(userId, `No presente en servidor, removiendo`, 'warning')
        registerDisconnection({ userId })
      }
    }

    addGlobalLog(`Sincronización completada: ${connectedBranches.value.size} sucursales online`, 'success')
  }

  /**
   * Limpia todas las conexiones registradas
   */
  const clearAll = () => {
    connectedBranches.value.clear()
    lastHeartbeats.value.clear()
    reconnectionAttempts.value.clear()
    branchLogs.value.clear()
    addGlobalLog('Todas las conexiones limpiadas', 'warning')
  }

  // Helper: normaliza claves comunes (PascalCase/camelCase) a nombres consistentes
  const normalizeData = (raw) => {
    if (!raw || typeof raw !== 'object') return raw
    const map = {
      UserId: 'userId', userId: 'userId', id: 'userId', sucursalId: 'userId', SucursalId: 'userId',
      UserName: 'username', userName: 'username', username: 'username', user: 'username',
      BranchName: 'branchName', branchName: 'branchName', sucursalName: 'branchName',
      ConnectionId: 'connectionId', connectionId: 'connectionId',
      isPlaying: 'isPlaying', mode: 'mode', currentSong: 'currentSong', activePlayer: 'activePlayer',
      TotalUsers: 'totalUsers', UserIds: 'userIds', userIds: 'userIds', onlineUsers: 'onlineUsers',
      message: 'message', event: 'event'
    }

    const out = {}
    for (const key of Object.keys(raw)) {
      const mapped = map[key] || key.charAt(0).toLowerCase() + key.slice(1)
      out[mapped] = raw[key]
    }
    // si trae status anidado, normalizarlo tambien y mezclar para facilitar acceso
    if (raw.status && typeof raw.status === 'object') {
      for (const k of Object.keys(raw.status)) {
        const mapped = map[k] || k.charAt(0).toLowerCase() + k.slice(1)
        out[mapped] = out[mapped] === undefined ? raw.status[k] : out[mapped]
      }
    }
    return out
  }

  // Helper: parse seguro de notificaciones que pueden venir como string JSON o con message string
  const parseNotification = (notification) => {
    try {
      if (!notification) return null
      if (typeof notification === 'string') {
        // puede ser JSON string
        return normalizeData(JSON.parse(notification))
      }
      if (typeof notification === 'object') {
        // message puede ser string JSON o objeto
        if (typeof notification.message === 'string') {
          try {
            const parsed = JSON.parse(notification.message)
            return normalizeData({ ...notification, ...parsed })
          } catch (e) {
            // message no JSON, devolver combinado
            return normalizeData(notification)
          }
        }
        // ya es objeto
        return normalizeData(notification)
      }
    } catch (e) {
      console.warn('[ConnectionMonitor] parseNotification error', e)
      return null
    }
  }

  // Configurar listeners de SignalR
  const setupListeners = () => {
    // Usuario conectado (ignorado - esperamos heartbeat)
    signalR.on('userConnected', (data) => {
      const payload = normalizeData(data)
      const userId = payload.userId || payload.username
      if (userId) {
        addBranchLog(userId, 'Conexión detectada (esperando heartbeat)', 'info')
      }
    })

    // Usuario desconectado
    signalR.on('userDisconnected', (data) => {
      const payload = normalizeData(data)
      const userId = payload.userId || payload.username
      if (userId) {
        addBranchLog(userId, 'Evento de desconexión recibido', 'warning')
      }
      registerDisconnection(payload)
    })

    // Actualizacion de usuarios online
    signalR.on('onlineUsersUpdate', () => {
      addGlobalLog(`Actualización de usuarios online recibida`, 'info')
      // No forzar sync automático, pero ofrecemos la función syncFromOnlineUsers si se necesita
    })

    // Heartbeat del reproductor
    signalR.on('playerHeartbeat', (data) => {
      const payload = normalizeData(data)
      const userId = payload.userId || payload.username
      if (userId) {
        if (!connectedBranches.value.has(userId)) {
          addBranchLog(userId, 'Nuevo reproductor detectado', 'success')
          registerConnection({
            userId,
            username: payload.username,
            branchName: payload.branchName,
            sucursalId: payload.sucursalId,
            connectionId: payload.connectionId,
            isPlayer: true,
            ...payload
          })
        }
        updateHeartbeat(userId, payload)
      }
    })

    // Notificaciones generales (pueden contener heartbeats)
    signalR.on('notification', (notification) => {
      const parsed = parseNotification(notification)
      if (!parsed) return
      // Detectar distintos esquemas de evento para player_heartbeat
      const eventName = parsed.event || parsed.type || parsed?.message?.event
      if (eventName && String(eventName).toLowerCase() === 'player_heartbeat') {
        const payload = normalizeData(parsed)
        const userId = payload.userId || payload.username
        if (userId) {
          if (!connectedBranches.value.has(userId)) {
            addBranchLog(userId, 'Reproductor detectado via notificación', 'success')
            registerConnection({
              userId,
              username: payload.username,
              branchName: payload.branchName,
              sucursalId: payload.sucursalId,
              connectionId: payload.connectionId,
              isPlayer: true,
              ...payload
            })
          }
          // fusionar status si existe para pasar campos anidados
          updateHeartbeat(userId, { ...payload, ...payload.status })
        }
      }
    })
  }

  // Lifecycle
  onMounted(async () => {
    addGlobalLog('Iniciando monitor de reproductores', 'info')

    // Arranque robusto de SignalR con retries
    const maxAttempts = 5
    let attempt = 0
    let started = false

    while (attempt < maxAttempts && !started) {
      attempt += 1
      try {
        await signalR.connect()
        started = true
        addGlobalLog(`SignalR conectado (intento ${attempt})`, 'success')
      } catch (err) {
        addGlobalLog(`Error conectando SignalR (intento ${attempt})`, 'warning')
        const delay = Math.min(5000, 500 * attempt)
        await new Promise(r => setTimeout(r, delay))
      }
    }

    if (!started) {
      addGlobalLog('No se pudo iniciar SignalR después de varios intentos', 'error')
    } else {
      // Configurar listeners una vez conectado
      setupListeners()
    }

    // Verificar timeouts cada 10 segundos (detectar reproductores desconectados)
    heartbeatCheckInterval = setInterval(() => {
      checkHeartbeatTimeouts()
    }, 10000)
  })

  onUnmounted(async () => {
    addGlobalLog('Deteniendo monitor de conexiones', 'warning')
    if (heartbeatCheckInterval) {
      clearInterval(heartbeatCheckInterval)
    }
    await signalR.disconnect()
  })

  return {
    // Estado
    connectedBranches,
    lastHeartbeats,
    reconnectionAttempts,
    branchLogs,
    globalLogs,
    signalR,

    // Metodos de consulta
    isConnected,
    isConnectedByUsername,
    getBranchInfo,
    getAllConnected,
    getConnectedCount,
    getBranchLogs,

    // Metodos de gestion
    registerConnection,
    registerDisconnection,
    updateHeartbeat,
    syncFromOnlineUsers,
    requestOnlineUsersUpdate,
    clearAll,
    clearBranchLogs,
    addBranchLog,
    addGlobalLog
  }
}

export default useConnectionMonitor
