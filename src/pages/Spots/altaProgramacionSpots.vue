<template>
  <card>
      <h5 slot="header" class="title">Nueva Programación</h5>
      <form  id="frmNuevaProgramacion" accept-charset="UTF-8" role="form" v-on:submit.prevent="guardarProgramacion" class="form-lock">
        <div class="row">
          <div class="col-md-6 pr-md-3">
            <base-input label="Nombre de la Programacion"
                      placeholder="Nombre"
                      v-model="nombreProgramacion"
                      required>
            </base-input>
          </div>
        </div>
        <input class="btn btn-md btn-success"
                      type="submit"
                      value="Guardar"
                    >
      </form>
      <loading-overlay
        :show="isLoading"
        opacity="0.4"
        color="#1d8cf8"
        height="95px"
        text="Guardando programación..."
      />
  </card>
</template>

<script>
import SpotServices from '../../services/SpotServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

export default {
  layout: 'default',
  name: 'frmNuevaProgramacion',
  components: {
    LoadingOverlay,
    LoadingSpinner
  },

  data () {
    return {
      nombreProgramacion: '',
      notificacion: { mensaje: '', tipo: 'error' },
      type: ['', 'danger'],
      notifications: {
        topCenter: false
      },
      codigoProgramacion: this.$route.params.codigoProgramacion,
      isLoading: false
    }
  },
  methods: {
    guardarProgramacion () {
      this.isLoading = true
      // Obtengo por parametro el codigo de la Programacion para editar, 0 si es para crear una nueva
      SpotServices.altaProgramacion(this.codigoProgramacion, this.nombreProgramacion)
        .then(res => {
          // si todo sale ok, redirijo a programaSpot
          this.isLoading = false
          this.$router.push({ path: '/programaSpot' })
        })
        .catch(err => {
          this.handleError(err)
          this.notifyVue('top', 'center', this.notificacion.mensaje)
          this.isLoading = false
        })
    },
    handleError (err) {
      if (!err.response) {
        this.notificacion.mensaje = 'No se ha recibido respuesta del servidor. Int&eacute;ntelo nuevamente m&aacute;s tarde.'
      } else {
        if (err.response && err.response.data.hasOwnProperty('errorMessage')) {
          this.notificacion.mensaje = err.response.data.errorMessage
        } else {
          console.log(err.response.data.split('at'))
          switch (err.response.status) {
            case 502:
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
    },
    verificarParametros () {
      const codigoProgramacion = this.$route.params.codigoProgramacion
      const nombreProg = this.$route.params.nombreProgramacion

      if (this.codigoProgramacion != 0) {
        this.nombreProgramacion = nombreProg
      }
      if (codigoProgramacion == null) {
        this.codigoProgramacion = 0
      }
    },
    notifyVue (verticalAlign, horizontalAlign, message) {
      // Usar alert nativo o implementar notificación personalizada
      alert(message)
    }
  },
  mounted () {
    this.verificarParametros()
  },
  computed: {

  }
}

</script>
<style>
</style>
