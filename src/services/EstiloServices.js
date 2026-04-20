import api from './api'

const EstiloService = {}

// Obtener todos los estilos
EstiloService.getAll = async function () {
  return api.get('/Estilo').then(res => res.data)
}

export default EstiloService
