import api from './api'

const clienteHorarioService = {}

clienteHorarioService.get = async function () {
  return api.get('/clienteHorario/').then(res => res.data)
}

export default clienteHorarioService
