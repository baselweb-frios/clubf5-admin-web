<template>
  <div id="TablaResumen">
    <div class="row">
      <b-card-group deck :title="``">
        <b-card>
          <b-card-body>
            <b-card-header>
              <b-button
                type="button"
                :title="'Borrar pautados'"
                class="float-right"
                :class="'btn btn-icon btn-link  btn-danger'"
                aria-describedby="el-tooltip-8889"
                tabindex="0"
                @click="BorrarPautados()"
              >
                <i class="tim-icons icon-button-power"></i>
              </b-button>
              <b-card-title>{{ "Spot: " + paramNombreSpot }}</b-card-title>
              <base-input :label="'Reemplazar spot actual:'">
                <b-form-select
                  v-model="spot"
                  @change="ReemplazarPautados(prog)"
                >
                  <option
                    v-for="spot in spots"
                    v-show="spot.spo_codigo != paramCodSpot"
                    :key="spot.spo_codigo"
                    v-bind:value="spot"
                  >
                    {{ spot.spo_nombre }}
                  </option>
                </b-form-select>
              </base-input>
            </b-card-header>
            <data-table
              :rows="programacion"
              :columns="columns"
              :config="config"
            >
              <template #actions="{ row, index }">
                <button
                  type="button"
                  title="Ir a la programación"
                  class="btn el-tooltip btn-icon btn-fab btn-success btn-sm"
                  aria-describedby="el-tooltip-8889"
                  tabindex="0"
                  @click="calendarRedirect(row, $event.target)"
                >
                  <i class="tim-icons icon-double-right"></i>
                </button>
              </template>
            </data-table>
          </b-card-body>

          <b-card-footer> </b-card-footer>
        </b-card>
      </b-card-group>
    </div>
  </div>
</template>
<script>
import ResumenSpotServices from '../../services/ResumenSpotServices'
import SpotServices from '../../services/SpotServices'
import DataTable from '@/components/ui/DataTable.vue'

export default {
  components: {
    DataTable
  },
  data () {
    const i18labels = this.$t('modulo_spots.biblioteca_spots')
    const colnames = i18labels.resumen_spot.tablaResumen.columnas
    return {
      name: 'TablaResumen',

      textos: {
        title: i18labels.resumen_spot.tablaResumen.titulo
      },

      paramCodSpot: null,
      paramNombreSpot: null,

      columns: [
        {
          label: colnames.dia,
          name: 'dia',
          filter: {
            type: 'simple'
          }
        },
        {
          label: colnames.horaDesde,
          name: 'horaDesde',
          filter: {
            type: 'simple'
          }
        },

        {
          label: colnames.actions,
          name: 'actions'
        }
      ],
      spots: [],
      spot: {},
      programacion: [],
      codProg: null,
      config: {
        per_page: 5, // numero de filas a mostrar por cada página
        per_page_options: [],
        show_refresh_button: false,
        show_reset_button: false,
        global_search: {
          visibility: 'true'
        },
        highlight_row_hover_color: '#003962'
      },
      isLoading: false
    }
  },
  created () {
    this.inicializar()
  },
  mounted () {
    // llamar los metodos que necesito al cargar esta página
    this.i18n = this.$i18n
    this.getResumen()
  },
  methods: {
    inicializar () {
      this.paramCodSpot = this.$route.params.codigoSpot
      this.paramNombreSpot = this.$route.params.nombreSpot
    },
    getResumen () {
      this.isLoading = true
      const list = []
      ResumenSpotServices.get(this.paramCodSpot)
        .then((res) => {
          this.codProg = res[0].clipro_codigo
          res.forEach((element) => {
            this.programacion.push({
              horaDesde: element.clprsp_horaDesde,
              dia: this.obtenerDia(element.clprsp_numeroDia),
              prog: element.clipro_codigo
            })
          })
        })
        .then(() => {
          SpotServices.getSpots().then((res) => {
            const result = res.filter(
              // eslint-disable-next-line eqeqeq
              (e) => e.spo_usuario == JSON.parse(localStorage.user).unique_name
            )
            result.forEach((element) => {
              list.push({
                spo_nombre: element.spo_nombre,
                spo_codigo: element.spo_codigo
              })
              this.spots = list
              this.isLoading = false
            })
          })
        })
    },
    ReemplazarPautados (prog) {
      this.$confirm({
        message: `Se cambiara el spot ${this.paramNombreSpot} por ${this.spot.spo_nombre}`,
        button: {
          no: 'Cancelar',
          yes: 'Confirmar'
        },
        callback: (confirm) => {
          if (confirm) {
            this.isLoading = true
            // eslint-disable-next-line no-undef
            spotService
              .ReemplazarPautados(
                this.spot.spo_codigo,
                this.$route.params.codigoSpot,
                prog.clipro_codigo
              )
              .then((res) => {
                this.paramCodSpot = res
                this.paramNombreSpot = this.spot.spo_nombre
              })
              .then(() => {
                this.getResumen()
              })
          } else {
            this.spot = {}
          }
        }
      })
    },
    BorrarPautados () {
      this.$confirm({
        message: `Confirmar para borrar todas las pautas para este spot ${this.paramNombreSpot}`,
        button: {
          no: 'Cancelar',
          yes: 'Confirmar'
        },
        callback: (confirm) => {
          if (confirm) {
            this.isLoading = true
            SpotServices.BorrarPautados(this.paramCodSpot, this.codProg).then(
              (res) => {
                this.$router.push('/bibliotecaSpot')
              }
            )
          }
        }
      })
    },
    armarFecha (hora, minutos) {
      let min = ''
      let hs = ''
      let fechaReturn = ''

      // Hago esto porque el timeSpan pone solo una cifra en hora o minutos si es menor a 10
      if (hora < 10) {
        hs = '0' + hora
      } else {
        hs = hora
      }

      if (minutos < 10) {
        min = '0' + minutos
      } else {
        min = minutos
      }

      fechaReturn = hs + ':' + min + ':' + '00'
      return fechaReturn
    },
    obtenerDia (day) {
      let aux
      switch (day) {
        case 0:
          aux = 'Domingo'
          break
        case 1:
          aux = 'Lunes'
          break
        case 2:
          aux = 'Martes'
          break
        case 3:
          aux = 'Miércoles'
          break
        case 4:
          aux = 'Jueves'
          break
        case 5:
          aux = 'Viernes'
          break
        case 6:
          aux = 'Sábado'
      }
      return aux
    },
    calendarRedirect (item, button) {
      this.$router.push({
        name: 'Programaciones de spot',
        params: {
          codigoProgramacion: item.clipro_codigo,
          nombreProgramacion: item.clipro_nombre,
          horaInicio: item.clprsp_horaDesde,
          dia: item.numeroDiaParam
        }
      })
    }
  } // cierre methods
}
</script>
<style>
</style>
