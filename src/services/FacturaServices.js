import api from './api'

const facturaService = {}

// ========== MÉTODOS PARA ADMINISTRADOR ==========

// Obtener todas las facturas
facturaService.getAll = async function () {
  return api.get('/Factura').then(res => res.data)
}

// Obtener factura por ID con detalles completos
facturaService.getById = async function (id) {
  return api.get(`/Factura/${id}`).then(res => res.data)
}

// Obtener facturas de un cliente específico
facturaService.getByCliente = async function (clienteId) {
  return api.get(`/Factura/cliente/${clienteId}`).then(res => res.data)
}

// Obtener siguiente número de factura
facturaService.getSiguienteNumero = async function (anio) {
  return api.get(`/Factura/siguiente-numero/${anio}`).then(res => res.data)
}

// Obtener estadísticas de facturación
facturaService.getEstadisticas = async function (anio = null, mes = null) {
  const params = {}
  if (anio) params.anio = anio
  if (mes) params.mes = mes
  return api.get('/Factura/estadisticas', { params }).then(res => res.data)
}

// Crear nueva factura
facturaService.crear = async function (facturaData) {
  return api.post('/Factura', facturaData).then(res => res.data)
}

// Actualizar factura existente
facturaService.actualizar = async function (id, facturaData) {
  return api.put(`/Factura/${id}`, facturaData).then(res => res.data)
}

// Marcar factura como pagada
facturaService.marcarPagada = async function (id, datosPago) {
  return api.post(`/Factura/${id}/pagar`, datosPago).then(res => res.data)
}

// Anular factura
facturaService.anular = async function (id) {
  return api.post(`/Factura/${id}/anular`).then(res => res.data)
}

// Eliminar factura
facturaService.eliminar = async function (id) {
  return api.delete(`/Factura/${id}`).then(res => res.data)
}

// ========== MÉTODOS PARA PDF DE FACTURA FISCAL ==========

// Subir PDF de factura fiscal
facturaService.subirPdfFactura = async function (id, archivo) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  return api.post(`/Factura/${id}/subir-pdf-factura`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}

// Descargar PDF de factura fiscal
facturaService.descargarPdfFactura = async function (id) {
  return api.get(`/Factura/${id}/pdf-factura`, {
    responseType: 'blob'
  }).then(res => res.data)
}

// Verificar si existe PDF de factura fiscal
facturaService.tienePdfFactura = async function (id) {
  return api.get(`/Factura/${id}/tiene-pdf-factura`).then(res => res.data)
}

// Ver PDF de factura fiscal en nueva ventana
facturaService.verPdfFactura = async function (id) {
  const blob = await facturaService.descargarPdfFactura(id)
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  return url
}

// ========== MÉTODOS LEGACY (mantener compatibilidad) ==========

facturaService.getFacturasByCliente = async function () {
  return api.get('/factura/Cliente/').then(res => res.data)
}

// Obtener facturas pendientes del cliente actual
facturaService.getFacturasPendientesCliente = async function () {
  const facturas = await api.get('/factura/Cliente/').then(res => res.data)
  // Filtrar solo las facturas con estado 'P' (Pendiente) o 'V' (Vencida)
  return facturas.filter(f => f.fac_estado === 'P' || f.fac_estado === 'V')
}

facturaService.getUltimaFactura = async function () {
  return api.get('/factura/Cliente/').then(res => res.data[0])
}

facturaService.verFactura = async function (codFactura) {
  return api.get(`/factura/${codFactura}`, {
    responseType: 'arraybuffer'
  }).then(res => res.data)
}

export default facturaService
