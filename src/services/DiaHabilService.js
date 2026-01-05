import api from './api'

const diaHabilService = {}

diaHabilService.get = async function () {
  return api.get('/diaHabil/').then(res => res.data)
}

export default diaHabilService
