import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientesStore } from '@/stores/clientes'
import { useSucursalesStore } from '@/stores/sucursales'
import { useSpotsStore } from '@/stores/spots'
import { useRadiosStore } from '@/stores/radios'
import { useFacturasStore } from '@/stores/facturas'
import { useGenerosMusicalesStore } from '@/stores/generosMusicales'
import { usePedidosSpotsStore } from '@/stores/pedidosSpots'
import { useLocutoresStore } from '@/stores/locutores'
import { useProgramacionSpotsStore } from '@/stores/programacionSpots'

/**
 * Composable for loading all stores with initial data
 * based on user role and permissions
 */
export function useStoreLoader() {
  const isLoading = ref(false)
  const loadingProgress = ref(0)
  const errors = ref([])

  /**
   * Load all stores based on user role
   */
  const loadAllStores = async (userRole) => {
    // Verificar autenticación antes de cargar
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      console.warn('User not authenticated, skipping store loading')
      return { success: false, errors: ['Usuario no autenticado'] }
    }

    isLoading.value = true
    loadingProgress.value = 0
    errors.value = []

    const storeLoaders = getStoreLoadersForRole(userRole)
    const totalStores = storeLoaders.length

    try {
      // Load stores sequentially with progress tracking
      for (let i = 0; i < storeLoaders.length; i++) {
        const loader = storeLoaders[i]
        try {
          console.log(`Loading store: ${loader.name}`)
          await loader.load()
          loadingProgress.value = ((i + 1) / totalStores) * 100
        } catch (error) {
          console.error(`Error loading ${loader.name}:`, error)

          // Si es error 401, detener la carga
          if (error.response?.status === 401) {
            console.error('Authentication error, stopping store loading')
            return { success: false, errors: ['Error de autenticación'] }
          }

          errors.value.push({
            store: loader.name,
            error: error.message || 'Error desconocido'
          })
        }
      }

      console.log('All stores loaded successfully')
      return { success: true, errors: errors.value }
    } catch (error) {
      console.error('Error loading stores:', error)
      return { success: false, errors: errors.value }
    } finally {
      isLoading.value = false
      loadingProgress.value = 100
    }
  }

  /**
   * Load stores in parallel for better performance
   */
  const loadAllStoresParallel = async (userRole) => {
    // Verificar autenticación antes de cargar
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      console.warn('User not authenticated, skipping store loading')
      return { success: false, errors: ['Usuario no autenticado'] }
    }

    isLoading.value = true
    loadingProgress.value = 0
    errors.value = []

    const storeLoaders = getStoreLoadersForRole(userRole)

    try {
      console.log('Loading all stores in parallel...')

      // Load all stores in parallel
      const results = await Promise.allSettled(
        storeLoaders.map(loader => loader.load())
      )

      // Check for errors
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error loading ${storeLoaders[index].name}:`, result.reason)

          // Si es error 401, marcar como error crítico
          if (result.reason?.response?.status === 401) {
            errors.value.push({
              store: storeLoaders[index].name,
              error: 'Error de autenticación',
              critical: true
            })
          } else {
            errors.value.push({
              store: storeLoaders[index].name,
              error: result.reason?.message || 'Error desconocido'
            })
          }
        }
      })

      loadingProgress.value = 100
      console.log('All stores loaded in parallel')

      // Si hay errores críticos, considerarlo como fallo
      const hasCriticalErrors = errors.value.some(e => e.critical)
      return { success: !hasCriticalErrors && errors.value.length === 0, errors: errors.value }
    } catch (error) {
      console.error('Error loading stores:', error)
      return { success: false, errors: errors.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get store loaders based on user role
   */
  const getStoreLoadersForRole = (userRole) => {
    const commonStores = [
      {
        name: 'sucursales',
        load: async () => {
          const store = useSucursalesStore()
          await store.loadSucursales()
        }
      },
      // {
      //   name: 'locutores',
      //   load: async () => {
      //     const store = useLocutoresStore()
      //     await store.loadLocutores()
      //     await store.loadEtiquetas()
      //   }
      // },
      {
        name: 'generosMusicales',
        load: async () => {
          const store = useGenerosMusicalesStore()
          await store.loadGeneros()
        }
      }
    ]

    const clienteStores = [
      {
        name: 'spots',
        load: async () => {
          const store = useSpotsStore()
          await store.loadSpotsDisponibles()
          await store.loadSpotsPautados()
        }
      },
      {
        name: 'radios',
        load: async () => {
          const store = useRadiosStore()
          await store.loadProgramacionesRadio()
          //await store.loadRadios()
        }
      },
      {
        name: 'facturas',
        load: async () => {
          const store = useFacturasStore()
          await store.loadFacturas()
        }
      // },
      // {
      //   name: 'pedidosSpots',
      //   load: async () => {
      //     const store = usePedidosSpotsStore()
      //     await store.loadPedidos()
      //     await store.loadNotificacionesNoLeidas()
      //   }
       }
    ]

    const operadorStores = [
      {
        name: 'clientes',
        load: async () => {
          const store = useClientesStore()
          await store.loadClientes()
        }
      },
      ...clienteStores
    ]

    // Return stores based on role
    switch (userRole) {
      case 'Cliente':
        return [...commonStores, ...clienteStores]
      case 'Operador':
        return [...commonStores, ...operadorStores]
      case 'Usuario':
      case 'Reproductor':
        return commonStores
      default:
        return commonStores
    }
  }

  /**
   * Reload a specific store
   */
  const reloadStore = async (storeName) => {
    const authStore = useAuthStore()
    const loaders = getStoreLoadersForRole(authStore.userRole)
    const loader = loaders.find(l => l.name === storeName)

    if (loader) {
      try {
        await loader.load()
        return { success: true }
      } catch (error) {
        console.error(`Error reloading ${storeName}:`, error)
        return { success: false, error: error.message }
      }
    } else {
      console.warn(`Store ${storeName} not found for role ${authStore.userRole}`)
      return { success: false, error: 'Store not found' }
    }
  }

  /**
   * Clear all store data
   */
  const clearAllStores = () => {
    try {
      // Clear each store's data
      const clientesStore = useClientesStore()
      clientesStore.clearCurrentCliente()

      const sucursalesStore = useSucursalesStore()
      sucursalesStore.clearError()

      const spotsStore = useSpotsStore()
      spotsStore.clearError()

      const radiosStore = useRadiosStore()
      radiosStore.clearCurrentProgramacion()

      const facturasStore = useFacturasStore()
      facturasStore.clearError()

      const pedidosStore = usePedidosSpotsStore()
      pedidosStore.clearMensajes()
      pedidosStore.clearCurrentPedido()

      const progSpotsStore = useProgramacionSpotsStore()
      progSpotsStore.clearProgramaciones()

      console.log('All stores cleared')
    } catch (error) {
      console.error('Error clearing stores:', error)
    }
  }

  return {
    isLoading,
    loadingProgress,
    errors,
    loadAllStores,
    loadAllStoresParallel,
    reloadStore,
    clearAllStores
  }
}
