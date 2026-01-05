import api from './api'

const PedidoSpotService = {}

PedidoSpotService.GetNotificacionesNoLeidas = async function () {
  return api.get('/PedidoSpot/Notificaciones/NoLeidas/').then(res => res.data)
}

PedidoSpotService.GetNotificacionesNoLeidasByCodPs0 = async function (codigoPedido) {
  return api.get(`/PedidoSpot/Notificaciones/NoLeidas/${codigoPedido}`).then(res => res.data)
}

PedidoSpotService.GetPedidos = async function () {
  return api.get('/PedidoSpot/').then(res => res.data)
}

PedidoSpotService.GetPedidoByCodPs0 = async function (codigoPedido) {
  return api.get(`/PedidoSpot/${codigoPedido}`).then(res => res.data)
}

PedidoSpotService.GetMensajes = async function (codigoPedido) {
  return api.get(`/PedidoSpot/chat/${codigoPedido}`).then(res => res.data)
}

PedidoSpotService.GetUltimoMensaje = async function (codigoPedido) {
  return api.get(`/PedidoSpot/chat/last/${codigoPedido}`).then(res => res.data)
}

PedidoSpotService.nuevoPedido = async function (fechaAlta, textoPedido, fechaDesde, fechaHasta, codigoLocutor, tipoSpot) {
  return api.post('/PedidoSpot/', {

    fechaAlta, textoPedido, fechaDesde, fechaHasta, codigoLocutor, tipoSpot

  }).then(res => res.data)
}

PedidoSpotService.leerMensaje = async function (codigoPedido) {
  return api.post('/PedidoSpot/leido', {
    codigoPedido
  }).then(res => res.data)
}

PedidoSpotService.mensajeChatAlta = async function (codigoPedido, usuarioAlta, textoMensaje, fecha, usuarioDestino) {
  return api.post('/PedidoSpot/chat/', {

    codigoPedido, usuarioAlta, textoMensaje, fecha, usuarioDestino

  }).then(res => res.data)
}

export default PedidoSpotService
