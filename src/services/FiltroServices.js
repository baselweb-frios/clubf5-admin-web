import api from './api'

const filtroService = {}

// Gereros musicales
filtroService.listarTipoEmpresa = async function () {
  return api.get('/tipoEmpresa/').then(res => res.data)
}

filtroService.listarTipoEmpresaGrupo = async function () {
  return api.get('/tipoEmpresaGrupo/').then(res => res.data)
}

filtroService.listarRitmo = async function () {
  return api.get('/ritmo/').then(res => res.data)
}

filtroService.listarEstilo = async function () {
  return api.get('/estilo/').then(res => res.data)
}

export default filtroService
