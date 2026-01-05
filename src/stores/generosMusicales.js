import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import generoMusicalService from '@/services/GeneroMusicalServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useGenerosMusicalesStore = defineStore('generosMusicales', () => {
  // State
  const generos = ref([])
  const generosRadio = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const generosCount = computed(() => generos.value.length)
  const hasGeneros = computed(() => generosCount.value > 0)

  // Actions
  const loadGeneros = async () => {
    if (!requireAuth('GenerosMusicalesStore', 'loadGeneros')) {
      generos.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await generoMusicalService.getGeneros()
      generos.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando géneros musicales'
      console.error('Error loading generos:', err)
      generos.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const searchGenerosRadio = async (idGenMus, idRad, idRit, idTipEmp, idEst) => {
    loading.value = true
    error.value = null

    try {
      const data = await generoMusicalService.buscar(idGenMus, idRad, idRit, idTipEmp, idEst)
      generosRadio.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error buscando géneros de radio'
      console.error('Error searching generos radio:', err)
      generosRadio.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    generos,
    generosRadio,
    loading,
    error,

    // Getters
    generosCount,
    hasGeneros,

    // Actions
    loadGeneros,
    searchGenerosRadio,
    clearError
  }
})
