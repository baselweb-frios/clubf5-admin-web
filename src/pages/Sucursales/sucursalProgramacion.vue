<template>
  <card>
      <h4 slot="header" class="title">{{titulos.titulo + nombreSucursal}}</h4>

      <form id="frmClienteProgramaciones"  accept-charset="UTF-8" role="form" v-on:submit.prevent="btnGuardar" class="form-lock">

        <div class="options-container-Musica">
          <div class="row">
            <div class="col-12 mb-4">
              <h5 class="title mb-4">{{titulos.subtituloMusica}}</h5>
                <div id="inputRadio">

                  <b-form-group>
                    <b-form-radio-group
                      v-model="radioSelected"
                      :options="optionsRadio"

                      value-field="item"
                      text-field="name"
                      disabled-field="notEnabled">
                    </b-form-radio-group>
                  </b-form-group>
                </div>
            </div>
          </div>
        </div>

        <div class="options-container-Spot border-top border-info">
          <div class="row">
            <div class="col-12 mb-5">
              <h5 class="title mt-3 mb-4">{{titulos.subtituloSpot }}</h5>
                <div id="inputRadio">
                  <b-form-radio-group
                    v-model="spotSelected"
                    :options="optionsSpot"
                    value-field="item"
                    text-field="name"
                    disabled-field="notEnabled"
                  ></b-form-radio-group>
                </div>
            </div>
          </div>
        </div>

        <div class="border-top border-info">
          <div class="row">
            <div class="col-12 mb-5">
              <h5 class="title mt-3 mb-4">{{titulos.subtituloPermisoSpot}}</h5>
                <div id="inputRadio">
                  <b-form-radio-group
                    v-model="permisoSelected"
                    :options="permisoSpots"
                    value-field="item"
                    text-field="name"
                    disabled-field="notEnabled"
                  ></b-form-radio-group>
                </div>
            </div>
          </div>
        </div>
        <div class="border-top border-info">
          <div class="row">
            <div class="col-12 mb-5">
              <h5 class="title mt-3 mb-4">Modo reproducci&oacute;n</h5>
                <div id="inputRadio">
                  <b-form-radio-group
                    v-model="modoSelected"
                    :options="modoReprod"
                    value-field="item"
                    text-field="name"
                    :state="state"
                    disabled-field="notEnabled"
                  ></b-form-radio-group>
                </div>
            </div>
          </div>
        </div>

        <input
          class="btn btn-md btn-success"
          type="submit"
          value="Guardar"
        >
      </form>
      <b-overlay
        :show="isLoading"
        opacity="0.4"
        no-wrap
        >
        <template #overlay>
          <div class="text-center">
            <scale-loader :loading="loading" :color="'#1d8cf8'" :height="'95px'" :width="width"></scale-loader>
          </div>
        </template>
      </b-overlay>
  </card>
</template>

<script>
import ClienteProgramacion from '../../services/ClienteProgramacionServices'
import ClienteSucursalProgramacion from '../../services/ClienteSucursalProgramacionServices'
import sucursalService from '@/services/SucursalServices'
import { BaseAlert } from '@/components'
import NotificationTemplate from '@/components/NotificationPlugin/NotificationTemplate'
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'

export default {
  layout: 'default',
  components: {
    BaseAlert,
    ScaleLoader
  },

  data () {
    const i18labels = this.$t('modulo_sucursales.sucursalProgramacion')
    return {
      titulos: {
        titulo: i18labels.titulo,
        subtituloSpot: i18labels.subtituloSpots,
        subtituloMusica: i18labels.subtituloMusica,
        subtituloPermisoSpot: i18labels.subtituloPermiso
      },

      idSucursal: this.$route.params.idSucursal,
      nombreSucursal: this.$route.params.nombreSucursal,
      usernameSucursal: this.$route.params.sucUsuario,
      notificacion: '',
      type: ['', 'danger'],
      notifications: {
        topCenter: false
      },
      radioSelected: 0,
      optionsRadio: [],
      spotSelected: 0,
      optionsSpot: [],
      permisoSpots: [
        { name: 'Si', item: 1 }, { name: 'No', item: 0 }
      ],
      modoReprod: [
        { name: 'Radio', item: 1 }, { name: 'No radio', item: 0 }
      ],
      permisoSelected: this.$route.params.permisoSpot,
      modoSelected: this.$route.params.modoReprod,
      isLoading: false
    }
  },
  methods: {
    btnGuardar () {
      this.isLoading = true
      ClienteSucursalProgramacion.guardar(this.idSucursal, this.radioSelected, this.spotSelected, this.permisoSelected)
        .then(res => {
          this.$router.push({ name: 'sucursales' })
        })
        .catch(err => {
          this.handleError(err)
          this.notifyVue('top', 'center', this.notificacion)
          this.isLoading = false
        })
    },
    verificarParametros () {
      if (this.idSucursal === undefined || this.nombreSucursal === undefined || this.usernameSucursal === undefined) {
        this.$router.push({ name: 'sucursales' })
      }
    },
    listarProgramacionesRadio () {
      const resJson = []
      this.isLoading = true
      ClienteProgramacion.listarProgRadios().then(res => {
        res.forEach(element => {
          resJson.push({
            item: element.clipro_codigo,
            name: element.clipro_nombre
          })
        })

        this.optionsRadio = resJson
        this.isLoading = false
      })
    },
    listarProgramacionesSpot () {
      const resJson = []
      ClienteProgramacion.listarProgSpot().then(res => {
        res.forEach(element => {
          resJson.push({
            item: element.clipro_codigo,
            name: element.clipro_nombre
          })
        })
        this.isLoading = false
        this.optionsSpot = resJson
      })
    },
    getProgramacionesSeleccionadas () {
      ClienteSucursalProgramacion.getProgramacionesSeleccionadas(this.usernameSucursal).then(res => {
        this.radioSelected = res.sucpgr_codigoProgramacionRadio
        this.spotSelected = res.sucpgr_codigoProgramacionSpot
        this.isLoading = false
      })
    },
    handleError (err) {
      if (!err.response) {
        this.notificacion = 'No se ha recibido respuesta del servidor. Int&eacute;ntelo nuevamente m&aacute;s tarde.'
      } else {
        if (err.response && err.response.data.hasOwnProperty('errorMessage')) {
          this.notificacion = err.response.data.errorMessage
        } else {
          const erro = []
          console.log(err.response.data.split('at'))
          switch (err.response.status) {
            case 502:
              this.notificacion = 'El servidor no se encuentra disponible.'
              break
            default:
              /* si obtengo un system.exception, hago un split para poder obtener la primer parte
                *luego, de la primer parte, con un substr para extraer lo que sigue de
                *"system.exception" (17 caracteres)
                */
              let error = []
              error = (err.response.data.split('at'))
              this.notificacion = error[0].substr(18)
          }
        }
      }
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
  mounted () {
    this.i18n = this.$i18n
    this.verificarParametros()
    this.listarProgramacionesRadio()
    this.listarProgramacionesSpot()
    this.getProgramacionesSeleccionadas()
  },
  watch: {
    async modoSelected (oldvalue, newvalue) {
      await sucursalService.setModoReprod(this.$route.params.idSucursal, newvalue)
    }
  }

}

</script>
<style>
</style>
