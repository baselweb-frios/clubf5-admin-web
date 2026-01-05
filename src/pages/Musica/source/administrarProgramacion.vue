<template>
 <p>En Contruccion</p>
</template>

<script>
import cliproRadioServices from '@/services/ClienteProgramacionRadioServices'
import generoMusicalServices from '@/services/GeneroMusicalServices'
import generoMusicalSubServices from '@/services/GeneroMusicalSubServices'
import filtros from '@/services/FiltroServices'
import clienteProgramacionRadioService from '@/services/ClienteProgramacionRadioServices'
import clienteConfigService from '@/services/ClienteConfigServices'
import RadioServices from '@/services/RadioServices'
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'
import DiasServices from '@/services/DiaHabilService'
import CliHorarioServices from '@/services/ClienteHorarioServices'
import { BaseAlert } from '@/components'

export default {
  components: {
    ScaleLoader,
    BaseAlert
  },
  data () {
    return {
      codigoProgramacion: this.$route.params.codigoProgramacion,
      nombreProgramacion: this.$route.params.nombreProgramacion,
      titulo: '',
      type: ['', 'danger'],
      notifications: {
        topCenter: false
      },
      notificacion: '',
      activeTab: 'calendar',
      isFilterPanelOpen: false,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedRadio: null,
      selectedProgramacion: null,
      programacionesData: [],
      businessHours: {
          daysOfWeek: [],
          startTime: '',
          endTime: ''
      },
      generosMusicales: [],
      subGeneros: [],
      radios: [],
      allRadios: [], // Store all radios before filtering
      subGeneroSelected: null,
      filtros: {
        tipoEmpresa: [],
        estiloEmpresa: [],
        ritmo: []
      },
      filtroSelected: {
        tipoEmpresa: 0,
        estiloEmpresa: 0,
        ritmo: 0
      },
      userTiposEmpresa: [], // User's configured business types
      isLoading: false,
      isLoadingUserConfig: false
    }
  },
  created () {
    this.verificarParametros()
    this.getUserTiposEmpresa() // Get user's business types first
    this.getSubGenerosMusicales()
    this.cargarDatosFiltros()
    this.getGenerosMusicales()
    this.getDiasHabilesCliente()
    this.getHorarioCliente()
  },
  mounted () {
    this.getPlaylists()
    this.buildDraggables()
    this.getProgramaciones()
  },
  methods: {
    // All original methods preserved here
    getDiasHabilesCliente () {
      const dias = []
      this.isLoading = true
      DiasServices.get().then(res => {
        res.forEach(element => {
          dias.push(element.cliDha_codigoDia)
        })
        this.businessHours.daysOfWeek = dias
        this.isLoading = false
      })
    },
    getHorarioCliente () {
      this.isLoading = true
      let then=this
      CliHorarioServices.get().then(res => {
        debugger
        then.businessHours.startTime = res.cliHor_horaDesde
        then.businessHours.endTime = res.cliHor_horaHasta
        then.isLoading = false
      })
    },
    filtroSubgenero (etiqueta) {
      if (etiqueta === 'Todos') {
        this.subGeneroSelected = null
      } else {
        this.subGeneroSelected = etiqueta.subGenero
      }
    },
    verificarParametros () {
      if (this.codigoProgramacion === undefined || this.nombreProgramacion === undefined) {
        this.$router.push({
          name: 'Mi música'
        })
      } else {
        this.titulo = this.nombreProgramacion
      }
    },
    cargarDatosFiltros () {
      const tipEmpJson = [{ nombre: 'Todas las empresas', cod: 0 }]
      const tipEmpGrJson = []
      const ritmoJson = [{ nombre: 'Todos los ritmos', cod: 0 }]
      const estiloJson = [{ nombre: 'Todos los estilos', cod: 0 }]

      filtros.listarTipoEmpresa().then(res => {
        res.forEach(element => {
          tipEmpJson.push({
            nombre: element.tipEmp_nombre,
            cod: element.tipEmp_codigo
          })
        })
        this.filtros.tipoEmpresa = tipEmpJson
      })

      filtros.listarTipoEmpresaGrupo().then(res => {
      })

      filtros.listarRitmo().then(res => {
        res.forEach(element => {
          ritmoJson.push({
            nombre: element.ritmos_nombre,
            cod: element.ritmos_codigo
          })
        })
        this.filtros.ritmo = ritmoJson
      })

      filtros.listarEstilo().then(res => {
        res.forEach(element => {
          estiloJson.push({
            nombre: element.estilo_nombre,
            cod: element.estilo_codigo
          })
        })
        this.filtros.estiloEmpresa = estiloJson
      })
    },
    async getUserTiposEmpresa () {
      try {
        this.isLoadingUserConfig = true
        const tiposEmpresa = await clienteConfigService.getTiposEmpresaCliente()
        this.userTiposEmpresa = tiposEmpresa.map(te => te.tipEmp_codigo)
        console.log('✅ Tipos de empresa configurados para el usuario:', this.userTiposEmpresa)
      } catch (error) {
        console.error('Error al cargar tipos de empresa del usuario:', error)
        // Si hay error, permitir ver todas las radios
        this.userTiposEmpresa = []
      } finally {
        this.isLoadingUserConfig = false
      }
    },
    async isRadioAvailableForUser(radioId) {
      // If user has no business types configured, allow all radios
      if (!this.userTiposEmpresa || this.userTiposEmpresa.length === 0) {
        return true
      }

      try {
        // Get business types configured for this radio
        const radioTiposEmpresa = await RadioServices.getTiposEmpresaByRadio(radioId)

        // If radio has no business types configured, it's available for everyone
        if (!radioTiposEmpresa || radioTiposEmpresa.length === 0) {
          return true
        }

        // Check if any of the radio's business types match user's business types
        const hasMatch = radioTiposEmpresa.some(rte =>
          this.userTiposEmpresa.includes(rte.tipEmp_codigo)
        )

        return hasMatch
      } catch (error) {
        console.error(`Error checking availability for radio ${radioId}:`, error)
        // On error, allow the radio to be shown
        return true
      }
    },
    selectFiltro () {
      this.getPlaylists()
    },
    async getPlaylists () {
      const jsonRes = []
      this.isLoading = true

      try {
        const res = await generoMusicalServices.buscar(
          0,
          0,
          this.filtroSelected.ritmo,
          this.filtroSelected.tipoEmpresa,
          this.filtroSelected.estiloEmpresa
        )

        // Store all radios
        this.allRadios = res.filter(element => element.rad_codigo != 0)

        // Filter radios based on user's business types
        for (const element of this.allRadios) {
          const isAvailable = await this.isRadioAvailableForUser(element.rad_codigo)

          if (isAvailable) {
            jsonRes.push({
              data: '{"title": "' + element.rad_nombre + '"}',
              nombre: element.rad_nombre,
              title: element.rad_nombre,
              codRadio: element.rad_codigo,
              img: element.rad_imagen,
              genero: element.genmus_nombre,
              subGenero: element.gemusu_nombre,
              enlanceStream: element.rad_enlace
            })
          }
        }

        this.radios = jsonRes

        console.log(`📻 Radios disponibles: ${jsonRes.length} de ${this.allRadios.length} total`)

        if (jsonRes.length === 0 && this.allRadios.length > 0) {
          console.warn('⚠️ No hay radios disponibles para tu configuración de empresa')
          this.notifyVue('top', 'right', 'No hay radios disponibles según tu configuración de empresa')
        }
      } catch (error) {
        console.error('Error loading playlists:', error)
        this.notifyVue('top', 'right', 'Error al cargar las radios')
      } finally {
        this.isLoading = false
      }
    },
    getGenerosMusicales () {
      generoMusicalServices.getGeneros().then(res => {
        const resJson = []
        let cont = 0
        res.forEach(element => {
          resJson.push({
            genero: element.genmus_nombre,
            index: cont
          })
          cont = cont + 1
        })

        this.generosMusicales = resJson
      })
    },
    getSubGenerosMusicales () {
      const resJson = []
      generoMusicalSubServices.getSubGeneros().then(res => {
        res.forEach(element => {
          resJson.push({
            subGenero: element.gemusu_nombre,
            genero: element.genmus_nombre
          })
        })
        this.subGeneros = resJson
      })
    },
    getProgramaciones () {
      const programaciones = []
      this.isLoading = true
      cliproRadioServices.getProgramacionesByProg(this.codigoProgramacion).then(res => {
        res.forEach(element => {
          const horaInicio = element.clprra_horaDesde
          const horaFin = element.clprra_horaHasta
          const numeroDia = element.clprra_numeroDia

          programaciones.push({
            cod: element.clprra_codigo,
            radioNombre: element.rad_nombre,
            numeroDia: numeroDia,
            diaSemana: this.getDiaNombre(numeroDia),
            horaInicio: horaInicio,
            horaFin: horaFin,
            codRadio: element.rad_codigo,
            radImagen: element.rad_imagen
          })
        })

        this.programacionesData = programaciones
        this.isLoading = false
      })
    },
    getDiaNombre (numeroDia) {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      return dias[numeroDia] || 'Desconocido'
    },
    agregarProgramacion (radio) {
      // Open modal or form to add new programacion
      this.selectedRadio = radio
      this.showAddModal = true
    },
    editProgramacion (programacion) {
      this.selectedProgramacion = { ...programacion }
      this.showEditModal = true
    },
    confirmDeleteProgramacion (programacion) {
      this.selectedProgramacion = programacion
      this.showDeleteModal = true
    },
    deleteProgramacion () {
      if (this.selectedProgramacion) {
        clienteProgramacionRadioService.bajaProgramacionRadio(this.selectedProgramacion.cod).then(res => {
          this.getProgramaciones()
          this.showDeleteModal = false
          this.selectedProgramacion = null
        })
      }
    },
    confirmDelete () {
      if (this.eventToDelete) {
        clienteProgramacionRadioService.bajaProgramacionRadio(this.eventToDelete.extendedProps.cod).then(res => {
          this.getProgramaciones()
          this.showDeleteModal = false
          this.eventToDelete = null
        })
      }
    },
    editEvent () {
      // Implement edit functionality if needed
      this.showEventModal = false
    },
    handleError (err) {
      if (!err.response) {
        this.notificacion = 'No se ha recibido respuesta del servidor. Inténtelo nuevamente más tarde.'
      } else {
        if (err.response && err.response.data.hasOwnProperty('errorMessage')) {
          this.notificacion = err.response.data.errorMessage
        } else {
          switch (err.response.status) {
            case 502:
              this.notificacion = 'El servidor no se encuentra disponible.'
              break
            default:
              this.notificacion = 'Ocurrió un error al intentar guardar la programación. Intente nuevamente'
          }
        }
      }
    },
    notifyVue (verticalAlign, horizontalAlign, message) {
      this.$buefy.notification.open({
        message: message,
        type: 'is-danger',
        position: 'is-top-right',
        duration: 5000
      })
    },
    saveEditProgramacion () {
      // Implement save edit logic
      this.showEditModal = false
      this.getProgramaciones()
    }
  }
}
</script>

<style lang="scss">

</style>

