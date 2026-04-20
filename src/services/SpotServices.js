import moment from 'moment'
import api from './api'
import ResumenSpotServices from './ResumenSpotServices'
const spotService = {}
// no le paso el codigo de cliente porque lo obtengo en la api
spotService.getSpotsBycodCliente = async function (viewvencidos = false) {
  try {
    console.log('SpotService: Fetching spots by client, viewvencidos:', viewvencidos)

    const response = await api.get('/spot/Cliente/')

    if (!response.data || !Array.isArray(response.data)) {
      console.error('SpotService: Invalid response data for client spots:', response.data)
      throw new Error('Invalid response from client spots API')
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userName = user.unique_name

    if (!userName) {
      throw new Error('User not authenticated or user data not available')
    }

    console.log(`SpotService: Filtering spots for user: ${userName}`)

    // Filter spots by user and expiration status
    let filteredSpots = response.data.filter(spo => {
      if (spo.spo_usuario !== userName) return false
      if (viewvencidos) return true
      return spo.vencido >= 0 // Only non-expired spots
    })

    console.log(`SpotService: Found ${filteredSpots.length} spots for client`)

    // Transform the data
    const transformedSpots = filteredSpots.map(spo => {
      try {
        const fechaInicio = moment(spo.spo_fecini).format('DD/MM/YYYY')
        const fechaFin = (spo.spo_tipo=='inst')?false:moment(spo.spo_fecfin).format('DD/MM/YYYY')
        const vencido = moment(spo.spo_fecfin).diff(moment(new Date()),'days')

        return {
          ...spo,
          codSpot: spo.spo_codigo,
          codCli: spo.spo_codcli,
          nombreSpot: spo.spo_nombre || 'Sin nombre',
          tipo: spo.spo_tipo || 'inst',
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          source: spo.spo_source || '',
          usuario: spo.spo_usuario,
          mediaTipo: spo.spo_mediaTipo,
          duracion: spo.spo_dursec || 0,
          vencido: vencido,
          slot: null,
          url:spo.spo_mediaTipo=='streaming'?spo.spo_url:`${import.meta.env.VITE_ROOT_PATH_SPOTS}${spo.spo_source}`
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

spotService.getSpots = async function () {
  try {
    console.log('SpotService: Fetching spots from API...')
    const response = await api.get('/spot/')

    if (!response.data || !Array.isArray(response.data)) {
      console.error('SpotService: Invalid response data:', response.data)
      throw new Error('Invalid response from spots API')
    }

    const spots = response.data
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

// Helper function to validate and format dates safely
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

// Helper function to validate date string format
function isValidDateString(dateString) {
  if (!dateString) return false

  try {
    const date = moment(dateString)
    return date.isValid()
  } catch {
    return false
  }
}

// Helper function to get audio duration
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

spotService.guardarSpot = async function (formdata) {
  try {
    console.log('SpotService: Saving new spot...')
    const response = await api.post('/spot/', formdata)

    // Clear relevant caches
    localStorage.removeItem('spots')
    localStorage.removeItem('HistoryList')
    localStorage.removeItem('VoiceList')

    console.log('SpotService: Spot saved successfully, cache cleared')
    return response
  } catch (error) {
    console.error('SpotService: Error saving spot:', error)
    throw new Error(`Failed to save spot: ${error.message}`)
  }
}

spotService.guardarSpotOperador = async function (nombreSpot, source, fechaDesde, fechaHasta, tipoSpot, cliente, clienteCodigo, locutor, codPedido) {
  return api.post('/spot/operador', { nombreSpot, source, fechaDesde, fechaHasta, tipoSpot, cliente, clienteCodigo, locutor, codPedido }
  ).then(res => res.data)
}

spotService.uploadSpot = async function (formData, tipo) {
  return api.post('/spot', formData,{
        headers: {
            'Content-Type': 'multipart/form-data' // Axios often handles this automatically for FormData, but explicit setting can be helpful.
        }
    }
  ).then(res => res.data)
}

spotService.uploadNoticias = async function (formData) {
  return api.post('/spot/uploadNoti', formData
  ).then(res => res.data)
}

spotService.uploadSpotOperador = async function (formData, idCliente) {
  return api.post(`/spot/upload/${idCliente}`, formData
  ).then(res => res.data)
}

spotService.cambiarVencimiento = async function (codigoSpot, fecha) {
  return api.put('/spot/', { codigoSpot, fecha }
  ).then(res => res.data)
}

spotService.editarSpot = async function (formdata) {
  try {
    console.log('SpotService: Updating spot...')
    const response = await api.put('/spot/editar', formdata, {
            headers: {
                'Content-Type': 'multipart/form-data' // Axios often handles this automatically for FormData, but explicit setting can be helpful.
            }
        })

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
spotService.editarNoti = async function (codigoSpot, nombreSpot, source, fechaFin) {
  return api.put('/spot/editarNoti', { codigoSpot, nombreSpot, source, fechaFin }
  ).then(res => res.data)
}

spotService.bajaSpot = async function (codigoSpot) {
  try {
    if (!codigoSpot) {
      throw new Error('Spot code is required')
    }

    console.log('SpotService: Deleting spot:', codigoSpot)
    const response = await api.delete(`/spot/del/${codigoSpot}`)

    // Clear caches after deletion
    localStorage.removeItem('spots')
    localStorage.removeItem('HistoryList')
    localStorage.removeItem('VoiceList')

    console.log('SpotService: Spot deleted successfully, cache cleared')
    return response.data
  } catch (error) {
    console.error('SpotService: Error deleting spot:', error)
    throw new Error(`Failed to delete spot: ${error.message}`)
  }
}

/**
 * Get all spots without any filtering (admin function)
 * @returns {Promise<Array>} All spots from API
 */
spotService.getAllSpots = async function () {
  try {
    console.log('SpotService: Fetching all spots (admin)...')
    const response = await api.get('/spot/')

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from spots API')
    }

    console.log(`SpotService: Retrieved ${response.data.length} total spots`)
    return response.data
  } catch (error) {
    console.error('SpotService: Error fetching all spots:', error)
    throw new Error(`Failed to load all spots: ${error.message}`)
  }
}

// Programacion spot
spotService.getProgramacionesByCliente = async function () {
  return api.get('/spot/programacion/').then(res => res.data)
}
// Programacion spot
spotService.ReemplazarPautados = async function (codigoSpotIn, codigoSpot, codigoProg = 0) {
  return api.delete(`/spot/pautados/${codigoSpotIn}/${codigoSpot}/${codigoProg}`).then(res => res.data)
}
spotService.BorrarPautados = async function (codigoSpot, codigoProg = 0) {
  return api.delete(`/spot/pautados/${codigoSpot}/${codigoProg}`).then(res => res.data)
}

// Programacion spot
spotService.getLinkShare = async function (codigoSpot) {
  return api.get(`/spot/getlinkdbx/${codigoSpot}`).then(res => res.data)
}

spotService.altaProgramacion = async function (codigoProgramacion, nombreProgramacion) {
  return api.post('/spot/programacion/', {

    codigoProgramacion, nombreProgramacion

  }).then(res => res.data)
}

spotService.bajaProgramacion = async function (codigoProgramacion) {
  try {
    if (!codigoProgramacion) {
      throw new Error('Program code is required')
    }

    console.log('SpotService: Deleting program:', codigoProgramacion)
    const response = await api.delete(`/spot/programacion/${codigoProgramacion}`)

    // Clear relevant caches
    localStorage.removeItem('spots')

    console.log('SpotService: Program deleted successfully, cache cleared')
    return response.data
  } catch (error) {
    console.error('SpotService: Error deleting program:', error)
    throw new Error(`Failed to delete program: ${error.message}`)
  }
}

/**
 * Refresh spots data by clearing cache and forcing reload
 * @returns {Promise<void>}
 */
spotService.refreshSpots = async function () {
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
 * Get cached spots if available, otherwise fetch from API
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Array>} Spots data
 */
spotService.getSpotsCached = async function (forceRefresh = false) {
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

// Get spots that are already programmed/scheduled (pautados)
spotService.getSpotsPautados = async function () {
  try {
    console.log('SpotService: Fetching pautados (programmed spots)...')
    let programacion = JSON.parse(localStorage.selectedProgramacion).clipro_codigo
    // Try to get programmed spots from the API
    // This endpoint might not exist, so we'll handle the error gracefully
    try {
      const response = await api.get('/spot/SpotProgramado/' + programacion)
      console.log(`SpotService: Retrieved ${response.data?.length || 0} pautados`)
      return response.data || []
    } catch (apiError) {
      // If the endpoint doesn't exist, return empty array
      if (apiError.response?.status === 404) {
        console.log('SpotService: Pautados endpoint not found, returning empty array')
        return []
      }
      throw apiError
    }
  } catch (error) {
    console.error('SpotService: Error fetching pautados:', error)
    // Return empty array instead of throwing to avoid blocking the app
    return []
  }
}

// Export utility functions for use in components
spotService.formatDate = formatDate
spotService.isValidDateString = isValidDateString

export default spotService
