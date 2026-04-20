import api from './api'

const controlAireService = {}

controlAireService.getControlAire = async function () {
  return api.get('/ControlAire/getAllData').then(res => res.data)
}
controlAireService.getSpotControlAire = async function (anio, mes) {
  return api.post('/ControlAire/getSpotControlAire', { anio, mes }).then(res => res.data)
}

controlAireService.genRegistro = async function () {
  return api.post('/Music/Registrar', {}).then(res => res.data)
}

controlAireService.GetEstado = async function (action,msg){
  return api.post("/ControlAire/Estado/",{action,msg})
}

export default controlAireService
