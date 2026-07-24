import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const usePlanUsageStore = defineStore('planUsage', () => {
  // State
  const usage = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const spotsDisponibles = computed(() => {
    if (!usage.value || !usage.value.limites) return null
    const max = usage.value.limites.maxSpots
    if (max === null || max === 0 || max === undefined) return Infinity
    return Math.max(0, max - (usage.value.spotsActuales || 0))
  })

  const equiposDisponibles = computed(() => {
    if (!usage.value || !usage.value.limites) return null
    const max = usage.value.limites.maxEquipos
    if (max === null || max === 0 || max === undefined) return Infinity
    return Math.max(0, max - (usage.value.equiposActuales || 0))
  })

  const iaDisponible = computed(() => {
    if (!usage.value || !usage.value.limites) return null
    const max = usage.value.limites.maxIA
    if (max === null || max === 0 || max === undefined) return Infinity
    return Math.max(0, max - (usage.value.iaUsosPeriodo || 0))
  })

  const isAtLimit = (tipo) => {
    switch (tipo) {
      case 'spots': return spotsDisponibles.value !== null && spotsDisponibles.value <= 0
      case 'equipos': return equiposDisponibles.value !== null && equiposDisponibles.value <= 0
      case 'ia': return iaDisponible.value !== null && iaDisponible.value <= 0
      default: return false
    }
  }

  // Actions
  const loadUsage = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await api.get('/Cliente/miPlan/uso').then(res => res.data)
      usage.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando limites del plan'
      console.error('Error loading plan usage:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearUsage = () => {
    usage.value = null
    error.value = null
  }

  return {
    usage,
    loading,
    error,
    spotsDisponibles,
    equiposDisponibles,
    iaDisponible,
    isAtLimit,
    loadUsage,
    clearUsage
  }
})
