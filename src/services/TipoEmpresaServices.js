import api from './api'

const TipoEmpresaService = {}

// Obtener todos los tipos de empresa
TipoEmpresaService.getAll = async function () {
  return api.get('/TipoEmpresa/all').then(res => res.data)
}

// Obtener tipos de empresa por cliente
TipoEmpresaService.getByCliente = async function () {
  return api.get('/TipoEmpresa').then(res => res.data)
}

export default TipoEmpresaService
