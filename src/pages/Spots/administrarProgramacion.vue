<template>
  <div>
<b-form-group label="Sucursales">
      <b-form-select
v-model="datosProgSpot.usuario"
class="mb-3"
>
      <b-form-select-option :value="currentUserName">
        <p v-if="datosProgSpot.usuario==currentUserName">
Usuario elegido: {{ currentUserName }}
</p>
        <p v-if="datosProgSpot.usuario!=currentUserName">
Programar para: {{ currentUserName }}
</p>
      </b-form-select-option>

    <b-form-select-option
v-for="(sucu,ix) in listaSucursales"
:key="ix+1"
:value="sucu.usuario"
>
      <p v-if="datosProgSpot.usuario==sucu.usuario">
Usuario elegido: {{ datosProgSpot.usuario }}
</p>
      <p v-if="datosProgSpot.usuario!=sucu.usuario">
Programar para: {{ sucu.usuario }}
</p>
</b-form-select-option>
    </b-form-select>
    </b-form-group>
    <b-card-group deck>
     <b-card
v-if="showFormPauta"
title="Programación pautas publicitarias"
class="p-2"
style="width: 15px;"
>
      <b-form-group
label="Tipos de spot publicitario"
class="p-2"
>
      <b-form-radio-group
        id="radio-tipo-spot"
        v-model="tipoSelected"
        :options="tipoSpot"

        name="spot-tipo-options"
      />
    </b-form-group>
    <b-form-group
v-if="datosProgSpot.numeroDia.length>0"
label="Spots disponibles"
>
      <TagSpot
:options="getSpotDisponibles"
:tipo-spot="tipoSelected"
:horadesde="datosProgSpot.horasDesde"
@remove-codspot="removeCodSpot"
@update-codspot="updateCodSpot"
@set-spot="setSpot"
/>
    </b-form-group>
      <b-form-group
v-if="programacion.length>0"
label="Días de la semana"
>
        <b-form-checkbox-group
          id="dias-semana"
          v-model="datosProgSpot.numeroDia"
          label="Días de la semana"
          :options="filtroSemana"
          :aria-describedby="ariaDescribedby"
          name="dias-semana"
        />
      </b-form-group>

    <b-form-group
v-if="programacion.length>0"
      label="Hora desde:"
      label-class="font-weight-bold pt-0"
      >
     <b-form-input
id="horadesde"
v-model="datosProgSpot.horasDesde"
class="form-control-sm bg-dark"
type="time"
min="00:00"
max="23:55"
step="2"
@keypress.enter="setAddHoraDesde"
/>
    <b-button @click="addCadaXtime">
<b-icon-clock /> Agregar cada 5 minutos
</b-button>
    </b-form-group>
</b-card>
        <b-card title="Detalle de la programación">
          <b-card-header>
            <b-row class="p-2">
  <b-button-toolbar
key-nav
aria-label="acciones"
>
                    <b-button-group
v-if="progSpots.filter(prog=>prog.codPautaSpot==-1).length>0"
class="mx-1"
>
                      <b-button
size="sm"
title="Confirmar todos"
@click="confirmar(progSpots)"
>
                        <b-icon
icon="cloud-upload"
aria-hidden="true"
>
Confirmar
</b-icon>
                      </b-button>
                      <b-button
size="sm"
title="Eliminar todos"
@click="progSpots=[]"
>
                        <b-icon
icon="trash-fill"
aria-hidden="true"
>
Eliminar
</b-icon>
                      </b-button>
                    </b-button-group>
                  </b-button-toolbar>
                  <b-button-group class="mx-1">
                      <b-button
size="sm"
title="Agregar"
@click="showFormPauta=!showFormPauta"
>
                        <b-icon
icon="plus-circle"
aria-hidden="true"
>
Confirmar
</b-icon>
                      </b-button>
                      <!-- <b-button size="sm" title="Eliminar todos" @click="">
                        <b-icon icon="trash-fill" aria-hidden="true">Eliminar</b-icon>
                      </b-button> -->
                    </b-button-group>
</b-row>
          </b-card-header>
          <b-table-simple
id="prog-spots"
hover
small
head-variant="light"
            caption-top
responsive
sticky-header="500px"
class="table tablesorter table-bordered"
>
            <b-thead>
              <b-tr>
<b-th
scope="col"
class="text-center"
variant="dark"
>
Horarios
</b-th>
                <b-th
v-for="dia in filtroSemana"
:key="dia.value"
scope="col"
class="text-center"
variant="dark"
>
{{ dia.text.substring(0,2) }}
</b-th>
                <b-th
scope="col"
class="text-center"
variant="dark"
>
Quitar
</b-th>
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr
v-for="(detalle,hora) in generarDetalle"
:key="hora"
style="height: 10vh;"
>
<b-td
class="text-center bg-dark"
:sticky-column="true"
>
<h5 style="color: white;">
{{ hora }}
</h5>
</b-td>

                      <b-td
v-for="dia in filtroSemana"
:key="dia.text"
>
                        <div class="d-flex flex-row">
                          <div
v-for="spot in detalle[dia.value]"
:key="spot.codSpot"
class="p-2 m-2 border border-light"
:class="spot.classTipo"
>
                            <h5 style="color: white;">
<strong>{{ spot.nombreSpot }}</strong>
</h5>
                          </div>
                        </div>
                      </b-td>


<b-td
scope="col"
class="text-center"
>
  <b-button-toolbar
key-nav
aria-label="Acciones"
>
    <b-button-group class="mx-1">
      <b-button
size="sm"
title="Eliminar"
@click="eliminarProgSpot()"
>
        <b-icon
icon="trash-fill"
aria-hidden="true"
/>
      </b-button>
    </b-button-group>
  </b-button-toolbar>
</b-td>
</b-tr>
            </b-tbody>
            </b-table-simple>
</b-card>
      </b-card-group>











    <loading-overlay
:show="isLoading"
opacity="0.4"
color="#1d8cf8"
height="95px"
text="Cargando programación..."
/>
  </div>
</template>

<script>
import moment from 'moment'
import cliProgramacionSpotServices from '../../services/ClienteProgramacionSpotServices'
import spotService from '../../services/SpotServices'
import clienteProgramacionSpotService from '../../services/ClienteProgramacionSpotServices'
import UserServices from '../../services/UserServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import TagSpot from '@/components/ui/TagSpot.vue'

export default {
  components: {
    LoadingOverlay,
    LoadingSpinner,
    TagSpot
  },
  data() {
    const i18labels = this.$t('modulo_spots.programacion_spot')
    return {
      repeated: false,
      showFormPauta: false,
      copiaPautados:[],
      spotsPautados: [],
      spotsConflicto: [],
      spoSelected: {},
      slotSelected: 0,
      sendresult: false,
      searchNameSpot: "",
      notificacion: { mensaje: '', tipo: 'error' },
      type: ['', 'danger', 'success', 'info', 'warning', 'default'],
      notifIconExc: 'tim-icons icon-alert-circle-exc',
      notifIconOk: 'tim-icons icon-check-2',
      titulo: '',
      sucursal: this.currentUserName,
      codigoProgramacion: this.$route.params.codigoProgramacion,
      nombreProgramacion: this.$route.params.nombreProgramacion,
      filtroSemana: [
        { text: "Domingo", value: 0},
        { text: "Lunes", value: 1},
        { text: "Martes", value: 2},
        { text: "Miércoles", value: 3},
        { text: "Jueves", value: 4},
        { text: "Viernes", value: 5},
        { text: "Sabado", value: 6}
      ],
      spotsDisponibles: [],
      progSpots: [],
      programacion:[],
      tableView:{},
      fields: [
        { key: "horaDesde", label: "Desde", sortable: true },
        { key: "slot", label: "Slot", sortable: true },
        { key: "sucursal", label: "Sucursal", sortable: true },
        { key: "nombreSpot", label: "Nombre", sortable: true },
      ],
    datosProgSpot: {
      codProgramacion: -1,
      codSpot: [],
      numeroDia: [moment().day()],
      horasDesde: moment().format("HH:mm"),
      totalminutos:0,
      usuario: this.currentUserName
    },
      horaInicial: "00:00",
      horaFinal: "00:05",
      horasOcupados: [],
      horaRepetir: [],
      nroDia: moment().day(),
      slotOrigenTemp: 0,
      movHoraTemp: '',
      codigoProgSpotOrigen: 0,
      codigoSpotInsertar: 0,
      tipoSelected: 'inst',//Cambiar por el objeto
      regSelected: [],

      tipoSpot: [
        {
          text: 'Institucionales',
          value: 'inst',
          class: 'spots-azul'
        },
        {
          text: 'Promocionales',
          value: 'prom',
          class: 'spots-verde'
        },
        {
          text: 'Noticias',
          value: 'noti',
          class: 'spots-marron'
        }
      ],
      repit: 0,
      isLoading: false,
      showModal: false,
      nombreSpotModal: null,
      codigoSpotModal: null,
      fechaInicio: '',
      fechaFin: '',
      initPauta: 0,
      listaSucursales: [],
      currentUserName: null,
      currentCliente: null,
      usuariOrigen: ''
    }
  },
  computed: {
    generarDetalle() {
      if(this.progSpots.length==0) return {};

      const groupSpot = Object.groupBy(this.progSpots,({horaDesde})=>horaDesde)
      const horarios = Object.keys(groupSpot)
      let detalle = {}
      for (let hora of horarios) {
        const spots = groupSpot[hora]
        let result = []
        for (const spotprog of spots){
          const spot = this.spotsDisponibles.find(spo=>spo.codSpot==spotprog.codigoSpot)
          if(spot==undefined){
            console.warn(`Spot con código ${spotprog.codigoSpot} no encontrado en spotsDisponibles`)
            continue;
          }
          const tipoSpotObj = this.tipoSpot.find(t=>t.value==spot.tipo)
          if(!tipoSpotObj){
            console.warn(`Tipo de spot ${spot.tipo} no encontrado`)
            continue;
          }
          result.push({
            ...spot,
            classTipo: tipoSpotObj.class,
            dia:spotprog.numeroDia,
            horarios: hora
          })
        }
        detalle[hora]=Object.groupBy(result,({dia})=>dia)
      }
      return detalle
    },
    getSpotDisponibles(){

      return this.spotsDisponibles.filter(spot=>spot.tipo==this.tipoSelected)
    },
    isValidForm() {
      const isSelectedDiaSemana = this.datosProgSpot.numeroDia.length>0
      const isSelectedSpot = this.datosProgSpot.codSpot.length>0
      return isSelectedDiaSemana&&isSelectedHora&&isSelectedSpot
    },

    ExistCopy(){
      return this.copiaPautados.filter(cp=>cp.clprsp_numeroDia!=this.datosProgSpot.numeroDia).length>0
    }
    ,
    filterSpots() {
      return this.spotsDisponibles.filter((spot) => { return (spot.nombreSpot.toLowerCase().includes(this.searchNameSpot.toLowerCase()) && spot.tipo == this.tipoSelected) })
    }
  },
  watch: {


    'datosProgSpot.codSpot'(codeSpots){
     if(codeSpots.length==0) return;
     this.datosProgSpot.totalminutos=codeSpots.map(code=>this.spotsDisponibles.find(spo=>spo.codSpot==code).duracion).reduce((sum,valCurrent)=>sum+valCurrent,0)

    },
    'datosProgSpot.totalminutos'(val){
     const step = (val>5)?val:5
     this.horaFinal = moment(this.horaInicial,'HH:mm').add(step,'minutes').format("HH:mm")

    },
    'datosProgSpot.numeroDia'(val){
     const step = (val>5)?val:5
     this.updateCodSpot(this.programacion)

    },

    progSpots(){
      this.tableView = Object.groupBy(this.progSpots,({horaDesde})=>horaDesde)
    },
    horaInicial(){
      const step = (this.datosProgSpot.totalminutos>5)?this.datosProgSpot.totalminutos:5
     this.horaFinal = moment(this.horaInicial,'HH:mm').add(step,'minutes').format("HH:mm")

    }


  },

  created() {
    this.getCurrentUser()
    this.verificarParametros()
    this.inicializar()

  },


  mounted() {
  },

  methods: {



    isDraggable(ev) {
      return (((this.currentUserName === ev.usuario && ev.admin == 0) || (this.currentCliente === this.currentUserName)))
    },
    addCadaXtime(){
      let ini = moment(this.datosProgSpot.horasDesde,"HH:mm:ss")
      let iniMasTime = ini.add(5,'minutes')
      this.datosProgSpot.horasDesde = iniMasTime.format("HH:mm:ss")
      this.setAddHoraDesde()
    },
    setAddHoraDesde(){

let auxProg = this.datosProgSpot.codSpot.map((opt)=>{
  console.log(opt)
return{
  ...opt,
  horadesde:this.datosProgSpot.horasDesde

}
})
this.programacion.forEach(prog=>auxProg.push(prog))
this.updateCodSpot(auxProg)

},
    getCurrentUser() {
      // obtenemos el username del usuario logueado
      const ususarioLogueado = UserServices.current().unique_name
      this.currentUserName = ususarioLogueado

      // obtengo el cliente (en caso de ser sucursal, obtengo a que cliente pertenece)
      const cli = JSON.parse(UserServices.current().Cliente)
      this.currentCliente = cli.cli_usuari
      this.sucursal = ''

    },
    abrirModal(info) {
      this.codigoSpotModal = parseInt(info.target.getAttribute('data-idSpot'))
      this.nombreSpotModal = info.target.getAttribute('data-nombreSpot')
      const auxFechaIni = info.target.getAttribute('data-fecIni')
      const auxFechaFin = info.target.getAttribute('data-fecFin')
      this.fechaInicio = (moment(auxFechaIni).format('yyyy-MM-DD'))
      this.fechaFin = (moment(auxFechaFin).format('yyyy-MM-DD'))
      this.showModal = !this.showModal
    },

    canDrag() {
      return false
    },
    guardarCambios() {
      spotService.cambiarVencimiento(this.codigoSpotModal, this.fechaFin).then(res => {
        this.showModal = !this.showModal
        this.inicializar()
      })
    },
    verificarParametros() {

      if (this.codigoProgramacion === undefined || this.nombreProgramacion === undefined) {
        this.codigoProgramacion = 0
        this.$router.push({
          name: 'Mis programaciones de spots'
        })
        return false;
      } else {

        this.titulo = "Programacion semanal de Spots"
        this.datosProgSpot.codProgramacion = this.$route.params.codigoProgramacion
        this.datosProgSpot.usuario = this.currentUserName
      }
    },
    listarSpotsDisponibles() {
      return spotService.getSpotsBycodCliente().then(list => {
        this.spotsDisponibles =  list
      })

    },
    cleanData() {
      this.datosProgSpot.codSpot= []
      this.datosProgSpot.numeroDia= moment().day(),
      this.datosProgSpot.numeroDia= moment().format("HH:mm"),
      this.datosProgSpot.totalminutos=0,
      this.datosProgSpot.usuario= this.currentUserName

    },

    listarSpotProgramados(server = true) {
      this.isLoading = true
      this.horasDisponibles = []
      this.progSpots = []

      return cliProgramacionSpotServices.getProgramacionesByProg(this.datosProgSpot.codProgramacion, '00:00')
        .then((result)=>{
          if(!result || result.length === 0){
            this.progSpots = []
            console.warn('No hay programaciones cargadas')
          } else {
            this.progSpots = result
            localStorage.progSpots = JSON.stringify(result)
          }
          this.isLoading = false
        })
        .catch((error) => {
          console.error('Error al cargar programaciones:', error)
          this.progSpots = []
          this.isLoading = false
        })

    },
    llenarHorarios() {
      return this.calcularHsDisponibles.ocupados;
    },
    setSpot(spot){
      if(spot!=undefined){
        this.datosProgSpot.codSpot.push(spot)
      }
    },
    updateCodSpot(programacion){
      this.progSpots=[]
      this.programacion = programacion

      let SetProgSpot = (prog,dia,slot,then)=>{

        this.progSpots.push({
                  codPautaSpot: -1,
                  codigoProgramacion: then.codigoProgramacion,
                  nombreSpot:prog.nombreSpot,
                  classTipo:then.tipoSpot.find(tipo=>tipo.value==prog.tipo).class,
                  codigoSpot: prog.codSpot,
                  numeroDia: dia,
                  horaDesde: prog.horadesde,
                  codigoProgSpotDestino: 0,
                  slot: slot,
                  for: then.datosProgSpot.usuario
          })

      }
      this.datosProgSpot.numeroDia.forEach(dia=>{
       programacion.forEach((prog,slot)=>{
            SetProgSpot(prog,dia,slot,this)
          })
       })

    },
    removeCodSpot(pos){
      this.datosProgSpot.codSpot.splice(pos,1)
      this.progSpots = JSON.parse(localStorage.progSpots)
    },
    corregirHora() {
      // Cuando se ingresa solo los minutos o solo la hora, el input envía un HH o mm rn lugar de la hora o los minutos
      // Se extrae las partes del string que contenga "HH" o "mm" y se lo reemplaza por "00".
      const auxHora = this.horaDesde.substr(0, 2)
      const auxMinutos = this.horaDesde.substr(3, 2)
      if (auxHora === 'HH') {
        this.horaDesde = '00:' + auxMinutos
      }
      if (auxMinutos === 'mm') {
        this.horaDesde = auxHora + ':00'
      }
    },
    armarFecha(numeroDia, hora, minutos) {
      const fecha = moment(moment().day(numeroDia)).format('YYYY-MM-DD')
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

      fechaReturn = fecha + ' ' + hs + ':' + min + ':' + '00'
      return fechaReturn
    },
    addHora(hora){
      this.datosProgSpot.horasDesde.push(hora)
    },
    cambiaDia() {
      //this.llenarHorarios()
      this.listarSpotProgramados()
    },
    canDrop() {
      if (this.progSpots.length < 5) {
        return true
      } else {
        return false
      }
    },
    addParams(params) {
      this.regSelected.push(params)
    },
    eliminarSpot(iparams) {
      let params = iparams || this.regSelected
      this.isLoading = true
      let promises = [], error = []
      params.forEach((p) => {
        promises.push(clienteProgramacionSpotService.eliminarProgSpot(p.codProgSpot, p.usuario))
      })
      Promise.all(promises).then(resp => {
        if (resp.pop() == '') {
          this.listarSpotProgramados().then(() => { this.selected = [] })
          this.isLoading = false
        }
        else {
          this.notifyVue('top', 'center', resp.pop(), this.notifIconExc, 5)
        }

      })
    },
    chequearSlotYHora(slot, hora, dia) {
      let result = this.progSpots.filter(el => el.numeroDia == dia)
        .filter(sp => sp.orden == slot && moment(sp.horaDesde, 'HH:mm').diff(moment(hora, 'HH:mm'), 'minutes') == 0)

      if (result.length == 0) {
        return []
      }

      return result
    },
    getEventHora(hora) {
      const result = []
      let getCondition = (element) => {

        return element.horaDesde == (hora.format('HH:mm') + ':00') &&
          element.orden == (slot - 1)
      }

      let count =
        result.push(

          this.progSpots.filter(element => getCondition(element))

        )

      return result
    },
    allowDrop(ev) {
      ev.preventDefault()
    },

    dragHandler(ev) {

      this.$root.$emit('bv::hide::popover')// cuando se empieza a arrastrar el spot, cierro el popover

      // guardo los datos del día y el horario del spot que se moverá
      this.slotOrigenTemp = ev.composedPath().find(el => el?.dataset?.slot).dataset.slot
      this.movHoraTemp = ev.composedPath().find(el => el?.dataset?.horadestino).dataset.horadestino
      this.codigoProgSpotOrigen = ev.composedPath().find(elem => elem?.dataset?.progspot)?.dataset?.progspot ?? null
      this.usuariOrigen = ev.composedPath().find(elem => elem?.dataset?.usuario)?.dataset?.usuario

    },
    async dropHandler(ev) {
      ev.preventDefault()

      // si es 0, es porque el spot viene de afuera de la tabla,
      if (this.slotOrigenTemp === 0) {
        if (this.currentUserName === this.currentCliente) {
          this.addPauta(ev)
        } else {
          // si el usuario logueado no es role cliente, solo podrá permutar si el spot cargado en el slot elegido está vacío o si le pertenece a ese usuario
          if (this.currentUserName === ev.target.getAttribute('data-usuario') || ev.target.getAttribute('data-usuario') === null) {
            this.agregaUnNuevoSpot(ev)
          } else {
            this.notificacion.mensaje = this.textos.mensajes.textNotValid + ' ' + this.currentCliente

            this.notifyVue('top', 'center', this.notificacion.mensaje, this.notifIconExc, 5)
          }
        }
      } else {
        if (this.currentUserName === this.currentCliente) {
          this.permutaUnSpot(ev)
        } else {
          // si el usuario logueado no es role cliente, solo podrá permutar si el spot cargado en el slot elegido está vacío o si le pertenece a ese usuario
          if (this.currentUserName === ev.target.getAttribute('data-usuario') || ev.target.getAttribute('data-usuario') === null) {
            this.permutaUnSpot(ev)
          } else {
            this.notificacion.mensaje = this.textos.mensajes.textNotValid + ' ' + this.currentCliente

            this.notifyVue('top', 'center', this.notificacion.mensaje, this.notifIconExc, 5)
          }
        }
      }
    },
    async agregaUnNuevoSpot(ev) {
      let numSlotDestino
      let horarioSlotDestino

      let codigoProgSpotDestino = this.codigoProgramacion

      // si el usuario logueado es el cliente o si el spot a mover pertenece al usuario logueado puedo realizar la accion
      // if(this.currentUserName === this.currentCliente || this.currentUserName === ev.target.getAttribute("data-usuario")){
      // Si no hay un spot cargado en el slot al que voy a mover
      if (ev.target.id != '') {
        // obtengo el horario del row donde está el slot a donde estoy moviendo
        horarioSlotDestino = ev.composedPath()[2].id
        /* paso un valor que no sea ningun del 1 al 5 (los slots validos) porque en el caso de intercambio entre
          dos slots ocupados, los datos los obtengo en el stored
        */

        numSlotDestino = 7
      } else {
        // obtengo el horario del row donde está el slot a donde estoy moviendo
        horarioSlotDestino = ev.composedPath()[1].id
        // obtengo el numero del slot donde está el spot que voy a mover, y tambien el slot hacia donde voy a mover
        numSlotDestino = ev.composedPath()[0].cellIndex
        codigoProgSpotDestino = 0
      }


      this.listarSpotProgramados()

      // }
    },
    async resolveConflict(horaDesde) {

      let pendientes = this.progSpots.filter(ps => ps.codProgSpot == -1)
      await this.listarSpotProgramados()
      pendientes.forEach(el => this.progSpots.push(el))

      let exist = () => {
        return this.progSpots.filter(el => el.numeroDia == this.datosProgSpot.numeroDia)
          .find(sp => sp.orden == this.datosProgSpot.slot && moment(sp.horaDesde, 'HH:mm').diff(moment(this.datosProgSpot.horas, 'HH:mm'), 'minutes') == 0) !== undefined
      }
      while (exist()) {

        if (this.datosProgSpot.slot >= 4) {
          let horaAux = moment(this.datosProgSpot.horas, 'HH:mm').add(5, 'minutes').format("HH:mm")
          this.datosProgSpot.horas = horaAux
          this.datosProgSpot.slot = 0
        } else {
          this.datosProgSpot.slot++
        }
      }
      return moment(this.datosProgSpot.horas, 'HH:mm')
    },
    async confirmar(pautas) {
      this.isLoading = true
      let presult = await clienteProgramacionSpotService.guardarProgSpot(pautas)
      if(presult){
        this.progSpots=[]
        this.listarSpotProgramados()
        this.cleanData()
        this.isLoading = false
      }
    },
    async permutaUnSpot(ev) {

      // este dato es el que capturo en el dragHandler

      const composedPath = ev.composedPath()

      let data = {
        codigoProgramacion: parseInt(this.codigoProgramacion),
        codigoProgSpotOrigen: this.codigoProgSpotOrigen,
        codigoProgSpotDestino: composedPath.find(elem => elem?.dataset?.progspot)?.dataset?.progspot ?? null,
        usuarioSpot: composedPath.find(elem => elem?.dataset?.usuario)?.dataset?.usuario ?? this.usuariOrigen,
        numeroDia: parseInt(this.nroDia),
        horaSlotOrigen: this.movHoraTemp,
        horaDesde: composedPath.find(elem => elem?.dataset?.horadestino).dataset.horadestino,
        ordenDestino: 6,
        ordenOrigen: parseInt(this.slotOrigenTemp)
      }
      // si el usuario logueado es el cliente o si el spot a mover pertenece al usuario logueado puedo realizar la accion
      const elTargetId = composedPath.find(el => el.id == `popover-${parseInt(data.codigoProgSpotDestino)}`)?.id ?? ''
      // Si no hay un spot cargado en el slot al que voy a mover
      if (elTargetId == '') {
        data.ordenDestino = parseInt(composedPath.find(elem => elem?.dataset?.slot)?.dataset?.slot)
      }

      /* En caso de que haya un spot en el slot al que voy a mover, le paso en el último parametro el valor
        del slot (restando 1 porque en la BD va del 0 al 4)
      */
      await clienteProgramacionSpotService.permutarProgSpot(data)
        .then(res => {
          this.listarSpotProgramados()
        })
      this.slotOrigenTemp = 0
      this.movHoraTemp = ''
    },

    obtenerSucursales() {
      const sucursales = []
      cliProgramacionSpotServices.getProgSpotSucursal(this.codigoProgramacion)
        .then(res => {
          res.forEach(element => {
            sucursales.push({
              codigoSucursal: element.sucpgr_codigoSucursal,
              nombreSucursal: element.clisuc_nombre,
              usuario: element.clisuc_usuario
            })
          })
          this.listaSucursales = sucursales

        })
    },

    notifyVue(verticalAlign, horizontalAlign, message, icono, tipo) {
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
    },
    inicializar() {
        this.obtenerSucursales()
        this.listarSpotsDisponibles().then(()=>{
          this.listarSpotProgramados()
        })
        this.horaInicial = moment(new Date(),'HH:mm').format('HH:mm')
        this.horaFinal = moment(this.horaInicial,'HH:mm').add(5,'HH:mm').format('HH:mm')

    },


  }
}
</script>
<style scoped></style>
