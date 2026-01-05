import api from './api'

const obsServices = {}

// Listar objetos con prefijo opcional
obsServices.ListarObject = async function (prefix = '') {
  return api.get('/ObsCloud/Listar', { params: { prefix } }).then(res => res.data)
}

// Subir archivo
obsServices.SubirFiles = async function (formdata) {
  return api.post('/ObsCloud/Upload', formdata, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
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

// Descargar archivo
obsServices.Download = async function (objectName) {
  return api.get('/ObsCloud/Download', {
    params: { objectName },
    responseType: 'blob'
  }).then(res => res.data)
}

// Generar link de acceso
obsServices.GetLink = async function (objectKey) {
  return api.get('/ObsCloud/GenLink', { params: { objectKey } }).then(res => res.data)
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

export default obsServices
