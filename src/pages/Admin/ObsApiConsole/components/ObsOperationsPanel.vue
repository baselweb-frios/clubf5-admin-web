<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          Eliminaciones
        </h3>

        <div class="form-group">
          <label class="label">ObjectKey para eliminar archivo</label>
          <input
            v-model="deleteObjectName"
            class="input"
            placeholder="path/archivo.mp3"
            type="text"
          >
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-danger"
            :disabled="loading || !deleteObjectName"
            @click="eliminarArchivo"
          >
            <i class="fas fa-trash" />
            EliminarArchivo
          </button>
          <button
            class="btn btn-warning"
            :disabled="loading || !deleteObjectName"
            @click="eliminarArchivoYNotificar"
          >
            <i class="fas fa-bell" />
            EliminarArchivoYNotificar
          </button>
        </div>

        <div class="divider" />

        <div class="form-group">
          <label class="label">ObjectKey carpeta/objeto</label>
          <input
            v-model="deleteFolderObject"
            class="input"
            placeholder="carpeta/"
            type="text"
          >
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-danger"
            :disabled="loading || !deleteFolderObject"
            @click="eliminarObjeto"
          >
            <i class="fas fa-folder-minus" />
            EliminarObjeto
          </button>
          <button
            class="btn btn-danger"
            :disabled="loading || !deleteFolderObject"
            @click="eliminarRecursivo"
          >
            <i class="fas fa-broom" />
            EliminarCarpetaRecursivo
          </button>
        </div>

        <div class="divider" />

        <div class="form-group">
          <label class="label">Eliminar múltiples (coma separada)</label>
          <input
            v-model="multipleDeleteText"
            class="input"
            placeholder="a.mp3,b.mp3,c.mp3"
            type="text"
          >
        </div>
        <button
          class="btn btn-danger"
          :disabled="loading || !multipleDeleteText"
          @click="eliminarMultiples"
        >
          <i class="fas fa-trash-alt" />
          EliminarMultiples
        </button>
      </div>

      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          Mover, copiar y renombrar
        </h3>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="form-group">
            <label class="label">Origen</label>
            <input
              v-model="origen"
              class="input"
              placeholder="origen/archivo.mp3"
              type="text"
            >
          </div>
          <div class="form-group">
            <label class="label">Destino</label>
            <input
              v-model="destino"
              class="input"
              placeholder="destino/archivo.mp3"
              type="text"
            >
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-secondary"
            :disabled="loading || !origen || !destino"
            @click="mover"
          >
            <i class="fas fa-arrows-alt" />
            Mover
          </button>
          <button
            class="btn btn-info"
            :disabled="loading || !origen || !destino"
            @click="copiar"
          >
            <i class="fas fa-copy" />
            Copiar
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model="nuevoNombre"
            class="input"
            placeholder="nuevo-nombre.mp3"
            type="text"
          >
          <button
            class="btn btn-primary"
            :disabled="loading || !origen || !nuevoNombre"
            @click="renombrar"
          >
            <i class="fas fa-i-cursor" />
            Renombrar
          </button>
        </div>

        <div class="divider" />

        <div class="form-group">
          <label class="label">Mover múltiples (coma separada)</label>
          <input
            v-model="multipleMoveText"
            class="input"
            placeholder="a.mp3,b.mp3,c.mp3"
            type="text"
          >
        </div>
        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model="moveDestinationFolder"
            class="input"
            placeholder="destino/carpeta/"
            type="text"
          >
          <button
            class="btn btn-success"
            :disabled="loading || !multipleMoveText || !moveDestinationFolder"
            @click="moverMultiples"
          >
            <i class="fas fa-random" />
            MoverMultiples
          </button>
        </div>

        <div class="divider" />

        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model.number="linkExpiration"
            class="input"
            type="number"
            min="1"
            placeholder="Expiración min"
          >
          <button
            class="btn btn-ghost"
            :disabled="loading || !origen"
            @click="getLink"
          >
            <i class="fas fa-link" />
            GetLink
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import obsServices from '@/services/obsServices'

const emit = defineEmits(['result', 'error'])

const loading = ref(false)

const deleteObjectName = ref('')
const deleteFolderObject = ref('')
const multipleDeleteText = ref('')

const origen = ref('')
const destino = ref('')
const nuevoNombre = ref('')
const multipleMoveText = ref('')
const moveDestinationFolder = ref('')
const linkExpiration = ref(60)

const run = async (action, fn) => {
  try {
    loading.value = true
    const payload = await fn()
    emit('result', { action, payload, at: new Date().toISOString() })
  } catch (error) {
    emit('error', { action, error })
  } finally {
    loading.value = false
  }
}

const eliminarArchivo = () => run('EliminarArchivo', () => obsServices.EliminarArchivo(deleteObjectName.value))
const eliminarObjeto = () => run('EliminarObjeto', () => obsServices.EliminarObjeto(deleteFolderObject.value))
const eliminarMultiples = () => run('EliminarMultiples', () => obsServices.EliminarMultiples(toList(multipleDeleteText.value)))
const eliminarRecursivo = () => run('EliminarCarpetaRecursivo', () => obsServices.EliminarCarpetaRecursivo(deleteFolderObject.value))

const eliminarArchivoYNotificar = () => run('EliminarArchivoYNotificar', () => {
  const fileName = obsServices.GetNombreArchivo(deleteObjectName.value)
  return obsServices.EliminarArchivoYNotificar(deleteObjectName.value, fileName, null, null)
})

const mover = () => run('Mover', () => obsServices.Mover({ origen: origen.value, destino: destino.value }))
const copiar = () => run('Copiar', () => obsServices.Copiar(origen.value, destino.value))
const renombrar = () => run('Renombrar', () => obsServices.Renombrar(origen.value, nuevoNombre.value))
const moverMultiples = () => run('MoverMultiples', () => obsServices.MoverMultiples(toList(multipleMoveText.value), moveDestinationFolder.value))
const getLink = () => run('GetLink', () => obsServices.GetLink(origen.value, linkExpiration.value))

const toList = (value) => value.split(',').map(item => item.trim()).filter(Boolean)
</script>
