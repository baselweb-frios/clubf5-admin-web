/**
 * OBS (Object Storage Service) API Services - Usando SDK de Huawei OBS
 * @see https://support.huaweicloud.com/intl/en-us/sdk-browserjs-devg-obs/obs_24_0001.html
 *
 * Este servicio usa el SDK de Huawei OBS directamente desde el navegador,
 * liberando recursos del backend API.
 *
 * Requiere:
 * - SDK: esdk-obs-browserjs.min.js (cargado globalmente en index.html)
 * - Endpoint del backend: /ObsCloud/GetTemporaryCredentials para obtener tokens STS
 */

import api from './api'

// El SDK de OBS se carga globalmente desde index.html
// y está disponible como window.ObsClient
const ObsClient = window.ObsClient

// Validar que el SDK esté cargado
if (!ObsClient) {
  console.error('[OBS SDK] El SDK de Huawei OBS no está cargado. Asegúrate de incluir <script src="/esdk-obs-browserjs.min.js"></script> en index.html')
}

/**
 * Configuracion del servicio OBS
 */
const OBS_CONFIG = {
  // Endpoint OBS desde .env
  ENDPOINT:import.meta.env.VITE_PATH_OBS,
  BUCKET: 'clubf5oficial',
  // Tiempo de cache de credenciales temporales (en minutos)
  CREDENTIALS_CACHE_TIME: 50,
  // Rutas del backend para operaciones que aún requieren backend
  BACKEND_PATH: '/ObsCloud',
  // Tamanos y limites
  MAX_DIRECT_UPLOAD_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
  MULTIPART_THRESHOLD: 100 * 1024 * 1024, // 100MB
  PART_SIZE: 5 * 1024 * 1024, // 5MB
  // Tipos de contenido
  CONTENT_TYPES: {
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz']
  }
}

/**
 * Cache de credenciales temporales
 */
let credentialsCache = {
  credentials: null,
  expiresAt: null,
  obsClient: null
}

/**
 * Estado del modo de operación
 * - 'sdk': Usar SDK directamente (requiere endpoint de credenciales)
 * - 'backend': Usar API del backend (fallback)
 */
let operationMode = 'sdk' // Intentar SDK primero, fallback a backend

// Log de configuración al iniciar
console.log('[OBS Config] ENDPOINT:', OBS_CONFIG.ENDPOINT)
console.log('[OBS Config] BUCKET:', OBS_CONFIG.BUCKET)
console.log('[OBS Config] BACKEND_PATH:', OBS_CONFIG.BACKEND_PATH)
console.log('[OBS Config] SDK disponible:', !!ObsClient)
console.log('[OBS Config] Modo de operación inicial:', operationMode)

/**
 * Servicio de OBS API
 */
const obsServicesApi = {}

// ============================================================================
// GESTION DE CREDENCIALES Y CLIENTE OBS
// ============================================================================

/**
 * Obtener credenciales temporales del backend (STS tokens)
 *
 * IMPORTANTE: Necesitas implementar este endpoint en tu backend:
 *
 * Endpoint: POST /ObsCloud/GetTemporaryCredentials
 * Respuesta esperada:
 * {
 *   accessKeyId: "AKIAIOSFODNN7EXAMPLE",
 *   secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
 *   securityToken: "FwoGZXIvYXdzEBYaDH...",
 *   expiresIn: 3600  // segundos
 * }
 *
 * Implementación sugerida en .NET:
 * ```csharp
 * [HttpPost("GetTemporaryCredentials")]
 * public async Task<IActionResult> GetTemporaryCredentials()
 * {
 *     // Usa el SDK de Huawei para generar credenciales temporales (STS)
 *     var stsClient = new ObsClient(accessKey, secretKey, endpoint);
 *     var temporaryCredentials = await stsClient.CreateTemporaryCredentials(3600);
 *     return Ok(temporaryCredentials);
 * }
 * ```
 */
async function getTemporaryCredentials() {
  // Verificar si las credenciales cacheadas aún son válidas
  if (credentialsCache.credentials && credentialsCache.expiresAt) {
    const now = new Date().getTime()
    const timeUntilExpiry = credentialsCache.expiresAt - now

    // Renovar si quedan menos de 5 minutos
    if (timeUntilExpiry > 5 * 60 * 1000) {
      console.log('[OBS SDK] Usando credenciales cacheadas')
      return credentialsCache.credentials
    }
  }

  console.log('[OBS SDK] Obteniendo nuevas credenciales temporales...')

  try {
    const response = await api.post(`${OBS_CONFIG.BACKEND_PATH}/GetTemporaryCredentials`)
    const credentials = response.data

    // Cachear credenciales
    credentialsCache.credentials = credentials
    credentialsCache.expiresAt = new Date().getTime() + (credentials.expiresIn || 3600) * 1000
    credentialsCache.obsClient = null // Invalidar cliente actual

    console.log('[OBS SDK] Credenciales temporales obtenidas exitosamente')
    return credentials
  } catch (error) {
    console.warn('[OBS SDK] No se pudo obtener credenciales temporales. Cambiando a modo backend...', error.response?.status)

    // Cambiar a modo backend si el endpoint no existe
    if (error.response?.status === 404 || error.response?.status === 500) {
      operationMode = 'backend'
      console.info('[OBS] Usando API del backend (el endpoint de credenciales temporales no está implementado)')
    }

    throw error
  }
}

/**
 * Obtener o crear instancia del cliente OBS
 */
async function getObsClient() {
  // Si ya existe un cliente válido, reutilizarlo
  if (credentialsCache.obsClient) {
    const now = new Date().getTime()
    const timeUntilExpiry = credentialsCache.expiresAt - now

    if (timeUntilExpiry > 5 * 60 * 1000) {
      return credentialsCache.obsClient
    }
  }

  // Obtener nuevas credenciales
  const credentials = await getTemporaryCredentials()
  // Crear nuevo cliente OBS
  const obsClient = new ObsClient({
    access_key_id: credentials.accessKeyId,
    secret_access_key: credentials.secretAccessKey,
    server: OBS_CONFIG.ENDPOINT,
    timeout : 60 * 5
  })

  credentialsCache.obsClient = obsClient
  console.log('[OBS SDK] Cliente OBS creado exitosamente')

  return obsClient
}

/**
 * Ejecutar operación OBS con manejo de errores y reintentos
 */
async function executeObsOperation(operation, retries = 1) {
  try {
    const client = await getObsClient()
    const result = await operation(client)

    // Verificar si hubo error en la respuesta
    if (result.CommonMsg && result.CommonMsg.Status >= 300) {
      throw new Error(`OBS Error ${result.CommonMsg.Status}: ${result.CommonMsg.Code}`)
    }

    return result
  } catch (error) {
    // Si es error de autenticación y quedan reintentos, invalidar cache y reintentar
    if (retries > 0 && (error.message?.includes('403') || error.message?.includes('InvalidAccessKeyId'))) {
      console.warn('[OBS SDK] Error de autenticación, invalidando credenciales y reintentando...')
      credentialsCache.credentials = null
      credentialsCache.obsClient = null
      return executeObsOperation(operation, retries - 1)
    }

    throw error
  }
}

// ============================================================================
// OPERACIONES DE LISTADO
// ============================================================================

/**
 * Listar objetos en un bucket con prefijo opcional
 * @see https://support.huaweicloud.com/intl/en-us/sdk-browserjs-devg-obs/obs_24_0201.html
 */
/**
 * Normaliza propiedades de objetos OBS a formato consistente { objectKey, size, lastModified, etag }
 * Soporta camelCase, PascalCase y nombres alternativos que puede devolver el backend .NET
 */
const normalizeObjectKeys = (obj) => {
  if (!obj) return obj
  const objectKey = obj.objectKey || obj.Key || obj.ObjectKey || obj.key || obj.object_key || ''
  const size = obj.size ?? obj.Size ?? obj.length ?? obj.ContentLength ?? 0
  const lastModified = obj.lastModified || obj.LastModified || obj.last_modified || obj.lastModifiedDate || null
  const etag = obj.etag || obj.ETag || obj.ETAG || obj.eTag || null
  return { objectKey, size, lastModified, etag, ...obj }
}

obsServicesApi.ListarObject = async function (prefix = '', options = {}) {
  console.log('[OBS ListarObject] Iniciando listado - prefix:', prefix, 'options:', options, 'modo:', operationMode)

  // Si el modo es backend o el SDK no está disponible, usar API del backend
  if (operationMode === 'backend' || !ObsClient) {
    console.log('[OBS ListarObject] Usando modo backend')
    try {
      const params = { prefix, ...options }
      console.log('[OBS ListarObject] Llamando a backend:', `${OBS_CONFIG.BACKEND_PATH}/Listar`, 'params:', params)
      
      const result = await api.get(`${OBS_CONFIG.BACKEND_PATH}/Listar`, { params })
      const data = result.data
      
      console.log('[OBS ListarObject] Respuesta del backend (sin normalizar):', data)
      
      // Extraer y normalizar la lista de objetos
      let rawObjects = []
      if (Array.isArray(data)) {
        rawObjects = data
      } else if (data && Array.isArray(data.objects)) {
        rawObjects = data.objects
      } else if (data && (data.success === false || data.error)) {
        const errorMsg = data.message || data.error || 'Error desconocido del backend'
        console.error('[OBS ListarObject] TenBackend devolvio error:', errorMsg)
        throw new Error(errorMsg)
      }

      // Normalizar TODOS los objetos a formato consistente con objectKey
      const objects = rawObjects.map(normalizeObjectKeys)

      // Si el backend incluye folder markers (objectKey que termina en /) dentro de la lista plana,
      // los dejamos tal cual. El consumidor filtra con endsWith('/').
      const folders = objects.filter(o => o.objectKey.endsWith('/'))
      const files = objects.filter(o => !o.objectKey.endsWith('/') && o.objectKey)
      console.log('[OBS ListarObject] ✓ Backend - normalizados:', objects.length, 'objetos (', folders.length, 'carpetas,', files.length, 'archivos)')

      return objects
      
    } catch (error) {
      console.error('[OBS ListarObject] TenError en modo backend:', error)
      console.error('[OBS ListarObject] Detalles:', error.response?.data || error.message)
      throw error
    }
  }

  // Intentar usar el SDK
  try {
    console.log('[OBS ListarObject] Intentando usar SDK...')
    const result = await executeObsOperation(async (client) => {
      return client.listObjects({
        Bucket: OBS_CONFIG.BUCKET,
        Prefix: prefix,
        Marker: options.marker || '',
        MaxKeys: options.maxKeys || 1000,
        Delimiter: options.delimiter !== undefined ? options.delimiter : '/'
      })
    })

    console.log('[OBS ListarObject] Respuesta del SDK:', result)

    // Transformar respuesta del SDK al formato esperado por la app
    const objects = []

    // Agregar directorios (CommonPrefixes siempre terminan en /)
    if (result.InterfaceResult && result.InterfaceResult.CommonPrefixes) {
      result.InterfaceResult.CommonPrefixes.forEach(dir => {
        objects.push({
          objectKey: dir.Prefix,
          size: 0,
          lastModified: null,
          etag: null
        })
      })
    }

    // Agregar archivos. Gracias al Delimiter='/', Contents solo contiene archivos.
    // Pero por si acaso, filtramos cualquier objeto que termine en '/' (folder marker residual).
    if (result.InterfaceResult && result.InterfaceResult.Contents) {
      result.InterfaceResult.Contents.forEach(obj => {
        if (!obj.Key.endsWith('/')) {
          objects.push({
            objectKey: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            etag: obj.ETag
          })
        }
      })
    }

    console.log('[OBS ListarObject] ✓ SDK retornio', objects.length, 'objetos')
    return objects
  } catch (error) {
    // Si falla con el SDK, cambiar a modo backend y reintentar
    console.warn('[OBS ListarObject] Error con SDK, cambiando a modo backend:', error.message)
    operationMode = 'backend'

    console.log('[OBS ListarObject] Reintentando con API del backend...')
    try {
      const params = { prefix, ...options }
      const result = await api.get(`${OBS_CONFIG.BACKEND_PATH}/Listar`, { params })
      const data = result.data
      
      let rawObjects = []
      if (Array.isArray(data)) {
        rawObjects = data
      } else if (data && Array.isArray(data.objects)) {
        rawObjects = data.objects
      }

      const objects = rawObjects.map(normalizeObjectKeys)
      console.log('[OBS ListarObject] ✓ Retry backend -', objects.length, 'objetos normalizados')
      return objects
      
    } catch (retryError) {
      console.error('[OBS ListarObject] TenError en retry con backend:', retryError)
      throw retryError
    }
  }
}

/**
 * Listar objetos con paginacion completa
 */
obsServicesApi.ListarObjectPaginado = async function* (prefix = '', maxKeys = 1000) {
  let marker = ''
  let hasMore = true

  while (hasMore) {
    const response = await obsServicesApi.ListarObject(prefix, { marker, maxKeys })

    for (const obj of response) {
      yield obj
    }

    // Verificar si hay más páginas
    if (response.isTruncated && response.nextMarker) {
      marker = response.nextMarker
    } else {
      hasMore = false
    }
  }
}

/**
 * Listar solo carpetas (directorios) en una ruta
 */
obsServicesApi.ListarCarpetas = async function (prefix = '') {
  const objetos = await obsServicesApi.ListarObject(prefix)
  return objetos.filter(obj => obj.objectKey && obj.objectKey.endsWith('/'))
}

/**
 * Listar solo archivos (no carpetas) en una ruta
 */
obsServicesApi.ListarArchivos = async function (prefix = '') {
  const objetos = await obsServicesApi.ListarObject(prefix)
  return objetos.filter(obj => obj.objectKey && !obj.objectKey.endsWith('/'))
}

/**
 * Buscar archivos por extension
 */
obsServicesApi.BuscarPorExtension = async function (prefix = '', extensiones) {
  const exts = Array.isArray(extensiones) ? extensiones : [extensiones]
  const archivos = await obsServicesApi.ListarArchivos(prefix)

  return archivos.filter(archivo => {
    const ext = archivo.objectKey.split('.').pop().toLowerCase()
    return exts.includes(ext)
  })
}

/**
 * Buscar archivos de audio
 */
obsServicesApi.BuscarAudio = async function (prefix = '') {
  return obsServicesApi.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.audio)
}

/**
 * Buscar archivos de video
 */
obsServicesApi.BuscarVideo = async function (prefix = '') {
  return obsServicesApi.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.video)
}

/**
 * Buscar archivos de imagen
 */
obsServicesApi.BuscarImagenes = async function (prefix = '') {
  return obsServicesApi.BuscarPorExtension(prefix, OBS_CONFIG.CONTENT_TYPES.image)
}

// ============================================================================
// OPERACIONES DE UPLOAD
// ============================================================================

/**
 * Subir archivo(s) al OBS usando el SDK
 * @see https://support.huaweicloud.com/intl/en-us/sdk-browserjs-devg-obs/obs_24_0202.html
 */
obsServicesApi.SubirFiles = async function (formdata, options = {}) {
  // Extraer file y filePath del FormData
  const file = formdata.get('file')
  const filePath = formdata.get('filePath')
  const metadata = formdata.get('metadata')

  if (!file || !filePath) {
    throw new Error('Se requiere file y filePath en el FormData')
  }

  const uploadParams = {
    Bucket: OBS_CONFIG.BUCKET,
    Key: filePath,
    SourceFile: file,
    ContentType: obsServicesApi.GetContentType(file.name)
  }

  // Agregar metadata si existe
  if (metadata) {
    try {
      uploadParams.Metadata = JSON.parse(metadata)
    } catch (e) {
      console.warn('[OBS SDK] Error al parsear metadata:', e)
    }
  }

  // Manejar progreso si se proporcionó callback
  if (options.onProgress) {
    uploadParams.ProgressCallback = (transferredAmount, totalAmount) => {
      const percent = Math.round((transferredAmount / totalAmount) * 100)
      options.onProgress(percent)
    }
  }

  const result = await executeObsOperation(async (client) => {
    return client.putObject(uploadParams)
  })

  return {
    success: true,
    objectKey: filePath,
    etag: result.InterfaceResult?.ETag,
    versionId: result.InterfaceResult?.VersionId
  }
}

/**
 * Subir archivo con metadata personalizada
 */
obsServicesApi.SubirConMetadata = async function (file, objectKey, metadata = {}, options = {}) {
  const formdata = new FormData()
  formdata.append('file', file)
  formdata.append('filePath', objectKey)

  if (Object.keys(metadata).length > 0) {
    formdata.append('metadata', JSON.stringify(metadata))
  }

  return obsServicesApi.SubirFiles(formdata, options)
}

/**
 * Subir multiples archivos en paralelo
 */
obsServicesApi.SubirMultiples = async function (archivos, options = {}) {
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
        const result = await obsServicesApi.SubirFiles(formdata, {
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

/**
 * Crear una carpeta (objeto vacio con '/' al final)
 */
obsServicesApi.CrearCarpeta = async function (folderPath) {
  const path = folderPath.endsWith('/') ? folderPath : `${folderPath}/`

  const result = await executeObsOperation(async (client) => {
    return client.putObject({
      Bucket: OBS_CONFIG.BUCKET,
      Key: path,
      Body: ''
    })
  })

  return {
    success: true,
    objectKey: path,
    etag: result.InterfaceResult?.ETag
  }
}

// ============================================================================
// OPERACIONES DE DESCARGA Y URLS
// ============================================================================

/**
 * Generar link de acceso temporal (URL firmada)
 * @see https://support.huaweicloud.com/intl/en-us/sdk-browserjs-devg-obs/obs_24_0203.html
 */
obsServicesApi.GetLink = async function (objectKey, expirationMinutes = 60) {
  // Si el modo es backend o el SDK no está disponible, usar API del backend
  if (operationMode === 'backend' || !ObsClient) {
    return api.get(`${OBS_CONFIG.BACKEND_PATH}/GenLink`, {
      params: { objectKey, expiration: expirationMinutes }
    }).then(res => res.data)
  }

  // Intentar usar el SDK
  try {
    const result = await executeObsOperation(async (client) => {
      return client.createSignedUrlSync({
        Method: 'GET',
        Bucket: OBS_CONFIG.BUCKET,
        Key: objectKey,
        Expires: expirationMinutes * 60 // Convertir minutos a segundos
      })
    })

    return result.SignedUrl
  } catch (error) {
    // Si falla con el SDK, cambiar a modo backend y reintentar
    console.warn('[OBS] Error con SDK en GetLink, cambiando a modo backend:', error.message)
    operationMode = 'backend'

    console.log('[OBS] Reintentando GetLink con API del backend...')
    const result = await api.get(`${OBS_CONFIG.BACKEND_PATH}/GenLink`, {
      params: { objectKey, expiration: expirationMinutes }
    })
    console.log('[OBS] ✓ GetLink completado con API del backend')
    return result.data
  }
}

/**
 * Generar links para multiples objetos
 */
obsServicesApi.GetLinksMultiples = async function (objectKeys, expirationMinutes = 60) {
  const promises = objectKeys.map(async key => {
    try {
      const url = await obsServicesApi.GetLink(key, expirationMinutes)
      return { objectKey: key, url, success: true }
    } catch (error) {
      return { objectKey: key, url: null, success: false, error }
    }
  })

  return Promise.all(promises)
}

/**
 * Descargar archivo del OBS
 */
obsServicesApi.Download = async function (objectName, options = {}) {
  const result = await executeObsOperation(async (client) => {
    return client.getObject({
      Bucket: OBS_CONFIG.BUCKET,
      Key: objectName,
      ...options
    })
  })

  // Convertir el resultado a Blob
  return new Blob([result.InterfaceResult.Content], {
    type: result.InterfaceResult.ContentType || 'application/octet-stream'
  })
}

/**
 * Descargar archivo y guardarlo automaticamente
 */
obsServicesApi.DownloadYGuardar = async function (objectName, fileName = null) {
  const blob = await obsServicesApi.Download(objectName)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || objectName.split('/').pop()
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Obtener URL de descarga directa (pre-firmada)
 */
obsServicesApi.GetDownloadUrl = async function (objectKey, expirationMinutes = 60) {
  return obsServicesApi.GetLink(objectKey, expirationMinutes)
}

/**
 * Descargar rango de bytes (para streaming o descarga parcial)
 */
obsServicesApi.DownloadRango = async function (objectName, start, end) {
  return obsServicesApi.Download(objectName, {
    Range: `bytes=${start}-${end}`
  })
}

// ============================================================================
// OPERACIONES DE ELIMINACION
// ============================================================================

/**
 * Eliminar un archivo del OBS
 * @see https://support.huaweicloud.com/intl/en-us/sdk-browserjs-devg-obs/obs_24_0204.html
 */
obsServicesApi.EliminarArchivo = async function (objectName) {
  // Si el modo es backend o el SDK no está disponible, usar API del backend
  if (operationMode === 'backend' || !ObsClient) {
    return api.delete(`${OBS_CONFIG.BACKEND_PATH}/Delete`, {
      params: { objectName }
    }).then(res => res.data)
  }

  // Intentar usar el SDK
  try {
    const result = await executeObsOperation(async (client) => {
      return client.deleteObject({
        Bucket: OBS_CONFIG.BUCKET,
        Key: objectName
      })
    })

    return {
      success: true,
      objectKey: objectName,
      deleteMarker: result.InterfaceResult?.DeleteMarker,
      versionId: result.InterfaceResult?.VersionId
    }
  } catch (error) {
    // Si falla con el SDK, cambiar a modo backend y reintentar
    console.warn('[OBS] Error con SDK en EliminarArchivo, cambiando a modo backend:', error.message)
    operationMode = 'backend'

    console.log('[OBS] Reintentando EliminarArchivo con API del backend...')
    const result = await api.delete(`${OBS_CONFIG.BACKEND_PATH}/Delete`, {
      params: { objectName }
    })
    console.log('[OBS] ✓ EliminarArchivo completado con API del backend')
    return result.data
  }
}

/**
 * Eliminar un objeto (carpeta/directorio) y su contenido
 */
obsServicesApi.EliminarObjeto = async function (objectKey) {
  return obsServicesApi.EliminarArchivo(objectKey)
}

/**
 * Eliminar multiples archivos en batch
 */
obsServicesApi.EliminarMultiples = async function (objectKeys) {
  const result = await executeObsOperation(async (client) => {
    return client.deleteObjects({
      Bucket: OBS_CONFIG.BUCKET,
      Quiet: false,
      Objects: objectKeys.map(key => ({ Key: key }))
    })
  })

  // Transformar respuesta
  const deleted = result.InterfaceResult?.Deleteds || []
  const errors = result.InterfaceResult?.Errors || []

  return objectKeys.map(key => {
    const isDeleted = deleted.some(d => d.Key === key)
    const error = errors.find(e => e.Key === key)

    return {
      objectKey: key,
      success: isDeleted,
      error: error ? new Error(`${error.Code}: ${error.Message}`) : null
    }
  })
}

/**
 * Eliminar carpeta y todo su contenido recursivamente
 */
obsServicesApi.EliminarCarpetaRecursivo = async function (folderPath, onProgress = null) {
  const path = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
  const objetos = await obsServicesApi.ListarObject(path)

  let deleted = 0
  const errors = []

  for (const obj of objetos) {
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
      errors.push({ objectKey: obj.objectKey, error })
    }
  }

  try {
    await obsServicesApi.EliminarObjeto(path)
    deleted++
  } catch (error) {
    errors.push({ objectKey: path, error })
  }

  return { deleted, errors }
}

/**
 * Eliminar archivo y notificar a clientes via SignalR
 */
obsServicesApi.EliminarArchivoYNotificar = async function (objectKey, fileName, radioId = null, signalR = null) {
  try {
    // 1. Eliminar el archivo del OBS
    const result = await obsServicesApi.EliminarArchivo(objectKey)

    // 2. Enviar notificacion por SignalR
    if (signalR && signalR.connected()) {
      try {
        const notificationData = {
          fileName,
          objectKey,
          radioId,
          deletedAt: new Date().toISOString(),
          action: 'MusicFileDeleted'
        }

        await signalR.sendMessageToAll(JSON.stringify({
          type: 'MusicFileDeleted',
          data: notificationData,
          message: `Archivo de musica eliminado: ${fileName}`
        }))

        console.log('[OBS SDK] Notificacion de eliminacion enviada via SignalR:', notificationData)
      } catch (signalrError) {
        console.error('[OBS SDK] Error al enviar notificacion SignalR:', signalrError)
      }
    } else {
      console.warn('[OBS SDK] SignalR no disponible para notificacion')
    }

    return result
  } catch (error) {
    console.error('[OBS SDK] Error al eliminar archivo:', error)
    throw error
  }
}

// ============================================================================
// OPERACIONES DE COPIA/MOVIMIENTO
// ============================================================================

/**
 * Copiar objeto (sin eliminar el original)
 * @see https://support.huaweicloud.com/intl/en-us/sdk-browserjs-devg-obs/obs_24_0205.html
 */
obsServicesApi.Copiar = async function (origen, destino) {
  const result = await executeObsOperation(async (client) => {
    return client.copyObject({
      Bucket: OBS_CONFIG.BUCKET,
      Key: destino,
      CopySource: `${OBS_CONFIG.BUCKET}/${origen}`
    })
  })

  return {
    success: true,
    origen,
    destino,
    etag: result.InterfaceResult?.ETag
  }
}

/**
 * Mover objeto a nueva ubicacion
 */
obsServicesApi.Mover = async function (postData) {
  const { origen, destino } = postData

  // Copiar y luego eliminar el original
  await obsServicesApi.Copiar(origen, destino)
  await obsServicesApi.EliminarArchivo(origen)

  return {
    success: true,
    origen,
    destino
  }
}

/**
 * Renombrar objeto
 */
obsServicesApi.Renombrar = async function (objectKey, nuevoNombre) {
  const partes = objectKey.split('/')
  partes[partes.length - 1] = nuevoNombre
  const nuevoObjectKey = partes.join('/')

  return obsServicesApi.Mover({
    origen: objectKey,
    destino: nuevoObjectKey
  })
}

/**
 * Mover multiples archivos a una carpeta destino
 */
obsServicesApi.MoverMultiples = async function (objectKeys, carpetaDestino) {
  const destino = carpetaDestino.endsWith('/') ? carpetaDestino : `${carpetaDestino}/`

  const promises = objectKeys.map(key => {
    const nombreArchivo = key.split('/').pop()
    return obsServicesApi.Mover({
      origen: key,
      destino: `${destino}${nombreArchivo}`
    })
      .then(() => ({ success: true, objectKey: key }))
      .catch(error => ({ success: false, objectKey: key, error }))
  })

  return Promise.all(promises)
}

// ============================================================================
// OPERACIONES DE MUSICA (ESPECIFICAS DEL PROYECTO)
// Estas operaciones aún usan el backend porque requieren lógica de negocio
// ============================================================================

/**
 * Obtener musica desde API
 */
obsServicesApi.GetMusicApi = async function (listaRadioDescarga, marker = '') {
  return api.post(`${OBS_CONFIG.BACKEND_PATH}/GetMusicApi`, {
    listaRadioDescarga,
    marker
  }).then(res => res.data)
}

/**
 * Sincronizar radios desde OBS
 */
obsServicesApi.SincronizarRadios = async function () {
  return api.post(`${OBS_CONFIG.BACKEND_PATH}/SincronizarRadios`).then(res => res.data)
}

/**
 * Buscar archivos de musica en una carpeta de genero
 */
obsServicesApi.BuscarMusicaPorGenero = async function (codigoGenero) {
  const prefix = `musica/generos/${codigoGenero}/`
  return obsServicesApi.BuscarAudio(prefix)
}

/**
 * Buscar archivos de musica en una carpeta de subgenero
 */
obsServicesApi.BuscarMusicaPorSubgenero = async function (codigoGenero, codigoSubgenero) {
  const prefix = `musica/generos/${codigoGenero}/${codigoSubgenero}/`
  return obsServicesApi.BuscarAudio(prefix)
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtener informacion de un objeto (metadatos)
 */
obsServicesApi.GetObjectInfo = async function (objectKey) {
  const result = await executeObsOperation(async (client) => {
    return client.getObjectMetadata({
      Bucket: OBS_CONFIG.BUCKET,
      Key: objectKey
    })
  })

  return {
    objectKey,
    contentType: result.InterfaceResult.ContentType,
    contentLength: result.InterfaceResult.ContentLength,
    lastModified: result.InterfaceResult.LastModified,
    etag: result.InterfaceResult.ETag,
    metadata: result.InterfaceResult.Metadata || {}
  }
}

/**
 * Verificar si un objeto existe
 */
obsServicesApi.ExisteObjeto = async function (objectKey) {
  try {
    await obsServicesApi.GetObjectInfo(objectKey)
    return true
  } catch {
    return false
  }
}

/**
 * Obtener el tipo de contenido basado en la extension
 */
obsServicesApi.GetContentType = function (filename) {
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

/**
 * Formatear tamano de bytes a formato legible
 */
obsServicesApi.FormatSize = function (bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Obtener icono segun el tipo de archivo
 */
obsServicesApi.GetFileIcon = function (filename) {
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

/**
 * Obtener nombre de archivo de una ruta completa
 */
obsServicesApi.GetNombreArchivo = function (objectKey) {
  const parts = objectKey.split('/').filter(p => p)
  return parts[parts.length - 1] || objectKey
}

/**
 * Obtener la carpeta padre de un objeto
 */
obsServicesApi.GetCarpetaPadre = function (objectKey) {
  const parts = objectKey.split('/').filter(p => p)
  parts.pop()
  return parts.length > 0 ? parts.join('/') + '/' : ''
}

/**
 * Validar si el archivo es de un tipo permitido
 */
obsServicesApi.ValidarTipoArchivo = function (filename, allowedTypes) {
  const ext = filename.split('.').pop().toLowerCase()

  for (const type of allowedTypes) {
    if (OBS_CONFIG.CONTENT_TYPES[type]?.includes(ext)) {
      return true
    }
  }

  return false
}

/**
 * Validar tamano de archivo
 */
obsServicesApi.ValidarTamanoArchivo = function (size, maxSizeMB = 100) {
  const maxBytes = maxSizeMB * 1024 * 1024

  if (size > maxBytes) {
    return {
      valid: false,
      message: `El archivo excede el tamano maximo permitido de ${maxSizeMB}MB`
    }
  }

  return { valid: true, message: '' }
}

// Exportar configuracion para uso externo
obsServicesApi.CONFIG = OBS_CONFIG

// Exportar función para limpiar cache de credenciales (útil para logout)
obsServicesApi.clearCredentialsCache = function() {
  credentialsCache = {
    credentials: null,
    expiresAt: null,
    obsClient: null
  }
  console.log('[OBS SDK] Cache de credenciales limpiado')
}

// Obtener modo de operación actual (útil para debugging)
obsServicesApi.getOperationMode = function() {
  return operationMode
}

// Forzar modo de operación (útil para testing)
obsServicesApi.setOperationMode = function(mode) {
  if (mode === 'sdk' || mode === 'backend') {
    operationMode = mode
    console.log(`[OBS] Modo de operación cambiado a: ${mode}`)
  }
}

// Exponer en window para debugging desde la consola
if (typeof window !== 'undefined') {
  window.obsServicesApi = obsServicesApi
}

export default obsServicesApi
