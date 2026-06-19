/**
 * OBS (Object Storage Service) API Services - Vanilla JavaScript
 * Basado en la API de Huawei Cloud OBS
 * @see https://support.huaweicloud.com/intl/en-us/api-obs/obs_04_0005.html
 *
 * Version vanilla JS sin dependencias externas (usa fetch nativo)
 *
 * Operaciones soportadas:
 * - Listar objetos (GET /)
 * - Subir objetos (PUT/POST)
 * - Descargar objetos (GET /ObjectName)
 * - Eliminar objetos (DELETE /ObjectName)
 * - Eliminar objetos en batch
 * - Copiar/Mover objetos
 * - Generar URLs firmadas
 * - Consultar metadatos
 */

/**
 * Configuracion del cliente HTTP vanilla
 */
const API_BASE_URL = 'https://api.clubf5.com/api/'
const API_TIMEOUT = 90000 // 90 segundos

/**
 * Helper: obtener token de autenticacion
 * @returns {string|null}
 */
function _getAuthToken() {
  return localStorage.getItem('token') || localStorage.access_token || null
}

/**
 * Helper: construir headers por defecto
 * @param {Object} extra - Headers adicionales
 * @returns {Headers}
 */
function _buildHeaders(extra = {}) {
  const headers = new Headers()
  const token = _getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      headers.set(key, value)
    }
  })
  return headers
}

/**
 * Helper: construir query string desde objeto de params
 * @param {Object} params
 * @returns {string}
 */
function _buildQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
}

/**
 * Helper: fetch con timeout usando AbortController
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeout
 * @returns {Promise<Response>}
 */
async function _fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.body = errorBody
      throw error
    }

    return response
  } catch (err) {
    clearTimeout(id)
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw err
  }
}

/**
 * Cliente HTTP vanilla (reemplaza axios)
 */
const http = {
  /**
   * GET request
   * @param {string} path - Ruta relativa
   * @param {Object} options - { params, responseType, headers }
   * @returns {Promise<*>}
   */
  async get(path, options = {}) {
    const { params, responseType, headers: extraHeaders } = options
    const url = API_BASE_URL + path.replace(/^\//, '') + _buildQuery(params)
    const headers = _buildHeaders({ 'Content-Type': 'application/json', ...extraHeaders })

    const response = await _fetchWithTimeout(url, { method: 'GET', headers })

    if (responseType === 'blob') {
      return response.blob()
    }

    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  },

  /**
   * POST request
   * @param {string} path - Ruta relativa
   * @param {*} body - Cuerpo de la peticion
   * @param {Object} options - { headers, onUploadProgress }
   * @returns {Promise<*>}
   */
  async post(path, body = null, options = {}) {
    const { headers: extraHeaders, onUploadProgress } = options
    const url = API_BASE_URL + path.replace(/^\//, '')

    const isFormData = body instanceof FormData

    // Si hay callback de progreso y es FormData, usar XMLHttpRequest
    if (onUploadProgress && isFormData) {
      return _xhrUpload('POST', url, body, onUploadProgress)
    }

    const headers = _buildHeaders(
      isFormData
        ? { ...extraHeaders } // No establecer Content-Type para FormData (el browser lo hace)
        : { 'Content-Type': 'application/json', ...extraHeaders }
    )

    // Eliminar Content-Type para FormData si se establecio
    if (isFormData) {
      headers.delete('Content-Type')
    }

    const fetchBody = isFormData ? body : (body ? JSON.stringify(body) : undefined)

    const response = await _fetchWithTimeout(url, { method: 'POST', headers, body: fetchBody })

    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  },

  /**
   * DELETE request
   * @param {string} path - Ruta relativa
   * @param {Object} options - { params, headers }
   * @returns {Promise<*>}
   */
  async delete(path, options = {}) {
    const { params, headers: extraHeaders } = options
    const url = API_BASE_URL + path.replace(/^\//, '') + _buildQuery(params)
    const headers = _buildHeaders({ 'Content-Type': 'application/json', ...extraHeaders })

    const response = await _fetchWithTimeout(url, { method: 'DELETE', headers })

    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
}

/**
 * Helper: Upload con XMLHttpRequest para tracking de progreso
 * @param {string} method - Metodo HTTP
 * @param {string} url - URL completa
 * @param {FormData} formData - Datos del formulario
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<*>}
 */
function _xhrUpload(method, url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    // Establecer token de autorizacion
    const token = _getAuthToken()
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    // Timeout
    xhr.timeout = API_TIMEOUT

    // Tracking de progreso
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let data
        try {
          data = JSON.parse(xhr.responseText)
        } catch {
          data = xhr.responseText
        }
        resolve(data)
      } else {
        const error = new Error(`HTTP ${xhr.status}: ${xhr.statusText}`)
        error.status = xhr.status
        error.body = xhr.responseText
        reject(error)
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error')))
    xhr.addEventListener('timeout', () => reject(new Error(`Request timeout after ${API_TIMEOUT}ms`)))
    xhr.addEventListener('abort', () => reject(new Error('Request aborted')))

    xhr.send(formData)
  })
}

// ============================================================================
// CONFIGURACION OBS
// ============================================================================

/**
 * Configuracion del servicio OBS
 */
const OBS_CONFIG = {
  BASE_PATH: 'ObsCloud',
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

// ============================================================================
// SERVICIO OBS API
// ============================================================================

/**
 * Servicio de OBS API (Vanilla JS)
 */
const obsServicesApi = {}

// ============================================================================
// OPERACIONES DE LISTADO
// ============================================================================

/**
 * Listar objetos en un bucket con prefijo opcional
 * @param {string} prefix - Prefijo para filtrar objetos (carpeta)
 * @param {Object} options - Opciones adicionales
 * @param {string} options.marker - Marcador para paginacion
 * @param {number} options.maxKeys - Maximo de objetos a retornar (default: 1000)
 * @param {string} options.delimiter - Delimitador para agrupar (default: '/')
 * @returns {Promise<Array>} Lista de objetos
 */
obsServicesApi.ListarObject = async function (prefix, options) {
  if (prefix === undefined) prefix = ''
  if (options === undefined) options = {}

  var params = { prefix: prefix }
  Object.keys(options).forEach(function (key) {
    params[key] = options[key]
  })

  return http.get(OBS_CONFIG.BASE_PATH + '/Listar', { params: params })
}

/**
 * Listar objetos con paginacion completa
 * @param {string} prefix - Prefijo para filtrar
 * @param {number} maxKeys - Maximo de objetos por pagina
 * @returns {Promise<Array>} Todos los objetos paginados
 */
obsServicesApi.ListarObjectPaginado = async function (prefix, maxKeys) {
  if (prefix === undefined) prefix = ''
  if (maxKeys === undefined) maxKeys = 1000

  var allObjects = []
  var marker = ''
  var hasMore = true

  while (hasMore) {
    var response = await obsServicesApi.ListarObject(prefix, { marker: marker, maxKeys: maxKeys })
    var objects = Array.isArray(response) ? response : (response.objects || [])

    for (var i = 0; i < objects.length; i++) {
      allObjects.push(objects[i])
    }

    if (response.isTruncated && response.nextMarker) {
      marker = response.nextMarker
    } else {
      hasMore = false
    }
  }

  return allObjects
}

/**
 * Listar solo carpetas (directorios) en una ruta
 * @param {string} prefix - Prefijo/ruta
 * @returns {Promise<Array>} Lista de carpetas
 */
obsServicesApi.ListarCarpetas = async function (prefix) {
  if (prefix === undefined) prefix = ''
  var objetos = await obsServicesApi.ListarObject(prefix)
  return objetos.filter(function (obj) {
    return obj.objectKey && obj.objectKey.endsWith('/')
  })
}

/**
 * Listar solo archivos (no carpetas) en una ruta
 * @param {string} prefix - Prefijo/ruta
 * @returns {Promise<Array>} Lista de archivos
 */
obsServicesApi.ListarArchivos = async function (prefix) {
  if (prefix === undefined) prefix = ''
  var objetos = await obsServicesApi.ListarObject(prefix)
  return objetos.filter(function (obj) {
    return obj.objectKey && !obj.objectKey.endsWith('/')
  })
}

/**
 * Buscar archivos por extension
 * @param {string} prefix - Prefijo/ruta
 * @param {string|Array<string>} extensiones - Extension(es) a buscar
 * @returns {Promise<Array>} Lista de archivos filtrados
 */
obsServicesApi.BuscarPorExtension = async function (prefix, extensiones) {
  if (prefix === undefined) prefix = ''
  var exts = Array.isArray(extensiones) ? extensiones : [extensiones]
  var archivos = await obsServicesApi.ListarArchivos(prefix)

  return archivos.filter(function (archivo) {
    var partes = archivo.objectKey.split('.')
    var ext = partes[partes.length - 1].toLowerCase()
    return exts.indexOf(ext) !== -1
  })
}

/**
 * Buscar archivos de audio
 * @param {string} prefix - Prefijo/ruta
 * @returns {Promise<Array>} Lista de archivos de audio
 */
obsServicesApi.BuscarAudio = async function (prefix) {
  if (prefix === undefined) prefix = ''
  return obsServicesApi.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.audio)
}

/**
 * Buscar archivos de video
 * @param {string} prefix - Prefijo/ruta
 * @returns {Promise<Array>} Lista de archivos de video
 */
obsServicesApi.BuscarVideo = async function (prefix) {
  if (prefix === undefined) prefix = ''
  return obsServicesApi.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.video)
}

/**
 * Buscar archivos de imagen
 * @param {string} prefix - Prefijo/ruta
 * @returns {Promise<Array>} Lista de archivos de imagen
 */
obsServicesApi.BuscarImagenes = async function (prefix) {
  if (prefix === undefined) prefix = ''
  return obsServicesApi.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.image)
}

// ============================================================================
// OPERACIONES DE UPLOAD
// ============================================================================

/**
 * Subir archivo(s) al OBS
 * @param {FormData} formdata - FormData con archivo y ruta
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.onProgress - Callback de progreso (0-100)
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.SubirFiles = async function (formdata, options) {
  if (options === undefined) options = {}

  var config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }

  if (options.onProgress) {
    config.onUploadProgress = function (progressEvent) {
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      options.onProgress(percentCompleted)
    }
  }

  return http.post(OBS_CONFIG.BASE_PATH + '/Upload', formdata, config)
}

/**
 * Subir archivo con metadata personalizada
 * @param {File} file - Archivo a subir
 * @param {string} objectKey - Ruta/nombre del objeto en OBS
 * @param {Object} metadata - Metadata personalizada
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.SubirConMetadata = async function (file, objectKey, metadata, options) {
  if (metadata === undefined) metadata = {}
  if (options === undefined) options = {}

  var formdata = new FormData()
  formdata.append('file', file)
  formdata.append('filePath', objectKey)

  if (Object.keys(metadata).length > 0) {
    formdata.append('metadata', JSON.stringify(metadata))
  }

  return obsServicesApi.SubirFiles(formdata, options)
}

/**
 * Subir multiples archivos en paralelo
 * @param {Array<{file: File, objectKey: string}>} archivos - Lista de archivos
 * @param {Object} options - Opciones
 * @param {number} options.concurrency - Concurrencia maxima (default: 3)
 * @param {Function} options.onFileProgress - Callback por archivo
 * @param {Function} options.onTotalProgress - Callback de progreso total
 * @returns {Promise<Array>} Resultados de cada upload
 */
obsServicesApi.SubirMultiples = async function (archivos, options) {
  if (options === undefined) options = {}
  var concurrency = options.concurrency || 3
  var onFileProgress = options.onFileProgress
  var onTotalProgress = options.onTotalProgress

  var results = []
  var completados = 0

  for (var i = 0; i < archivos.length; i += concurrency) {
    var batch = archivos.slice(i, i + concurrency)

    var batchPromises = batch.map(function (item, batchIndex) {
      var file = item.file
      var objectKey = item.objectKey
      var globalIndex = i + batchIndex

      var formdata = new FormData()
      formdata.append('file', file)
      formdata.append('filePath', objectKey)

      return obsServicesApi.SubirFiles(formdata, {
        onProgress: function (progress) {
          if (onFileProgress) {
            onFileProgress(globalIndex, progress, file.name)
          }
        }
      })
        .then(function (result) {
          completados++
          if (onTotalProgress) {
            onTotalProgress(Math.round((completados / archivos.length) * 100))
          }
          return { success: true, objectKey: objectKey, result: result }
        })
        .catch(function (error) {
          completados++
          if (onTotalProgress) {
            onTotalProgress(Math.round((completados / archivos.length) * 100))
          }
          return { success: false, objectKey: objectKey, error: error }
        })
    })

    var batchResults = await Promise.all(batchPromises)
    results = results.concat(batchResults)
  }

  return results
}

/**
 * Crear una carpeta (objeto vacio con '/' al final)
 * @param {string} folderPath - Ruta de la carpeta
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.CrearCarpeta = async function (folderPath) {
  var path = folderPath.endsWith('/') ? folderPath : (folderPath + '/')

  var formdata = new FormData()
  var emptyBlob = new Blob([''], { type: 'application/x-directory' })
  formdata.append('file', emptyBlob, '.folder')
  formdata.append('filePath', path)

  return http.post(OBS_CONFIG.BASE_PATH + '/Upload', formdata, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ============================================================================
// OPERACIONES DE DESCARGA
// ============================================================================

/**
 * Descargar archivo del OBS
 * @param {string} objectName - Nombre/ruta del objeto
 * @param {Object} options - Opciones de descarga
 * @param {string} options.range - Rango de bytes (ej: 'bytes=0-1023')
 * @param {string} options.versionId - ID de version especifica
 * @returns {Promise<Blob>} Blob del archivo
 */
obsServicesApi.Download = async function (objectName, options) {
  if (options === undefined) options = {}
  var params = { objectName: objectName }
  Object.keys(options).forEach(function (key) {
    params[key] = options[key]
  })

  return http.get(OBS_CONFIG.BASE_PATH + '/Download', {
    params: params,
    responseType: 'blob'
  })
}

/**
 * Descargar archivo y guardarlo automaticamente
 * @param {string} objectName - Nombre/ruta del objeto
 * @param {string} fileName - Nombre para guardar (opcional)
 * @returns {Promise<void>}
 */
obsServicesApi.DownloadYGuardar = async function (objectName, fileName) {
  if (fileName === undefined) fileName = null

  var blob = await obsServicesApi.Download(objectName)
  var url = window.URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.href = url
  a.download = fileName || objectName.split('/').pop()
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Obtener URL de descarga directa (pre-firmada)
 * @param {string} objectKey - Clave del objeto
 * @param {number} expirationMinutes - Minutos de validez (default: 60)
 * @returns {Promise<string>} URL firmada
 */
obsServicesApi.GetDownloadUrl = async function (objectKey, expirationMinutes) {
  if (expirationMinutes === undefined) expirationMinutes = 60

  return http.get(OBS_CONFIG.BASE_PATH + '/GenLink', {
    params: { objectKey: objectKey, expiration: expirationMinutes }
  })
}

/**
 * Descargar rango de bytes (para streaming o descarga parcial)
 * @param {string} objectName - Nombre del objeto
 * @param {number} start - Byte inicial
 * @param {number} end - Byte final
 * @returns {Promise<Blob>} Blob parcial
 */
obsServicesApi.DownloadRango = async function (objectName, start, end) {
  return obsServicesApi.Download(objectName, {
    range: 'bytes=' + start + '-' + end
  })
}

// ============================================================================
// OPERACIONES DE ELIMINACION
// ============================================================================

/**
 * Eliminar un archivo del OBS
 * @param {string} objectName - Nombre/ruta del objeto
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.EliminarArchivo = async function (objectName) {
  return http.delete(OBS_CONFIG.BASE_PATH + '/Delete', {
    params: { objectName: objectName }
  })
}

/**
 * Eliminar un objeto (carpeta/directorio) y su contenido
 * @param {string} objectKey - Clave del objeto/carpeta
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.EliminarObjeto = async function (objectKey) {
  return http.delete(OBS_CONFIG.BASE_PATH + '/EliminarObjeto', {
    params: { objectKey: objectKey }
  })
}

/**
 * Eliminar multiples archivos en batch
 * @param {Array<string>} objectKeys - Lista de claves de objetos
 * @returns {Promise<Array>} Resultados de cada eliminacion
 */
obsServicesApi.EliminarMultiples = async function (objectKeys) {
  var promises = objectKeys.map(function (key) {
    return obsServicesApi.EliminarArchivo(key)
      .then(function () { return { success: true, objectKey: key } })
      .catch(function (error) { return { success: false, objectKey: key, error: error } })
  })
  return Promise.all(promises)
}

/**
 * Eliminar carpeta y todo su contenido recursivamente
 * @param {string} folderPath - Ruta de la carpeta
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<{deleted: number, errors: Array}>}
 */
obsServicesApi.EliminarCarpetaRecursivo = async function (folderPath, onProgress) {
  if (onProgress === undefined) onProgress = null

  var path = folderPath.endsWith('/') ? folderPath : (folderPath + '/')
  var objetos = await obsServicesApi.ListarObject(path)

  var deleted = 0
  var errors = []

  for (var i = 0; i < objetos.length; i++) {
    var obj = objetos[i]
    try {
      if (obj.objectKey.endsWith('/')) {
        await obsServicesApi.EliminarCarpetaRecursivo(obj.objectKey)
      } else {
        await obsServicesApi.EliminarArchivo(obj.objectKey)
      }
      deleted++

      if (onProgress) {
        onProgress(deleted, objetos.length)
      }
    } catch (error) {
      errors.push({ objectKey: obj.objectKey, error: error })
    }
  }

  try {
    await obsServicesApi.EliminarObjeto(path)
    deleted++
  } catch (error) {
    errors.push({ objectKey: path, error: error })
  }

  return { deleted: deleted, errors: errors }
}

/**
 * Eliminar archivo y notificar a clientes via SignalR
 * @param {string} objectKey - Clave del objeto
 * @param {string} fileName - Nombre del archivo
 * @param {string} radioId - ID de la radio (opcional)
 * @param {Object} signalR - Instancia de SignalR (opcional)
 * @returns {Promise<*>}
 */
obsServicesApi.EliminarArchivoYNotificar = async function (objectKey, fileName, radioId, signalR) {
  if (radioId === undefined) radioId = null
  if (signalR === undefined) signalR = null

  try {
    var result = await http.delete(OBS_CONFIG.BASE_PATH + '/Delete', {
      params: { objectName: objectKey }
    })

    if (signalR && signalR.connected()) {
      try {
        var notificationData = {
          fileName: fileName,
          objectKey: objectKey,
          radioId: radioId,
          deletedAt: new Date().toISOString(),
          action: 'MusicFileDeleted'
        }

        await signalR.sendMessageToAll(JSON.stringify({
          type: 'MusicFileDeleted',
          data: notificationData,
          message: 'Archivo de musica eliminado: ' + fileName
        }))

        console.log('[OBS API] Notificacion de eliminacion enviada via SignalR:', notificationData)
      } catch (signalrError) {
        console.error('[OBS API] Error al enviar notificacion SignalR:', signalrError)
      }
    } else {
      console.warn('[OBS API] SignalR no disponible para notificacion')
    }

    return result
  } catch (error) {
    console.error('[OBS API] Error al eliminar archivo:', error)
    throw error
  }
}

// ============================================================================
// OPERACIONES DE COPIA/MOVIMIENTO
// ============================================================================

/**
 * Mover objeto a nueva ubicacion
 * @param {Object} postData - Datos de movimiento
 * @param {string} postData.origen - Ruta origen
 * @param {string} postData.destino - Ruta destino
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.Mover = async function (postData) {
  return http.post(OBS_CONFIG.BASE_PATH + '/Mover', postData)
}

/**
 * Copiar objeto (sin eliminar el original)
 * @param {string} origen - Ruta origen
 * @param {string} destino - Ruta destino
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.Copiar = async function (origen, destino) {
  return http.post(OBS_CONFIG.BASE_PATH + '/Copiar', { origen: origen, destino: destino })
}

/**
 * Renombrar objeto
 * @param {string} objectKey - Clave actual del objeto
 * @param {string} nuevoNombre - Nuevo nombre (solo nombre, no ruta completa)
 * @returns {Promise<*>} Resultado de la operacion
 */
obsServicesApi.Renombrar = async function (objectKey, nuevoNombre) {
  var partes = objectKey.split('/')
  partes[partes.length - 1] = nuevoNombre
  var nuevoObjectKey = partes.join('/')

  return obsServicesApi.Mover({
    origen: objectKey,
    destino: nuevoObjectKey
  })
}

/**
 * Mover multiples archivos a una carpeta destino
 * @param {Array<string>} objectKeys - Lista de claves de objetos
 * @param {string} carpetaDestino - Carpeta destino
 * @returns {Promise<Array>} Resultados de cada movimiento
 */
obsServicesApi.MoverMultiples = async function (objectKeys, carpetaDestino) {
  var destino = carpetaDestino.endsWith('/') ? carpetaDestino : (carpetaDestino + '/')

  var promises = objectKeys.map(function (key) {
    var nombreArchivo = key.split('/').pop()
    return obsServicesApi.Mover({
      origen: key,
      destino: destino + nombreArchivo
    })
      .then(function () { return { success: true, objectKey: key } })
      .catch(function (error) { return { success: false, objectKey: key, error: error } })
  })

  return Promise.all(promises)
}

// ============================================================================
// OPERACIONES DE LINKS Y URLS
// ============================================================================

/**
 * Generar link de acceso temporal (URL firmada)
 * @param {string} objectKey - Clave del objeto
 * @param {number} expirationMinutes - Minutos de validez
 * @returns {Promise<string>} URL firmada
 */
obsServicesApi.GetLink = async function (objectKey, expirationMinutes) {
  if (expirationMinutes === undefined) expirationMinutes = 60

  return http.get(OBS_CONFIG.BASE_PATH + '/GenLink', {
    params: { objectKey: objectKey, expiration: expirationMinutes }
  })
}

/**
 * Generar links para multiples objetos
 * @param {Array<string>} objectKeys - Lista de claves
 * @param {number} expirationMinutes - Minutos de validez
 * @returns {Promise<Array<{objectKey: string, url: string}>>}
 */
obsServicesApi.GetLinksMultiples = async function (objectKeys, expirationMinutes) {
  if (expirationMinutes === undefined) expirationMinutes = 60

  var promises = objectKeys.map(function (key) {
    return obsServicesApi.GetLink(key, expirationMinutes)
      .then(function (url) {
        return { objectKey: key, url: url, success: true }
      })
      .catch(function (error) {
        return { objectKey: key, url: null, success: false, error: error }
      })
  })

  return Promise.all(promises)
}

// ============================================================================
// OPERACIONES DE MUSICA (ESPECIFICAS DEL PROYECTO)
// ============================================================================

/**
 * Obtener musica desde API
 * @param {Object} listaRadioDescarga - Lista de radios para descarga
 * @param {string} marker - Marcador de paginacion
 * @returns {Promise<*>} Datos de musica
 */
obsServicesApi.GetMusicApi = async function (listaRadioDescarga, marker) {
  if (marker === undefined) marker = ''

  return http.post(OBS_CONFIG.BASE_PATH + '/GetMusicApi', {
    listaRadioDescarga: listaRadioDescarga,
    marker: marker
  })
}

/**
 * Sincronizar radios desde OBS
 * @returns {Promise<*>} Resultado de sincronizacion
 */
obsServicesApi.SincronizarRadios = async function () {
  return http.post(OBS_CONFIG.BASE_PATH + '/SincronizarRadios')
}

/**
 * Buscar archivos de musica en una carpeta de genero
 * @param {string} codigoGenero - Codigo del genero musical
 * @returns {Promise<Array>} Lista de archivos de audio
 */
obsServicesApi.BuscarMusicaPorGenero = async function (codigoGenero) {
  var prefix = 'musica/generos/' + codigoGenero + '/'
  return obsServicesApi.BuscarAudio(prefix)
}

/**
 * Buscar archivos de musica en una carpeta de subgenero
 * @param {string} codigoGenero - Codigo del genero musical
 * @param {string} codigoSubgenero - Codigo del subgenero
 * @returns {Promise<Array>} Lista de archivos de audio
 */
obsServicesApi.BuscarMusicaPorSubgenero = async function (codigoGenero, codigoSubgenero) {
  var prefix = 'musica/generos/' + codigoGenero + '/' + codigoSubgenero + '/'
  return obsServicesApi.BuscarAudio(prefix)
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtener informacion de un objeto (metadatos)
 * @param {string} objectKey - Clave del objeto
 * @returns {Promise<Object>} Metadatos del objeto
 */
obsServicesApi.GetObjectInfo = async function (objectKey) {
  return http.get(OBS_CONFIG.BASE_PATH + '/ObjectInfo', {
    params: { objectKey: objectKey }
  })
}

/**
 * Verificar si un objeto existe
 * @param {string} objectKey - Clave del objeto
 * @returns {Promise<boolean>}
 */
obsServicesApi.ExisteObjeto = async function (objectKey) {
  try {
    await obsServicesApi.GetObjectInfo(objectKey)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Obtener el tipo de contenido basado en la extension
 * @param {string} filename - Nombre del archivo
 * @returns {string} Tipo de contenido
 */
obsServicesApi.GetContentType = function (filename) {
  var partes = filename.split('.')
  var ext = partes[partes.length - 1].toLowerCase()

  var mimeTypes = {
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

/**
 * Formatear tamano de bytes a formato legible
 * @param {number} bytes - Tamano en bytes
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Tamano formateado
 */
obsServicesApi.FormatSize = function (bytes, decimals) {
  if (decimals === undefined) decimals = 2
  if (!bytes || bytes === 0) return '0 B'

  var k = 1024
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  var i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * Obtener icono segun el tipo de archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Clase CSS del icono
 */
obsServicesApi.GetFileIcon = function (filename) {
  var partes = filename.split('.')
  var ext = partes[partes.length - 1].toLowerCase()

  if (OBS_CONFIG.CONTENT_TYPES.audio.indexOf(ext) !== -1) return 'fas fa-file-audio'
  if (OBS_CONFIG.CONTENT_TYPES.video.indexOf(ext) !== -1) return 'fas fa-file-video'
  if (OBS_CONFIG.CONTENT_TYPES.image.indexOf(ext) !== -1) return 'fas fa-file-image'
  if (ext === 'pdf') return 'fas fa-file-pdf'
  if (['doc', 'docx'].indexOf(ext) !== -1) return 'fas fa-file-word'
  if (['xls', 'xlsx'].indexOf(ext) !== -1) return 'fas fa-file-excel'
  if (['ppt', 'pptx'].indexOf(ext) !== -1) return 'fas fa-file-powerpoint'
  if (OBS_CONFIG.CONTENT_TYPES.archive.indexOf(ext) !== -1) return 'fas fa-file-archive'
  if (ext === 'txt') return 'fas fa-file-alt'

  return 'fas fa-file'
}

/**
 * Obtener nombre de archivo de una ruta completa
 * @param {string} objectKey - Clave del objeto
 * @returns {string} Nombre del archivo
 */
obsServicesApi.GetNombreArchivo = function (objectKey) {
  var parts = objectKey.split('/').filter(function (p) { return p })
  return parts[parts.length - 1] || objectKey
}

/**
 * Obtener la carpeta padre de un objeto
 * @param {string} objectKey - Clave del objeto
 * @returns {string} Ruta de la carpeta padre
 */
obsServicesApi.GetCarpetaPadre = function (objectKey) {
  var parts = objectKey.split('/').filter(function (p) { return p })
  parts.pop()
  return parts.length > 0 ? parts.join('/') + '/' : ''
}

/**
 * Validar si el archivo es de un tipo permitido
 * @param {string} filename - Nombre del archivo
 * @param {Array<string>} allowedTypes - Tipos permitidos (ej: ['audio', 'video'])
 * @returns {boolean}
 */
obsServicesApi.ValidarTipoArchivo = function (filename, allowedTypes) {
  var partes = filename.split('.')
  var ext = partes[partes.length - 1].toLowerCase()

  for (var i = 0; i < allowedTypes.length; i++) {
    var type = allowedTypes[i]
    if (OBS_CONFIG.CONTENT_TYPES[type] && OBS_CONFIG.CONTENT_TYPES[type].indexOf(ext) !== -1) {
      return true
    }
  }

  return false
}

/**
 * Validar tamano de archivo
 * @param {number} size - Tamano en bytes
 * @param {number} maxSizeMB - Tamano maximo en MB
 * @returns {{valid: boolean, message: string}}
 */
obsServicesApi.ValidarTamanoArchivo = function (size, maxSizeMB) {
  if (maxSizeMB === undefined) maxSizeMB = 100
  var maxBytes = maxSizeMB * 1024 * 1024

  if (size > maxBytes) {
    return {
      valid: false,
      message: 'El archivo excede el tamano maximo permitido de ' + maxSizeMB + 'MB'
    }
  }

  return { valid: true, message: '' }
}

// Exportar configuracion para uso externo
obsServicesApi.CONFIG = OBS_CONFIG

// Compatibilidad: exportar como modulo ES si es posible, sino como global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = obsServicesApi
} else if (typeof window !== 'undefined') {
  window.obsServicesApi = obsServicesApi
}
