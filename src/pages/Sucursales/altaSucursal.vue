<template>
        <card>
          <h5 slot="header" class="title">Todavía no elegiste tu prefijo!</h5>

          <base-alert  class="mb-4" :type="tipoAlerta">
            <div class="row">
              <div class="col-12">
                <div class="row">
                  <div class="col-1">
                    <span><b-icon class="display-4" icon="info-circle"></b-icon></span>
                  </div>
                  <div class="col-10">
                    <span data-notify="message">
                      {{mensajeAlerta}}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </base-alert>

          <base-input
            class="col-4 mb-4"
            label="Elejí tu prefijo"
            placeholder="prefijo"
            v-model="nuevoPrefijo"
            required>
          </base-input>
          <div class="col-md-2">
            <base-button type="success" block @click="setPrefijo">Guardar</base-button>
          </div>
        </card>

</template>

<script>
import SucursalServices from '../../services/SucursalServices'
import UserServices from '../../services/UserServices'
import ClienteServices from '../../services/ClienteServices'
import { BaseAlert } from '@/components'
import NotificationTemplate from '@/components/NotificationPlugin/NotificationTemplate'

export default {
  layout: 'default',
  name: 'frmNuevaSucursal',
  components: {
    BaseAlert

  },
  data () {
    return {
      clientePrefijo: '',
      notificacion: { mensaje: '', tipo: 'error' },
      type: ['', 'danger'],
      notifications: {
        topCenter: false
      },
      nuevoPrefijo: '',
      user: null,
      idSucursal: this.$route.params.idSucursal,
      tipoAlerta: 'default',
      mensajeAlerta: 'El prefijo es necesario para crear usuarios a tus sucursales. Éste debe identificar a tu empresa de forma única en Club F5, de esta manera nos aseguramos que el nombre que elijas para tu sucursal sea único. Completá este campo para comenzar a utilizar Club F5 en tus sucursales.'
    }
  },
  methods: {
    getCurrentUser () {
      const currentUser = UserServices.current()
      if (currentUser && currentUser.Cliente) {
        const cli = JSON.parse(currentUser.Cliente)
        this.user = cli
      } else {
        console.error('No se pudo obtener el usuario actual')
        this.user = null
      }
    },
    verificarPermisoAlta () {
      if (this.$store.getters.getLimiteSucursal) {
        if (this.idSucursal === 0) {
          this.$router.push({ path: 'sucursales' })
        }
      }
    },
    getPrefijo () {
      ClienteServices.getClienteByUsername().then(response => {
        if (response.cli_prefijo != null) {
          this.$router.push({
            name: 'Datos de la sucursal',
            params:
              {
                idSucursal: 0
              }
          })
        }
      })
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
    },
    setPrefijo () {
      ClienteServices.setPrefijo(this.nuevoPrefijo).then(res => {
        this.$router.push({
          name: 'Datos de la sucursal',
          params:
            {
              idSucursal: 0
            }
        })
      })
        .catch(err => {
          this.handleError(err)
          this.notifyVue('top', 'center', this.notificacion.mensaje)
        })
    },
    handleError (err) {
      if (!err.response) {
        this.notificacion.mensaje = 'No se ha recibido respuesta del servidor. Int&eacute;ntelo nuevamente m&aacute;s tarde.'
      } else {
        if (err.response && err.response.data.hasOwnProperty('errorMessage')) {
          this.notificacion.mensaje = err.response.data.errorMessage
        } else {
          switch (err.response.status) {
            case 500:
              this.notificacion.mensaje = 'El servidor no se encuentra disponible.'
              break
            default:
              /* si obtengo un system.exception, hago un split para poder obtener la primer parte
              *luego, de la primer parte, con un substr para extraer lo que sigue de
              *"system.exception" (17 caracteres)
              */
              let error = []
              error = (err.response.data.split('at'))
              this.notificacion.mensaje = error[0].substr(18)
          }
        }
      }
    }
  },
  created () {
    this.verificarPermisoAlta() // verifica si puede crear una sucursal o no.. control redundante por si trata de acceder por url a esta pagina
  },
  mounted () {
    this.getPrefijo()
  },
  computed: {
    estadoBoton () {
      // si no tiene prefijo, no puede enviar el formulario
      let inhabilitado = true
      if (this.clientePrefijo != null) {
        inhabilitado = false
      }
      return inhabilitado
    }
  }
}

</script>
<style>
</style>
