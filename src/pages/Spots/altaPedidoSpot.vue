<template>
  <card :title="textos.title">
      <form  id="pedidoSpot" accept-charset="UTF-8" role="form" v-on:submit.prevent="enviarPedidoSpot" class="form-lock">

        <div class="row">
          <div class="col-md-8 pr-md-1">
            <base-input label="Mensaje del spot">
                <textarea rows="4" cols="80"
                class="form-control"
                placeholder="Mensaje del spot"
                v-model="MensajeSpot"
                required
                >
              </textarea>
            </base-input>
          </div>
        </div>

        <div class="row">
          <div class="col-md-5 pr-md-1">
          <base-input label="Tipo de spot">
            <select v-model="selected" class="form-select">
                <option v-for="tipo in tipoSpot" v-bind:value="tipo.value" :key="tipo.value">
                  {{ tipo.texto }}
                </option>
            </select>
          </base-input>
          </div>
        </div>

        <div v-if="selected == 'prom'">
          <div class="row">
            <div class="col-md-5 pr-md-1">
              <base-input
                label="Fecha de inicio"
                type="date"
                v-model="fechaInicio"
                
                >
              </base-input>
            </div>
          </div>

          <div class="row">
            <div class="col-md-5 pr-md-1">
              <base-input
                label="Fecha de finalización"
                type="date"
                v-model="fechaFin">
              </base-input>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 pr-md-1">
            <base-input>
              <base-checkbox
                class="mb-3"
                v-model="checked"
              >
                Cualquier locutor disponible (Desmarcar esta opción para ver los locures disponibles)
              </base-checkbox>
            </base-input>
          </div>
        </div>

        <div v-if="checked == false">
          <div class="tituloMedio">
            <h4 class="mb-4 title">{{data.title}}</h4>
          </div>
          <div class="row">

            <div class="col-lg-3">
              <base-input label="Voz">
                <select class="form-select" v-model="filtroSelected.voz" @change="selectFiltro">
                    <option v-for="filtro in filtros.voz" v-bind:value="filtro.value" :key="filtro.value">
                      {{filtro.texto}}
                    </option>
                </select>
              </base-input>
            </div>

            <div class="col-lg-3">
              <base-input label="Edad">
                <select class="form-select" v-model="filtroSelected.edad"  @change="selectFiltro" :disabled="filtroSelected.tipoEmpresa === 0">
                    <option v-for="filtro in filtros.edad" v-bind:value="filtro.value" :key="filtro.value">
                      {{filtro.texto}}
                    </option>
                </select>
              </base-input>
            </div>

            <div class="col-lg-3">
              <base-input label="Tono">
                <select class="form-select" v-model="filtroSelected.tono"  @change="selectFiltro">
                    <option v-for="filtro in filtros.tono" v-bind:value="filtro.value" :key="filtro.value">
                      {{filtro.texto}}
                    </option>
                </select>
              </base-input>
            </div>

            <div class="col-lg-3">
              <base-input label="Tipo">
                <select class="form-select" v-model="filtroSelected.tipo"  @change="selectFiltro">
                    <option v-for="filtro in filtros.tipo" v-bind:value="filtro.value" :key="filtro.value">
                      {{filtro.texto}}
                    </option>
                </select>
              </base-input>
            </div>

          </div>

          <div id="tabala-pedidoSpot" class="table-responsive">
            <data-table :rows="data.rows" :columns="data.columns" :config="config">
              <template #escuchar="{ row, index }">
                <audio  :src="row.escuchar" controls></audio>
              </template>

              <template #actions="{ row, index }">
                <button
                  type="button"
                  title="Elegir este locutor"
                  class="btn el-tooltip btn-icon btn-fab btn-success btn-sm"
                  aria-describedby="el-tooltip-8889"
                  tabindex="0"
                  @click="seleccionarLocutor(row, $event.target)"
                  >
                  <i class="fas fa-check-circle"></i>
                </button>
              </template>
            </data-table>
          </div>
          <div class="row">
            <div class="col-md-12 mb-5">
              <span>
                <label class="">Locutor seleccionado:</label>
              </span>
              <b-badge class="locutor-badge" variant="info">{{locutorSeleccionadoNombre}}</b-badge>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-5 pr-md-1">
            <input class="btn btn-md btn-success"
                      type="submit"
                      value="Guardar"
                    >
          </div>
        </div>
      </form>
      <loading-overlay :show="isLoading" opacity="0.4" color="#1d8cf8" height="95px" text="Procesando..." />
  </card>
</template>

<script>
import moment from 'moment'
import PedidoSpotService from '../../services/PedidoSpotServices'
import LocutorService from '../../services/LocutorServices'
import ClientePaqueteService from '../../services/ClientePaqueteServices'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import api from '../../services/api'

export default {
  layout: 'default',
  components: {
    DataTable,
    LoadingSpinner
  },

  data () {
    const i18labels = this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido')
    const colnames = i18labels.tabla_locutores.columnas
    return {
      isLoading: false,
      modoReproduccion: {
        selected: null,
        options: [
          { modo: 'Neuro', value: 'neuro' }, { modo: 'Radio', value: 'radio' }
        ]
      },
      textos: {
        title: i18labels.titulo,
        alertOk: i18labels.alertas.mensajeAlertaOk
      },
      notifIconExc: 'tim-icons icon-alert-circle-exc',
      notifIconOk: 'tim-icons icon-check-2',
      name: 'pedidoSpot',
      MensajeSpot: '',
      selected: 'prom',
      checked: true,
      tipoSpot: [
        { texto: i18labels.tipoSpotSelect.prom, value: 'prom' },
        { texto: i18labels.tipoSpotSelect.inst, value: 'inst' }
      ],
      fechaInicio: '',
      fechaFin: '',
      filtros: {
        voz: [{ texto: 'Todas', value: '' }, { texto: 'Femenina', value: 'Femenina' }, { texto: 'Masculina', value: 'Masculina' }],
        edad: [{ texto: 'Todas', value: '' }, { texto: 'Adulta', value: 'Adulta' }, { texto: 'Joven', value: 'Joven' }],
        tono: [{ texto: 'Todos', value: '' }, { texto: 'Aguda', value: 'Aguda' }, { texto: 'Grave', value: 'Grave' }],
        tipo: [{ texto: 'Todos', value: '' }, { texto: 'Promocional', value: 'Promocional' }, { texto: 'Institucional', value: 'Institucional' }, { texto: 'Ductil', value: 'Ductil' }]
      },
      filtroSelected: {
        voz: '',
        edad: '',
        tono: '',
        tipo: ''
      },
      locutorSeleccionado: -1, // por defecto -1, si no se selecciona ningun locutor, se envía -1
      locutorSeleccionadoNombre: '',
      locutorDemoFilesPath: '/demo/',
      locutorDemoPathFull: null,
      data: {
        title: i18labels.tabla_locutores.titulo,
        columns: [

        ],
        classes: {
          table: {
            'vbt-row-selected': true
          }
        },
        rows: []
      },
      notifications: {
        topCenter: false
      },
      notificacion: { mensaje: '', tipo: 'error' },
      type: ['', 'danger', 'success'],
      config: {
        per_page: 10, // numero de filas a mostrar por cada página
        per_page_options: [],
        show_refresh_button: false,
        show_reset_button: false,
        highlight_row_hover: true,
        preservePageOnDataChange: true,
        highlight_row_hover_color: '#003962',
        checkbox_rows: false,
        rows_selectable: false,
        global_search: {
          placeholder: 'Buscar'
        }
      },
      tipoPaquete: null
    }
  },
  methods: {
    armarRutaDemo () {
      this.locutorDemoPathFull = api.url() + this.locutorDemoFilesPath
    },
    onSelectRow (selected) {
      selected.selected_items = selected.selected_item
      console.log(selected)
    },
    consultarPaquete () {
      this.isLoading = true

      ClientePaqueteService.GetByCli().then(res => {
        this.tipoPaquete = res.paq_descri
      })
    },
    inicializar () {
      if (this.tipoPaquete != 'Standard') {
        this.obtenerLocutores()
      } else {
        this.$router.push({
          path: 'pedidoSpot'
        })
      }
    },
    enviarPedidoSpot () {
      let fechaDesde
      let fechaHasta
      const fechaAlta = moment().format('YYYY-MM-DD')
      let locutor
      if (this.checked === false) {
        locutor = this.locutorSeleccionado
      } else {
        locutor = -1 // si no selecciono ningun locutor, se enviará -1
      }
      if (this.selected === 'inst') {
        fechaDesde = moment().format('YYYY-MM-DD')
        fechaHasta = moment('9999-01-01').format('YYYY-MM-DD')
      } else {
        fechaDesde = this.fechaInicio,
        fechaHasta = this.fechaFin
      }

      PedidoSpotService.nuevoPedido(fechaAlta, this.MensajeSpot, fechaDesde, fechaHasta, locutor, this.selected).then(res => {
        this.notificacion.mensaje = this.textos.alertOk + res.ps0_codigo
        this.notifyVue('top', 'center', this.notificacion.mensaje, this.notifIconOk, 2)
        this.redirectTo('pedidoSpot')
      })
    },
    armarColumnas () {
      const col = [
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.locutor'),
          name: 'locutor'
        },
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.demo'),
          name: 'escuchar'
        },
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.voz'),
          name: 'voz',
          filter:
                    {
                      type: 'simple',
                      init: {
                        value: this.filtroSelected.voz
                      }
                    }
        },
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.edad'),
          name: 'edad',
          filter:
                    {
                      type: 'simple',
                      init: {
                        value: this.filtroSelected.edad
                      }
                    }
        },
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.tono'),
          name: 'tono',
          filter:
                    {
                      type: 'simple',
                      init: {
                        value: this.filtroSelected.tono
                      }
                    }
        },
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.tipo'),
          name: 'tipo',
          filter:
                    {
                      type: 'simple',
                      init: {
                        value: this.filtroSelected.tipo
                      }
                    }
        },
        {
          label: this.$t('modulo_spots.biblioteca_spots.pedido_spot.nuevoPedido.tabla_locutores.columnas.actions'),
          name: 'actions'
        }
      ]

      this.data.columns = col
    },
    obtenerLocutores () {
      const aux = []
      let i
      let act
      const res = [
    {
        "lo0_codigo": 1,
        "lo0_apenom": "Federico",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/z1mk8d5nlugfqqf/demo_1.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 1,
        "lo0_apenom": "Federico",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/z1mk8d5nlugfqqf/demo_1.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 1,
        "lo0_apenom": "Federico",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/z1mk8d5nlugfqqf/demo_1.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 1,
        "lo0_apenom": "Federico",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/z1mk8d5nlugfqqf/demo_1.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 9,
        "loetva_nombre": "Ductil",
        "loetva_orden": 900
    },
    {
        "lo0_codigo": 2,
        "lo0_apenom": "Fernanda",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/n3bhvddna3n8x2r/demo_2.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 1,
        "loetva_nombre": "Femenina",
        "loetva_orden": 100
    },
    {
        "lo0_codigo": 2,
        "lo0_apenom": "Fernanda",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/n3bhvddna3n8x2r/demo_2.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 2,
        "lo0_apenom": "Fernanda",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/n3bhvddna3n8x2r/demo_2.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 2,
        "lo0_apenom": "Fernanda",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/n3bhvddna3n8x2r/demo_2.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 9,
        "loetva_nombre": "Ductil",
        "loetva_orden": 900
    },
    {
        "lo0_codigo": 3,
        "lo0_apenom": "Gabriel",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/581txaw7lzlh4v3/demo_3.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 3,
        "lo0_apenom": "Gabriel",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/581txaw7lzlh4v3/demo_3.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 3,
        "lo0_apenom": "Gabriel",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/581txaw7lzlh4v3/demo_3.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 3,
        "lo0_apenom": "Gabriel",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/581txaw7lzlh4v3/demo_3.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 7,
        "loetva_nombre": "Promocional",
        "loetva_orden": 700
    },
    {
        "lo0_codigo": 4,
        "lo0_apenom": "Hernán",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/ktxvgovrfm346oo/demo_4.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 4,
        "lo0_apenom": "Hernán",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/ktxvgovrfm346oo/demo_4.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 4,
        "lo0_apenom": "Hernán",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/ktxvgovrfm346oo/demo_4.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 4,
        "lo0_apenom": "Hernán",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/ktxvgovrfm346oo/demo_4.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 8,
        "loetva_nombre": "Institucional",
        "loetva_orden": 800
    },
    {
        "lo0_codigo": 5,
        "lo0_apenom": "Marcos",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/67cf3f5rt3aiste/demo_5.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 5,
        "lo0_apenom": "Marcos",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/67cf3f5rt3aiste/demo_5.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 3,
        "loetva_nombre": "Adulta",
        "loetva_orden": 300
    },
    {
        "lo0_codigo": 5,
        "lo0_apenom": "Marcos",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/67cf3f5rt3aiste/demo_5.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 5,
        "lo0_apenom": "Marcos",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/67cf3f5rt3aiste/demo_5.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 9,
        "loetva_nombre": "Ductil",
        "loetva_orden": 900
    },
    {
        "lo0_codigo": 7,
        "lo0_apenom": "Mauro",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/rgkfvxdnl78uzow/demo_7.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 7,
        "lo0_apenom": "Mauro",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/rgkfvxdnl78uzow/demo_7.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 3,
        "loetva_nombre": "Adulta",
        "loetva_orden": 300
    },
    {
        "lo0_codigo": 7,
        "lo0_apenom": "Mauro",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/rgkfvxdnl78uzow/demo_7.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 7,
        "lo0_apenom": "Mauro",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/rgkfvxdnl78uzow/demo_7.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 9,
        "loetva_nombre": "Ductil",
        "loetva_orden": 900
    },
    {
        "lo0_codigo": 8,
        "lo0_apenom": "Mery",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/mnf895okul4zr8h/demo_8.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 1,
        "loetva_nombre": "Femenina",
        "loetva_orden": 100
    },
    {
        "lo0_codigo": 8,
        "lo0_apenom": "Mery",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/mnf895okul4zr8h/demo_8.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 8,
        "lo0_apenom": "Mery",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/mnf895okul4zr8h/demo_8.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 8,
        "lo0_apenom": "Mery",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/mnf895okul4zr8h/demo_8.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 7,
        "loetva_nombre": "Promocional",
        "loetva_orden": 700
    },
    {
        "lo0_codigo": 9,
        "lo0_apenom": "Nelson",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/s5pkbjzcmvm2h6a/demo_9.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 9,
        "lo0_apenom": "Nelson",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/s5pkbjzcmvm2h6a/demo_9.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 3,
        "loetva_nombre": "Adulta",
        "loetva_orden": 300
    },
    {
        "lo0_codigo": 9,
        "lo0_apenom": "Nelson",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/s5pkbjzcmvm2h6a/demo_9.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 9,
        "lo0_apenom": "Nelson",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/s5pkbjzcmvm2h6a/demo_9.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 8,
        "loetva_nombre": "Institucional",
        "loetva_orden": 800
    },
    {
        "lo0_codigo": 10,
        "lo0_apenom": "Nestor",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/7npzn115h14nkz4/demo_10.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 10,
        "lo0_apenom": "Nestor",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/7npzn115h14nkz4/demo_10.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 3,
        "loetva_nombre": "Adulta",
        "loetva_orden": 300
    },
    {
        "lo0_codigo": 10,
        "lo0_apenom": "Nestor",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/7npzn115h14nkz4/demo_10.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 10,
        "lo0_apenom": "Nestor",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/7npzn115h14nkz4/demo_10.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 9,
        "loetva_nombre": "Ductil",
        "loetva_orden": 900
    },
    {
        "lo0_codigo": 11,
        "lo0_apenom": "Nicolás",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/6ctamvxid0xxwiv/demo_11.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 11,
        "lo0_apenom": "Nicolás",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/6ctamvxid0xxwiv/demo_11.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 11,
        "lo0_apenom": "Nicolás",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/6ctamvxid0xxwiv/demo_11.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 11,
        "lo0_apenom": "Nicolás",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/6ctamvxid0xxwiv/demo_11.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 8,
        "loetva_nombre": "Institucional",
        "loetva_orden": 800
    },
    {
        "lo0_codigo": 12,
        "lo0_apenom": "Paola",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3alo3qks5l6ts7y/demo_12.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 1,
        "loetva_nombre": "Femenina",
        "loetva_orden": 100
    },
    {
        "lo0_codigo": 12,
        "lo0_apenom": "Paola",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3alo3qks5l6ts7y/demo_12.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 3,
        "loetva_nombre": "Adulta",
        "loetva_orden": 300
    },
    {
        "lo0_codigo": 12,
        "lo0_apenom": "Paola",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3alo3qks5l6ts7y/demo_12.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 12,
        "lo0_apenom": "Paola",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3alo3qks5l6ts7y/demo_12.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 7,
        "loetva_nombre": "Promocional",
        "loetva_orden": 700
    },
    {
        "lo0_codigo": 13,
        "lo0_apenom": "Maru",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3xpwjqkqojeo7ww/demo_13.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 1,
        "loetva_nombre": "Femenina",
        "loetva_orden": 100
    },
    {
        "lo0_codigo": 13,
        "lo0_apenom": "Maru",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3xpwjqkqojeo7ww/demo_13.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 13,
        "lo0_apenom": "Maru",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3xpwjqkqojeo7ww/demo_13.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 13,
        "lo0_apenom": "Maru",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/3xpwjqkqojeo7ww/demo_13.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 9,
        "loetva_nombre": "Ductil",
        "loetva_orden": 900
    },
    {
        "lo0_codigo": 14,
        "lo0_apenom": "Sivina",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/uxseq9udj97eg53/demo_14.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 1,
        "loetva_nombre": "Femenina",
        "loetva_orden": 100
    },
    {
        "lo0_codigo": 14,
        "lo0_apenom": "Sivina",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/uxseq9udj97eg53/demo_14.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 3,
        "loetva_nombre": "Adulta",
        "loetva_orden": 300
    },
    {
        "lo0_codigo": 14,
        "lo0_apenom": "Sivina",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/uxseq9udj97eg53/demo_14.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 6,
        "loetva_nombre": "Grave",
        "loetva_orden": 600
    },
    {
        "lo0_codigo": 14,
        "lo0_apenom": "Sivina",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/uxseq9udj97eg53/demo_14.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 8,
        "loetva_nombre": "Institucional",
        "loetva_orden": 800
    },
    {
        "lo0_codigo": 15,
        "lo0_apenom": "Facundo",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/fqo1g1lsn2apc1t/demo_15.mp3?raw=1",
        "loetgr_codigo": 1,
        "loetgr_nombre": "Voz",
        "loetgr_orden": 100,
        "loetva_codigo": 2,
        "loetva_nombre": "Masculina",
        "loetva_orden": 200
    },
    {
        "lo0_codigo": 15,
        "lo0_apenom": "Facundo",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/fqo1g1lsn2apc1t/demo_15.mp3?raw=1",
        "loetgr_codigo": 2,
        "loetgr_nombre": "Edad",
        "loetgr_orden": 200,
        "loetva_codigo": 4,
        "loetva_nombre": "Joven",
        "loetva_orden": 400
    },
    {
        "lo0_codigo": 15,
        "lo0_apenom": "Facundo",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/fqo1g1lsn2apc1t/demo_15.mp3?raw=1",
        "loetgr_codigo": 3,
        "loetgr_nombre": "Tono",
        "loetgr_orden": 300,
        "loetva_codigo": 5,
        "loetva_nombre": "Aguda",
        "loetva_orden": 500
    },
    {
        "lo0_codigo": 15,
        "lo0_apenom": "Facundo",
        "lo0_estado": "A",
        "lo0_demo": "https://www.dropbox.com/s/fqo1g1lsn2apc1t/demo_15.mp3?raw=1",
        "loetgr_codigo": 4,
        "loetgr_nombre": "Tipo",
        "loetgr_orden": 400,
        "loetva_codigo": 7,
        "loetva_nombre": "Promocional",
        "loetva_orden": 700
    }
]
     // LocutorService.getAll().then(res => {
        aux.push({
          codigoLocutor: res[0].lo0_codigo,
          locutor: res[0].lo0_apenom,
          escuchar: res[0].lo0_demo,
          voz: res[0].loetva_nombre,
          edad: res[1].loetva_nombre,
          tono: res[2].loetva_nombre,
          tipo: res[3].loetva_nombre
        })

        for (i = 0; i < res.length-1; i++) {
          act = res[i + 1].lo0_apenom
          if (res[i].lo0_apenom != act) {
            aux.push({
              codigoLocutor: res[i + 1].lo0_codigo,
              locutor: res[i + 1].lo0_apenom,
              escuchar: res[i + 1].lo0_demo,
              voz: res[i + 1].loetva_nombre,
              edad: res[i + 2].loetva_nombre,
              tono: res[i + 3].loetva_nombre,
              tipo: res[i + 4].loetva_nombre
            })
          }
        }
     // })
      this.data.rows = aux
      this.isLoading = false
    },
    seleccionarLocutor (item) {
      if (this.locutorSeleccionado != null) {
        this.locutorSeleccionado = null
      }
      this.locutorSeleccionado = item.codigoLocutor
      this.locutorSeleccionadoNombre = item.locutor
    },
    selectFiltro () {
      this.armarColumnas()
    },
    redirectTo (ruta) {
      this.$router.push({
        path: ruta
      })
    },
    notifyVue (verticalAlign, horizontalAlign, message, icono, tipo) {
      const color = tipo
      this.$notify({
        message: message,
        component: NotificationTemplate,
        icon: icono,
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color],
        timeout: 20000
      })
    }
  },
  created () {
    this.i18n = this.$i18n
    this.armarColumnas()
    this.consultarPaquete()
  },
  mounted () {
    this.armarRutaDemo()
    this.inicializar()
  },
  computed: {

  }
}

</script>
<style>
</style>
