import api from './api'

const obsServices = {}

/**
 * Configuracion del servicio OBS
 */
const OBS_CONFIG = {
  BASE_PATH: '/ObsCloud',
  MAX_DIRECT_UPLOAD_SIZE: 5 * 1024 * 1024 * 1024,
  MULTIPART_THRESHOLD: 100 * 1024 * 1024,
  PART_SIZE: 5 * 1024 * 1024,
  CONTENT_TYPES: {
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz']
  }
}

// Exportar configuracion
obsServices.CONFIG = OBS_CONFIG

// Listar objetos con prefijo opcional
obsServices.ListarObject = async function (prefix = '', options = {}) {
  const params = { prefix, ...options }
  return api.get('/ObsCloud/Listar', { params }).then(res => res.data)
}

// Listar objetos con paginacion completa (generador async)
obsServices.ListarObjectPaginado = async function* (prefix = '', maxKeys = 1000) {
  let marker = ''
  let hasMore = true

  while (hasMore) {
    const response = await obsServices.ListarObject(prefix, { marker, maxKeys })
    const objects = Array.isArray(response) ? response : response.objects || []

    for (const obj of objects) {
      yield obj
    }

    if (response.isTruncated && response.nextMarker) {
      marker = response.nextMarker
    } else {
      hasMore = false
    }
  }
}

// Listar solo carpetas (directorios) en una ruta
obsServices.ListarCarpetas = async function (prefix = '') {
  const objetos = await obsServices.ListarObject(prefix)
  return objetos.filter(obj => obj.objectKey && obj.objectKey.endsWith('/'))
}

// Listar solo archivos (no carpetas) en una ruta
obsServices.ListarArchivos = async function (prefix = '') {
  const objetos = await obsServices.ListarObject(prefix)
  return objetos.filter(obj => obj.objectKey && !obj.objectKey.endsWith('/'))
}

// Buscar archivos por extension
obsServices.BuscarPorExtension = async function (prefix = '', extensiones) {
  const exts = Array.isArray(extensiones) ? extensiones : [extensiones]
  const archivos = await obsServices.ListarArchivos(prefix)

  return archivos.filter(archivo => {
    const ext = archivo.objectKey.split('.').pop().toLowerCase()
    return exts.includes(ext)
  })
}

// Buscar archivos de audio
obsServices.BuscarAudio = async function (prefix = '') {
  return obsServices.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.audio)
}

// Buscar archivos de video
obsServices.BuscarVideo = async function (prefix = '') {
  return obsServices.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.video)
}

// Buscar archivos de imagen
obsServices.BuscarImagenes = async function (prefix = '') {
  return obsServices.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.image)
}

// Subir archivo
obsServices.SubirFiles = async function (formdata, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }

  if (options.onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      options.onProgress(percentCompleted)
    }
  }

  return api.post('/ObsCloud/Upload', formdata, config).then(res => res.data)
}

// Subir archivo con metadata personalizada
obsServices.SubirConMetadata = async function (file, objectKey, metadata = {}, options = {}) {
  const formdata = new FormData()
  formdata.append('file', file)
  formdata.append('filePath', objectKey)

  if (Object.keys(metadata).length > 0) {
    formdata.append('metadata', JSON.stringify(metadata))
  }

  return obsServices.SubirFiles(formdata, options)
}

// Subir multiples archivos en paralelo
obsServices.SubirMultiples = async function (archivos, options = {}) {
  const { concurrency = 3, onFileProgress, onTotalProgress } = options
  const results = []
  let completados = 0

  for (let i = 0; i < archivos.length; i += concurrency) {
    const batch = archivos.slice(i, i + concurrency)

    const batchPromises = batch.map(async ({ file, objectKey }, batchIndex) => {
      const formdata = new FormData()
      formdata.append('file', file)
      formdata.append('filePath', objectKey)

      try {
        const result = await obsServices.SubirFiles(formdata, {
          onProgress: (progress) => {
            if (onFileProgress) {
              onFileProgress(i + batchIndex, progress, file.name)
            }
          }
        })

        completados++
        if (onTotalProgress) {
          onTotalProgress(Math.round((completados / archivos.length) * 100))
        }

        return { success: true, objectKey, result }
      } catch (error) {
        completados++
        if (onTotalProgress) {
          onTotalProgress(Math.round((completados / archivos.length) * 100))
        }
        return { success: false, objectKey, error }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  return results
}

// Crear una carpeta (objeto vacio con '/' al final)
obsServices.CrearCarpeta = async function (folderPath) {
  const path = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
  const formdata = new FormData()
  const emptyBlob = new Blob([''], { type: 'application/x-directory' })
  formdata.append('file', emptyBlob, '.folder')
  formdata.append('filePath', path)

  return api.post('/ObsCloud/Upload', formdata, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data)
}

// Mover objeto
obsServices.Mover = async function (postData) {
  return api.post('/ObsCloud/Mover', postData).then(res => res.data)
}

// Eliminar archivo
obsServices.EliminarArchivo = async function (objectName) {
  return api.delete('/ObsCloud/Delete', { params: { objectName } }).then(res => res.data)
}

// Eliminar objeto (carpeta/directorio)
obsServices.EliminarObjeto = async function (objectKey) {
  return api.delete('/ObsCloud/EliminarObjeto', { params: { objectKey } }).then(res => res.data)
}

// Eliminar multiples archivos en batch
obsServices.EliminarMultiples = async function (objectKeys) {
  const promises = objectKeys.map(key =>
    obsServices.EliminarArchivo(key)
      .then(() => ({ success: true, objectKey: key }))
      .catch(error => ({ success: false, objectKey: key, error }))
  )
  return Promise.all(promises)
}

// Eliminar carpeta y todo su contenido recursivamente
obsServices.EliminarCarpetaRecursivo = async function (folderPath, onProgress = null) {
  const path = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
  const objetos = await obsServices.ListarObject(path)

  let deleted = 0
  const errors = []

  for (const obj of objetos) {
    try {
      if (obj.objectKey.endsWith('/')) {
        await obsServices.EliminarCarpetaRecursivo(obj.objectKey)
      } else {
        await obsServices.EliminarArchivo(obj.objectKey)
      }
      deleted++

      if (onProgress) {
        onProgress(deleted, objetos.length)
      }
    } catch (error) {
      errors.push({ objectKey: obj.objectKey, error })
    }
  }

  try {
    await obsServices.EliminarObjeto(path)
    deleted++
  } catch (error) {
    errors.push({ objectKey: path, error })
  }

  return { deleted, errors }
}

// Copiar objeto (sin eliminar el original)
obsServices.Copiar = async function (origen, destino) {
  return api.post('/ObsCloud/Copiar', { origen, destino }).then(res => res.data)
}

// Renombrar objeto
obsServices.Renombrar = async function (objectKey, nuevoNombre) {
  const partes = objectKey.split('/')
  partes[partes.length - 1] = nuevoNombre
  const nuevoObjectKey = partes.join('/')

  return obsServices.Mover({
    origen: objectKey,
    destino: nuevoObjectKey
  })
}

// Mover multiples archivos a una carpeta destino
obsServices.MoverMultiples = async function (objectKeys, carpetaDestino) {
  const destino = carpetaDestino.endsWith('/') ? carpetaDestino : `${carpetaDestino}/`

  const promises = objectKeys.map(key => {
    const nombreArchivo = key.split('/').pop()
    return obsServices.Mover({
      origen: key,
      destino: `${destino}${nombreArchivo}`
    })
      .then(() => ({ success: true, objectKey: key }))
      .catch(error => ({ success: false, objectKey: key, error }))
  })

  return Promise.all(promises)
}

// Descargar archivo
obsServices.Download = async function (objectName, options = {}) {
  const params = { objectName, ...options }
  return api.get('/ObsCloud/Download', {
    params,
    responseType: 'blob'
  }).then(res => res.data)
}

// Descargar archivo y guardarlo automaticamente
obsServices.DownloadYGuardar = async function (objectName, fileName = null) {
  const blob = await obsServices.Download(objectName)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || objectName.split('/').pop()
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Descargar rango de bytes (para streaming o descarga parcial)
obsServices.DownloadRango = async function (objectName, start, end) {
  return obsServices.Download(objectName, {
    range: `bytes=${start}-${end}`
  })
}

// Obtener URL de descarga directa (pre-firmada)
obsServices.GetDownloadUrl = async function (objectKey, expirationMinutes = 60) {
  return api.get('/ObsCloud/GenLink', {
    params: { objectKey, expiration: expirationMinutes }
  }).then(res => res.data)
}

// Generar link de acceso
obsServices.GetLink = async function (objectKey, expirationMinutes = 60) {
  return api.get('/ObsCloud/GenLink', {
    params: { objectKey, expiration: expirationMinutes }
  }).then(res => res.data)
}

// Generar links para multiples objetos
obsServices.GetLinksMultiples = async function (objectKeys, expirationMinutes = 60) {
  const promises = objectKeys.map(async key => {
    try {
      const url = await obsServices.GetLink(key, expirationMinutes)
      return { objectKey: key, url, success: true }
    } catch (error) {
      return { objectKey: key, url: null, success: false, error }
    }
  })

  return Promise.all(promises)
}

// Obtener musica API
obsServices.GetMusicApi = async function (listaRadioDescarga, marker = '') {
  return api.post('/ObsCloud/GetMusicApi', {
    listaRadioDescarga,
    marker
  }).then(res => res.data)
}

// Sincronizar radios desde OBS
obsServices.SincronizarRadios = async function () {
  return api.post('/ObsCloud/SincronizarRadios').then(res => res.data)
}

/**
 * Eliminar archivo y notificar a todos los clientes reproductores via SignalR
 * @param {string} objectKey - Clave del objeto a eliminar
 * @param {string} fileName - Nombre del archivo para mostrar
 * @param {string} radioId - ID de la radio (opcional, para notificacion especifica)
 * @param {Object} signalR - Instancia de useSignalRAuth (opcional)
 * @returns {Promise<*>}
 */
obsServices.EliminarArchivoYNotificar = async function (objectKey, fileName, radioId = null, signalR = null) {
  try {
    // 1. Eliminar el archivo del OBS
    const result = await api.delete('/ObsCloud/Delete', { params: { objectName: objectKey } }).then(res => res.data)

    // 2. Enviar notificacion por SignalR a todos los clientes (si se proporciona instancia)
    if (signalR && signalR.connected()) {
      try {
        const notificationData = {
          fileName: fileName,
          objectKey: objectKey,
          radioId: radioId,
          deletedAt: new Date().toISOString(),
          action: 'MusicFileDeleted'
        }

        // Enviar a todos los clientes conectados
        await signalR.sendMessageToAll(JSON.stringify({
          type: 'MusicFileDeleted',
          data: notificationData,
          message: `Archivo de musica eliminado: ${fileName}`
        }))

        console.log('[OBS] Notificacion de eliminacion enviada via SignalR:', notificationData)
      } catch (signalrError) {
        console.error('[OBS] Error al enviar notificacion SignalR:', signalrError)
        // No fallar la operacion completa si solo falla la notificacion
      }
    } else {
      console.warn('[OBS] SignalR no disponible. No se pudo enviar notificacion de eliminacion.')
    }

    return result
  } catch (error) {
    console.error('[OBS] Error al eliminar archivo:', error)
    throw error
  }
}

// ============================================================================
// OPERACIONES DE MUSICA (ESPECIFICAS DEL PROYECTO)
// ============================================================================

// Buscar archivos de musica en una carpeta de genero
obsServices.BuscarMusicaPorGenero = async function (codigoGenero) {
  const prefix = `musica/generos/${codigoGenero}/`
  return obsServices.BuscarAudio(prefix)
}

// Buscar archivos de musica en una carpeta de subgenero
obsServices.BuscarMusicaPorSubgenero = async function (codigoGenero, codigoSubgenero) {
  const prefix = `musica/generos/${codigoGenero}/${codigoSubgenero}/`
  return obsServices.BuscarAudio(prefix)
}

// ============================================================================
// UTILIDADES
// ============================================================================

// Obtener informacion de un objeto (metadatos)
obsServices.GetObjectInfo = async function (objectKey) {
  return api.get('/ObsCloud/ObjectInfo', {
    params: { objectKey }
  }).then(res => res.data)
}

// Verificar si un objeto existe
obsServices.ExisteObjeto = async function (objectKey) {
  try {
    await obsServices.GetObjectInfo(objectKey)
    return true
  } catch {
    return false
  }
}

// Obtener el tipo de contenido basado en la extension
obsServices.GetContentType = function (filename) {
  const ext = filename.split('.').pop().toLowerCase()

  const mimeTypes = {
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    // Video
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    webm: 'video/webm',
    // Imagen
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Documento
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    // Archivo
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed'
  }

  return mimeTypes[ext] || 'application/octet-stream'
}

// Formatear tamano de bytes a formato legible
obsServices.FormatSize = function (bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

// Obtener icono segun el tipo de archivo
obsServices.GetFileIcon = function (filename) {
  const ext = filename.split('.').pop().toLowerCase()

  if (OBS_CONFIG.CONTENT_TYPES.audio.includes(ext)) return 'fas fa-file-audio'
  if (OBS_CONFIG.CONTENT_TYPES.video.includes(ext)) return 'fas fa-file-video'
  if (OBS_CONFIG.CONTENT_TYPES.image.includes(ext)) return 'fas fa-file-image'
  if (ext === 'pdf') return 'fas fa-file-pdf'
  if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word'
  if (['xls', 'xlsx'].includes(ext)) return 'fas fa-file-excel'
  if (['ppt', 'pptx'].includes(ext)) return 'fas fa-file-powerpoint'
  if (OBS_CONFIG.CONTENT_TYPES.archive.includes(ext)) return 'fas fa-file-archive'
  if (ext === 'txt') return 'fas fa-file-alt'

  return 'fas fa-file'
}

// Obtener nombre de archivo de una ruta completa
obsServices.GetNombreArchivo = function (objectKey) {
  const parts = objectKey.split('/').filter(p => p)
  return parts[parts.length - 1] || objectKey
}

// Obtener la carpeta padre de un objeto
obsServices.GetCarpetaPadre = function (objectKey) {
  const parts = objectKey.split('/').filter(p => p)
  parts.pop()
  return parts.length > 0 ? parts.join('/') + '/' : ''
}

// Validar si el archivo es de un tipo permitido
obsServices.ValidarTipoArchivo = function (filename, allowedTypes) {
  const ext = filename.split('.').pop().toLowerCase()

  for (const type of allowedTypes) {
    if (OBS_CONFIG.CONTENT_TYPES[type]?.includes(ext)) {
      return true
    }
  }

  return false
}

// Validar tamano de archivo
obsServices.ValidarTamanoArchivo = function (size, maxSizeMB = 100) {
  const maxBytes = maxSizeMB * 1024 * 1024

  if (size > maxBytes) {
    return {
      valid: false,
      message: `El archivo excede el tamano maximo permitido de ${maxSizeMB}MB`
    }
  }

  return { valid: true, message: '' }
}

export default obsServices
