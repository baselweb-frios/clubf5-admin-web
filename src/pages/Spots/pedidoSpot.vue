<template>
  <card :title="textos.title">

    <base-button
      class="mb-2"
      type="success"
      @click="redirectNuevoPedido()"
      :disabled="tipoPaquete === 'Standard'"
      >{{textos.button}}
    </base-button>

        <div id="container-plan-pedidos" >
          <div class="row mt-1">
            <div class="col-4">
              <div class="mb-2">
                <span class="texto-ped">Plan: </span>
                <span class="badge badge-info paquete-badge">{{tipoPaquete}}</span>
              </div>
            </div>

            <div class="col-4">
                <div class="mb-2">
                  <span class="texto-ped">Pedidos de spot por mes: </span>
                  <span class="texto-ped">{{cantMaxPedidos}}</span>
                </div>
            </div>

            <div class="col-4">
                <div class="mb-2">
                  <span class="texto-ped">Pedidos disponibles: </span>
                  <span class="texto-ped">{{pedidosDisponibles}}</span>
                </div>
            </div>
          </div>
        </div>

    <!-- Chat component temporarily disabled - requires Vue 3 compatible library -->
    <div class="chat-placeholder">
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        <p>El componente de chat está temporalmente deshabilitado. Se está trabajando en una versión compatible con Vue 3.</p>
        <p>Por favor, contacta al operador por otros medios mientras se actualiza esta funcionalidad.</p>
      </div>
    </div>
  </card>
</template>

<script>
import moment from 'moment'
import UserService from '../../services/UserServices'
import PedidoSpotService from '../../services/PedidoSpotServices'
import ClientePaqueteService from '../../services/ClientePaqueteServices'
import api from '../../services/api'

export default {
  layout: 'default',
  components: {
  },

  data () {
    const i18labels = this.$t('modulo_spots.biblioteca_spots.pedido_spot')
    return {
      textos: {
        title: i18labels.titulo,
        button: i18labels.botonNuevoPedido,
        textMessages: {
          ROOMS_EMPTY: i18labels.chatText.pedidosVacio,
          ROOM_EMPTY: i18labels.chatText.noSeleccion,
          NEW_MESSAGES: i18labels.chatText.nuevosMensajes,
          MESSAGE_DELETED: i18labels.chatText.mensajesBorrados,
          MESSAGES_EMPTY: i18labels.chatText.vacio,
          CONVERSATION_STARTED: i18labels.chatText.inicioChat,
          TYPE_MESSAGE: i18labels.chatText.escribe,
          SEARCH: i18labels.chatText.buscar
        }
      },
      roomsLoaded: false,
      loadingRooms: true,
      messagesLoaded: false,
      rooms: [],
      messages: [],
      showTextBox: true,
      currentUserId: '',
      currentChatId: null,
      name: 'altaPedidoSpot',
      MensajeSpot: '',
      selected: 'INST',
      checked: true,
      tipoSpot: [
        { texto: 'Institucional', value: 'INST' },
        { texto: 'Promocional', value: 'PROM' }
      ],
      fechaInicio: '',
      fechaFin: '',
      timer: null,
      urlSpotBase: '/Spots/',
      userCodigo: null,
      tipoPaquete: null,
      cantMaxPedidos: null,
      pedidosDisponibles: null,
      usuarioDestinoChat: null,
      cantNoLeidos: null
    }
  },
  methods: {
    inicializar () {
      if (this.tipoPaquete != 'Standard') {
        this.obtenerPedidos()
      }
    },
    getCurrentUser () {
      const cli = JSON.parse(UserService.current().Cliente)
      this.userCodigo = cli.cli_codigo
      this.currentUserId = UserService.current().unique_name
    },
    consultarPaquete () {
      let cantPedidos
      let cantRealizados
      let max
      ClientePaqueteService.GetByCli().then(res => {
        cantPedidos = res.paq_maxped
        cantRealizados = res.cant_pedidos
        max = cantPedidos - cantRealizados

        this.tipoPaquete = res.paq_descri
        this.cantMaxPedidos = cantPedidos
        this.pedidosDisponibles = max
      })
    },
    resetRooms () {
      this.loadingRooms = true
      this.rooms = []
      this.roomsLoaded = true

      this.resetMessages()
    },
    resetMessages () {
			  this.messages = []
			  this.messagesLoaded = false
		  },
    async enviarMensajeChat ({ content, roomId, file, replyMessage }) {
      const fechaHora = moment().format('YYYY/MM/DD HH:mm')

      PedidoSpotService.mensajeChatAlta(roomId, this.currentUserId, content, fechaHora, this.usuarioDestinoChat).then(res => {
        /* Cuando se realizó correctamente el envío del mensaje,
           * agrego temporalmente el mensaje al array para que se vea el mensaje enviado
           */
        this.messages.push(
          {
            _id: this.messages.length, // los id de los mensajes estan en orden del 1 al tamaño del array - 1. el nuevo mensaje sería correlativo
            content: content,
            sender_id: this.currentUserId, // el ususario que envía el mensaje siempre será el current user
            username: this.currentUserId,
            date: fechaHora,
            timestamp: moment(fechaHora).format('HH:mm'),
            system: false,
            saved: true,
            distributed: true,
            seen: false,
            disable_actions: true,
            disable_reactions: true
          })
      })
    },
    obtenerPedidos () {
      const pedidos = []
      let estado
      PedidoSpotService.GetPedidos().then(res => {
        res.forEach(element => {
          PedidoSpotService.GetNotificacionesNoLeidasByCodPs0(element.ps0_codigo)
            .then(resp => {
              if (resp.ps3_codigoPs0 === element.ps0_codigo) {
                this.cantNoLeidos = 'mensajes nuevos'
              } else {
                this.cantNoLeidos = 0
              }
              estado = this.verificaEstadoPedido(element.ps0_estado)
              pedidos.push({
                roomId: element.ps0_codigo,
                roomName: 'Pedido ' + element.ps0_codigo,
                avatar: '/imgs/logos/logoheader.png',
                unreadCount: this.cantNoLeidos, // cantidad de mensajes no leidos
                lastMessage: {
                  content: estado,
                  sender_id: this.currentUserId,
                  username: this.currentUserId,
                  timestamp: moment(element.ps0_fecalt).format('DD-MM-YY'),
                  saved: true,
                  distributed: true,
                  seen: false,
                  new: true
                },
                users: [
                  {
                    _id: this.currentUserId, // utilizamos el username del cliente para determinar el participante del chat
                    username: this.currentUserId,
                    avatar: 'assets/imgs/doe.png',
                    status: {
                      state: 'online',
                      last_changed: 'today, 14:30'
                    }
                  },
                  {
                    _id: 'admin', // el otro participante de la conversación siempre será el admin
                    username: 'admin',
                    avatar: '../../',
                    status: {
                      state: 'offline',
                      last_changed: ''
                    }
                  }
                ]
              })
            })
        })
      })
      this.rooms = pedidos
      this.roomsLoaded = true // cuando ya cargaron los pedidos lo pongo en true para indicar que ya estan cargados
    },
    verificaEstadoPedido (estado) {
      let auxEstado

      switch (estado) {
        case 'R':
          auxEstado = 'Tenés un nuevo mensaje'
          break
        case 'C':
          auxEstado = 'Esperando respuesta'
          break
        case 'N':
          auxEstado = 'Enviaste un pedido'
          break
        case 'A':
          auxEstado = 'Tu Spot está en proceso'
          break
        case '5':
          auxEstado = 'Cancelado'
          break
        case 'T':
          auxEstado = 'Tu Spot ya está disponible'
          break
      }

      return auxEstado
    },
    fetchMessages ({ room, options = {} }) {
      clearInterval(this.timer)
      this.messagesLoaded = false
      this.currentChatId = room.roomId
      const mensajes = []
      let spotSource
      // obtener el primer mensaje que corresponde al pedido de spot (ps0)

      PedidoSpotService.GetPedidoByCodPs0(room.roomId).then(res => {
        this.usuarioDestinoChat = res.cli_usuari
        // si el pedido ya está terminado desactivo el texbox para mandar mensajes
        if (res.ps0_estado === 'T') {
          this.showTextBox = false
        } else {
          this.showTextBox = true
          // si el estado es R, recibió un mensaje y debo indicar el mensaje como leído
          if (res.ps0_estado === 'R') {
            PedidoSpotService.leerMensaje(res.ps0_codigo).then(res => {

            })
          }
        }
        mensajes.push(
          {
            _id: -1, // el pedido siempre será el primer mensaje, por tanto puede ir 0
            content: res.ps0_texto,
            sender_id: this.currentUserId, // el pedido siempre será de parte del cliente
            username: this.currentUserId,
            date: moment(res.ps0_fecalt).format('DD/MM/YYYY'),
            timestamp: moment(res.ps0_fecalt).format('HH:mm'),
            system: false,
            saved: true,
            distributed: true,
            seen: true,
            disable_actions: true, // activar-desactivar acciones en un mensaje (eliminar-editar)
            disable_reactions: true // activar-desactivar reacciones a un mensaje
          })

        // Obtener el resto de los mensajes correspondientes a ps1
        PedidoSpotService.GetMensajes(room.roomId).then(res => {
          res.forEach(element => {
            if (element.ps1_estpos === 'T') {
              spotSource = element.ps1_texto

              mensajes.push(
                {
                  _id: element.ps1_item,
                  content: 'El spot ya está disponible. Podés administrarlo desde la biblioteca de spots.',
                  sender_id: element.ps1_usualt,
                  username: element.ps1_usualt,
                  date: moment(element.ps1_fecalt).format('DD/MM/YYYY'),
                  timestamp: moment(element.ps1_fecalt).format('HH:mm'),
                  system: false,
                  saved: true, // un check
                  distributed: true, // doble check
                  seen: true, // doble check azul
                  disable_actions: true, // activar-desactivar acciones en un mensaje (eliminar-editar)
                  disable_reactions: true // activar-desactivar reacciones a un mensaje
                })

              mensajes.push(
                {
                  _id: element.ps1_item + 1,
                  content: 'El spot ya está disponible',
                  sender_id: element.ps1_usualt,
                  username: element.ps1_usualt,
                  date: moment(element.ps1_fecalt).format('DD/MM/YYYY'),
                  timestamp: moment(element.ps1_fecalt).format('HH:mm'),
                  system: false,
                  saved: true, // un check
                  distributed: true, // doble check
                  seen: true, // doble check azul
                  disable_actions: true, // activar-desactivar acciones en un mensaje (eliminar-editar)
                  disable_reactions: true, // activar-desactivar reacciones a un mensaje
                  file: {
                    name: 'My File',

                    type: 'mp3',
                    audio: true,

                    url: spotSource
                  }
                })
            } else {
              mensajes.push(
                {
                  _id: element.ps1_item,
                  content: element.ps1_texto,
                  sender_id: element.ps1_usualt,
                  username: element.ps1_usualt,
                  date: moment(element.ps1_fecalt).format('DD/MM/YYYY'),
                  timestamp: moment(element.ps1_fecalt).format('HH:mm'),
                  system: false,
                  saved: true, // un check
                  distributed: true, // doble check
                  seen: true, // doble check azul
                  disable_actions: true, // activar-desactivar acciones en un mensaje (eliminar-editar)
                  disable_reactions: true // activar-desactivar reacciones a un mensaje

                })
            }
          })
        })
      })

      this.messages = mensajes
      this.messagesLoaded = true
      this.chequearMensajesNuevos()
      PedidoSpotService.leerMensaje(room.roomId)
    },
    redirectNuevoPedido () {
      this.$router.push({
        path: 'altaPedidoSpot'
      })
    },
    chequearMensajesNuevos () {
      this.timer = window.setInterval(() => {
        const fechaHora = moment().format('YYYY/MM/DD HH:mm')
        const ultimoId = (this.messages.length - 1)

        PedidoSpotService.GetUltimoMensaje(this.currentChatId).then(res => {
          if (res.ps1_item > ultimoId) {
            this.messages.push(
              {
                _id: res.ps1_item, // En este caso no importa el id. no se guarda. unicamente para mostrar el mensaje al momento de enviarlo
                content: res.ps1_texto,
                sender_id: 'admin', // el ususario que envía el mensaje siempre será el current user
                username: 'admin',
                date: fechaHora,
                timestamp: moment(fechaHora).format('HH:mm'),
                system: false,
                saved: true,
                distributed: true,
                seen: false,
                disable_actions: true,
                disable_reactions: true
              })
          }
        })
      }, 5000)
    },
    notifyVue (verticalAlign, horizontalAlign, message) {
      const color = 1
      this.$notify({
        message: message,
        component: NotificationTemplate,
        icon: 'tim-icons icon-alert-circle-exc',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color],
        timeout: 0
      })
    }
  },
  created () {
    this.i18n = this.$i18n
    this.getCurrentUser()
    this.consultarPaquete()
  },
  mounted () {
    this.inicializar()
  },
  destroyed () {
    clearInterval(this.timer)
  },
  computed: {

  }
}

</script>
<style>
</style>
