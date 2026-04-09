import { onMounted, onUnmounted } from 'vue'
import { useSignalRAuth } from './useSignalRAuth'
import { useSucursalesStore } from '@/stores/sucursales'
import { useSpotsStore } from '@/stores/spots'
import { usePedidosSpotsStore } from '@/stores/pedidosSpots'
import { useFacturasStore } from '@/stores/facturas'
import { useProgramacionSpotsStore } from '@/stores/programacionSpots'
import { useRadiosStore } from '@/stores/radios'

/**
 * Composable for syncing stores with SignalR real-time updates
 */
export function useStoreSync() {
  // Instancia de SignalR
  const signalR = useSignalRAuth()

  /**
   * Initialize SignalR connection and set up event listeners
   */
  const initializeSync = async () => {
    try {
      // Start SignalR connection
      await signalR.connect()

      // Set up event listeners for real-time updates
      setupEventListeners()

      console.log('Store sync initialized with SignalR')
    } catch (error) {
      console.error('Error initializing store sync:', error)
    }
  }

  /**
   * Set up event listeners for different store updates
   */
  const setupEventListeners = () => {
    // Sucursales updates
    signalR.on('sucursalStatusChanged', handleSucursalStatusChanged)
    signalR.on('sucursalUpdated', handleSucursalUpdated)
    signalR.on('sucursalCreated', handleSucursalCreated)
    signalR.on('sucursalDeleted', handleSucursalDeleted)

    // Spots updates
    signalR.on('spotCreated', handleSpotCreated)
    signalR.on('spotUpdated', handleSpotUpdated)
    signalR.on('spotDeleted', handleSpotDeleted)

    // Programacion Spots updates
    signalR.on('programacionSpotCreated', handleProgramacionSpotCreated)
    signalR.on('programacionSpotUpdated', handleProgramacionSpotUpdated)
    signalR.on('programacionSpotDeleted', handleProgramacionSpotDeleted)

    // Pedidos updates
    signalR.on('pedidoCreated', handlePedidoCreated)
    signalR.on('pedidoUpdated', handlePedidoUpdated)
    signalR.on('newMessage', handleNewMessage)
    signalR.on('notificacionNoLeida', handleNotificacionNoLeida)

    // Facturas updates
    signalR.on('facturaCreated', handleFacturaCreated)
    signalR.on('facturaUpdated', handleFacturaUpdated)

    // Radio updates
    signalR.on('programacionRadioUpdated', handleProgramacionRadioUpdated)

    console.log('SignalR event listeners configured')
  }

  /**
   * Clean up event listeners
   */
  const cleanupEventListeners = () => {
    signalR.off('sucursalStatusChanged')
    signalR.off('sucursalUpdated')
    signalR.off('sucursalCreated')
    signalR.off('sucursalDeleted')
    signalR.off('spotCreated')
    signalR.off('spotUpdated')
    signalR.off('spotDeleted')
    signalR.off('programacionSpotCreated')
    signalR.off('programacionSpotUpdated')
    signalR.off('programacionSpotDeleted')
    signalR.off('pedidoCreated')
    signalR.off('pedidoUpdated')
    signalR.off('newMessage')
    signalR.off('notificacionNoLeida')
    signalR.off('facturaCreated')
    signalR.off('facturaUpdated')
    signalR.off('programacionRadioUpdated')

    console.log('SignalR event listeners cleaned up')
  }

  // ==================== Event Handlers ====================

  // Sucursales
  const handleSucursalStatusChanged = (data) => {
    console.log('Sucursal status changed:', data)
    const sucursalesStore = useSucursalesStore()
    sucursalesStore.updateSucursalStatus(data.sucursalId, data.status)
  }

  const handleSucursalUpdated = async (data) => {
    console.log('Sucursal updated:', data)
    const sucursalesStore = useSucursalesStore()
    await sucursalesStore.loadSucursales()
  }

  const handleSucursalCreated = async (data) => {
    console.log('Sucursal created:', data)
    const sucursalesStore = useSucursalesStore()
    await sucursalesStore.loadSucursales()
  }

  const handleSucursalDeleted = async (data) => {
    console.log('Sucursal deleted:', data)
    const sucursalesStore = useSucursalesStore()
    await sucursalesStore.loadSucursales()
  }

  // Spots
  const handleSpotCreated = async (data) => {
    console.log('Spot created:', data)
    const spotsStore = useSpotsStore()
    await spotsStore.loadSpotsDisponibles()
  }

  const handleSpotUpdated = async (data) => {
    console.log('Spot updated:', data)
    const spotsStore = useSpotsStore()
    await spotsStore.loadSpotsDisponibles()
  }

  const handleSpotDeleted = async (data) => {
    console.log('Spot deleted:', data)
    const spotsStore = useSpotsStore()
    await spotsStore.loadSpotsDisponibles()
  }

  // Programación Spots
  const handleProgramacionSpotCreated = async (data) => {
    console.log('Programacion spot created:', data)
    const progSpotsStore = useProgramacionSpotsStore()
    if (data.codigoProgramacion) {
      await progSpotsStore.loadProgramacionesByPrograma(data.codigoProgramacion)
    }
  }

  const handleProgramacionSpotUpdated = async (data) => {
    console.log('Programacion spot updated:', data)
    const progSpotsStore = useProgramacionSpotsStore()
    if (data.codigoProgramacion) {
      await progSpotsStore.loadProgramacionesByPrograma(data.codigoProgramacion)
    }
  }

  const handleProgramacionSpotDeleted = async (data) => {
    console.log('Programacion spot deleted:', data)
    const progSpotsStore = useProgramacionSpotsStore()
    if (data.codigoProgramacion) {
      await progSpotsStore.loadProgramacionesByPrograma(data.codigoProgramacion)
    }
  }

  // Pedidos
  const handlePedidoCreated = async (data) => {
    console.log('Pedido created:', data)
    const pedidosStore = usePedidosSpotsStore()
    await pedidosStore.loadPedidos()
  }

  const handlePedidoUpdated = async (data) => {
    console.log('Pedido updated:', data)
    const pedidosStore = usePedidosSpotsStore()
    await pedidosStore.loadPedidos()
  }

  const handleNewMessage = async (data) => {
    console.log('New message received:', data)
    const pedidosStore = usePedidosSpotsStore()
    if (data.codigoPedido) {
      await pedidosStore.loadMensajes(data.codigoPedido)
    }
    await pedidosStore.loadNotificacionesNoLeidas()
  }

  const handleNotificacionNoLeida = async (data) => {
    console.log('Notificacion no leida:', data)
    const pedidosStore = usePedidosSpotsStore()
    await pedidosStore.loadNotificacionesNoLeidas()
  }

  // Facturas
  const handleFacturaCreated = async (data) => {
    console.log('Factura created:', data)
    const facturasStore = useFacturasStore()
    await facturasStore.loadFacturas()
  }

  const handleFacturaUpdated = async (data) => {
    console.log('Factura updated:', data)
    const facturasStore = useFacturasStore()
    await facturasStore.loadFacturas()
  }

  // Radio
  const handleProgramacionRadioUpdated = async (data) => {
    console.log('Programacion radio updated:', data)
    const radiosStore = useRadiosStore()
    await radiosStore.loadProgramacionesRadio()
  }

  /**
   * Disconnect from SignalR
   */
  const disconnect = async () => {
    cleanupEventListeners()
    await signalR.disconnect()
  }

  return {
    initializeSync,
    disconnect,
    setupEventListeners,
    cleanupEventListeners
  }
}

/**
 * Hook to automatically initialize and cleanup SignalR sync
 * 
 * NOTA: Este hook solo limpia los listeners en onUnmounted, pero NO
 * desconecta SignalR porque es un singleton compartido. La desconexión
 * se maneja en DashboardLayout cuando el usuario hace logout.
 */
export function useAutoStoreSync() {
  const { initializeSync, cleanupEventListeners } = useStoreSync()

  onMounted(async () => {
    await initializeSync()
  })

  onUnmounted(() => {
    // Solo limpiar listeners, NO desconectar SignalR (es singleton compartido)
    cleanupEventListeners()
  })

  return {
    initializeSync,
    cleanupEventListeners
  }
}
