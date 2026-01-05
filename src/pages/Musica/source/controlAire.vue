<template>
  <div id="TablaControlAire">
    <div class="row">
      <div class="col-12">
        <card :title="data.title">
          <div v-if="isLoading">
            <scale-loader :loading="true" :color="'#1d8cf8'" :height="'95px'"></scale-loader>
          </div>
          <div v-else>

            <div class="table-responsive">
              <vue-bootstrap4-table sticky-header :rows="data.rows" :columns="data.columns" :config="config">
                <template slot="empty-results">
                  No se encontraron registros
                </template>

              </vue-bootstrap4-table>
            </div>
          </div>
        </card>
        <div>
          <!--Confirm dialog-->
          <template>
            <vue-confirm-dialog></vue-confirm-dialog>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { BaseTable } from '@/components'
import ControlAire from '../../services/ControlAireServices'
import VueBootstrap4Table from 'vue-bootstrap4-table'
import Vue from 'vue'
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'
import moment from 'moment'

export default {
  components: {
    BaseTable,
    VueBootstrap4Table,
    ScaleLoader
  },
  data () {
    const i18labels = this.$t('modulo_control_aire.principal')
    const colnames = i18labels.tabla_control_aire.columnas

    return {
      name: 'TablaControlAire',
      data: {
        title: i18labels.titulo,
        columns: [
          {
            label: colnames.Reproducido,
            name: 'reprod',
            sort: true,
            filter: {
              type: 'simple',
              placeholder: 'Ingrese una fecha'
            }
          },
          {
            label: colnames.ReprodIni,
            name: 'inicio',
            sort: false
          },
          {
            label: colnames.ReprodFin,
            name: 'fin',
            sort: false
          },
          {
            label: colnames.Usuario,
            name: 'usuario',
            filter: {
              type: 'simple',
              placeholder: 'Ingrese la sucursal'
            },
            sort: true
          },
          {
            label: colnames.FileName,
            name: 'fileName',
            sort: false
          }
        ],
        actions: [],
        rows: []
      },
      ruta: 'Control de aire',
      config:
      {
        card_mode: true,
        per_page: 50, // numero de filas a mostrar por cada página
        per_page_options: [],
        show_refresh_button: false,
        show_reset_button: false,
       
        global_search: {
          placeholder: 'Buscar'
        },
        highlight_row_hover: true,
        preservePageOnDataChange: true,
        highlight_row_hover_color: '#003962'
      },

      isLoading: false
    }
  },
  created () {
    this.isLoading = true
    // llamar los metodos que necesito al cargar esta página
    this.getControlAire()
    
  },
  methods: {
    onRefreshData() {
                this.rows=[]
            },
    getControlAire () {
      this.isLoading = true
      this.data.title = (this.$route.params.tipo==1)?'Musica':'Spots'
        ControlAire.getControlAire().then((res) => {
          for(const i in res){
                let reproducido = moment(res[i].reprod).format('DD-MM-YYYY')
                res[i].reprod=reproducido
          }
            let datos = res.filter(r=>r.tipo==this.$route.params.tipo)
            this.data.rows = datos
            this.isLoading = false
        })
      
    }
  }// cierre methods
}
</script>
<style>
</style>
