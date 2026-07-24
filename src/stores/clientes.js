import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import clienteService from '@/services/ClienteServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useClientesStore = defineStore('clientes', () => {
  // State
  const clientes = ref([])
  const currentCliente = ref(null)
  const miPaquete = ref(null)
  const paquetes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const clientesCount = computed(() => clientes.value.length)
  const hasClientes = computed(() => clientesCount.value > 0)
  // Paquete/plan actualmente contratado, resuelto contra el catálogo por cli_codpaq
  const planActual = computed(() => {
    if (!currentCliente.value || !paquetes.value.length) return null
    return paquetes.value.find(p => p.paq_codigo === currentCliente.value.cli_codpaq) || null
  })

  // Actions
  const loadClientes = async () => {
    if (!requireAuth('ClientesStore', 'loadClientes')) {
      clientes.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await clienteService.getClienteAll()
      clientes.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando clientes'
      console.error('Error loading clientes:', err)
      clientes.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadClienteByUsername = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await clienteService.getClienteByUsername()
      currentCliente.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando cliente'
      console.error('Error loading cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadClienteById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const data = await clienteService.getClienteById(id)
      currentCliente.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando cliente'
      console.error('Error loading cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Paquete/plan actual del cliente autenticado, con info de uso (cant_pedidos / paq_maxped)
  const loadMiPaquete = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await clienteService.getMiPaquete()
      miPaquete.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando el paquete actual'
      console.error('Error loading miPaquete:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Catálogo completo de paquetes disponibles, para elegir un nuevo plan
  const loadPaquetes = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await clienteService.getPaquetes()
      paquetes.value = data || []
      return paquetes.value
    } catch (err) {
      error.value = err.message || 'Error cargando el catálogo de paquetes'
      console.error('Error loading paquetes:', err)
      paquetes.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  // Self-service: cambia el plan del cliente autenticado (PUT /Cliente/miPlan).
  // IMPORTANTE: currentCliente SOLO se actualiza tras la confirmación exitosa del backend
  // (no es un update optimista - ver el bug de updateDatosCuenta más abajo, que asume
  // que lo que se mandó quedó persistido tal cual sin esperar la confirmación real).
  const cambiarPlan = async (nuevoCodPaq) => {
    loading.value = true
    error.value = null

    try {
      const result = await clienteService.cambiarMiPlan(nuevoCodPaq)
      if (currentCliente.value) {
        currentCliente.value = { ...currentCliente.value, cli_codpaq: result.cli_codpaq }
      }
      return result
    } catch (err) {
      error.value = err.response?.data?.errorMessage || err.message || 'Error cambiando de plan'
      console.error('Error changing plan:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCliente = async (clienteData, adminData) => {
    loading.value = true
    error.value = null

    try {
      const newCliente = await clienteService.altaCuenta(clienteData, adminData)
      clientes.value.push(newCliente)
      return newCliente
    } catch (err) {
      error.value = err.message || 'Error creando cliente'
      console.error('Error creating cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePrefijo = async (nuevoPrefijo) => {
    loading.value = true
    error.value = null

    try {
      const result = await clienteService.setPrefijo(nuevoPrefijo)
      if (currentCliente.value) {
        currentCliente.value.prefijo = nuevoPrefijo
      }
      return result
    } catch (err) {
      error.value = err.message || 'Error actualizando prefijo'
      console.error('Error updating prefijo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDatosCuenta = async (datosCuenta) => {
    loading.value = true
    error.value = null

    try {
      const result = await clienteService.setDatosCuenta(datosCuenta)
      if (currentCliente.value) {
        currentCliente.value = { ...currentCliente.value, ...datosCuenta }
      }
      return result
    } catch (err) {
      error.value = err.message || 'Error actualizando datos de cuenta'
      console.error('Error updating datos cuenta:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCliente = async (id) => {
    loading.value = true
    error.value = null

    try {
      await clienteService.del(id)
      const index = clientes.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clientes.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Error eliminando cliente'
      console.error('Error deleting cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== Gestión completa de clientes (Cliente + Admin) para páginas admin ==========
  // Antes las páginas admin (ej. UsuariosUnificado.vue) llamaban a clienteService directamente,
  // bypaseando el store. Estas acciones centralizan esas llamadas respetando el patrón Pinia.

  const loadClientesCompleto = async () => {
    if (!requireAuth('ClientesStore', 'loadClientesCompleto')) {
      clientes.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await clienteService.getAllCompleto()
      clientes.value = data || []
      return clientes.value
    } catch (err) {
      error.value = err.message || 'Error cargando clientes completos'
      console.error('Error loading clientes completos:', err)
      clientes.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClienteCompleto = async (id, clienteData) => {
    loading.value = true
    error.value = null

    try {
      const result = await clienteService.updateCompleto(id, clienteData)
      return result
    } catch (err) {
      error.value = err.message || 'Error actualizando cliente completo'
      console.error('Error updating cliente completo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClienteCompleto = async (id) => {
    loading.value = true
    error.value = null

    try {
      const result = await clienteService.deleteCompleto(id)
      return result
    } catch (err) {
      error.value = err.message || 'Error eliminando cliente completo'
      console.error('Error deleting cliente completo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== Utilidades ==========

  const clearError = () => {
    error.value = null
  }

  const clearCurrentCliente = () => {
    currentCliente.value = null
  }

  return {
    // State
    clientes,
    currentCliente,
    miPaquete,
    paquetes,
    loading,
    error,

    // Getters
    clientesCount,
    hasClientes,
    planActual,

    // Actions
    loadClientes,
    loadClientesCompleto,
    loadClienteByUsername,
    loadClienteById,
    loadMiPaquete,
    loadPaquetes,
    cambiarPlan,
    createCliente,
    updatePrefijo,
    updateDatosCuenta,
    updateClienteCompleto,
    deleteCliente,
    deleteClienteCompleto,
    clearError,
    clearCurrentCliente
  }
})
