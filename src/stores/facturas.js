import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import facturaService from '@/services/FacturaServices'
import { requireAuth } from '@/utils/storeHelpers'
import UserServices from '@/services/UserServices'

export const useFacturasStore = defineStore('facturas', () => {
  // State
  const facturas = ref([])
  const ultimaFactura = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const cliente = UserServices.currentCliente()
  // Getters
  const facturasCount = computed(() => facturas.value.length)
  const hasFacturas = computed(() => facturasCount.value > 0)
  const facturasPendientes = computed(() =>
    facturas.value.filter(f => f.facli_estado === 'A' || f.estado === 'Pendiente')
  )
  const facturasPagadas = computed(() =>
    facturas.value.filter(f => f.facli_estado === 'P' || f.estado === 'Pagada')
  )
  const facturasVencidas = computed(() =>
    facturas.value.filter(f => f.facli_estado === 'V' || f.estado === 'Vencida')
  )

  // Actions
  const loadFacturas = async () => {
    if (!requireAuth('FacturasStore', 'loadFacturas')) {
      facturas.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getByCliente(cliente.cli_codigo)
      facturas.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando facturas'
      console.error('Error loading facturas:', err)
      facturas.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadUltimaFactura = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getByCliente(cliente.cli_codigo)
      ultimaFactura.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando última factura'
      console.error('Error loading ultima factura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const viewFactura = async (codFactura) => {
    loading.value = true
    error.value = null

    try {
      const pdfData = await facturaService.verFactura(codFactura)

      // Create blob and open in new window
      const file = new Blob([pdfData], { type: 'application/pdf' })
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL)

      return fileURL
    } catch (err) {
      error.value = err.message || 'Error visualizando factura'
      console.error('Error viewing factura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== NUEVOS MÉTODOS PARA ADMINISTRADOR ==========

  const loadAllFacturas = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getAll()
      facturas.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando todas las facturas'
      console.error('Error loading all facturas:', err)
      facturas.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const loadFacturaById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getById(id)
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando factura'
      console.error('Error loading factura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadFacturasByCliente = async (clienteId) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getByCliente(clienteId)
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando facturas del cliente'
      console.error('Error loading facturas by cliente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSiguienteNumero = async (anio) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getSiguienteNumero(anio)
      return data.numero_factura
    } catch (err) {
      error.value = err.message || 'Error obteniendo siguiente número'
      console.error('Error getting siguiente numero:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadEstadisticas = async (anio = null, mes = null) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.getEstadisticas(anio, mes)
      return data
    } catch (err) {
      error.value = err.message || 'Error cargando estadísticas'
      console.error('Error loading estadisticas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const crearFactura = async (facturaData) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.crear(facturaData)
      // Recargar facturas después de crear
      await loadAllFacturas()
      return data
    } catch (err) {
      error.value = err.message || 'Error creando factura'
      console.error('Error creating factura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarFactura = async (id, facturaData) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.actualizar(id, facturaData)
      // Recargar facturas después de actualizar
      await loadAllFacturas()
      return data
    } catch (err) {
      error.value = err.message || 'Error actualizando factura'
      console.error('Error updating factura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const marcarPagada = async (id, datosPago) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.marcarPagada(id, datosPago)
      // Recargar facturas después de marcar como pagada
      await loadAllFacturas()
      return data
    } catch (err) {
      error.value = err.message || 'Error marcando factura como pagada'
      console.error('Error marking factura as pagada:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const anularFactura = async (id) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.anular(id)
      // Recargar facturas después de anular
      await loadAllFacturas()
      return data
    } catch (err) {
      error.value = err.message || 'Error anulando factura'
      console.error('Error anulando factura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const eliminarFactura = async (id) => {
    loading.value = true
    error.value = null

    try {
      const data = await facturaService.eliminar(id)
      // Recargar facturas después de eliminar
      await loadAllFacturas()
      return data
    } catch (err) {
      error.value = err.message || 'Error eliminando factura'
      console.error('Error deleting factura:', err)
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
    facturas,
    ultimaFactura,
    loading,
    error,

    // Getters
    facturasCount,
    hasFacturas,
    facturasPendientes,
    facturasPagadas,
    facturasVencidas,

    // Actions (legacy)
    loadFacturas,
    loadUltimaFactura,
    viewFactura,

    // Actions (nuevas)
    loadAllFacturas,
    loadFacturaById,
    loadFacturasByCliente,
    getSiguienteNumero,
    loadEstadisticas,
    crearFactura,
    actualizarFactura,
    marcarPagada,
    anularFactura,
    eliminarFactura,
    clearError
  }
})
