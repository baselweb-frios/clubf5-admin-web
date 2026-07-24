import api from './api'

const clienteService = {}

clienteService.getClienteAll = async function () {
  return api.get('/Cliente/all').then(res => res.data)
}
clienteService.getClienteByUsername = async function () {
  return api.get('/Cliente/consultarCliente').then(res => res.data)
}

clienteService.setPrefijo = async function (nuevoPrefijo) {
  return api.post('/Cliente/nuevoPrefijo', {
    nuevoPrefijo
  }).then(res => res.data)
}

clienteService.setDatosCuenta = async function (datosCuenta) {
  return api.post('/Cliente/datosCuenta', {...datosCuenta}).then(res => res.data)
}
clienteService.altaCuenta = async function (cliente, admin) {
  return api.post("/Cliente/alta", { ...cliente, ...admin }).then(res => res.data)
}
clienteService.del = async function (id) {
  return api.delete(`/Cliente/${id}`)
}

clienteService.getClienteById = async function (id) {
  return api.get(`/Cliente/${id}`).then(res => res.data)
}

// ========== SELF-SERVICE: CAMBIO DE PLAN (rol Cliente) ==========

// Paquete/plan actual del cliente autenticado (incluye info de uso, ej. cant_pedidos vs paq_maxped).
// El cliente se identifica en el backend vía JWT, no se manda ningún id acá.
clienteService.getMiPaquete = async function () {
  return api.get('/ClientePaquete').then(res => res.data)
}

// Catálogo completo de paquetes disponibles (para elegir un nuevo plan).
clienteService.getPaquetes = async function () {
  return api.get('/Paquete').then(res => res.data)
}

// Cambia el paquete del cliente autenticado. El backend identifica al cliente por JWT
// (PUT /Cliente/miPlan, rol Cliente) - acá solo se manda el código del paquete destino.
clienteService.cambiarMiPlan = async function (cliCodpaq) {
  return api.put('/Cliente/miPlan', { cli_codpaq: cliCodpaq }).then(res => res.data)
}

// ========== NUEVOS MÉTODOS PARA GESTIÓN COMPLETA DE CLIENTES ==========

// Obtener todos los clientes con información completa (Cliente + Admin)
clienteService.getAllCompleto = async function () {
  return api.get('/Cliente/completo/all').then(res => res.data)
}

// Actualizar cliente completo (Cliente + Admin)
clienteService.updateCompleto = async function (id, clienteData) {
  return api.put(`/Cliente/completo/${id}`, clienteData).then(res => res.data)
}

// Eliminar cliente completo (Cliente + todos sus usuarios dependientes)
clienteService.deleteCompleto = async function (id) {
  return api.delete(`/Cliente/completo/${id}`).then(res => res.data)
}

// Limpiar caché del servidor
clienteService.clearCache = async function () {
  return api.post('/Cliente/cache/clear').then(res => res.data)
}

export default clienteService
