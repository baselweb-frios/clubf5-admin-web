import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import locutorService from '@/services/LocutorServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useLocutoresStore = defineStore('locutores', () => {
  // State
  const locutores = ref([])
  const etiquetas = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const locutoresCount = computed(() => locutores.value.length)
  const hasLocutores = computed(() => locutoresCount.value > 0)
  const etiquetasCount = computed(() => etiquetas.value.length)
  const hasEtiquetas = computed(() => etiquetasCount.value > 0)

  // Actions
  const loadLocutores = async () => {
    if (!requireAuth('LocutoresStore', 'loadLocutores')) {
      locutores.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await locutorService.getLocutores()
      locutores.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando locutores'
      console.error('Error loading locutores:', err)
      locutores.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadEtiquetas = async (forceReload = false) => {
    loading.value = true
    error.value = null

    try {
      // Clear localStorage if forcing reload
      if (forceReload) {
        localStorage.removeItem('etiqueta')
      }

      const data = await locutorService.getAll()
      etiquetas.value = data || []

      // Cache in localStorage
      if (data && data.length > 0) {
        localStorage.setItem('etiqueta', JSON.stringify(data))
      }

      return data
    } catch (err) {
      error.value = err.message || 'Error cargando etiquetas'
      console.error('Error loading etiquetas:', err)
      etiquetas.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const getLocutorById = (id) => {
    return locutores.value.find(l => l.id === id || l.codigo === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    locutores,
    etiquetas,
    loading,
    error,

    // Getters
    locutoresCount,
    hasLocutores,
    etiquetasCount,
    hasEtiquetas,

    // Actions
    loadLocutores,
    loadEtiquetas,
    getLocutorById,
    clearError
  }
})
