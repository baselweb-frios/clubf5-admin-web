import api from './api'

const clienteService = {}

clienteService.getClienteAll = async function () {
  return api.get('/Cliente/all').then(res => res.data)
}
clienteService.getClienteByUsername = async function () {
  return api.get('/Cliente/consultarCliente').then(res => res.data)
}
clienteService.buscarClientePorId = async function (id) {
  return api.get(`/Cliente/${id}`).then(res => res.data)
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

clienteService.update = async function (id, clienteData) {
  return api.put(`/Cliente/${id}`, clienteData).then(res => res.data)
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
