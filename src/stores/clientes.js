import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import clienteService from '@/services/ClienteServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useClientesStore = defineStore('clientes', () => {
  // State
  const clientes = ref([])
  const currentCliente = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const clientesCount = computed(() => clientes.value.length)
  const hasClientes = computed(() => clientesCount.value > 0)

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
      const data = await clienteService.buscarClientePorId(id)
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
    loading,
    error,

    // Getters
    clientesCount,
    hasClientes,

    // Actions
    loadClientes,
    loadClienteByUsername,
    loadClienteById,
    createCliente,
    updatePrefijo,
    updateDatosCuenta,
    deleteCliente,
    clearError,
    clearCurrentCliente
  }
})
