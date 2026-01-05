<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Bienvenido{{ user?.cli_nombre ? `, ${user.cli_nombre}` : '' }}</h1>
      <p class="dashboard-subtitle">Accede rápidamente a las principales secciones</p>
    </div>
    <div class="dashboard-menu">
      <div class="menu-card" @click="irSucursales">
        <span class="menu-icon">🏢</span>
        <span>Sucursales</span>
      </div>
      <div class="menu-card" @click="irSpots">
        <span class="menu-icon">🎵</span>
        <span>Biblioteca de Spots</span>
      </div>
      <div class="menu-card" @click="irMiCuenta">
        <span class="menu-icon">👤</span>
        <span>Mi Negocio</span>
      </div>
      <div class="menu-card" @click="irNotifPago">
        <span class="menu-icon">💳</span>
        <span>Notificar Pago</span>
      </div>
    </div>
    <div class="dashboard-info">
      <div v-if="haySpotsVencidos" class="info-card warning">
        <strong>¡Atención!</strong> Tienes spots próximos a vencer.
      </div>
      <div v-if="ultimaFactura" class="info-card">
        <span>Última factura: <strong>{{ ultimaFactura.facli_periodoI }}</strong> - Monto: <strong>${{ ultimaFactura.facli_monto }}</strong></span>
      </div>
      <div v-if="paqueteContratado" class="info-card">
        <span>Paquete contratado: <strong>{{ paqueteContratado }}</strong> | Pedidos disponibles: <strong>{{ pedidosDisponibles }}</strong></span>
      </div>
    </div>
  </div>
</template>

<script>
import SucursalServices from '../../services/SucursalServices'
import UserServices from '../../services/UserServices'
import FacturaServices from '../../services/FacturaServices'
import clienteModoSpotService from '../../services/ClienteModoReproduccionSpot'
import SpotServices from '../../services/SpotServices'
import ClientePaqueteService from '../../services/ClientePaqueteServices'
import moment from 'moment'
import diaHabilService from '@/services/DiaHabilService'
import clienteHorarioService from '@/services/ClienteHorarioServices'

export default {
  data () {
    const i18labels1 = this.$t('modulo_spots.biblioteca_spots')
    const colnames1 = i18labels1.tabla_spots.columnas

    return {
      isLoading: false,
      modoRepSpot: '',
      sucursales: [],
      tablaSpotsVencimiento: {
        columns: [
          {
            label: colnames1.spo_nombre,
            name: 'spo_nombre'
          },
          {
            label: colnames1.fechaVenc,
            name: 'spo_fecfin'
          }
        ],
        rows: [],
        config: {
          show_refresh_button: false,
          show_reset_button: false,
          pagination: true,
          per_page: 3,
          pagination_info: false,
          global_search: {
            visibility: false
          },
          highlight_row_hover: true,
          preservePageOnDataChange: true,
          highlight_row_hover_color: '#003962'
        }
      },
      facturas: [],
      ultimaFactura: null,
      haySpotsVencidos: false,
      paqueteContratado: null,
      cantMaxPedidos: null,
      pedidosDisponibles: null,
      user: null
    }
  },
  methods: {
    irSucursales () { this.$router.push({ path: 'sucursales' }) },
    irMiCuenta () { this.$router.push({ path: 'miNegocio' }) },
    irSpots () { this.$router.push({ path: 'bibliotecaSpot' }) },
    irNotifPago () { this.$router.push({ path: 'notificarPago' }) },
    getCurrentUser () {
      const cli = JSON.parse(UserServices.current().Cliente)
      this.$store.state.cliente = cli
      this.user = cli
    },
    setDatosCliente () {
      diaHabilService.get().then(() => clienteHorarioService.get())
    },
    cliSucursalesGetByCli () {
      this.isLoading = true
      SucursalServices.getcliSucursalByCliente().then((res) => {
        this.sucursales = res

        const cantSucursales = this.sucursales.length

        this.chequearLimiteSucursales(cantSucursales)

        if (cantSucursales > 0) {
          this.inicializar()
        } else {
          this.crearSucursales = true
        }

        this.isLoading = false
      })
    },
    escuchar (url) {
      const audio = new Audio(url)
      audio.play()
    },
    cargarConenidoTabla () {
      const auxRes = []
      let progSpot
      // Armo un json auxiliar agregando, por cada sucursal traida, el estado

      this.sucursales.forEach(element => {
        SucursalServices.estadoSucursal(element.username).then(response => {
          SucursalServices.getprogSpotBySuc(element.clisuc_nombre).then(resp => {
            if (resp.length > 0) {
              progSpot = resp[0].clipro_nombre

              if (response.estado === 1) {
                this.cantSucursalesCon = this.cantSucursalesCon + 1
              }

              auxRes.push({
                adm_NroIntentos: element.adm_NroIntentos,
                adm_fechaDesde: element.adm_fechaDesde.substr(0, [10]),
                cli_codigo: element.cli_codigo,
                cli_usuari: element.cli_usuari,
                clipro_nombre: element.clipro_nombre,
                clisuc_codigo: element.clisuc_codigo,
                clisuc_nombre: element.clisuc_nombre,
                clisuc_numeroSucursal: element.clisuc_numeroSucursal,
                password: element.password,
                sucpgr_codigoSucursal: element.sucpgr_codigoSucursal,
                username: element.username,
                estado: response.estado,
                progSpot: progSpot,
                tiempoDesconectado: this.tiempoDesconectado(response.diferencia),
                audio: element.clisuc_idSucursal == null ? '' : `https://sonic.dattalive.com:${element.clisuc_idSucursal}/stream.aac`
              })
            }
          })
        })
      })
      this.tablaSucursales.rows = auxRes.sort((a, b) => a.estado - b.estado)
    },
    tiempoDesconectado (tiempoDesconectado) {
      let ultimaConexion
      // calculo los días desde la ultima conexión
      const dias = Math.trunc(((tiempoDesconectado) / 60) / 24)

      var date = moment()

      if (tiempoDesconectado === -1) {
        ultimaConexion = 'Nunca se inició sesión'
      } else {
        if (dias === 0) {
          ultimaConexion = 'Última conexión: hoy a las ' + (date.subtract(tiempoDesconectado, 'minutes').format('HH:mm'))
        } else if (dias === 1) {
          ultimaConexion = 'Última conexión: Ayer a las ' + (date.subtract(tiempoDesconectado, 'minutes').format('HH:mm'))
        } else if (dias > 1) {
          ultimaConexion = 'Última conexión: ' + (date.subtract(tiempoDesconectado, 'minutes').format('DD/MM/YYYY HH:mm'))
        }
      }

      return ultimaConexion
    },
    crearSucursal () {
      this.crearSucursales = false // pongo en false para poder navegar
      this.$router.push({
        name: 'Creá una nueva sucursal',
        params:
          {
            idSucursal: 0
          }
      })
    },

    getFacturasByCli () {
      const auxRes = []
      // this.isLoading = true
      FacturaServices.getFacturasByCliente().then(res => {
        res.forEach(element => {
          /* armo un json en base al response. haciendo un substr en los elementos de tipo fecha,
            * extrayendo con substr la parte que necesito mostrar
            */
          auxRes.push({
            facli_codigo: element.facli_codigo,
            facli_periodoI: element.facli_periodoI.substr(0, [7]),
            facli_periodoF: element.facli_periodoF,
            facli_monto: element.facli_monto,
            facli_fecalt: element.facli_fecalt,
            facli_estado: element.facli_estado,
            facli_usuario: element.facli_usuario,
            facli_archivo: element.facli_archivo,
            facli_fecven: element.facli_fecven.substr(0, [10])
          })
        })

        this.ultimaFactura = auxRes[0]
        // this.isLoading = false
      })
    },
    getModoRepSpot () {
      clienteModoSpotService.get().then(res => {
        this.modoRepSpot = res.climod_modo
      })
    },
    consultarPaquete () {
      let cantPedidos
      let cantRealizados
      let max
      ClientePaqueteService.GetByCli().then(res => {
        cantPedidos = res.paq_maxped
        cantRealizados = res.cant_pedidos
        max = cantPedidos - cantRealizados

        this.paqueteContratado = res.paq_descri
        this.cantMaxPedidos = cantPedidos
        this.pedidosDisponibles = max
      })
    },
    getSpotsByCli () {
      const list = []

      let fechaIni, vencimiento, diasParaVenc, estadoSpot
      const fechaHoy = moment()
      let aux
      const pos = 0
      // this.isLoading = true

      SpotServices.getSpots().then(res => {
        res.forEach(element => {
          fechaIni = moment(element.spo_fecini.substr(0, 10)).format('DD-MM-YYYY')
          vencimiento = moment(element.spo_fecfin.substr(0, [10]))

          if (element.spo_tipo === 'prom') {
            aux = moment(element.spo_fecfin.substr(0, [10])).format('D/M/yyyy')
            diasParaVenc = (vencimiento.diff(fechaHoy, 'hour'))

            // 168 horas = 1 semana
            if (diasParaVenc < 168) {
              list.push({
                spo_nombre: element.spo_nombre,
                spo_codigo: element.spo_codigo,
                spo_fecini: fechaIni,
                spo_fecfin: aux,
                spo_source: element.spo_source,
                spo_codcli: element.spo_codcli,
                spo_tipo: element.spo_tipo
              })
            }
          }
        })
        if (list.length > 0) {
          this.haySpotsVencidos = true
        }
        this.tablaSpotsVencimiento.rows = list
        this.isLoading = false
      })
    },
    chequearLimiteSucursales (cantSucursales) {
      // buscar con un service el limite de sucursales del cliente
      const limite = this.user.cli_cantEquipos // obtengo el numero de sucursales desde el store de vuex

      if (cantSucursales === limite) {
        this.$store.state.limiteSucursal = true
      } else {
        this.$store.state.limiteSucursal = false
      }
    },
    inicializar () {
      this.cargarConenidoTabla()
      this.getFacturasByCli()
      this.getModoRepSpot()
      this.consultarPaquete()
      this.getSpotsByCli()
    }
  },
  beforeRouteLeave (to, from, next) {
    // si no tiene ninguna sucursal creada, no va a dejar navegar hasta crear una
    if (this.crearSucursales) {
      return
    }
    next()
  },
  created () {
    this.getCurrentUser()
    // LocutorService.getAll().then(data=>localStorage.etiqueta=JSON.stringify(data))
    this.i18n = this.$i18n
  },
  mounted () {
    this.cliSucursalesGetByCli()
    this.actualizarEstadoSucursal && this.actualizarEstadoSucursal()
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Inter', Arial, sans-serif;
}
.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}
.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  color: #222;
}
.dashboard-subtitle {
  color: #666;
  font-size: 1.1rem;
}
.dashboard-menu {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.menu-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 2rem 1.5rem;
  min-width: 160px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.08rem;
  color: #003962;
  border: 1px solid #f2f2f2;
}
.menu-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.10);
  transform: translateY(-4px) scale(1.03);
  background: #f7fbfd;
}
.menu-icon {
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
}
.dashboard-info {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.info-card {
  background: #f8fafd;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  color: #003962;
  font-size: 1rem;
  border-left: 4px solid #003962;
}
.info-card.warning {
  background: #fff6f0;
  color: #c96a00;
  border-left: 4px solid #c96a00;
}
</style>
