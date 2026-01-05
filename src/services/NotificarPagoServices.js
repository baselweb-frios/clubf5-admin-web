import api from './api'

const NotificarPagoService = {}

NotificarPagoService.subirComprobante = async function (formdata) {
  return api.post('/PagoInformado/', formdata,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
}

NotificarPagoService.notificarPago = async function (monto, fecha, nombreArchivo, observacion) {
  return api.post('/PagoInformado/nuevo', { monto, fecha, nombreArchivo, observacion }
  ).then(res => res.data)
}

/*
LocutorService.post= async function(prop1, prop2) {
  return api.post('/Locutor/',{

    prop1, prop2

  }).then(res => res.data);
}
*/

export default NotificarPagoService
