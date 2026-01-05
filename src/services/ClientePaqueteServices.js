import api from './api'

const ClientePaqueteService = {}

ClientePaqueteService.GetByCli = async function () {
  return api.get('/ClientePaquete/').then(res => res.data)
}

export default ClientePaqueteService
