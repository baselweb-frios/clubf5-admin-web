<template>
  <card :title="textos.title" id="certificado">
    <b-overlay :show="isLoading" opacity="0.25" no-wrap>
      <template #overlay>
        <div class="text-center">
          <scale-loader :loading="true" :color="'#1d8cf8'" :height="'95px'" :mensaje="textoLoader"></scale-loader>
        </div>
      </template>
    </b-overlay>
    <div class="d-flex">
      <div class="mr-2 flex-fill">
        <form id="frmCertif" accept-charset="UTF-8" role="form" v-on:submit.prevent="imprimir" class="form-lock">
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Mes de certificacion">
                <b-form-select v-model="dataCert.mes" @change="setSpotDisponibles" required>
                  <option v-for="m in meses" :key="m.value" v-bind:value="m.value">
                    {{ m.mes }}
                  </option>
                </b-form-select>
              </base-input>
              <base-input label="Desde" @input="setLabelMes" placeholder="" v-model="fechaIni" required>
              </base-input>
              <base-input label="Hasta" @input="setLabelMes" placeholder="" v-model="fechaFin" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input :label="textos.filtros.selSpots">
                <b-form-select v-model="spotSel" @change="genTable" multiple required>
                  <option v-for="spot in spotsDisponibles" :key="spot.spo_codigo" v-bind:value="spot">
                    {{ spot.spo_nombre }}
                  </option>
                </b-form-select>
              </base-input>
            </div>
          </div>

          <!-- <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Programa" placeholder="" v-model="prog" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Tema" placeholder="" v-model="tema" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Agencia" placeholder="" v-model="agencia" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Anunciante" placeholder="" v-model="anunciante" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Nº de OP" placeholder="" v-model="nroOP" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Producto" placeholder="" v-model="prod" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Medio" placeholder="" v-model="radio" required>
              </base-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <base-input label="Nombre responsable" placeholder="" v-model="responsable" required>
              </base-input>
            </div>
          </div> -->
          <div class="row"  >
        <div class="col-md-12 p-2">
          <b-form-file
            ref="images"
            @change="loadImage"
            placeholder="Elija otro logo"
            >
          </b-form-file>
        </div>
      </div>
          <div class="row">
            <div class="col-md-12 p-2">
              <button class="btn btn-info">Imprimir</button>
            </div>
          </div>

        </form>
      </div>
      <div class="flex-fill" style="background-color: white; color:black">
        <div class="container"  style="width: 605pt; display: block;" id="reporte" contenteditable="true">

          <img src="/imgs/logos/logoheader.png" alt="" class="float-left" id="logorep" width="90px"><br>
          <div class="text-center">
            <h4 class="align-bottom text-dark font-weight-bold"><u>CERTIFICACI&Oacute;N DE AIRE RADIAL</u></h4><br>
          </div>

          <p class="text-break p-2 text-dark" style="font-size: 12px;"  >
            Certifico la Difusión Institucional de Spots del Producto {{ prod }}, [Tema: {{ tema }}] del
            Anunciante {{ anunciante }}, de la Agencia {{ agencia }}, del de {{ lbMes.toLowerCase() }} de {{ dataCert.anio }}, en {{ radio }}, de la
            provincia de Entre Ríos, en los días y en la cantidad de menciones solicitadas según la Orden de Publicidad
            N° {{ nroOP }} que se detalla a continuación:
          </p>
          <table style="border: 1px solid black; width: 100%; font-size: 12px;" class="text-center">
            <thead >
              <tr style="border-bottom: 1px solid black;">
                <th class="pb-1 pl-1 pr-1 pt-1 text-center" style="font-size: 10px; color:black;">Programa</th>
                <th class="pb-1 pl-1 pr-1 pt-1 text-center" style="font-size: 10px; color:black; border-left: 1px solid black;">Tema</th>
                <th class="pb-1 pl-1 pr-1 pt-1 text-center" v-for="(s,index) in headSemana" :key="index" style="font-size: 10px; color:black; border-left: 1px solid black; width: 5px;">{{ s }}</th>
                <th class="pb-1 pl-1 pr-1 pt-1 text-center" style="font-size: 10px; color:black; border-left: 1px solid black; width: 8px;">Tam.<br>Dur.</th>
                <th class="pb-1 pl-1 pr-1 pt-1 text-center" style="font-size: 10px; color:black; border-left: 1px solid black; width: 8px;">Tot.<br>Avi.</th>

              </tr>
            </thead>
            <tbody>
              <tr v-for="(spot,ix) in contentAire" :key="ix">
                <td style="font-size: 9px; color:black;">{{(ix==0)?prog:''}}</td>
                <td style="font-size: 9px; color:black; border-left: 1px solid black;">{{(ix==0)?tema:''}}</td>
                <td v-for="(dia,j) in spot" :key="j" style="font-size: 9px; color:black; border-left: 1px solid black; width: 8px !important;">{{ (dia.value == 0) ? "" : Math.round(dia.value) }}</td>
                <td style="font-size: 9px; color:black; border-left: 1px solid black; width: 8px;">{{ spot.dur }}</td>
                <td style="font-size: 9px; color:black; border-left: 1px solid black; width: 8px;">{{ spot.total }}</td>
              </tr>
            </tbody>
          </table>
          <br>
          <p style="font-size: 12px;" class="text-dark">Compañía / Agencia: {{ agencia }}</p>
          <p style="font-size: 12px;" class="text-dark">Cliente / Anunciante: {{ anunciante }}</p>
          <p style="font-size: 12px;" class="text-dark">Mes de Campaña: {{ lbMes }}</p>
          <p style="font-size: 12px;" class="text-dark">N° de OP: {{ nroOP }}</p>
          <p style="font-size: 12px;" class="text-dark">Producto: {{ prod}}</p>
          <br>
          <div class="float-right bg-white">
            <p style="font-size: 12px;" class="text-dark">Medio: {{ radio }}</p>
            <p style="font-size: 12px;" class="text-dark">Nombre responsable: {{ responsable }}</p>
            <br>
            <p style="font-size: 12px;" class="text-dark">Firma:</p>
          </div>

        </div>

      </div>

    </div>

  </card>
</template>

<script>
import { BaseAlert } from '@/components'
import NotificationTemplate from '@/components/NotificationPlugin/NotificationTemplate'
import controlService from '../../services/ControlAireServices'
import SpotServices from '../../services/SpotServices'
import moment from 'moment'
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'
import BaseInput from '../../components/Inputs/BaseInput.vue'
import jspdf from 'jspdf'
export default {
  layout: 'default',
  components: {
    BaseAlert,
    ScaleLoader,
    BaseInput
  },

  data () {
    const i18labels = this.$t('modulo_control_aire.certificado')
    return {
      isLoading: false,
      textos: {
        title: i18labels.titulo,
        alertOk: i18labels.mensajeAlertaOk,
        filtros: {
          selSpots: i18labels.filtro.selSpots
        }
      },
      textoLoader: '',
      spotsMensual: [],
      spotsDisponibles: [],
      listSpot: [],
      dataCert: {
        anio: moment().format('YYYY'),
        mes: null
      },
      meses: [{ mes: 'Enero', value: 1 }, { mes: 'Febrero', value: 2 }, { mes: 'Marzo', value: 3 }, { mes: 'Abril', value: 4 }, { mes: 'Mayo', value: 5 },
        { mes: 'Junio', value: 6 }, { mes: 'Julio', value: 7 }, { mes: 'Agosto', value: 8 }, { mes: 'Septiembre', value: 9 }, { mes: 'Octubre', value: 10 },
        { mes: 'Noviembre', value: 11 }, { mes: 'Diciembre', value: 12 }],
      spotSel: [],
      file: null,
      agencia: '',
      anunciante: '',
      lbMes: '[Seleccionar mes]',
      nroOP: '',
      tema: '',
      prog: '',
      prod: '',
      responsable: '[responsable]',
      radio: 'Radio F5 - FM 101.1 – Paraná - E. Ríos',
      notificacion: { mensaje: '', tipo: 'error' },
      type: ['', 'danger', 'success'],
      notifications: {
        topCenter: false
      },
      notifIconExc: 'tim-icons icon-alert-circle-exc',
      notifIconOk: 'tim-icons icon-check-2',
      selected: 'inst',
      fechaIni: '',
      fechaFin: '',
      file: null,
      headSemana: [],
      contentAire: []

    }
  },
  methods: {
    onEditorChange({ html, text }) {
        console.debug('editor change!', html, text)
        this.content = html
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
        timeout: 8000
      })
    },
    loadImage (event) {
      if (event.target.files.length > 0) {
        const src = URL.createObjectURL(event.target.files[0])
        const preview = document.getElementById('logorep')
        preview.src = src
        preview.style.display = 'block'
      }
    },
    imprimir () {
      const doc = new jspdf({ orientation: 'l', unit: 'pt', format: 'a4', putOnlyUsedFonts: true })
      const html = document.querySelector('#reporte')
      doc.html(html, {
        callback: function (doc) {
          doc.save(`reporte_${moment().format('dd/MM/YY')}`)
        },
        x: 15,
        y: 15
      }
      )
      // jspdf.save(`reporte_${moment().format("dd/MM/YY")}`)
    },
    setSpotDisponibles () {
      this.fechaFin = moment(`${this.dataCert.anio}-${this.dataCert.mes}`).daysInMonth()
      this.fechaIni = 1
      this.spotsDisponibles = []
      controlService.getSpotControlAire(this.dataCert.anio.toString(), this.dataCert.mes.toString())
        .then((spotAirReprods) => {
          const listCodigoSpot = spotAirReprods.map(spot => spot.codigoSpot)
          this.spotsMensual = spotAirReprods
          this.listSpot.forEach(spot => {
            if (listCodigoSpot.includes(spot.spo_codigo)) {
              this.spotsDisponibles.push(spot)
            }
          })
          this.setLabelMes()
        })
    },
    setLabelMes () {
      const month = moment(`${this.dataCert.anio}-${this.dataCert.mes}`)
      this.lbMes = month.format('MMMM').charAt(0).toUpperCase() + month.format('MMMM').slice(1)
    },
    genTable () {
      const month = moment(`${this.dataCert.anio}-${this.dataCert.mes}`)
      const totales = 0
      this.contentAire = []
      this.headSemana = Array.from(Array(month.daysInMonth()), (_, i) => { if (i >= this.fechaIni - 1 && i <= this.fechaFin - 1) { return `${moment(`${this.dataCert.anio}-${this.dataCert.mes}-${i + 1}`).format('dd')}\n${i + 1}` } }).filter(e => e)
      this.spotSel.forEach((spSel) => {
        const dias = Array.from(Array(month.daysInMonth()), (_, i) => { if (i >= this.fechaIni - 1 && i <= this.fechaFin - 1) { return { dia: `${this.dataCert.anio}/${this.dataCert.mes}/${i + 1}`, value: 0 } } }).filter(e => e)
        const menciones = this.spotsMensual.filter(reg => reg.codigoSpot == spSel.spo_codigo)
        menciones.forEach((regaireSpot) => {
          dias.forEach((dia) => {
            if (moment(regaireSpot.reprod).diff(dia.dia) == 0) {
              dia.value = regaireSpot.menciones
            }
          })
        })
        dias.total = dias.map(d => d.value).reduce((a, b) => a + b)
        dias.dur = Math.round(menciones[0].timeaire / menciones[0].menciones)
        this.contentAire.push(dias)
      })
    },
    getSpotsByCli () {
      const list = []
      let pos = 0
      this.isLoading = true
      SpotServices.getSpots().then(res => {
        const result = res.filter(e => e.spo_usuario == JSON.parse(localStorage.user).unique_name)
        result.forEach(element => {
          list.push({
            posicion: pos,
            spo_nombre: element.spo_nombre,
            spo_codigo: element.spo_codigo,
            spo_codcli: element.spo_codcli
          })
          pos++
        })
        this.listSpot = list
        this.isLoading = false
      })
    }

  },
  created () {
    moment.locale('es')

  },
  mounted () {
    this.getSpotsByCli()
  },
  computed: {

  }
}

</script>
