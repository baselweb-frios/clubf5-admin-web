import moment from 'moment'
import { dispatcherService } from './dispatcherService'
import api from './api'

/**
 * Servicio para manejar operaciones de spots usando SignalR Dispatcher
 * @namespace SpotService
 */
const SpotService = {}

/**
 * Obtiene spots del cliente actual
 * @param {boolean} [viewvencidos=false] - Si true, incluye spots vencidos
 * @returns {Promise<Array>} Lista de spots del cliente
 */
SpotService.getSpotsBycodCliente = async function (viewvencidos = false) {
  try {
    console.log('SpotService: Fetching spots by client, viewvencidos:', viewvencidos)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userName = user.unique_name
    const clientCode = user.clientCode

    if (!userName || !clientCode) {
      throw new Error('User not authenticated or user data not available')
    }

    const response = await dispatcherService.execute({
      controller: 'Spot',
      action: 'GetByCliente',
      parameters: {
        clientCode,
        username: userName,
        includeExpired: viewvencidos
      }
    })

    if (!response || !Array.isArray(response)) {
      console.error('SpotService: Invalid response data for client spots:', response)
      throw new Error('Invalid response from client spots API')
    }

    console.log(`SpotService: Filtering spots for user: ${userName}`)

    // Filter spots by user and expiration status
    let filteredSpots = response.filter(spo => {
      if (spo.spo_usuario !== userName) return false
      if (viewvencidos) return true
      return spo.vencido >= 0 // Only non-expired spots
    })

    console.log(`SpotService: Found ${filteredSpots.length} spots for client`)

    // Transform the data
    const transformedSpots = filteredSpots.map(spo => {
      try {
        const fechaInicio = formatDate(spo.spo_fecini)
        const fechaFin = formatDate(spo.spo_fecfin)

        return {
          codSpot: spo.spo_codigo,
          codCli: spo.spo_codcli,
          nombreSpot: spo.spo_nombre || 'Sin nombre',
          tipo: spo.spo_tipo || 'inst',
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          source: spo.spo_source || '',
          usuario: spo.spo_usuario,
          estado: spo.spo_codigoColor,
          duracion: spo.spo_dursec || 0,
          vencido: spo.vencido < 0,
          slot: null,
          // Add additional computed properties for compatibility
          spo_codigo: spo.spo_codigo,
          spo_nombre: spo.spo_nombre || 'Sin nombre',
          spo_tipo: spo.spo_tipo || 'inst',
          spo_fecini: fechaInicio,
          spo_fecfin: fechaFin,
          spo_source: spo.spo_source || '',
          spo_source_src: spo.spo_source ? `${import.meta.env.VITE_OBS_ROOT_URL}${spo.spo_source}` : '',
          spo_codcli: spo.spo_codcli,
          spo_dursec: spo.spo_dursec || 0
        }
      } catch (error) {
        console.error(`SpotService: Error transforming spot ${spo.spo_codigo}:`, error)
        return null
      }
    }).filter(spot => spot !== null) // Remove any failed transformations

    console.log(`SpotService: Successfully processed ${transformedSpots.length} client spots`)
    return transformedSpots

  } catch (error) {
    console.error('SpotService: Error fetching spots by client:', error)
    throw new Error(`Failed to load client spots: ${error.message}`)
  }
}

/**
 * Obtiene todos los spots (admin)
 * @returns {Promise<Array>} Lista de todos los spots
 */
SpotService.getSpots = async function () {
  try {
    console.log('SpotService: Fetching spots from API...')

    const response = await dispatcherService.execute({
      controller: 'Spot',
      action: 'GetAll',
      parameters: {}
    })

    if (!response || !Array.isArray(response)) {
      console.error('SpotService: Invalid response data:', response)
      throw new Error('Invalid response from spots API')
    }

    const spots = response
    console.log(`SpotService: Retrieved ${spots.length} spots from API`)

    // Process spots and load audio metadata asynchronously
    const processedSpots = await Promise.all(
      spots.map(async (element) => {
        try {
          // Build audio URL
          const urlAudio = `${import.meta.env.VITE_OBS_ROOT_URL}${element.spo_source}`

          // Get audio duration
          let duration = 0
          if (element.spo_source && element.spo_dursec) {
            // Use stored duration if available
            duration = element.spo_dursec
          } else if (element.spo_source) {
            // Try to get duration from audio metadata
            try {
              duration = await getAudioDuration(urlAudio)
            } catch (error) {
              console.warn(`SpotService: Could not load audio duration for ${element.spo_nombre}:`, error)
              duration = 0
            }
          }

          // Format dates with proper validation
          const fechaInicio = formatDate(element.spo_fecini)
          const fechaFin = formatDate(element.spo_fecfin)

          // Calculate expiration status
          const isExpired = element.vencido < 0
          const isInstitutional = element.spo_tipo === 'inst'

          return {
            slot: null,
            spo_nombre: element.spo_nombre || 'Sin nombre',
            spo_codigo: element.spo_codigo,
            spo_fecini: fechaInicio,
            spo_fecfin: isInstitutional
              ? 'No vence'
              : isExpired
                ? 'Vencido'
                : fechaFin,
            spo_source: element.spo_source || '',
            spo_source_src: urlAudio,
            spo_codcli: element.spo_codcli,
            spo_tipo: element.spo_tipo || 'inst',
            spo_dursec: duration,
            vencido: isExpired,
            usuario: element.spo_usuario,
            estado: element.spo_codigoColor
          }
        } catch (error) {
          console.error(`SpotService: Error processing spot ${element.spo_codigo}:`, error)
          // Return a minimal spot object to prevent breaking the UI
          return {
            slot: null,
            spo_nombre: element.spo_nombre || 'Error al cargar',
            spo_codigo: element.spo_codigo,
            spo_fecini: '',
            spo_fecfin: 'Error',
            spo_source: '',
            spo_source_src: '',
            spo_codcli: element.spo_codcli || '',
            spo_tipo: element.spo_tipo || 'inst',
            spo_dursec: 0,
            vencido: true,
            usuario: element.spo_usuario,
            estado: element.spo_codigoColor
          }
        }
      })
    )

    // Sort spots (institutional first, then by expiration status)
    const sortedSpots = processedSpots.sort((a, b) => {
      // Institutional spots first
      if (a.spo_tipo === 'inst' && b.spo_tipo !== 'inst') return -1
      if (a.spo_tipo !== 'inst' && b.spo_tipo === 'inst') return 1

      // Then by expiration status (active first)
      if (a.vencido && !b.vencido) return 1
      if (!a.vencido && b.vencido) return -1

      // Finally by name
      return (a.spo_nombre || '').localeCompare(b.spo_nombre || '')
    })

    console.log(`SpotService: Successfully processed ${sortedSpots.length} spots`)
    return sortedSpots

  } catch (error) {
    console.error('SpotService: Error fetching spots:', error)
    throw new Error(`Failed to load spots: ${error.message}`)
  }
}

/**
 * Guarda un nuevo spot
 * NOTA: Este método usa axios directamente porque puede recibir FormData o JSON
 * @param {FormData|Object} formdata - Datos del spot
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.guardarSpot = async function (formdata) {
  try {
    console.log('SpotService: Saving new spot...')

    // Usar axios directamente para soportar tanto FormData como JSON
    const response = await api.post('/spot', formdata)

    // Clear relevant caches
    localStorage.removeItem('spots')
    localStorage.removeItem('HistoryList')
    localStorage.removeItem('VoiceList')

    console.log('SpotService: Spot saved successfully, cache cleared')
    return response.data
  } catch (error) {
    console.error('SpotService: Error saving spot:', error)
    throw new Error(`Failed to save spot: ${error.message}`)
  }
}

/**
 * Guarda un spot desde operador
 * @param {string} nombreSpot - Nombre del spot
 * @param {string} source - Source del audio
 * @param {string} fechaDesde - Fecha desde
 * @param {string} fechaHasta - Fecha hasta
 * @param {string} tipoSpot - Tipo de spot
 * @param {string} cliente - Cliente
 * @param {number} clienteCodigo - Código del cliente
 * @param {string} locutor - Locutor
 * @param {string} codPedido - Código de pedido
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.guardarSpotOperador = async function (nombreSpot, source, fechaDesde, fechaHasta, tipoSpot, cliente, clienteCodigo, locutor, codPedido) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'CreateOperador',
    parameters: {
      nombreSpot,
      source,
      fechaDesde,
      fechaHasta,
      tipoSpot,
      cliente,
      clienteCodigo,
      locutor,
      codPedido
    },
    broadcastResult: true
  })
}

/**
 * Sube un archivo de spot
 * NOTA: Los uploads de archivos usan axios directamente (no dispatcher)
 * porque necesitan enviar multipart/form-data
 * @param {FormData} formData - Datos del archivo
 * @param {string} tipo - Tipo de archivo
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.uploadSpot = async function (formData, tipo) {
  try {
    console.log('SpotService: Uploading spot file...')
    // IMPORTANTE: No establecer Content-Type manualmente para FormData
    // Axios lo establece automáticamente con el boundary correcto
    const response = await api.post('/spot/upload', formData)
    console.log('SpotService: Spot file uploaded successfully')
    return response.data
  } catch (error) {
    console.error('SpotService: Error uploading spot:', error)
    throw new Error(`Failed to upload spot: ${error.message}`)
  }
}

/**
 * Sube noticias
 * NOTA: Los uploads de archivos usan axios directamente (no dispatcher)
 * @param {FormData} formData - Datos del archivo
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.uploadNoticias = async function (formData) {
  try {
    console.log('SpotService: Uploading noticias file...')
    // IMPORTANTE: No establecer Content-Type manualmente para FormData
    // Axios lo establece automáticamente con el boundary correcto
    const response = await api.post('/spot/uploadNoti', formData)
    console.log('SpotService: Noticias file uploaded successfully')
    return response.data
  } catch (error) {
    console.error('SpotService: Error uploading noticias:', error)
    throw new Error(`Failed to upload noticias: ${error.message}`)
  }
}

/**
 * Sube spot de operador
 * NOTA: Los uploads de archivos usan axios directamente (no dispatcher)
 * @param {FormData} formData - Datos del archivo
 * @param {number} idCliente - ID del cliente
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.uploadSpotOperador = async function (formData, idCliente) {
  try {
    console.log('SpotService: Uploading spot operador file...')
    // IMPORTANTE: No establecer Content-Type manualmente para FormData
    // Axios lo establece automáticamente con el boundary correcto
    const response = await api.post(`/spot/upload/${idCliente}`, formData)
    console.log('SpotService: Spot operador file uploaded successfully')
    return response.data
  } catch (error) {
    console.error('SpotService: Error uploading spot operador:', error)
    throw new Error(`Failed to upload spot operador: ${error.message}`)
  }
}

/**
 * Cambia el vencimiento de un spot
 * @param {string} codigoSpot - Código del spot
 * @param {string} fecha - Nueva fecha de vencimiento
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.cambiarVencimiento = async function (codigoSpot, fecha) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'UpdateVencimiento',
    parameters: {
      codigoSpot,
      fecha
    },
    broadcastResult: true
  })
}

/**
 * Edita un spot existente
 * NOTA: Este método usa axios directamente porque puede recibir FormData o JSON
 * @param {FormData|Object} formdata - Datos del spot
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.editarSpot = async function (formdata) {
  try {
    console.log('SpotService: Updating spot...')

    // Usar axios directamente para soportar tanto FormData como JSON
    const response = await api.put('/spot/editar', formdata)

    // Clear relevant caches after update
    localStorage.removeItem('spots')
    localStorage.removeItem('HistoryList')
    localStorage.removeItem('VoiceList')

    console.log('SpotService: Spot updated successfully, cache cleared')
    return response.data
  } catch (error) {
    console.error('SpotService: Error updating spot:', error)
    throw new Error(`Failed to update spot: ${error.message}`)
  }
}

/**
 * Edita una noticia
 * @param {string} codigoSpot - Código del spot
 * @param {string} nombreSpot - Nombre del spot
 * @param {string} source - Source del audio
 * @param {string} fechaFin - Fecha fin
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.editarNoti = async function (codigoSpot, nombreSpot, source, fechaFin) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'UpdateNoticia',
    parameters: {
      codigoSpot,
      nombreSpot,
      source,
      fechaFin
    },
    broadcastResult: true
  })
}

/**
 * Elimina un spot
 * @param {string} codigoSpot - Código del spot a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.bajaSpot = async function (codigoSpot) {
  try {
    if (!codigoSpot) {
      throw new Error('Spot code is required')
    }

    console.log('SpotService: Deleting spot:', codigoSpot)

    const response = await dispatcherService.execute({
      controller: 'Spot',
      action: 'Delete',
      parameters: {
        spotCode: codigoSpot
      },
      broadcastResult: true
    })

    // Clear caches after deletion
    localStorage.removeItem('spots')
    localStorage.removeItem('HistoryList')
    localStorage.removeItem('VoiceList')

    console.log('SpotService: Spot deleted successfully, cache cleared')
    return response
  } catch (error) {
    console.error('SpotService: Error deleting spot:', error)
    throw new Error(`Failed to delete spot: ${error.message}`)
  }
}

/**
 * Obtiene todos los spots sin filtros (admin)
 * @returns {Promise<Array>} Todos los spots
 */
SpotService.getAllSpots = async function () {
  try {
    console.log('SpotService: Fetching all spots (admin)...')

    const response = await dispatcherService.execute({
      controller: 'Spot',
      action: 'GetAll',
      parameters: {}
    })

    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response from spots API')
    }

    console.log(`SpotService: Retrieved ${response.length} total spots`)
    return response
  } catch (error) {
    console.error('SpotService: Error fetching all spots:', error)
    throw new Error(`Failed to load all spots: ${error.message}`)
  }
}

/**
 * Obtiene programaciones de spots del cliente
 * @returns {Promise<Array>} Programaciones
 */
SpotService.getProgramacionesByCliente = async function () {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'GetProgramaciones',
    parameters: {}
  })
}

/**
 * Reemplaza spots pautados
 * @param {string} codigoSpotIn - Código del spot entrante
 * @param {string} codigoSpot - Código del spot
 * @param {number} [codigoProg=0] - Código de programación
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.ReemplazarPautados = async function (codigoSpotIn, codigoSpot, codigoProg = 0) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'ReemplazarPautados',
    parameters: {
      codigoSpotIn,
      codigoSpot,
      codigoProg
    },
    broadcastResult: true
  })
}

/**
 * Borra spots pautados
 * @param {string} codigoSpot - Código del spot
 * @param {number} [codigoProg=0] - Código de programación
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.BorrarPautados = async function (codigoSpot, codigoProg = 0) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'BorrarPautados',
    parameters: {
      codigoSpot,
      codigoProg
    },
    broadcastResult: true
  })
}

/**
 * Obtiene link de compartir de Dropbox
 * @param {string} codigoSpot - Código del spot
 * @returns {Promise<string>} URL del link
 */
SpotService.getLinkShare = async function (codigoSpot) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'GetLinkDropbox',
    parameters: {
      codigoSpot
    }
  })
}

/**
 * Crea una nueva programación de spot
 * @param {string} codigoProgramacion - Código de la programación
 * @param {string} nombreProgramacion - Nombre de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.altaProgramacion = async function (codigoProgramacion, nombreProgramacion) {
  return await dispatcherService.execute({
    controller: 'Spot',
    action: 'CreateProgramacion',
    parameters: {
      codigoProgramacion,
      nombreProgramacion
    },
    broadcastResult: true
  })
}

/**
 * Elimina una programación de spot
 * @param {string} codigoProgramacion - Código de la programación
 * @returns {Promise<Object>} Resultado de la operación
 */
SpotService.bajaProgramacion = async function (codigoProgramacion) {
  try {
    if (!codigoProgramacion) {
      throw new Error('Program code is required')
    }

    console.log('SpotService: Deleting program:', codigoProgramacion)

    const response = await dispatcherService.execute({
      controller: 'Spot',
      action: 'DeleteProgramacion',
      parameters: {
        codigoProgramacion
      },
      broadcastResult: true
    })

    // Clear relevant caches
    localStorage.removeItem('spots')

    console.log('SpotService: Program deleted successfully, cache cleared')
    return response
  } catch (error) {
    console.error('SpotService: Error deleting program:', error)
    throw new Error(`Failed to delete program: ${error.message}`)
  }
}

/**
 * Refresca los spots limpiando caché
 * @returns {Promise<void>}
 */
SpotService.refreshSpots = async function () {
  try {
    console.log('SpotService: Refreshing spots data...')
    localStorage.removeItem('spots')
    localStorage.removeItem('HistoryList')
    localStorage.removeItem('VoiceList')
    console.log('SpotService: All caches cleared')
  } catch (error) {
    console.error('SpotService: Error refreshing spots:', error)
    throw new Error(`Failed to refresh spots: ${error.message}`)
  }
}

/**
 * Obtiene spots con caché
 * @param {boolean} [forceRefresh=false] - Fuerza recarga desde API
 * @returns {Promise<Array>} Spots
 */
SpotService.getSpotsCached = async function (forceRefresh = false) {
  try {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem('spots')
      if (cached) {
        console.log('SpotService: Using cached spots data')
        return JSON.parse(cached)
      }
    }

    // Fetch from API
    console.log('SpotService: Fetching fresh spots data from API')
    const spots = await this.getSpots()

    // Cache the result
    localStorage.setItem('spots', JSON.stringify(spots))
    console.log(`SpotService: Cached ${spots.length} spots`)

    return spots
  } catch (error) {
    console.error('SpotService: Error in getSpotsCached:', error)

    // Try to return cached data if available
    const cached = localStorage.getItem('spots')
    if (cached) {
      console.log('SpotService: Using cached spots due to API error')
      return JSON.parse(cached)
    }

    throw error
  }
}

/**
 * Obtiene spots pautados (programados)
 * @returns {Promise<Array>} Spots programados
 */
SpotService.getSpotsPautados = async function () {
  try {
    console.log('SpotService: Fetching pautados (programmed spots)...')

    const response = await dispatcherService.execute({
      controller: 'Spot',
      action: 'GetProgramados',
      parameters: {
        programId: 33
      }
    })

    console.log(`SpotService: Retrieved ${response?.length || 0} pautados`)
    return response || []
  } catch (error) {
    console.error('SpotService: Error fetching pautados:', error)
    // Return empty array instead of throwing to avoid blocking the app
    return []
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Formatea una fecha para visualización
 * @param {string} dateString - String de fecha
 * @returns {string} Fecha formateada
 */
function formatDate(dateString) {
  if (!dateString || dateString === null || dateString === undefined) {
    return ''
  }

  // Convert to string in case it's not
  const dateStr = String(dateString).trim()

  if (dateStr === '') {
    return ''
  }

  try {
    // Handle special case of "9999-02-01T00:00:00" (institutional spots that never expire)
    if (dateStr.includes('9999-02-01')) {
      return 'Nunca expira'
    }

    // Handle other special date values
    if (dateStr.includes('0001-01-01') || dateStr.includes('1900-01-01')) {
      return 'Fecha no definida'
    }

    // Handle malformed date strings
    if (dateStr === '0000-00-00' || dateStr === '0000-00-00T00:00:00') {
      return 'Fecha no definida'
    }

    // Parse the ISO datetime format
    const date = moment(dateStr)

    // Check if date is valid
    if (!date.isValid()) {
      console.warn('SpotService: Invalid date format:', dateStr)
      return 'Fecha inválida'
    }

    // Check for very old dates (before 2000) which might be placeholders
    const year = date.year()
    if (year < 2000) {
      console.warn('SpotService: Very old date, might be placeholder:', dateStr)
      return 'Fecha antigua'
    }

    // Check for future dates that are too far (after 2050)
    if (year > 2050) {
      console.warn('SpotService: Future date too far, might be placeholder:', dateStr)
      return 'Fecha futura'
    }

    // Format as DD-MM-YYYY for display
    return date.format('DD-MM-YYYY')
  } catch (error) {
    console.error('SpotService: Error formatting date:', dateStr, error)
    return 'Error de fecha'
  }
}

/**
 * Valida un string de fecha
 * @param {string} dateString - String de fecha
 * @returns {boolean} True si es válida
 */
function isValidDateString(dateString) {
  if (!dateString) return false

  try {
    const date = moment(dateString)
    return date.isValid()
  } catch {
    return false
  }
}

/**
 * Obtiene la duración de un audio
 * @param {string} audioUrl - URL del audio
 * @returns {Promise<number>} Duración en segundos
 */
async function getAudioDuration(audioUrl) {
  return new Promise((resolve, reject) => {
    if (!audioUrl) {
      resolve(0)
      return
    }

    const audio = new Audio(audioUrl)

    const timeout = setTimeout(() => {
      console.warn('SpotService: Audio duration timeout for:', audioUrl)
      resolve(0)
    }, 5000) // 5 second timeout

    audio.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout)
      resolve(audio.duration || 0)
    })

    audio.addEventListener('error', (error) => {
      clearTimeout(timeout)
      console.warn('SpotService: Audio load error for:', audioUrl, error)
      resolve(0)
    })

    audio.load()
  })
}

// Export utility functions
SpotService.formatDate = formatDate
SpotService.isValidDateString = isValidDateString

export default SpotService
