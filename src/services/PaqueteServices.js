import api from './api'

const PaqueteService = {}

// Obtener todos los paquetes
PaqueteService.getAll = async function () {
  return api.get('/Paquete').then(res => res.data)
}

// Obtener un paquete por código
PaqueteService.getById = async function (codigo) {
  return api.get(`/Paquete/${codigo}`).then(res => res.data)
}

// Crear un nuevo paquete
PaqueteService.create = async function (paquete) {
  return api.post('/Paquete', paquete).then(res => res.data)
}

// Actualizar un paquete existente
PaqueteService.update = async function (codigo, paquete) {
  return api.put(`/Paquete/${codigo}`, paquete).then(res => res.data)
}

// Eliminar un paquete
PaqueteService.delete = async function (codigo) {
  return api.delete(`/Paquete/${codigo}`).then(res => res.data)
}

export default PaqueteService
