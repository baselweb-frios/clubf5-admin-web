import api from './api'

const clienteConfigService = {}

// ===== HORARIOS =====
clienteConfigService.getHorario = async function () {
  return api.get('/ClienteHorario').then(res => res.data)
}

clienteConfigService.setHorario = async function (horarioData) {
  return api.post('/ClienteHorario', horarioData).then(res => res.data)
}

clienteConfigService.updateHorario = async function (horarioData) {
  return api.put('/ClienteHorario', horarioData).then(res => res.data)
}

// ===== DÍAS HÁBILES =====
clienteConfigService.getDiasHabiles = async function () {
  return api.get('/DiaHabil').then(res => res.data)
}

clienteConfigService.setDiasHabiles = async function (diasData) {
  return api.post('/DiaHabil', diasData).then(res => res.data)
}

clienteConfigService.updateDiasHabiles = async function (diasData) {
  return api.put('/DiaHabil', diasData).then(res => res.data)
}

// ===== TIPO DE EMPRESA =====
// Obtener tipos de empresa asignados al cliente
clienteConfigService.getTiposEmpresaCliente = async function () {
  return api.get('/TipoEmpresa').then(res => res.data)
}
clienteConfigService.getTiposEmpresaClienteAll = async function () {
  return api.get('/TipoEmpresa/all').then(res => res.data)
}

// Obtener grupos de tipo de empresa (para el selector)
clienteConfigService.getTiposEmpresaGrupo = async function () {
  return api.get('/TipoEmpresaGrupo').then(res => res.data)
}

// Asignar tipo de empresa al cliente
clienteConfigService.setTipoEmpresa = async function (tipoEmpresaData) {
  return api.post('/TipoEmpresa', {...tipoEmpresaData}).then(res => res.data)
}

// Eliminar tipo de empresa del cliente
clienteConfigService.deleteTipoEmpresa = async function (codigoTipoEmpresa) {
  return api.delete(`/TipoEmpresa/${codigoTipoEmpresa}`).then(res => res.data)
}

export default clienteConfigService
