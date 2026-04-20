import api from './api'

const clienteSucursalProgramacionService = {}

clienteSucursalProgramacionService.getProgramacionesSeleccionadas = async function (username) {
  return api.get(`/ClienteSucursalProgramacion/${username}`).then(res => res.data)
}

// post para guardar una relacion cliente sucursal programacion
clienteSucursalProgramacionService.guardar = async function (codigoSucursal, codigoProgRadio, codigoProgSpot, permisoSpot) {
  return api.post('/ClienteSucursalProgramacion/', {

    codigoSucursal, codigoProgRadio, codigoProgSpot, permisoSpot

  }).then(res => res.data)
}

export default clienteSucursalProgramacionService
