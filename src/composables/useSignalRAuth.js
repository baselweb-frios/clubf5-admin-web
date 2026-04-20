// composables/useSignalRAuth.js
import { ref, readonly } from 'vue'
import * as signalR from '@microsoft/signalr'

// ============================================
// ESTADO SINGLETON (compartido entre todas las instancias)
// ============================================
let sharedConnection = null
const sharedIsConnected = ref(false)
const sharedConnectionState = ref('Disconnected')
const sharedConnectionInfo = ref(null)
const sharedNotifications = ref([])
const sharedLastMessage = ref(null)
const sharedOnlineUsers = ref({ totalUsers: 0, userIds: [] })
const sharedAuthStatus = ref({
  isAuthenticating: false,
  isAuthenticated: false,
  error: null,
  token: null,
  userData: null
})

// Listeners registrados (compartido)
const registeredListeners = new Map()

// Cache de eventos
const cachePrefix = 'signalr_cache_'
const cacheTimestampPrefix = 'signalr_ts_'
const cacheExpiryMs = 5 * 60 * 1000 // 5 minutos

// Flag para evitar multiples inicializaciones
let isInitializing = false
let initPromise = null

export function useSignalRAuth() {

  const connect = async (hubUrl = import.meta.env.VITE_HUB_URL || import.meta.env.VITE_API_BASE_URL_WS + 'data-hub') => {
    // Si ya esta conectado, retornar
    if (sharedConnection && sharedIsConnected.value) {
      console.log('[SignalR] Ya conectado, reutilizando conexion existente')
      return
    }

    // Si ya se esta inicializando, esperar
    if (isInitializing && initPromise) {
      console.log('[SignalR] Esperando inicializacion en curso...')
      return initPromise
    }

    isInitializing = true
    initPromise = (async () => {
      try {
        // Obtener el token JWT del localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')

        if (!token) {
          console.warn('[SignalR] No se encontro token JWT. Conectando como anonimo...')
        }

        // Decodificar token para obtener informacion de usuario
        let username = null
        if (token) {
          try {
            const tokenParts = token.split('.')
            if (tokenParts.length === 3) {
              const payload = JSON.parse(window.atob(tokenParts[1]))
              console.log('[SignalR] Token payload:', payload)

              username = payload.unique_name ||
                        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                        payload.name ||
                        payload.usuario

              console.log('[SignalR] Usuario autenticado:', { username, allClaims: Object.keys(payload) })

              if (!username) {
                console.error('[SignalR] No se encontro username en el token. Claims disponibles:', Object.keys(payload))
              }
            }
          } catch (error) {
            console.error('[SignalR] Error al decodificar token:', error)
          }
        }

        sharedConnection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token
            // Nota: No usar skipNegotiation para permitir que el servidor negocie el transporte
            // El servidor puede usar WebSockets, SSE o Long Polling según disponibilidad
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              if (retryContext.previousRetryCount === 0) return 0
              if (retryContext.previousRetryCount === 1) return 2000
              if (retryContext.previousRetryCount === 2) return 10000
              return 30000
            }
          })
          .configureLogging(signalR.LogLevel.Information)
          .build()

        // ============================================
        // EVENTOS DE CONEXION
        // ============================================

        sharedConnection.on('ConnectionEstablished', async (data) => {
          console.log('[SignalR] Conexion establecida:', data)
          sharedConnectionInfo.value = data
          sharedIsConnected.value = true
          sharedConnectionState.value = 'Connected'

          if (username) {
            try {
              const groupName = `user_${username}`
              await sharedConnection.invoke('JoinGroup', groupName)
              console.log(`[SignalR] Unido al grupo de usuario: ${groupName}`)
            } catch (error) {
              console.error('[SignalR] Error al unirse al grupo de usuario:', error)
            }
          }
        })

        // ============================================
        // EVENTOS DE MENSAJES Y NOTIFICACIONES
        // ============================================

        sharedConnection.on('Receive', (data) => {
          const message = typeof data === 'string' ? JSON.parse(data) : data

          sharedLastMessage.value = message
          sharedNotifications.value.unshift({
            ...message,
            id: Date.now(),
            receivedAt: new Date()
          })

          console.log('[SignalR] Mensaje recibido:', message)

          try {
            const innerMessage = typeof message.message === 'string'
              ? JSON.parse(message.message)
              : message.message || message

            if (innerMessage && innerMessage.event) {
              console.log(`[SignalR] Evento detectado: ${innerMessage.event}`, innerMessage)
              notifyListeners(innerMessage.event, innerMessage)

              switch (innerMessage.event) {
                case 'player_heartbeat':
                  cacheEvent('playerHeartbeat', innerMessage)
                  notifyListeners('playerHeartbeat', innerMessage)
                  break
                case 'player_dying':
                  notifyListeners('playerDying', innerMessage)
                  break
                case 'player_visibility_change':
                  notifyListeners('playerVisibilityChange', innerMessage)
                  break
                case 'music_next':
                case 'music_load_error':
                case 'music_resumed':
                case 'music_fade_in':
                case 'music_fade_out':
                  notifyListeners('musicEvent', innerMessage)
                  break
                case 'spot_starting':
                case 'spot_loaded_success':
                case 'spot_time_reached':
                  notifyListeners('spotEvent', innerMessage)
                  break
                default:
                  notifyListeners('playerEvent', innerMessage)
              }
            }
          } catch (e) {
            // Si no se puede parsear, ignorar
          }

          notifyListeners('notification', message)
        })

        // ============================================
        // EVENTOS DE USUARIOS
        // ============================================

        sharedConnection.on('UserConnected', (data) => {
          console.log('[SignalR] Usuario conectado:', data)
          cacheEvent('userConnected', data)
          notifyListeners('userConnected', data)
        })

        sharedConnection.on('UserDisconnected', (data) => {
          console.log('[SignalR] Usuario desconectado:', data)
          cacheEvent('userDisconnected', data)
          notifyListeners('userDisconnected', data)
        })

        sharedConnection.on('OnlineUsersUpdate', (data) => {
          sharedOnlineUsers.value = {
            totalUsers: data.TotalUsers || data.totalUsers,
            userIds: data.UserIds || data.userIds || []
          }
          console.log('[SignalR] Usuarios online:', sharedOnlineUsers.value)
          cacheEvent('onlineUsersUpdate', data)
          notifyListeners('onlineUsersUpdate', data)
        })

        sharedConnection.on('onlineUsers', (data) => {
          console.log('[SignalR] Online Users (direct):', data)
          cacheEvent('onlineUsersUpdate', data)
          notifyListeners('onlineUsersUpdate', data)
        })

        sharedConnection.on('UserJoinedGroup', (data) => {
          console.log('[SignalR] Usuario se unio al grupo:', data)
          notifyListeners('userJoinedGroup', data)
        })

        sharedConnection.on('UserLeftGroup', (data) => {
          console.log('[SignalR] Usuario salio del grupo:', data)
          notifyListeners('userLeftGroup', data)
        })

        sharedConnection.on('MyInfo', (data) => {
          console.log('[SignalR] Mi informacion:', data)
          notifyListeners('myInfo', data)
        })

        sharedConnection.on('OnlineUsers', (data) => {
          console.log('[SignalR] Lista de usuarios online:', data)
          notifyListeners('onlineUsersList', data)
        })

        sharedConnection.on('Error', (data) => {
          console.error('[SignalR] Error:', data)
          notifyListeners('error', data)
        })

        // ============================================
        // EVENTOS DE NEGOCIO (ADMIN SPECIFIC)
        // ============================================

        sharedConnection.on('Sucursal.ModoChanged', (data) => {
          console.log('[SignalR] Modo Changed:', data)
          notifyListeners('sucursalModoChanged', data)
        })

        sharedConnection.on('Spot.Delete.Result', (data) => {
          console.log('[SignalR] Spot Deleted:', data)
          notifyListeners('spotDeleted', data)
        })

        sharedConnection.on('Spot.Create.Result', (data) => {
          console.log('[SignalR] Spot Created:', data)
          notifyListeners('spotCreated', data)
        })

        sharedConnection.on('Spot.Update.Result', (data) => {
          console.log('[SignalR] Spot Updated:', data)
          notifyListeners('spotUpdated', data)
        })

        sharedConnection.on('Sucursal.Create.Result', (data) => {
          console.log('[SignalR] Sucursal Created:', data)
          notifyListeners('sucursalCreated', data)
        })

        sharedConnection.on('Radio.Update.Result', (data) => {
          console.log('[SignalR] Radio Updated:', data)
          notifyListeners('radioUpdated', data)
        })

        sharedConnection.on('player_heartbeat', (data) => {
          console.log('[SignalR] Player Heartbeat:', data)
          cacheEvent('playerHeartbeat', data)
          notifyListeners('playerHeartbeat', data)
        })

        sharedConnection.on('CommandResult', (result) => {
          console.log('[SignalR] Command Result:', result)
          notifyListeners('commandResult', result)
        })

        sharedConnection.on('RemoteCommandResult', (result) => {
          console.log('[SignalR] Remote Command Result:', result)
          notifyListeners('remoteCommandResult', result)
        })

        // ============================================
        // HANDLERS DE AUTENTICACION REMOTA
        // ============================================

        sharedConnection.on('LoginSuccess', (data) => {
          console.log('[SignalR] Login exitoso:', data)
          sharedAuthStatus.value.isAuthenticating = false
          sharedAuthStatus.value.isAuthenticated = true
          sharedAuthStatus.value.error = null
          sharedAuthStatus.value.token = data.Token || data.token || data.access_token
          sharedAuthStatus.value.userData = data.User || data.user || data.UserData || data.userData

          if (sharedAuthStatus.value.token) {
            localStorage.token = sharedAuthStatus.value.token

            try {
              const tokenParts = sharedAuthStatus.value.token.split('.')
              if (tokenParts.length === 3) {
                const payload = JSON.parse(window.atob(tokenParts[1]))
                const userData = {
                  cliente: JSON.parse(payload.Cliente || '{}'),
                  nombre: payload.Nombre,
                  numSuc: payload.NumSuc,
                  role: payload.role,
                  usuario: payload.unique_name,
                  refresh: payload.tokenRefresh,
                  exp: payload.exp
                }
                localStorage.userData = JSON.stringify(userData)
                sharedAuthStatus.value.userData = userData
              }
            } catch (error) {
              console.error('[SignalR] Error al decodificar token:', error)
            }
          }
        })

        sharedConnection.on('LoginError', (data) => {
          console.error('[SignalR] Login fallido:', data)
          sharedAuthStatus.value.isAuthenticating = false
          sharedAuthStatus.value.isAuthenticated = false
          sharedAuthStatus.value.error = data.Message || data.message || data.Error || data.error || 'Error de autenticacion'
          sharedAuthStatus.value.token = null
          sharedAuthStatus.value.userData = null
        })

        sharedConnection.on('Unauthorized', (data) => {
          console.warn('[SignalR] No autorizado:', data)
          sharedAuthStatus.value.isAuthenticated = false
          sharedAuthStatus.value.error = data.Message || data.message || 'No autorizado'
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
        })

        sharedConnection.on('LogoutSuccess', (data) => {
          console.log('[SignalR] Logout exitoso:', data)
          sharedAuthStatus.value.isAuthenticated = false
          sharedAuthStatus.value.token = null
          sharedAuthStatus.value.userData = null
          sharedAuthStatus.value.error = null
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
        })

        // ============================================
        // HANDLERS DE PERSONALIZACION DE TEMA
        // ============================================

        sharedConnection.on('SetTheme', (data) => {
          console.log('[SignalR] Comando SetTheme recibido:', data)
          const themeId = typeof data === 'string' ? data : data.themeId || data.ThemeId
          window.dispatchEvent(new CustomEvent('signalr-theme-change', {
            detail: { type: 'preset', themeId }
          }))
          notifyListeners('setTheme', data)
        })

        sharedConnection.on('UpdateThemeProperty', (data) => {
          console.log('[SignalR] Comando UpdateThemeProperty recibido:', data)
          window.dispatchEvent(new CustomEvent('signalr-theme-update', {
            detail: {
              category: data.category || data.Category,
              key: data.key || data.Key,
              value: data.value || data.Value
            }
          }))
          notifyListeners('updateThemeProperty', data)
        })

        sharedConnection.on('ApplyThemeChanges', (data) => {
          console.log('[SignalR] Comando ApplyThemeChanges recibido:', data)
          window.dispatchEvent(new CustomEvent('signalr-theme-bulk-update', {
            detail: data
          }))
          notifyListeners('applyThemeChanges', data)
        })

        sharedConnection.on('ResetTheme', () => {
          console.log('[SignalR] Comando ResetTheme recibido')
          window.dispatchEvent(new CustomEvent('signalr-theme-reset'))
          notifyListeners('resetTheme', {})
        })

        sharedConnection.on('ImportTheme', (data) => {
          console.log('[SignalR] Comando ImportTheme recibido')
          const themeJson = typeof data === 'string' ? data : data.themeJson || data.ThemeJson
          window.dispatchEvent(new CustomEvent('signalr-theme-import', {
            detail: { themeJson }
          }))
          notifyListeners('importTheme', data)
        })

        // ============================================
        // EVENTOS DE RECONEXION
        // ============================================

        sharedConnection.onreconnecting((error) => {
          console.warn('[SignalR] Reconectando...', error)
          sharedIsConnected.value = false
          sharedConnectionState.value = 'Reconnecting'
        })

        sharedConnection.onreconnected((connectionId) => {
          console.log('[SignalR] Reconectado:', connectionId)
          sharedIsConnected.value = true
          sharedConnectionState.value = 'Connected'
        })

        sharedConnection.onclose((error) => {
          console.error('[SignalR] Conexion cerrada:', error)
          sharedIsConnected.value = false
          sharedConnectionState.value = 'Disconnected'
        })

        // Iniciar conexion
        await sharedConnection.start()
        sharedIsConnected.value = true
        sharedConnectionState.value = 'Connected'
        console.log('[SignalR] Conectado exitosamente')

      } catch (error) {
        console.error('[SignalR] Error conectando:', error)
        sharedIsConnected.value = false
        sharedConnectionState.value = 'Disconnected'
        throw error
      } finally {
        isInitializing = false
        initPromise = null
      }
    })()

    return initPromise
  }

  const disconnect = async () => {
    if (sharedConnection) {
      try {
        await sharedConnection.stop()
        sharedIsConnected.value = false
        sharedConnectionState.value = 'Disconnected'
        sharedConnection = null
        console.log('[SignalR] Desconectado')
      } catch (error) {
        if (!error.message || !error.message.includes('connection being closed')) {
          console.error('[SignalR] Error al desconectar:', error)
        }
        sharedIsConnected.value = false
        sharedConnectionState.value = 'Disconnected'
        sharedConnection = null
      }
    }
  }

  // ============================================
  // METODOS DE ENVIO
  // ============================================

  const sendMessageToAll = async (message) => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('SendMessageToAll', message)
    }
  }

  const sendMessageToUser = async (targetUserId, message) => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('SendMessageToUser', targetUserId, message)
    }
  }

  const sendMessageToGroup = async (groupName, message) => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('SendMessageToGroup', groupName, message)
    }
  }

  const sendMessageToBranch = async (message) => {
    if (sharedConnection && sharedIsConnected.value) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token')
        if (!token) {
          console.warn('[SignalR] No hay token, no se puede enviar mensaje al usuario')
          return
        }

        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(window.atob(tokenParts[1]))
          const username = payload.unique_name ||
                          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                          payload.name ||
                          payload.usuario

          if (username) {
            const groupName = `user_${username}`
            await sharedConnection.invoke('SendMessageToGroup', groupName, message)
          }
        }
      } catch (error) {
        console.error('[SignalR] Error al enviar mensaje al usuario:', error)
      }
    }
  }

  const joinGroup = async (groupName) => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('JoinGroup', groupName)
    }
  }

  const leaveGroup = async (groupName) => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('LeaveGroup', groupName)
    }
  }

  const getMyInfo = async () => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('GetMyInfo')
    }
  }

  const getOnlineUsers = async () => {
    if (sharedConnection && sharedIsConnected.value) {
      await sharedConnection.invoke('GetOnlineUsers')
    }
  }

  // ============================================
  // INVOCACION GENERICA
  // ============================================

  const invoke = async (methodName, ...args) => {
    if (sharedConnection && sharedIsConnected.value) {
      try {
        return await sharedConnection.invoke(methodName, ...args)
      } catch (error) {
        console.error(`[SignalR] Error invoking ${methodName}:`, error)
        throw error
      }
    } else {
      throw new Error('SignalR connection not established')
    }
  }

  // ============================================
  // SISTEMA DE LISTENERS
  // ============================================

  const on = (eventName, callback) => {
    if (!registeredListeners.has(eventName)) {
      registeredListeners.set(eventName, [])
    }
    registeredListeners.get(eventName).push(callback)
  }

  const off = (eventName, callback) => {
    if (callback && registeredListeners.has(eventName)) {
      const callbacks = registeredListeners.get(eventName)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else if (!callback) {
      registeredListeners.delete(eventName)
    }
  }

  const notifyListeners = (eventName, data) => {
    if (registeredListeners.has(eventName)) {
      registeredListeners.get(eventName).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[SignalR] Error en listener ${eventName}:`, error)
        }
      })
    }
  }

  // ============================================
  // SISTEMA DE CACHE
  // ============================================

  const cacheEvent = (eventName, data) => {
    try {
      const cacheKey = `${cachePrefix}${eventName}`
      const timestampKey = `${cacheTimestampPrefix}${eventName}`
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(timestampKey, Date.now().toString())
    } catch (error) {
      console.error(`[SignalR] Error cacheando ${eventName}:`, error)
    }
  }

  const getCachedEvent = (eventName, maxAge = null) => {
    try {
      const cacheKey = `${cachePrefix}${eventName}`
      const timestampKey = `${cacheTimestampPrefix}${eventName}`
      const cachedData = localStorage.getItem(cacheKey)
      const timestamp = localStorage.getItem(timestampKey)

      if (!cachedData || !timestamp) return null

      const age = Date.now() - parseInt(timestamp)
      const expiryTime = maxAge !== null ? maxAge : cacheExpiryMs

      if (age > expiryTime) {
        clearCachedEvent(eventName)
        return null
      }

      return {
        data: JSON.parse(cachedData),
        timestamp: parseInt(timestamp),
        age: age
      }
    } catch (error) {
      console.error(`[SignalR] Error leyendo cache ${eventName}:`, error)
      return null
    }
  }

  const clearCachedEvent = (eventName) => {
    try {
      const cacheKey = `${cachePrefix}${eventName}`
      const timestampKey = `${cacheTimestampPrefix}${eventName}`
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(timestampKey)
    } catch (error) {
      console.error(`[SignalR] Error limpiando cache ${eventName}:`, error)
    }
  }

  const clearAllCache = () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(cachePrefix) || key.startsWith(cacheTimestampPrefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('[SignalR] Error limpiando todo el cache:', error)
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================

  const clearNotifications = () => {
    sharedNotifications.value = []
  }

  const getState = () => {
    return sharedConnectionState.value
  }

  const connected = () => {
    return sharedIsConnected.value
  }

  const getConnectionId = () => {
    return sharedConnection?.connectionId || null
  }

  // ============================================
  // AUTENTICACION REMOTA
  // ============================================

  const loginRemote = async (username, password) => {
    if (!sharedConnection) {
      throw new Error('No hay conexion SignalR disponible')
    }

    try {
      sharedAuthStatus.value.isAuthenticating = true
      sharedAuthStatus.value.error = null
      console.log('[SignalR] Intentando login remoto para:', username)
      await sharedConnection.invoke('AuthAsync', { Username: username, Password: password })
    } catch (error) {
      console.error('[SignalR] Error en login remoto:', error)
      sharedAuthStatus.value.isAuthenticating = false
      sharedAuthStatus.value.error = error.message || 'Error de conexion'
      throw error
    }
  }

  const logoutRemote = async () => {
    if (!sharedConnection) {
      console.warn('[SignalR] No hay conexion SignalR para logout')
      return
    }

    try {
      console.log('[SignalR] Cerrando sesion remota...')
      await sharedConnection.invoke('Logout')
    } catch (error) {
      console.error('[SignalR] Error en logout remoto:', error)
      sharedAuthStatus.value.isAuthenticated = false
      sharedAuthStatus.value.token = null
      sharedAuthStatus.value.userData = null
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
    }
  }

  const isAuthenticatedRemote = () => {
    return sharedAuthStatus.value.isAuthenticated && sharedAuthStatus.value.token !== null
  }

  const clearAuthStatus = () => {
    sharedAuthStatus.value = {
      isAuthenticating: false,
      isAuthenticated: false,
      error: null,
      token: null,
      userData: null
    }
  }

  return {
    // Estado de conexion (readonly para evitar modificaciones accidentales)
    connection: readonly(ref(sharedConnection)),
    isConnected: readonly(sharedIsConnected),
    connectionState: readonly(sharedConnectionState),
    connectionInfo: readonly(sharedConnectionInfo),
    notifications: sharedNotifications,
    lastMessage: readonly(sharedLastMessage),
    onlineUsers: readonly(sharedOnlineUsers),

    // Metodos de conexion
    connect,
    disconnect,

    // Metodos de envio
    sendMessageToAll,
    sendMessageToUser,
    sendMessageToGroup,
    sendMessageToBranch,
    joinGroup,
    leaveGroup,
    getMyInfo,
    getOnlineUsers,
    invoke,

    // Sistema de listeners
    on,
    off,

    // Cache
    getCachedEvent,
    clearCachedEvent,
    clearAllCache,

    // Utilidades
    clearNotifications,
    getState,
    connected,
    getConnectionId,

    // Autenticacion remota
    authStatus: readonly(sharedAuthStatus),
    loginRemote,
    logoutRemote,
    isAuthenticatedRemote,
    clearAuthStatus
  }
}
