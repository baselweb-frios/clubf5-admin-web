import api from './api'

const InfoService = {}

InfoService.getBase = async function () {
  return api.get('/info/base/').then(res => res.data)
}

export default InfoService
