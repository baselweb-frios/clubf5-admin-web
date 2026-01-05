import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import clienteProgramacionSpotService from '@/services/ClienteProgramacionSpotServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useProgramacionSpotsStore = defineStore('programacionSpots', () => {
  // State
  const programacionesByPrograma = ref([])
  const programacionesBySucursal = ref([])
  const currentProgramacion = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const programacionesCount = computed(() => programacionesByPrograma.value.length)
  const hasProgramaciones = computed(() => programacionesCount.value > 0)

  // Actions
  const loadProgramacionesByPrograma = async (codigoProgramacion, horaDesde = null) => {
    if (!requireAuth('ProgramacionSpotsStore', 'loadProgramacionesByPrograma')) {
      console.warn('❌ Usuario no autenticado')
      programacionesByPrograma.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      console.log(`📡 Store: Cargando programaciones para codigoProgramacion=${codigoProgramacion}, horaDesde=${horaDesde}`)
      console.log(`🔄 Store: Forzando carga desde servidor (bypass cache) - timestamp: ${Date.now()}`)

      const data = await clienteProgramacionSpotService.getProgramacionesByProg(
        codigoProgramacion,
        horaDesde
      )

      console.log('📦 Store: Datos recibidos del servicio:', data)
      console.log(`📊 Store: Total de programaciones recibidas: ${Array.isArray(data) ? data.length : 0}`)

      programacionesByPrograma.value = data || []

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ Store: No se recibieron programaciones o el array está vacío')
      } else {
        console.log('✅ Store: Programaciones cargadas correctamente:', programacionesByPrograma.value.length)
      }

      return programacionesByPrograma.value
    } catch (err) {
      error.value = err.message || 'Error cargando programaciones de spots'
      console.error('❌ Store: Error loading programaciones spots:', err)
      programacionesByPrograma.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadProgramacionesBySucursal = async (codigoProgramacion) => {
    if (!requireAuth('ProgramacionSpotsStore', 'loadProgramacionesBySucursal')) {
      programacionesBySucursal.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔄 Store: Cargando programaciones por sucursal (bypass cache) - timestamp: ${Date.now()}`)
      const data = await clienteProgramacionSpotService.getProgSpotSucursal(codigoProgramacion)
      programacionesBySucursal.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando programaciones de sucursal'
      console.error('Error loading programaciones sucursal:', err)
      programacionesBySucursal.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const saveProgramacionesSpot = async (spotsProg) => {
    if (!requireAuth('ProgramacionSpotsStore', 'saveProgramacionesSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      console.log('Store - Guardando programaciones:', spotsProg)

      if (!Array.isArray(spotsProg) || spotsProg.length === 0) {
        throw new Error('No hay programaciones para guardar o el formato es inválido')
      }

      const result = await clienteProgramacionSpotService.guardarProgSpot(spotsProg)

      // Reload programaciones after save
      if (spotsProg[0]?.codigoProgramacion) {
        await loadProgramacionesByPrograma(spotsProg[0].codigoProgramacion)
      }

      return result
    } catch (err) {
      error.value = err.message || 'Error guardando programaciones de spots'
      console.error('Error saving programaciones spots:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProgramacionSpot = async (programacionData) => {
    if (!requireAuth('ProgramacionSpotsStore', 'updateProgramacionSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const {
        codigo,
        codigoProgramacion,
        codigoSpot,
        numeroDia,
        horaDesde,
        horaHasta,
        orden
      } = programacionData

      const result = await clienteProgramacionSpotService.editarProgSpot(
        codigo,
        codigoProgramacion,
        codigoSpot,
        numeroDia,
        horaDesde,
        horaHasta,
        orden
      )

      // Reload programaciones after update
      await loadProgramacionesByPrograma(codigoProgramacion)

      return result
    } catch (err) {
      error.value = err.message || 'Error actualizando programación de spot'
      console.error('Error updating programacion spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const moverSpot = async (moveData) => {
    if (!requireAuth('ProgramacionSpotsStore', 'moverSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const result = await clienteProgramacionSpotService.permutarProgSpot(moveData)

      // Reload programaciones after move
      if (moveData.codigoProgramacion) {
        await loadProgramacionesByPrograma(moveData.codigoProgramacion)
      }

      return result
    } catch (err) {
      error.value = err.message || 'Error moviendo spot'
      console.error('Error moving spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProgramacionSpot = async (codigoProgramacion, usuarioSpot) => {
    if (!requireAuth('ProgramacionSpotsStore', 'deleteProgramacionSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      await clienteProgramacionSpotService.eliminarProgSpot(codigoProgramacion, usuarioSpot)

      // Remove from local state
      programacionesByPrograma.value = programacionesByPrograma.value.filter(
        p => !(p.codigoProgramacion === codigoProgramacion && p.usuarioSpot === usuarioSpot)
      )

      // Reload to ensure consistency
      let programacion = JSON.parse(localStorage.selectedProgramacion).clipro_codigo
      let horadesde = "00:00";
       await loadProgramacionesByPrograma(programacion,horadesde)
       return codigoProgramacion
    } catch (err) {
      error.value = err.message || 'Error eliminando programación de spot'
      console.error('Error deleting programacion spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearProgramaciones = () => {
    programacionesByPrograma.value = []
    programacionesBySucursal.value = []
  }

  const clearCurrentProgramacion = () => {
    currentProgramacion.value = null
  }

  return {
    // State
    programacionesByPrograma,
    programacionesBySucursal,
    currentProgramacion,
    loading,
    error,

    // Getters
    programacionesCount,
    hasProgramaciones,

    // Actions
    loadProgramacionesByPrograma,
    loadProgramacionesBySucursal,
    saveProgramacionesSpot,
    updateProgramacionSpot,
    moverSpot,
    deleteProgramacionSpot,
    clearError,
    clearProgramaciones,
    clearCurrentProgramacion
  }
})
