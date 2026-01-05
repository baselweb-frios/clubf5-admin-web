import api from './api'
import apimusic from './apimusic'

const generoMusicalService = {}

// Gereros musicales
generoMusicalService.getGeneros = async function () {
  return api.get('/GeneroMusical/').then(res => res.data)
}

// Obtener un género musical por código
generoMusicalService.getGenero = async function (codigo) {
  return api.get(`/GeneroMusical/${codigo}`).then(res => res.data)
}

// Obtener géneros por tipo de empresa
generoMusicalService.getGenerosByTipoEmpresa = async function (codigoTipoEmpresa) {
  return api.get(`/GeneroMusical/ByTipoEmpresa/${codigoTipoEmpresa}`).then(res => res.data)
}

// Crear nuevo género musical
generoMusicalService.crearGenero = async function (genero) {
  return api.post('/GeneroMusical', genero).then(res => res.data)
}

// Eliminar género musical
generoMusicalService.eliminarGenero = async function (codigo) {
  return api.delete(`/GeneroMusical/${codigo}`).then(res => res.data)
}

// GeneroMusicalRadio
generoMusicalService.buscar = async function (idGenMus, idRad, idRit, idTipEmp, idEst) {
  return api.get(`/GeneroMusicalRadio/Buscar/${idGenMus}` + '/' + `${idRad}` + '/' + `${idRit}` + '/' +
  `${idTipEmp}` + '/' + `${idEst}`).then(res => res.data)
}

export default generoMusicalService
