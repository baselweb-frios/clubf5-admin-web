import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProgramacionStore = defineStore('programacion', () => {
  // State
  const programas = ref([])
  const currentPrograma = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const programasCount = computed(() => programas.value.length)
  const activeProgramas = computed(() =>
    programas.value.filter(p => p.active === true || p.activo === true)
  )
  const hasProgramas = computed(() => programasCount.value > 0)

  // Actions
  const loadProgramas = async () => {
    loading.value = true
    error.value = null

    try {
      // TODO: Implement API call when service is ready
      // const data = await programacionService.getProgramas()
      // programas.value = data || []
      programas.value = []
    } catch (err) {
      error.value = err.message || 'Error cargando programas'
      console.error('Error loading programas:', err)
      programas.value = []
    } finally {
      loading.value = false
    }
  }

  const createPrograma = async (programaData) => {
    loading.value = true
    error.value = null

    try {
      // TODO: Implement API call when service is ready
      // const newPrograma = await programacionService.createPrograma(programaData)
      // programas.value.push(newPrograma)
      // return newPrograma

      // Mock implementation
      const newPrograma = {
        id: Date.now(),
        ...programaData,
        createdAt: new Date().toISOString()
      }
      programas.value.push(newPrograma)
      return newPrograma
    } catch (err) {
      error.value = err.message || 'Error creando programa'
      console.error('Error creating programa:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePrograma = async (id, programaData) => {
    loading.value = true
    error.value = null

    try {
      // TODO: Implement API call when service is ready
      // const updatedPrograma = await programacionService.updatePrograma(id, programaData)

      const index = programas.value.findIndex(p => p.id === id)
      if (index !== -1) {
        programas.value[index] = { ...programas.value[index], ...programaData }
      }
      return programas.value[index]
    } catch (err) {
      error.value = err.message || 'Error actualizando programa'
      console.error('Error updating programa:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePrograma = async (id) => {
    loading.value = true
    error.value = null

    try {
      // TODO: Implement API call when service is ready
      // await programacionService.deletePrograma(id)

      const index = programas.value.findIndex(p => p.id === id)
      if (index !== -1) {
        programas.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Error eliminando programa'
      console.error('Error deleting programa:', err)
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
    programas,
    currentPrograma,
    loading,
    error,

    // Getters
    programasCount,
    activeProgramas,
    hasProgramas,

    // Actions
    loadProgramas,
    createPrograma,
    updatePrograma,
    deletePrograma,
    clearError
  }
})
