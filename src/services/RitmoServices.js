import api from './api'

const RitmoService = {}

// Obtener todos los ritmos
RitmoService.getAll = async function () {
  return api.get('/Ritmo').then(res => res.data)
}

export default RitmoService
