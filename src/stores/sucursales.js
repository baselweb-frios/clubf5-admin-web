import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import sucursalService from '@/services/SucursalServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useSucursalesStore = defineStore('sucursales', () => {
  // State
  const sucursales = ref([])
  const currentSucursal = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const sucursalesCount = computed(() => sucursales.value.length)
  const activeSucursales = computed(() =>
    sucursales.value.filter(s => s.conected === 1 || s.active === true)
  )
  const activeSucursalesCount = computed(() => activeSucursales.value.length)
  const hasSucursales = computed(() => sucursalesCount.value > 0)

  // Actions
  const loadSucursales = async () => {
    if (!requireAuth('SucursalesStore', 'loadSucursales')) {
      sucursales.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await sucursalService.getcliSucursalByCliente()
      sucursales.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando sucursales'
      console.error('Error loading sucursales:', err)
      sucursales.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadSucursalById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const sucursal = await sucursalService.getSucursalById(id)
      currentSucursal.value = sucursal
      return sucursal
    } catch (err) {
      error.value = err.message || 'Error cargando sucursal'
      console.error('Error loading sucursal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSucursal = async (sucursalData) => {
    loading.value = true
    error.value = null

    try {
      const newSucursal = await sucursalService.createSucursal(sucursalData)
      sucursales.value.push(newSucursal)
      return newSucursal
    } catch (err) {
      error.value = err.message || 'Error creando sucursal'
      console.error('Error creating sucursal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSucursal = async (id, sucursalData) => {
    loading.value = true
    error.value = null

    try {
      const updatedSucursal = await sucursalService.updateSucursal(id, sucursalData)
      const index = sucursales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sucursales.value[index] = updatedSucursal
      }
      return updatedSucursal
    } catch (err) {
      error.value = err.message || 'Error actualizando sucursal'
      console.error('Error updating sucursal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSucursal = async (id) => {
    loading.value = true
    error.value = null

    try {
      await sucursalService.deleteSucursal(id)
      const index = sucursales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sucursales.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Error eliminando sucursal'
      console.error('Error deleting sucursal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSucursalStatus = (sucursalId, status) => {
    const sucursal = sucursales.value.find(s => s.id === sucursalId)
    if (sucursal) {
      sucursal.conected = status ? 1 : 0
      sucursal.active = status
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    sucursales,
    currentSucursal,
    loading,
    error,

    // Getters
    sucursalesCount,
    activeSucursales,
    activeSucursalesCount,
    hasSucursales,

    // Actions
    loadSucursales,
    loadSucursalById,
    createSucursal,
    updateSucursal,
    deleteSucursal,
    updateSucursalStatus,
    clearError
  }
})
