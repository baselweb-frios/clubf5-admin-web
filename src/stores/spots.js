import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import moment from 'moment'
import spotService from '@/services/SpotServices'
import { requireAuth } from '@/utils/storeHelpers'

export const useSpotsStore = defineStore('spots', () => {
  // State
  const spotsDisponibles = ref([])
  const allSpots = ref([]) // Todos los spots incluyendo vencidos
  const spotsPautados = ref([])
  const currentSpot = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const showExpiredSpots = ref(false) // Toggle para mostrar spots vencidos

  /**
   * Verifica si un spot está vencido
   * @param {Object} spot - El objeto spot a verificar
   * @returns {boolean} - true si el spot está vencido, false si está vigente
   *
   * Reglas de vencimiento:
   * - Spots institucionales (tipo 'inst'): NUNCA vencen
   * - Spots sin fecha fin: NO están vencidos
   * - Spots promocionales/noticias: Vencen si spo_fecfin < fecha actual
   */
  const isSpotExpired = (spot) => {
    // Spots institucionales nunca vencen
    if (spot.spo_tipo === 'inst') {
      return false
    }

    // Si no tiene fecha fin, no está vencido
    if (!spot.spo_fecfin || spot.spo_fecfin === '') {
      return false
    }

    try {
      // Verificar si la fecha fin es anterior a hoy
      const fechaFin = moment(spot.spo_fecfin, ['YYYY-MM-DD', 'DD/MM/YYYY'])

      // Validar que la fecha sea válida
      if (!fechaFin.isValid()) {
        console.warn(`⚠️ Fecha inválida para spot ${spot.spo_codigo}: ${spot.spo_fecfin}`)
        return false // Si la fecha es inválida, no lo consideramos vencido
      }

      const hoy = moment().startOf('day')

      return fechaFin.isBefore(hoy)
    } catch (error) {
      console.error(`❌ Error verificando vencimiento del spot ${spot.spo_codigo}:`, error)
      return false // En caso de error, no lo consideramos vencido
    }
  }

  // Getters
  const spotsCount = computed(() => spotsDisponibles.value.length)
  const pautadosCount = computed(() => spotsPautados.value.length)
  const hasSpots = computed(() => spotsCount.value > 0)
  const allSpotsCount = computed(() => allSpots.value.length)
  const expiredSpotsCount = computed(() => allSpots.value.filter(isSpotExpired).length)
  const activeSpotsCount = computed(() => allSpots.value.filter(s => !isSpotExpired(s)).length)

  // Actions
  const loadSpotsDisponibles = async () => {
    if (!requireAuth('SpotsStore', 'loadSpotsDisponibles')) {
      spotsDisponibles.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const spots = await spotService.getSpotsBycodCliente()

      // Guardar TODOS los spots (incluyendo vencidos)
      allSpots.value = spots || []

      // Filtrar spots según el toggle showExpiredSpots
      const spotsNoVencidos = allSpots.value.filter(spot => !isSpotExpired(spot))
      const spotsVencidos = allSpots.value.filter(isSpotExpired)

      // Estadísticas detalladas
      const totalSpots = allSpots.value.length
      const institucionales = spotsNoVencidos.filter(s => s.spo_tipo === 'inst').length
      const promocionales = spotsNoVencidos.filter(s => s.spo_tipo === 'prom').length
      const noticias = spotsNoVencidos.filter(s => s.spo_tipo === 'noti').length

      console.log(`📊 Resumen de Spots:`)
      console.log(`   Total cargados: ${totalSpots}`)
      console.log(`   ✅ Vigentes: ${spotsNoVencidos.length} (${institucionales} institucionales, ${promocionales} promocionales, ${noticias} noticias)`)
      if (spotsVencidos.length > 0) {
        console.log(`   ⏰ Vencidos: ${spotsVencidos.length}`)
      }

      // Asignar spots disponibles según el toggle
      spotsDisponibles.value = showExpiredSpots.value ? allSpots.value : spotsNoVencidos

      return spotsDisponibles.value
    } catch (err) {
      error.value = err.message || 'Error cargando spots disponibles'
      console.error('Error loading spots:', err)
      spotsDisponibles.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadSpotsPautados = async () => {
    if (!requireAuth('SpotsStore', 'loadSpotsPautados')) {
      spotsPautados.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const spots = await spotService.getSpotsPautados()
      spotsPautados.value = spots || []
      return spots
    } catch (err) {
      error.value = err.message || 'Error cargando spots pautados'
      console.error('Error loading pautados:', err)
      spotsPautados.value = []
      // Don't throw to avoid blocking other stores
      return []
    } finally {
      loading.value = false
    }
  }

  const loadSpotById = async (id) => {
    if (!requireAuth('SpotsStore', 'loadSpotById')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const spot = await spotService.getSpotById(id)
      currentSpot.value = spot
      return spot
    } catch (err) {
      error.value = err.message || 'Error cargando spot'
      console.error('Error loading spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSpot = async (spotData) => {
    if (!requireAuth('SpotsStore', 'createSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const newSpot = await spotService.createSpot(spotData)
      spotsDisponibles.value.push(newSpot)
      return newSpot
    } catch (err) {
      error.value = err.message || 'Error creando spot'
      console.error('Error creating spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSpot = async (id, spotData) => {
    if (!requireAuth('SpotsStore', 'updateSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const updatedSpot = await spotService.editarSpot(spotData)
      // Reload spots after update to get fresh data
      await loadSpotsDisponibles()
      return updatedSpot
    } catch (err) {
      error.value = err.message || 'Error actualizando spot'
      console.error('Error updating spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSpot = async (id) => {
    if (!requireAuth('SpotsStore', 'deleteSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      await spotService.bajaSpot(id)
      const index = spotsDisponibles.value.findIndex(spot => spot.id === id)
      if (index !== -1) {
        spotsDisponibles.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Error eliminando spot'
      console.error('Error deleting spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadSpot = async (formData) => {
    if (!requireAuth('SpotsStore', 'uploadSpot')) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const result = await spotService.uploadSpot(formData)
      await loadSpotsDisponibles() // Reload spots after upload
      return result
    } catch (err) {
      error.value = err.message || 'Error subiendo spot'
      console.error('Error uploading spot:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Toggle para mostrar/ocultar spots vencidos
  const toggleShowExpiredSpots = () => {
    showExpiredSpots.value = !showExpiredSpots.value

    // Actualizar spots disponibles según el nuevo estado del toggle
    const spotsNoVencidos = allSpots.value.filter(spot => !isSpotExpired(spot))
    spotsDisponibles.value = showExpiredSpots.value ? allSpots.value : spotsNoVencidos

    console.log(`👁️ Mostrar spots vencidos: ${showExpiredSpots.value ? 'SÍ' : 'NO'}`)
    console.log(`   Mostrando: ${spotsDisponibles.value.length} de ${allSpots.value.length} spots`)
  }

  const setShowExpiredSpots = (value) => {
    showExpiredSpots.value = value

    // Actualizar spots disponibles
    const spotsNoVencidos = allSpots.value.filter(spot => !isSpotExpired(spot))
    spotsDisponibles.value = showExpiredSpots.value ? allSpots.value : spotsNoVencidos

    console.log(`👁️ Mostrar spots vencidos configurado a: ${showExpiredSpots.value ? 'SÍ' : 'NO'}`)
  }

  return {
    // State
    spotsDisponibles,
    allSpots,
    spotsPautados,
    currentSpot,
    loading,
    error,
    showExpiredSpots,

    // Getters
    spotsCount,
    pautadosCount,
    hasSpots,
    allSpotsCount,
    expiredSpotsCount,
    activeSpotsCount,

    // Actions
    loadSpotsDisponibles,
    loadSpotsPautados,
    loadSpotById,
    createSpot,
    updateSpot,
    deleteSpot,
    uploadSpot,
    clearError,
    toggleShowExpiredSpots,
    setShowExpiredSpots
  }
})
