import api from './api'
import ClienteSucursalProgramacion from './ClienteSucursalProgramacionServices'
import moment from 'moment'
import userService from './UserServices'

const sucursalService = {}

const clienteSucursal = {
  clisuc_codigo: 0,
  clisuc_numeroSucursal: 0,
  clisuc_nombre: '',
  clisuc_fechaAlta: '',
  clisuc_idSucursal: 0,
  cli_codigo: 0,
  cli_usuari: '',
  username: '',
  password: '',
  adm_NroIntentos: 0,
  adm_fechaDesde: '',
  sucpgr_codigoSucursal: 0,
  clipro_nombre: ''
}

sucursalService.cliSucursal = clienteSucursal

sucursalService.get = function () {
  return clienteSucursal
}

sucursalService.setModoReprod = async function (codSuc, modo) {
  return api.put(`/sucursal/setModo/${codSuc}/${modo}`).then(res => res.data)
}
sucursalService.getcliSucursalByCliente = function () {
  return api.get('/sucursal/')

    .then((response) => {
      console.log('✅ Sucursales recibidas del servidor:', response.data)
      const result = response.data.map(element => {
        return {
          ...element,
          detalle: 'Sin novedad',
          event: 'desconectado',
          avance: -1,
          conected: 0,
          audio_vivo: element.clisuc_idSucursal == null ? '' : `https://sonic.dattalive.com:${element.clisuc_idSucursal}/stream.aac`
        }
      })
      localStorage.setItem('sucursales', JSON.stringify(result))
      return result
    })
}

// para obtener la programacion de spot de una sucursal
sucursalService.getprogSpotBySuc = async function (nombreSucursal) {
  return api.get(`/sucursal/${nombreSucursal}`).then(res => res.data)
}

sucursalService.altaSucursal = async function (sucursal) {
  const cliente = JSON.parse(userService.current().Cliente)
  const dataSucursaSend = {
    ...sucursal,
    dependencia: (userService.current().role == 'Cliente') ? cliente.cli_usuari : '',
    iscliente: 0
  }
  return api.post('/sucursal/', dataSucursaSend).then(res => res.data)
}

//* **FIX*** agregar una funcion editarSucursal que llame a .put('sucursal/')

sucursalService.bajaSucursal = async function (pDeletes) {
  const promiseDelete = pDeletes.map(del => api.delete(`/sucursal/${del.clisuc_codigo}/${del.username}`))
  const result = await Promise.all(promiseDelete)
  return result
}

sucursalService.put = async function (sucursal) {
  const dataSucursaSend = {
    idSucursal: sucursal.idSucursal,
    nombreSucursal: sucursal.nombreSucu,
    nombreUsuarioSucursal: sucursal.usernameSucu,
    contrasenia: sucursal.passSucu,
    progRadioSelected: sucursal.progRadio,
    progSpotSelected: sucursal.progSpot,
    permisoSelected: sucursal.programSpot,
    iscliente: sucursal.iscliente
  }
  return api.put('/sucursal/', dataSucursaSend).then(res => res.data)
}

sucursalService.estadoSucursal = async function (nombreUsuarioSucursal) {
  return api.post('/sucursal/estado', {

    nombreUsuarioSucursal

  }).then(res => res.data)
}

export default sucursalService
