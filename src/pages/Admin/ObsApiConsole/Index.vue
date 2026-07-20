<template>
  <div class="page-wrapper">
    <div class="page-content flex flex-col h-[calc(100vh-64px)] gap-0">
      <!-- Toolbar fila 1 -->
      <div class="flex items-center gap-1 px-2 py-1 bg-dark-primary border border-dark-border border-b-0 rounded-t-md shrink-0">
        <button class="btn-icon text-text-tertiary hover:text-text-primary" title="Refrescar" @click="refreshObs">
          <i class="fas fa-sync-alt text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-text-primary" title="Nueva carpeta OBS" @click="newFolder">
          <i class="fas fa-folder-plus text-xs" />
        </button>
        <div class="flex-1" />
        <input ref="uploadInput" type="file" multiple class="hidden" @change="handleUploadSelect" />
        <input ref="uploadFolderInput" type="file" webkitdirectory multiple class="hidden" @change="handleFolderUploadSelect" />
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Subir archivos a OBS" @click="uploadInput.click()">
          <i class="fas fa-cloud-upload-alt text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Subir carpeta completa a OBS" @click="uploadFolderInput.click()">
          <i class="fas fa-folder-open text-xs" />
        </button>
        <span v-if="uploading" class="text-[10px] text-primary-400 ml-1">{{ uploadProgress }}%</span>
        <div class="w-px h-5 bg-dark-border mx-1" />
        <span class="text-[10px] text-text-quaternary mr-1">F2 Renombrar · F5 Descargar · F6 Mover · F7 Nueva · F8 Elim</span>
      </div>

      <!-- Toolbar fila 2: busqueda por tipo (server-side) y acciones sobre la seleccion -->
      <div class="flex items-center gap-1 px-2 py-1 bg-dark-primary border-x border-dark-border shrink-0">
        <span class="text-[10px] text-text-quaternary mr-1">Buscar en esta carpeta:</span>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Buscar audio en esta carpeta" @click="searchByType('audio')">
          <i class="fas fa-file-audio text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Buscar video en esta carpeta" @click="searchByType('video')">
          <i class="fas fa-file-video text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Buscar imagenes en esta carpeta" @click="searchByType('image')">
          <i class="fas fa-file-image text-xs" />
        </button>
        <button v-if="searchActive" class="btn-icon text-warning-400" title="Limpiar busqueda" @click="clearSearch">
          <i class="fas fa-times text-xs" />
        </button>
        <span v-if="searchActive" class="text-[10px] text-primary-400 mr-1">{{ searchResults.length }} resultado(s)</span>

        <div class="w-px h-5 bg-dark-border mx-1" />
        <span class="text-[10px] text-text-quaternary mr-1">Selección:</span>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Renombrar (F2, solo archivos)" @click="renameSelected">
          <i class="fas fa-pen text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Generar link temporal (copia al portapapeles)" @click="generateLinkSelected">
          <i class="fas fa-link text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Mover seleccion a otra carpeta OBS" @click="moveSelectedToFolder">
          <i class="fas fa-folder-tree text-xs" />
        </button>
        <button class="btn-icon text-text-tertiary hover:text-primary-400" title="Ver informacion del archivo" @click="showInfoSelected">
          <i class="fas fa-circle-info text-xs" />
        </button>
      </div>

      <!-- Panel unico: OBS -->
      <div
        class="flex-1 border-x border-dark-border min-h-0 overflow-hidden relative"
        @dragover.prevent="isDraggingOverObs = true"
        @dragenter.prevent="isDraggingOverObs = true"
        @dragleave.prevent="onObsDragLeave"
        @drop="handleObsDrop"
      >
        <div
          v-if="isDraggingOverObs"
          class="absolute inset-0 z-10 flex items-center justify-center bg-primary-500/10 border-2 border-dashed border-primary-400 pointer-events-none"
        >
          <span class="text-primary-300 text-sm font-medium px-3 py-1 bg-dark-primary/80 rounded">
            Soltar para subir a {{ obsPath }}
          </span>
        </div>
        <FilePanel
          ref="panelRef"
          :path="obsPath"
          :files="displayedFiles"
          :folders="searchActive ? [] : folders"
          :loading="loading"
          :active="true"
          @navigate="(p) => navigateObs(p)"
          @download="(k) => downloadObsFile(k)"
          @delete="(k) => deleteObsFile(k)"
          @openFile="(k) => downloadObsFile(k)"
          @rename="(k) => renameKey(k)"
          @link="(k) => generateLinkForKey(k)"
          @move-to-folder="(k) => moveKeyToFolder(k)"
          @info="(k) => showInfoForKey(k)"
        />
      </div>

      <!-- Commander bar -->
      <CommanderBar
        :right-selected="getSelected()"
        :right-count="allItemsCount()"
        single-pane
        @view="viewSelected"
        @edit="editSelected"
        @copy="downloadSelection"
        @move="moveSelectedToFolder"
        @new-folder="newFolder"
        @delete="deleteSelection"
        @refresh="refreshObs"
      />
    </div>

    <!-- Cola de subida -->
    <div v-if="uploadQueue.length" class="fixed bottom-4 right-4 w-72 bg-dark-primary border border-dark-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto text-[11px]">
      <div class="px-2 py-1 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-primary">
        <span class="text-text-secondary font-medium">Subiendo {{ uploadQueue.length }} archivo(s)</span>
        <button class="text-text-quaternary hover:text-text-primary" @click="uploadQueue = []">
          <i class="fas fa-times" />
        </button>
      </div>
      <div v-for="item in uploadQueue" :key="item.id" class="px-2 py-1 border-b border-dark-border/50">
        <div class="flex items-center justify-between gap-2">
          <span class="truncate text-text-tertiary" :title="item.name">{{ item.name }}</span>
          <i v-if="item.status === 'success'" class="fas fa-check text-success-400 shrink-0" />
          <i v-else-if="item.status === 'error'" class="fas fa-exclamation-circle text-red-400 shrink-0" />
          <span v-else class="text-text-quaternary shrink-0">{{ item.progress }}%</span>
        </div>
        <div class="h-1 bg-dark-secondary rounded mt-0.5 overflow-hidden">
          <div
            class="h-full transition-all"
            :class="item.status === 'error' ? 'bg-red-400' : 'bg-primary-400'"
            :style="{ width: (item.status === 'success' ? 100 : item.progress) + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import obsServices from '@/services/obsServices'
import { useToast } from '@/composables/useToast'
import FilePanel from '@/components/obs/FilePanel.vue'
import CommanderBar from '@/components/obs/CommanderBar.vue'

const toast = useToast()
const OBS_ROOT = import.meta.env.VITE_PATH_MUSIC || 'Music/online/'

// Estado del panel OBS (unico panel)
const obsPath = ref(OBS_ROOT)
const files = ref([])
const folders = ref([])
const loading = ref(false)

// Upload
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadQueue = ref([])
const uploadInput = ref(null)
const uploadFolderInput = ref(null)

// Referencia al FilePanel (para leer la seleccion)
const panelRef = ref(null)

// Busqueda por tipo (server-side, dentro de la carpeta actual)
const searchActive = ref(false)
const searchResults = ref([])

// Drag & drop
const isDraggingOverObs = ref(false)

const getSelected = () => panelRef.value ? Array.from(panelRef.value.selected || []) : []
const allItemsCount = () => files.value.length + folders.value.length

// Cuando hay busqueda por tipo activa, se muestran esos resultados en vez del listado normal.
// El filtro por nombre dentro de cada carpeta ya lo resuelve el propio FilePanel (su buscador rapido).
const displayedFiles = computed(() => searchActive.value ? searchResults.value : files.value)

// ===== PANEL OBS =====
const loadObsFolder = async () => {
  loading.value = true
  searchActive.value = false
  searchResults.value = []
  try {
    const result = await obsServices.ListarObject(obsPath.value)
    const objects = Array.isArray(result) ? result : (result?.objects || [])
    const prefix = obsPath.value

    // Las subcarpetas se derivan de la propia lista de objetos (como hace cualquier
    // explorador tipo S3), no de que exista un marcador vacío "carpeta/" explícito.
    // Antes dependía de ese marcador (o.size==0 && termina en '/'), así que una carpeta
    // que solo tenía archivos adentro (ej. subida por drag&drop, que no crea marcador)
    // nunca aparecía como carpeta navegable. Ademas, antes solo se comparaba la CANTIDAD
    // de segmentos del path, sin verificar que el objeto realmente estuviera dentro de la
    // carpeta actual (podía "matchear" algo de otra carpeta a la misma profundidad).
    const folderMap = new Map()
    const fileList = []

    for (const o of objects) {
      const key = o.objectKey
      if (!key || key === prefix || !key.startsWith(prefix)) continue

      const rest = key.slice(prefix.length)
      const slashIdx = rest.indexOf('/')

      if (slashIdx === -1) {
        // Sin más '/': es un archivo directo de esta carpeta
        if (o.size > 0) fileList.push(o)
      } else {
        // Tiene otro '/' más adelante: pertenece a una subcarpeta directa (con o sin marcador)
        const folderKey = prefix + rest.slice(0, slashIdx + 1)
        if (!folderMap.has(folderKey)) {
          folderMap.set(folderKey, { objectKey: folderKey, size: 0, lastModified: null })
        }
      }
    }

    folders.value = Array.from(folderMap.values())
    files.value = fileList
  } catch (err) {
    console.error('[ObsConsole] Error:', err)
    toast('Error al cargar OBS: ' + (err.message || 'Desconocido'), 'error')
  } finally {
    loading.value = false
  }
}

const navigateObs = (path) => { obsPath.value = path; loadObsFolder() }

const downloadObsFile = async (key) => {
  try {
    await obsServices.DownloadYGuardar(key)
    toast('Archivo descargado', 'success')
  }
  catch (err) { toast('Error al descargar', 'error') }
}

// Elimina un archivo o carpeta OBS sin pedir confirmacion (uso interno).
// Para carpetas usa EliminarObjeto (recursion del lado del servidor, una sola llamada)
// en vez de EliminarCarpetaRecursivo (recorria y borraba de a uno desde el navegador,
// y si algun item fallaba lo guardaba en un array de errores sin lanzar excepcion,
// asi que la carpeta quedaba parcialmente borrada pero igual se mostraba como exito).
const performDeleteObsKey = async (key) => {
  if (key.endsWith('/')) {
    await obsServices.EliminarObjeto(key)
  } else {
    await obsServices.EliminarArchivo(key)
  }
}

const deleteObsFile = async (key) => {
  const isFolder = key.endsWith('/')
  const label = isFolder ? key.split('/').filter(Boolean).pop() : key.split('/').pop()
  const confirmMsg = isFolder
    ? `¿Eliminar la carpeta "${label}" y TODO su contenido?`
    : `¿Eliminar ${label}?`
  if (!confirm(confirmMsg)) return
  try {
    await performDeleteObsKey(key)
    toast(isFolder ? 'Carpeta eliminada' : 'Archivo eliminado', 'success')
    loadObsFolder()
  } catch (err) { toast('Error al eliminar', 'error') }
}

// ===== BUSQUEDA POR TIPO (usa el service) =====
const searchByType = async (type) => {
  loading.value = true
  try {
    let results = []
    if (type === 'audio') results = await obsServices.BuscarAudio(obsPath.value)
    else if (type === 'video') results = await obsServices.BuscarVideo(obsPath.value)
    else if (type === 'image') results = await obsServices.BuscarImagenes(obsPath.value)
    searchResults.value = results
    searchActive.value = true
    toast(`${results.length} archivo(s) encontrados en esta carpeta`, 'success')
  } catch (err) {
    toast('Error al buscar: ' + (err.message || ''), 'error')
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchActive.value = false
  searchResults.value = []
}

// ===== RENOMBRAR / LINK / MOVER / INFO (funciones del service) =====
const renameKey = async (key) => {
  if (key.endsWith('/')) return toast('No se puede renombrar carpetas (el service no soporta rename recursivo)', 'warning')
  const currentName = key.split('/').pop()
  const nuevoNombre = prompt('Nuevo nombre:', currentName)
  if (!nuevoNombre || nuevoNombre === currentName) return
  try {
    await obsServices.Renombrar(key, nuevoNombre)
    toast('Renombrado correctamente', 'success')
    loadObsFolder()
  } catch (err) { toast('Error al renombrar: ' + (err.message || ''), 'error') }
}
const renameSelected = () => {
  const keys = getSelected()
  if (keys.length !== 1) return toast('Selecciona un solo archivo para renombrar', 'warning')
  renameKey(keys[0])
}

const generateLinkForKeys = async (keys) => {
  const valid = keys.filter(k => !k.endsWith('/'))
  if (valid.length === 0) return toast('Selecciona al menos un archivo', 'warning')
  try {
    if (valid.length === 1) {
      const url = await obsServices.GetLink(valid[0])
      await navigator.clipboard.writeText(url)
      toast('Link copiado al portapapeles', 'success')
    } else {
      const results = await obsServices.GetLinksMultiples(valid)
      const ok = results.filter(r => r.success)
      await navigator.clipboard.writeText(ok.map(r => r.url).join('\n'))
      toast(`${ok.length}/${valid.length} link(s) copiados al portapapeles`, 'success')
    }
  } catch (err) { toast('Error al generar link: ' + (err.message || ''), 'error') }
}
const generateLinkForKey = (key) => generateLinkForKeys([key])
const generateLinkSelected = () => generateLinkForKeys(getSelected())

const moveKeysToFolder = async (keys) => {
  const valid = keys.filter(k => !k.endsWith('/'))
  if (valid.length === 0) return toast('Selecciona archivos (no carpetas)', 'warning')
  const destino = prompt('Carpeta destino (ruta completa):', obsPath.value)
  if (!destino) return
  try {
    const results = await obsServices.MoverMultiples(valid, destino)
    const ok = results.filter(r => r.success).length
    toast(`${ok}/${valid.length} movido(s)`, ok === valid.length ? 'success' : 'warning')
    loadObsFolder()
  } catch (err) { toast('Error al mover: ' + (err.message || ''), 'error') }
}
const moveKeyToFolder = (key) => moveKeysToFolder([key])
const moveSelectedToFolder = () => moveKeysToFolder(getSelected())

const showInfoForKey = async (key) => {
  try {
    const info = await obsServices.GetObjectInfo(key)
    alert(
      `Archivo: ${info.objectKey}\n` +
      `Tipo: ${info.contentType}\n` +
      `Tamaño: ${obsServices.FormatSize(info.contentLength)}\n` +
      `Modificado: ${info.lastModified}\n` +
      `ETag: ${info.etag}`
    )
  } catch (err) { toast('Error al obtener informacion', 'error') }
}
const showInfoSelected = () => {
  const keys = getSelected()
  if (keys.length !== 1) return toast('Selecciona un solo archivo', 'warning')
  showInfoForKey(keys[0])
}

const newFolder = () => {
  const name = prompt('Nombre de la nueva carpeta:')
  if (!name) return
  obsServices.CrearCarpeta(obsPath.value + name + '/')
    .then(() => { toast('Carpeta creada', 'success'); loadObsFolder() })
    .catch(err => toast('Error: ' + (err.message || ''), 'error'))
}

const refreshObs = () => loadObsFolder()

// ===== BULK OPERATIONS (barra F3-F8) =====
const viewSelected = () => {
  const keys = getSelected()
  if (keys.length === 0) return
  downloadObsFile(keys[0])
}
const editSelected = () => { toast('Edicion no disponible', 'warning') }

// F5: ya no hay "otro panel" al cual copiar, asi que copiar = descargar a tu PC.
const downloadSelection = () => {
  const keys = getSelected().filter(k => !k.endsWith('/'))
  if (keys.length === 0) return toast('Selecciona archivos (no carpetas)', 'warning')
  keys.forEach(k => downloadObsFile(k))
}

const deleteSelection = async () => {
  const keys = getSelected()
  if (keys.length === 0) return toast('Selecciona archivos primero', 'warning')
  if (!confirm(`¿Eliminar ${keys.length} elemento(s)? Las carpetas se eliminan con todo su contenido.`)) return

  let ok = 0
  for (const k of keys) {
    try { await performDeleteObsKey(k); ok++ } catch { /* seguir con el resto */ }
  }
  loadObsFolder()
  toast(`${ok}/${keys.length} eliminado(s)`, ok === keys.length ? 'success' : 'warning')
}

// ===== UPLOAD (archivos sueltos, input multiple) =====
const handleUploadSelect = (e) => {
  const selectedFiles = Array.from(e.target.files || [])
  if (selectedFiles.length > 0) uploadToObs(selectedFiles)
  if (uploadInput.value) uploadInput.value.value = ''
}

// ===== UPLOAD (carpeta completa via input webkitdirectory) =====
const handleFolderUploadSelect = (e) => {
  const selectedFiles = Array.from(e.target.files || [])
  if (selectedFiles.length === 0) return
  const items = selectedFiles.map(f => ({ file: f, relativePath: f.webkitRelativePath || f.name }))
  uploadToObs(items)
  if (uploadFolderInput.value) uploadFolderInput.value.value = ''
}

// ===== UPLOAD (drag & drop desde el explorador, con soporte de carpetas) =====
const onObsDragLeave = (e) => {
  // dragleave se dispara tambien al pasar sobre hijos; solo apagamos si salimos del contenedor real
  if (e.currentTarget.contains(e.relatedTarget)) return
  isDraggingOverObs.value = false
}

// Recorre recursivamente un DataTransferItem (archivo o carpeta) preservando la ruta relativa
const readEntryContents = (entry) => {
  return new Promise((resolve) => {
    const contents = []
    let pending = 0
    let entryQueueDone = false

    const finishIfDone = () => {
      if (entryQueueDone && pending === 0) resolve(contents)
    }

    const walk = (node, path) => {
      if (node.isFile) {
        pending++
        node.file(
          (file) => { contents.push({ file, relativePath: path + node.name }); pending--; finishIfDone() },
          () => { pending--; finishIfDone() }
        )
      } else if (node.isDirectory) {
        pending++
        const reader = node.createReader()
        const readBatch = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) { pending--; finishIfDone(); return }
            entries.forEach(child => walk(child, path + node.name + '/'))
            readBatch()
          }, () => { pending--; finishIfDone() })
        }
        readBatch()
      }
    }

    walk(entry, '')
    entryQueueDone = true
    finishIfDone()
  })
}

const handleObsDrop = async (e) => {
  e.preventDefault()
  isDraggingOverObs.value = false

  const items = e.dataTransfer?.items
  const entries = items ? Array.from(items).map(it => it.webkitGetAsEntry?.()).filter(Boolean) : []

  if (entries.length > 0) {
    const groups = await Promise.all(entries.map(readEntryContents))
    const allFiles = groups.flat()
    if (allFiles.length === 0) return
    uploadToObs(allFiles)
    return
  }

  // Fallback (navegadores sin soporte de entries): archivos sueltos, sin carpetas
  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  if (droppedFiles.length > 0) uploadToObs(droppedFiles)
}

// ===== UPLOAD (nucleo compartido) =====
// items puede ser: File[] o { file, relativePath }[]
const uploadToObs = async (items) => {
  const normalized = items.map(it => (it instanceof File ? { file: it, relativePath: it.name } : it))

  uploading.value = true
  uploadProgress.value = 0
  uploadQueue.value = normalized.map((it, idx) => ({
    id: `${idx}_${it.file.name}`,
    name: it.relativePath,
    status: 'pending',
    progress: 0
  }))

  try {
    const archivos = normalized.map(it => ({ file: it.file, objectKey: obsPath.value + it.relativePath }))
    const results = await obsServices.SubirMultiples(archivos, {
      concurrency: 3,
      onFileProgress: (index, progress) => {
        const q = uploadQueue.value[index]
        if (q) { q.status = 'uploading'; q.progress = progress }
      },
      onTotalProgress: (p) => { uploadProgress.value = p }
    })

    results.forEach((r, idx) => {
      const q = uploadQueue.value[idx]
      if (q) q.status = r.success ? 'success' : 'error'
    })

    const okCount = results.filter(r => r.success).length
    const failCount = results.length - okCount
    if (failCount === 0) toast(`${okCount} archivo(s) subido(s)`, 'success')
    else toast(`${okCount} subido(s), ${failCount} con error`, 'warning')

    loadObsFolder()
  } catch (err) {
    toast('Error al subir: ' + (err.message || ''), 'error')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    setTimeout(() => { uploadQueue.value = [] }, 4000)
  }
}

onMounted(() => {
  loadObsFolder()
})
</script>

<style scoped>
.btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 24px; border-radius: 3px; border: none;
  background: transparent; cursor: pointer; transition: all 0.12s;
}
.btn-icon:hover { background: rgba(255,255,255,0.06); }
.page-content { padding: 0.5rem; }
</style>