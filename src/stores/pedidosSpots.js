import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pedidoSpotService from '@/services/PedidoSpotServices'
import { requireAuth } from '@/utils/storeHelpers'

export const usePedidosSpotsStore = defineStore('pedidosSpots', () => {
  // State
  const pedidos = ref([])
  const currentPedido = ref(null)
  const mensajes = ref([])
  const notificacionesNoLeidas = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const pedidosCount = computed(() => pedidos.value.length)
  const hasPedidos = computed(() => pedidosCount.value > 0)
  const notificacionesCount = computed(() => notificacionesNoLeidas.value.length)
  const hasNotificaciones = computed(() => notificacionesCount.value > 0)
  const mensajesCount = computed(() => mensajes.value.length)

  // Actions
  const loadPedidos = async () => {
    if (!requireAuth('PedidosSpotsStore', 'loadPedidos')) {
      pedidos.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await pedidoSpotService.GetPedidos()
      pedidos.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando pedidos'
      console.error('Error loading pedidos:', err)
      pedidos.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadPedidoById = async (codigoPedido) => {
    loading.value = true
    error.value = null

    try {
      const data = await pedidoSpotService.GetPedidoByCodPs0(codigoPedido)
      currentPedido.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando pedido'
      console.error('Error loading pedido:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadNotificacionesNoLeidas = async (codigoPedido = null) => {
    if (!requireAuth('PedidosSpotsStore', 'loadNotificacionesNoLeidas')) {
      notificacionesNoLeidas.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      let data
      if (codigoPedido) {
        data = await pedidoSpotService.GetNotificacionesNoLeidasByCodPs0(codigoPedido)
      } else {
        data = await pedidoSpotService.GetNotificacionesNoLeidas()
      }
      notificacionesNoLeidas.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando notificaciones'
      console.error('Error loading notificaciones:', err)
      notificacionesNoLeidas.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadMensajes = async (codigoPedido) => {
    loading.value = true
    error.value = null

    try {
      const data = await pedidoSpotService.GetMensajes(codigoPedido)
      mensajes.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando mensajes'
      console.error('Error loading mensajes:', err)
      mensajes.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadUltimoMensaje = async (codigoPedido) => {
    loading.value = true
    error.value = null

    try {
      const data = await pedidoSpotService.GetUltimoMensaje(codigoPedido)
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando último mensaje'
      console.error('Error loading ultimo mensaje:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPedido = async (pedidoData) => {
    loading.value = true
    error.value = null

    try {
      const { fechaAlta, textoPedido, fechaDesde, fechaHasta, codigoLocutor, tipoSpot } = pedidoData
      const newPedido = await pedidoSpotService.nuevoPedido(
        fechaAlta,
        textoPedido,
        fechaDesde,
        fechaHasta,
        codigoLocutor,
        tipoSpot
      )
      pedidos.value.push(newPedido)
      await loadPedidos() // Reload to get updated list
      return newPedido
    } catch (err) {
      error.value = err.message || 'Error creando pedido'
      console.error('Error creating pedido:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const marcarComoLeido = async (codigoPedido) => {
    loading.value = true
    error.value = null

    try {
      await pedidoSpotService.leerMensaje(codigoPedido)
      await loadNotificacionesNoLeidas() // Reload notifications
    } catch (err) {
      error.value = err.message || 'Error marcando mensaje como leído'
      console.error('Error marking as read:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const sendMensaje = async (mensajeData) => {
    loading.value = true
    error.value = null

    try {
      const { codigoPedido, usuarioAlta, textoMensaje, fecha, usuarioDestino } = mensajeData
      const newMensaje = await pedidoSpotService.mensajeChatAlta(
        codigoPedido,
        usuarioAlta,
        textoMensaje,
        fecha,
        usuarioDestino
      )
      mensajes.value.push(newMensaje)
      await loadMensajes(codigoPedido) // Reload messages
      return newMensaje
    } catch (err) {
      error.value = err.message || 'Error enviando mensaje'
      console.error('Error sending mensaje:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentPedido = () => {
    currentPedido.value = null
  }

  const clearMensajes = () => {
    mensajes.value = []
  }

  return {
    // State
    pedidos,
    currentPedido,
    mensajes,
    notificacionesNoLeidas,
    loading,
    error,

    // Getters
    pedidosCount,
    hasPedidos,
    notificacionesCount,
    hasNotificaciones,
    mensajesCount,

    // Actions
    loadPedidos,
    loadPedidoById,
    loadNotificacionesNoLeidas,
    loadMensajes,
    loadUltimoMensaje,
    createPedido,
    marcarComoLeido,
    sendMensaje,
    clearError,
    clearCurrentPedido,
    clearMensajes
  }
})
