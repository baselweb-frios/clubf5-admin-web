import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import radioService from '@/services/RadioServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useRadiosStore = defineStore('radios', () => {
  // State
  const programacionesRadio = ref([])
  const radios = ref([])
  const programacionSemanal = ref([])
  const currentProgramacion = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const programacionesCount = computed(() => programacionesRadio.value.length)
  const radiosCount = computed(() => radios.value.length)
  const hasProgramaciones = computed(() => programacionesCount.value > 0)
  const hasRadios = computed(() => radiosCount.value > 0)

  // Actions
  const loadProgramacionesRadio = async () => {
    if (!requireAuth('RadiosStore', 'loadProgramacionesRadio')) {
      programacionesRadio.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await radioService.getProgramacionesByCliente()
      programacionesRadio.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando programaciones de radio'
      console.error('Error loading programaciones radio:', err)
      programacionesRadio.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadRadios = async () => {
    if (!requireAuth('RadiosStore', 'loadRadios')) {
      radios.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await radioService.getRadiosByCliente()
      radios.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando radios'
      console.error('Error loading radios:', err)
      radios.value = []
      // Don't throw to avoid blocking other stores, just return empty array
      return []
    } finally {
      loading.value = false
    }
  }

  const loadProgramacionSemanal = async (codigoPrograma) => {
    loading.value = true
    error.value = null

    try {
      const data = await radioService.getProgramacionSemanal(codigoPrograma)
      programacionSemanal.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando programación semanal'
      console.error('Error loading programacion semanal:', err)
      programacionSemanal.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadProgramacionesByPrograma = async (codigoProgramacion) => {
    loading.value = true
    error.value = null

    try {
      const data = await radioService.getProgramacionesByPrograma(codigoProgramacion)
      currentProgramacion.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando programaciones por programa'
      console.error('Error loading programaciones by programa:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProgramacion = async (codigoProgramacion, nombreProgramacion) => {
    loading.value = true
    error.value = null

    try {
      const newProg = await radioService.altaProgramacion(codigoProgramacion, nombreProgramacion)
      programacionesRadio.value.push(newProg)
      await loadProgramacionesRadio() // Reload to get updated list
      return newProg
    } catch (err) {
      error.value = err.message || 'Error creando programación'
      console.error('Error creating programacion:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProgramacion = async (codigoProgramacion) => {
    loading.value = true
    error.value = null

    try {
      await radioService.bajaProgramacion(codigoProgramacion)
      const index = programacionesRadio.value.findIndex(
        p => p.codigo === codigoProgramacion || p.codigoProgramacion === codigoProgramacion
      )
      if (index !== -1) {
        programacionesRadio.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Error eliminando programación'
      console.error('Error deleting programacion:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveProgramacionHorario = async (programacionData) => {
    loading.value = true
    error.value = null

    try {
      const result = await radioService.guardarProgramacionHorario(programacionData)
      await loadProgramacionesByPrograma(programacionData.codigoProgramacion)
      return result
    } catch (err) {
      error.value = err.message || 'Error guardando programación horaria'
      console.error('Error saving programacion horario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProgramacionHorario = async (codigo, programacionData) => {
    loading.value = true
    error.value = null

    try {
      const result = await radioService.editarProgramacionHorario(codigo, programacionData)
      await loadProgramacionesByPrograma(programacionData.codigoProgramacion)
      return result
    } catch (err) {
      error.value = err.message || 'Error actualizando programación horaria'
      console.error('Error updating programacion horario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProgramacionHorario = async (codigo, codigoProgramacion) => {
    loading.value = true
    error.value = null

    try {
      await radioService.bajaProgramacionHorario(codigo)
      if (codigoProgramacion) {
        await loadProgramacionesByPrograma(codigoProgramacion)
      }
    } catch (err) {
      error.value = err.message || 'Error eliminando programación horaria'
      console.error('Error deleting programacion horario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveProgramacionSemanal = async (programacionSemanal) => {
    loading.value = true
    error.value = null

    try {
      const result = await radioService.guardarProgramacionSemanal(programacionSemanal)
      await loadProgramacionSemanal(programacionSemanal.codigoPrograma)
      return result
    } catch (err) {
      error.value = err.message || 'Error guardando programación semanal'
      console.error('Error saving programacion semanal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentProgramacion = () => {
    currentProgramacion.value = null
  }

  return {
    // State
    programacionesRadio,
    radios,
    programacionSemanal,
    currentProgramacion,
    loading,
    error,

    // Getters
    programacionesCount,
    radiosCount,
    hasProgramaciones,
    hasRadios,

    // Actions
    loadProgramacionesRadio,
    loadRadios,
    loadProgramacionSemanal,
    loadProgramacionesByPrograma,
    createProgramacion,
    deleteProgramacion,
    saveProgramacionHorario,
    updateProgramacionHorario,
    deleteProgramacionHorario,
    saveProgramacionSemanal,
    clearError,
    clearCurrentProgramacion
  }
})
