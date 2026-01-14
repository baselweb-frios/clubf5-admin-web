<template>
  <div id="TablaProgramaciones">
    <div class="row">
      <div class="col-12">
        <card :title="data.title">
          <div v-if="isLoading">
            <loading-spinner
:loading="true"
:color="'#1d8cf8'"
:height="'95px'"
/>
          </div>
          <div v-else>
            <div class="col-md-4">
              <base-button
v-show="data.rows.length==0"
type="success"
@click="redirect()"
>
{{ $t("modulo_spots.principal.btnAdd") }}
</base-button>
            </div>
            <div class="table-responsive">
              <data-table
:rows="data.rows"
:columns="data.columns"
:config="config"
>
                <template #empty-results>
                  No se encontraron registros
                </template>

                <template #actions="{ row, index }">
                  <button
                    type="button"
                    title="Editar programación"
                    class="btn el-tooltip btn-icon btn-fab btn-info btn-sm"
                    aria-describedby="el-tooltip-8889"
                    tabindex="0"
                    @click="btnEditar(row, $event.target)"
>
                    <span class="material-symbols-outlined">edit_square</span>
                  </button>

                  <button
                    type="button"
                    title="Eliminar programación"
                    class="btn el-tooltip btn-icon btn-fab btn-danger btn-sm"
                    aria-describedby="el-tooltip-8889"
                    tabindex="0"
                    @click="btnEliminar(row.clipro_codigo, $event.target)"
>
                    <span class="material-symbols-outlined">delete</span>
                  </button>

                  <button
                    type="button"
                    title="Programá tus spots"
                    class="btn el-tooltip btn-icon btn-fab btn-success btn-sm"
                    aria-describedby="el-tooltip-8889"
                    tabindex="0"
                    @click="calendarRedirect(row, $event.target)"
>
                    <span class="material-symbols-outlined">calendar_clock</span>
                  </button>
                </template>
              </data-table>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import SpotServices from '../../services/SpotServices'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

export default {
  components: {
    DataTable,
    LoadingSpinner
  },
  data () {
    const i18labels = this.$t('modulo_spots.principal')
    const colnames = i18labels.tabla_programaciones.columnas
    return {
      name: 'TablaProgramaciones',
      data: {
        title: i18labels.titulo,
        columns: [
          {
            label: colnames.clipro_nombre,
            name: 'clipro_nombre',
            sort: true
          },
          {
            label: colnames.actions,
            name: 'actions'
          }
        ],
        rows: []
      },
      ruta: 'Nueva programación de spot',
      config: {
        per_page: 5, // numero de filas a mostrar por cada página
        per_page_options: [],
        show_refresh_button: false,
        show_reset_button: false,
        global_search: {
          placeholder: 'Buscar'
        },
        highlight_row_hover: true,
        highlight_row_hover_color: '#003962',
        preservePageOnDataChange: true
      },
      isLoading: false
    }
  },
  mounted () {
    // llamar los metodos que necesito al cargar esta página
    this.getProgramacionesByCli()

    this.i18n = this.$i18n
  },
  methods: {
    getProgramacionesByCli () {
      this.isLoading = true
      SpotServices.getProgramacionesByCliente().then((res) => {
        // creo un vector para meter cada elemento como json
        this.data.rows = res
        this.isLoading = false
        if(res.length==1){
      this.calendarRedirect(res[0])
    }
      })
    },
    redirect () {
      this.$router.push({
        name: this.ruta,
        params:
                          {
                            codigoProgramacion: 0,
                            nombreProgramacion: ''
                          }
      })
    },
    btnEditar (item, button) {
      this.$router.push({
        name: this.ruta,
        params:
                          {
                            codigoProgramacion: item.clipro_codigo,
                            nombreProgramacion: item.clipro_nombre
                          }
      })
    },
    btnEliminar (item, button) {
      this.$confirm(
        {
          message: 'Confirmar para eliminar',
          button: {
            no: 'Cancelar',
            yes: 'Confirmar'
          },
          callback: confirm => {
            if (confirm) {
              SpotServices.bajaProgramacion(item).then(res => {
                this.getProgramacionesByCli()
              })
            }
          }
        }
      )
    },
    calendarRedirect (item, button) {
      this.$router.push({
        name: 'Programaciones de spot',
        params:
                          {
                            codigoProgramacion: item.clipro_codigo,
                            nombreProgramacion: item.clipro_nombre
                          }
      })
    }
  }// cierre methods
}
</script>
<style>
</style>
