import ApiElevenLabs from './ApiElevenLabs'
import axios from 'axios'

// Configuration
const ELEVENLABS_CONFIG = {
  baseURL: import.meta.env.VITE_API_ELEVENLABS_URL || 'https://api.elevenlabs.io/v1/',
  apiKey: import.meta.env.VITE_API_ELEVENLABS_KEY,
  timeout: 30000,
  maxRetries: 3
}

// Create optimized axios instance for audio generation
const createAudioApiInstance = () => {
  const instance = axios.create({
    baseURL: ELEVENLABS_CONFIG.baseURL,
    timeout: ELEVENLABS_CONFIG.timeout
  })

  instance.interceptors.request.use(
    (config) => {
      if (!ELEVENLABS_CONFIG.apiKey) {
        throw new Error('ElevenLabs API key is not configured. Please set VITE_API_ELEVENLABS_KEY environment variable.')
      }

      config.maxBodyLength = Infinity
      config.headers = {
        accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_CONFIG.apiKey
      }
      config.responseType = 'arraybuffer'
      return config
    },
    (error) => {
      console.error('ElevenLabs API Request Error:', error)
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('ElevenLabs API Response Error:', error.response?.data || error.message)
      return Promise.reject(error)
    }
  )

  return instance
}

// Retry mechanism for API calls
const retryApiCall = async (apiCall, retries = ELEVENLABS_CONFIG.maxRetries) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      if (i === retries - 1) throw error
      console.warn(`ElevenLabs API call failed, retrying... (${i + 1}/${retries})`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

const RequestElevenLabsServices = {}

/**
 * Get audio blob from ElevenLabs history
 * @param {string} historyId - History item ID
 * @returns {Promise<Blob>} Audio blob
 */
RequestElevenLabsServices.getHistoryAudio = async function (historyId) {
  if (!historyId) {
    throw new Error('History ID is required')
  }

  try {
    const audioApi = createAudioApiInstance()
    const response = await retryApiCall(() => audioApi.get(`history/${historyId}/audio`))

    return new Blob([response.data], { type: 'audio/mpeg' })
  } catch (error) {
    console.error('Error getting history audio:', error)
    throw new Error(`Failed to retrieve audio for history ID: ${historyId}`)
  }
}

/**
 * Get local history audio URL
 * @param {string} historyId - History item ID
 * @returns {string} Local audio URL or empty string
 */
RequestElevenLabsServices.getHistoryAudioLocal = function (historyId) {
  if (!historyId) return ''

  try {
    const historyList = JSON.parse(localStorage.getItem('HistoryList') || '[]')
    const historyItem = historyList.find(h => h.id_history == historyId)
    return historyItem?.voz || ''
  } catch (error) {
    console.error('Error getting local history audio:', error)
    return ''
  }
}

/**
 * Get and cache history with audio URLs
 * @param {boolean} force - Force refresh from API
 * @returns {Promise<Array>} History items with audio URLs
 */
RequestElevenLabsServices.getHistoryCreate = async function (force = false) {
  try {
    // Check cache first unless force refresh
    if (!force && localStorage.getItem('HistoryList')) {
      const cached = JSON.parse(localStorage.getItem('HistoryList'))
      console.log('Using cached history data')
      return cached
    }

    // Fetch from API
    console.log('Fetching history from ElevenLabs API...')
    const response = await retryApiCall(() => ApiElevenLabs.get('history'))

    const { history } = response.data
    const result = []

    // Process history items
    history.forEach((item) => {
      result.push({
        id: item.date_unix,
        id_history: item.history_item_id,
        locutor: item.voice_name,
        id_locutor: item.voice_id,
        texto: item.text,
        voz: ''
      })
    })

    // Generate audio URLs for each history item
    console.log('Generating audio URLs for history items...')
    for (let i = 0; i < result.length; i++) {
      try {
        const blob = await this.getHistoryAudio(result[i].id_history)
        result[i].voz = URL.createObjectURL(blob)
      } catch (error) {
        console.warn(`Failed to get audio for history item ${result[i].id_history}:`, error)
        result[i].voz = ''
      }
    }

    // Cache the result
    localStorage.setItem('HistoryList', JSON.stringify(result))
    console.log(`Cached ${result.length} history items`)

    return result
  } catch (error) {
    console.error('Error in getHistoryCreate:', error)
    throw new Error('Failed to retrieve history data')
  }
}
/**
 * Get user subscription information
 * @returns {Promise<Object>} User subscription data
 */
RequestElevenLabsServices.getInfoUser = async function () {
  try {
    const response = await retryApiCall(() => ApiElevenLabs.get('user/subscription'))
    return response.data
  } catch (error) {
    console.error('Error getting user info:', error)
    throw new Error('Failed to retrieve user subscription information')
  }
}

/**
 * Get available cloned voices
 * @returns {Promise<Array>} Array of voice objects
 */
RequestElevenLabsServices.getVoicesCloned = async function () {
  try {
    const response = await retryApiCall(() => ApiElevenLabs.get('voices'))
    const { voices } = response.data

    // Cache the voices list
    localStorage.setItem('VoiceList', JSON.stringify(voices))
    console.log(`Cached ${voices.length} voices`)

    return voices
  } catch (error) {
    console.error('Error getting voices:', error)

    // Try to return cached voices if available
    const cached = localStorage.getItem('VoiceList')
    if (cached) {
      console.log('Using cached voices due to API error')
      return JSON.parse(cached)
    }

    throw new Error('Failed to retrieve voices and no cached data available')
  }
}

/**
 * Find history item by voice ID and text
 * @param {string} voiceId - Voice ID
 * @param {string} text - Text content
 * @returns {Object|null} History item or null if not found
 */
RequestElevenLabsServices.GetHistory = function (voiceId, text) {
  if (!voiceId || !text) return null

  try {
    const historyList = JSON.parse(localStorage.getItem('HistoryList') || '[]')
    return historyList.find(hist =>
      hist.id_locutor == voiceId &&
      hist.texto.toLowerCase().trim() === text.toLowerCase().trim()
    )
  } catch (error) {
    console.error('Error finding history:', error)
    return null
  }
}
/**
 * Convert text to speech using ElevenLabs API
 * @param {string} voiceId - Voice ID to use for generation
 * @param {string} text - Text to convert to speech
 * @param {Object} options - Additional options for voice generation
 * @returns {Promise<Array>} Array containing [audioUrl, audioBlob]
 */
RequestElevenLabsServices.textToSpeech = async function (voiceId, text, options = {}) {
  // Input validation
  if (!voiceId) {
    throw new Error('Voice ID is required')
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text content is required')
  }

  if (text.length > 5000) {
    throw new Error('Text is too long (maximum 5000 characters)')
  }

  try {
    console.log(`Generating audio for voice ${voiceId} with text length: ${text.length}`)

    // Check if we already have this audio in history
    const existingHistory = this.GetHistory(voiceId, text)
    if (existingHistory && existingHistory.voz) {
      console.log('Using cached audio from history')
      const blob = await fetch(existingHistory.voz).then(r => r.blob())
      return [existingHistory.voz, blob]
    }

    // Prepare request data with optimized settings
    const requestData = {
      model_id: options.modelId || 'eleven_multilingual_v2',
      text: text.trim(),
      voice_settings: {
        similarity_boost: options.similarityBoost ?? 1.0,
        stability: options.stability ?? 1.0,
        style: options.style ?? 1.0,
        use_speaker_boost: options.useSpeakerBoost ?? true
      }
    }

    // Add client code if available (for tracking purposes)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.Cliente?.cli_codigo) {
        requestData.cli_clubf5 = user.Cliente.cli_codigo
      }
    } catch (error) {
      console.warn('Could not add client code to request:', error)
    }

    const audioApi = createAudioApiInstance()
    const endpoint = `text-to-speech/${voiceId}/stream?optimize_streaming_latency=1&output_format=mp3_44100_96`

    console.log('Sending text-to-speech request...')
    const response = await retryApiCall(() =>
      audioApi.post(endpoint, JSON.stringify(requestData))
    )

    if (!response.data) {
      throw new Error('No audio data received from ElevenLabs API')
    }

    // Create blob and URL
    const blob = new Blob([response.data], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(blob)

    console.log(`Audio generated successfully. Size: ${blob.size} bytes`)

    return [audioUrl, blob]

  } catch (error) {
    console.error('Error in textToSpeech:', error)

    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid ElevenLabs API key. Please check your configuration.')
    } else if (error.response?.status === 429) {
      throw new Error('ElevenLabs API rate limit exceeded. Please try again later.')
    } else if (error.response?.status >= 500) {
      throw new Error('ElevenLabs API server error. Please try again later.')
    }

    throw new Error(`Text-to-speech generation failed: ${error.message}`)
  }
}
// Utility methods
RequestElevenLabsServices.clearCache = function () {
  localStorage.removeItem('HistoryList')
  localStorage.removeItem('VoiceList')
  console.log('ElevenLabs cache cleared')
}

RequestElevenLabsServices.getCacheInfo = function () {
  try {
    const historyList = JSON.parse(localStorage.getItem('HistoryList') || '[]')
    const voiceList = JSON.parse(localStorage.getItem('VoiceList') || '[]')

    return {
      historyCount: historyList.length,
      voiceCount: voiceList.length,
      lastUpdated: localStorage.getItem('HistoryList') ? new Date() : null
    }
  } catch (error) {
    console.error('Error getting cache info:', error)
    return {
      historyCount: 0,
      voiceCount: 0,
      lastUpdated: null,
      error: error.message
    }
  }
}

RequestElevenLabsServices.validateApiKey = async function () {
  if (!ELEVENLABS_CONFIG.apiKey) {
    throw new Error('ElevenLabs API key is not configured')
  }

  try {
    const response = await ApiElevenLabs.get('user/subscription')
    return {
      valid: true,
      subscription: response.data
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return {
        valid: false,
        error: 'Invalid API key'
      }
    }
    throw error
  }
}

export default RequestElevenLabsServices
