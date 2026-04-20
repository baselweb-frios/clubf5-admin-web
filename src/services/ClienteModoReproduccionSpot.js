import api from './api'

const clienteModoSpotService = {}

clienteModoSpotService.get = async function () {
  return api.get('/ClienteModoReproduccionSpot/').then(res => res.data)
}

export default clienteModoSpotService
