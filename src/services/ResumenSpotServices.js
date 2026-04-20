import api from './api'

const resumenSpotService = {}

resumenSpotService.get = async function (codigoSpot) {
  return api.get(`/ResumenSpot/resumen/${codigoSpot}`).then(res => res.data)
}

export default resumenSpotService
