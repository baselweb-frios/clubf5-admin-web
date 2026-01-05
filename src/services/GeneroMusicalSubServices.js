import api from './api'

const generoMusicalSubService = {}

// SubGéneros musicales
generoMusicalSubService.getSubGeneros = async function () {
  return api.get('/GeneroMusicalSub/').then(res => res.data)
}

// Obtener todos los subgéneros (alias para compatibilidad)
generoMusicalSubService.getAllSubGeneros = async function () {
  return api.get('/GeneroMusicalSub/').then(res => res.data)
}

// Obtener un subgénero por código
generoMusicalSubService.getSubGenero = async function (codigo) {
  return api.get(`/GeneroMusicalSub/${codigo}`).then(res => res.data)
}

// Obtener subgéneros por género
generoMusicalSubService.getSubGenerosByGenero = async function (codigoGenero) {
  return api.get(`/GeneroMusicalSub/ByGenero/${codigoGenero}`).then(res => res.data)
}

// Crear nuevo subgénero
generoMusicalSubService.crearSubGenero = async function (subgenero) {
  return api.post('/GeneroMusicalSub', subgenero).then(res => res.data)
}

// Eliminar subgénero
generoMusicalSubService.eliminarSubGenero = async function (codigo) {
  return api.delete(`/GeneroMusicalSub/${codigo}`).then(res => res.data)
}

export default generoMusicalSubService
