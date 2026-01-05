import axios from 'axios'

/**
 * ElevenLabs API Service
 * Consolidated service for all ElevenLabs API interactions
 * @see https://elevenlabs.io/docs/api-reference
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  baseURL: import.meta.env.VITE_API_ELEVENLABS_URL || 'https://api.elevenlabs.io/v1',
  apiKey: import.meta.env.VITE_API_ELEVENLABS_KEY || import.meta.env.VITE_ELEVEN_KEY_API,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour in milliseconds
    keys: {
      voices: 'elevenlabs_voices',
      history: 'elevenlabs_history',
      subscription: 'elevenlabs_subscription'
    }
  },
  audio: {
    defaultFormat: 'mp3_44100_128', // High quality MP3
    streamingLatency: 1, // 0-4, lower = faster but lower quality
    supportedFormats: [
      'mp3_44100_32',
      'mp3_44100_64',
      'mp3_44100_96',
      'mp3_44100_128',
      'mp3_44100_192',
      'pcm_16000',
      'pcm_22050',
      'pcm_24000',
      'pcm_44100',
      'ulaw_8000'
    ]
  },
  voice: {
    defaultModel: 'eleven_multilingual_v2',
    availableModels: [
      'eleven_multilingual_v2',
      'eleven_turbo_v2',
      'eleven_turbo_v2_5',
      'eleven_monolingual_v1',
      'eleven_flash_v2_5'
    ],
    defaultSettings: {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    }
  }
}

// ============================================================================
// Axios Instances
// ============================================================================

/**
 * Create axios instance for standard API calls
 */
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: CONFIG.baseURL,
    timeout: CONFIG.timeout
  })

  instance.interceptors.request.use(
    (config) => {
      if (!CONFIG.apiKey) {
        throw new Error('ElevenLabs API key not configured. Set VITE_API_ELEVENLABS_KEY environment variable.')
      }

      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
        'xi-api-key': CONFIG.apiKey
      }

      return config
    },
    (error) => {
      console.error('[ElevenLabs] Request error:', error)
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage = error.response?.data?.detail?.message || error.message
      console.error('[ElevenLabs] Response error:', errorMessage)
      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * Create axios instance optimized for audio generation
 */
const createAudioInstance = () => {
  const instance = axios.create({
    baseURL: CONFIG.baseURL,
    timeout: CONFIG.timeout,
    maxBodyLength: Infinity,
    responseType: 'arraybuffer'
  })

  instance.interceptors.request.use(
    (config) => {
      if (!CONFIG.apiKey) {
        throw new Error('ElevenLabs API key not configured. Set VITE_API_ELEVENLABS_KEY environment variable.')
      }

      config.headers = {
        ...config.headers,
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': CONFIG.apiKey
      }

      return config
    },
    (error) => {
      console.error('[ElevenLabs] Audio request error:', error)
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[ElevenLabs] Audio response error:', error.response?.status || error.message)
      return Promise.reject(error)
    }
  )

  return instance
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Retry mechanism for API calls with exponential backoff
 */
const retryWithBackoff = async (apiCall, retries = CONFIG.maxRetries) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      const isLastAttempt = attempt === retries - 1
      const isRetryableError = error.response?.status >= 500 || error.code === 'ECONNABORTED'

      if (isLastAttempt || !isRetryableError) {
        throw error
      }

      const delay = CONFIG.retryDelay * Math.pow(2, attempt)
      console.warn(`[ElevenLabs] Retry ${attempt + 1}/${retries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Cache management utilities
 */
const cache = {
  get(key) {
    if (!CONFIG.cache.enabled) return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const { data, timestamp } = JSON.parse(item)
      const isExpired = Date.now() - timestamp > CONFIG.cache.ttl

      if (isExpired) {
        localStorage.removeItem(key)
        return null
      }

      return data
    } catch (error) {
      console.error('[ElevenLabs] Cache get error:', error)
      return null
    }
  },

  set(key, data) {
    if (!CONFIG.cache.enabled) return

    try {
      const item = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('[ElevenLabs] Cache set error:', error)
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('[ElevenLabs] Cache remove error:', error)
    }
  },

  clear() {
    Object.values(CONFIG.cache.keys).forEach(key => this.remove(key))
    console.log('[ElevenLabs] Cache cleared')
  }
}

/**
 * Error handler with user-friendly messages
 */
const handleApiError = (error, context = '') => {
  const status = error.response?.status
  const detail = error.response?.data?.detail

  let message = `${context} failed: `

  switch (status) {
    case 401:
      message += 'Invalid API key. Please check your configuration.'
      break
    case 403:
      message += 'Access forbidden. Check your subscription and permissions.'
      break
    case 404:
      message += 'Resource not found.'
      break
    case 422:
      message += detail?.message || 'Invalid request parameters.'
      break
    case 429:
      message += 'Rate limit exceeded. Please try again later.'
      break
    case 500:
    case 502:
    case 503:
      message += 'Server error. Please try again later.'
      break
    default:
      message += error.message || 'Unknown error occurred.'
  }

  console.error(`[ElevenLabs] ${message}`, error)
  throw new Error(message)
}

// ============================================================================
// Main Service
// ============================================================================

const ElevenLabsService = {
  // Configuration access
  config: CONFIG,

  /**
   * Validate API key and get subscription info
   * @returns {Promise<{valid: boolean, subscription?: Object, error?: string}>}
   */
  async validateApiKey() {
    try {
      const api = createApiInstance()
      const response = await api.get('user/subscription')

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
      handleApiError(error, 'API key validation')
    }
  },

  /**
   * Get user subscription information
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Object>}
   */
  async getUserInfo(useCache = true) {
    try {
      if (useCache) {
        const cached = cache.get(CONFIG.cache.keys.subscription)
        if (cached) {
          console.log('[ElevenLabs] Using cached subscription data')
          return cached
        }
      }

      const api = createApiInstance()
      const response = await retryWithBackoff(() => api.get('user/subscription'))

      cache.set(CONFIG.cache.keys.subscription, response.data)
      return response.data
    } catch (error) {
      handleApiError(error, 'Get user info')
    }
  },

  /**
   * Get available voices
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Array>}
   */
  async getVoices(useCache = true) {
    try {
      if (useCache) {
        const cached = cache.get(CONFIG.cache.keys.voices)
        if (cached) {
          console.log('[ElevenLabs] Using cached voices')
          return cached
        }
      }

      const api = createApiInstance()
      const response = await retryWithBackoff(() => api.get('voices'))

      const voices = response.data.voices || []
      cache.set(CONFIG.cache.keys.voices, voices)

      console.log(`[ElevenLabs] Loaded ${voices.length} voices`)
      return voices
    } catch (error) {
      // Try to use cache if API fails
      const cached = cache.get(CONFIG.cache.keys.voices)
      if (cached) {
        console.warn('[ElevenLabs] Using cached voices due to API error')
        return cached
      }
      handleApiError(error, 'Get voices')
    }
  },

  /**
   * Get voice by ID
   * @param {string} voiceId
   * @returns {Promise<Object>}
   */
  async getVoice(voiceId) {
    if (!voiceId) {
      throw new Error('Voice ID is required')
    }

    try {
      const api = createApiInstance()
      const response = await retryWithBackoff(() => api.get(`voices/${voiceId}`))
      return response.data
    } catch (error) {
      handleApiError(error, `Get voice ${voiceId}`)
    }
  },

  /**
   * Get voice preview audio
   * @param {string} voiceId - Voice ID
   * @returns {Promise<{audioUrl: string, audioBlob: Blob}>}
   */
  async getVoicePreview(voiceId) {
    if (!voiceId) {
      throw new Error('Voice ID is required')
    }

    try {
      console.log(`[ElevenLabs] Getting preview for voice ${voiceId}`)

      // First, get voice details to check if preview_url exists
      const voiceDetails = await this.getVoice(voiceId)

      if (voiceDetails.preview_url) {
        // Use the preview URL provided by ElevenLabs
        const response = await fetch(voiceDetails.preview_url)
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        console.log(`[ElevenLabs] Preview loaded from preview_url`)
        return { audioUrl, audioBlob }
      }

      // Fallback: generate a short sample
      console.log(`[ElevenLabs] No preview_url, generating sample`)
      const sampleText = "Hola, soy una voz de demostración. Este es un ejemplo de cómo sueno."

      const result = await this.textToSpeech(voiceId, sampleText, {
        modelId: 'eleven_turbo_v2_5', // Use fast model for preview
        optimizeStreamingLatency: 4 // Maximum speed
      })

      return {
        audioUrl: result.audioUrl,
        audioBlob: result.audioBlob
      }

    } catch (error) {
      handleApiError(error, `Get voice preview ${voiceId}`)
    }
  },

  /**
   * Get history items
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise<Array>}
   */
  async getHistory(useCache = true) {
    try {
      if (useCache) {
        const cached = cache.get(CONFIG.cache.keys.history)
        if (cached) {
          console.log('[ElevenLabs] Using cached history')
          return cached
        }
      }

      const api = createApiInstance()
      const response = await retryWithBackoff(() => api.get('history'))

      const history = response.data.history || []
      const formattedHistory = history.map(item => ({
        id: item.date_unix,
        historyItemId: item.history_item_id,
        voiceName: item.voice_name,
        voiceId: item.voice_id,
        text: item.text,
        characterCount: item.character_count_change_from || 0,
        date: new Date(item.date_unix * 1000)
      }))

      cache.set(CONFIG.cache.keys.history, formattedHistory)
      console.log(`[ElevenLabs] Loaded ${formattedHistory.length} history items`)

      return formattedHistory
    } catch (error) {
      const cached = cache.get(CONFIG.cache.keys.history)
      if (cached) {
        console.warn('[ElevenLabs] Using cached history due to API error')
        return cached
      }
      handleApiError(error, 'Get history')
    }
  },

  /**
   * Get audio from history item
   * @param {string} historyItemId
   * @returns {Promise<Blob>}
   */
  async getHistoryAudio(historyItemId) {
    if (!historyItemId) {
      throw new Error('History item ID is required')
    }

    try {
      const audioApi = createAudioInstance()
      const response = await retryWithBackoff(() =>
        audioApi.get(`history/${historyItemId}/audio`)
      )

      return new Blob([response.data], { type: 'audio/mpeg' })
    } catch (error) {
      handleApiError(error, `Get history audio ${historyItemId}`)
    }
  },

  /**
   * Delete history item
   * @param {string} historyItemId
   * @returns {Promise<boolean>}
   */
  async deleteHistoryItem(historyItemId) {
    if (!historyItemId) {
      throw new Error('History item ID is required')
    }

    try {
      const api = createApiInstance()
      await retryWithBackoff(() => api.delete(`history/${historyItemId}`))

      // Invalidate history cache
      cache.remove(CONFIG.cache.keys.history)

      console.log(`[ElevenLabs] Deleted history item ${historyItemId}`)
      return true
    } catch (error) {
      handleApiError(error, `Delete history item ${historyItemId}`)
    }
  },

  /**
   * Convert text to speech
   * @param {string} voiceId - Voice ID to use
   * @param {string} text - Text to convert
   * @param {Object} options - Generation options
   * @param {string} options.modelId - Model to use (default: eleven_multilingual_v2)
   * @param {number} options.stability - Voice stability 0-1 (default: 0.75)
   * @param {number} options.similarityBoost - Similarity boost 0-1 (default: 0.75)
   * @param {number} options.style - Style exaggeration 0-1 (default: 0)
   * @param {boolean} options.useSpeakerBoost - Use speaker boost (default: true)
   * @param {string} options.outputFormat - Audio format (default: mp3_44100_128)
   * @param {number} options.optimizeStreamingLatency - Latency optimization 0-4 (default: 1)
   * @returns {Promise<{audioUrl: string, audioBlob: Blob, metadata: Object}>}
   */
  async textToSpeech(voiceId, text, options = {}) {
    // Validation
    if (!voiceId) {
      throw new Error('Voice ID is required')
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required')
    }

    if (text.length > 5000) {
      throw new Error('Text exceeds maximum length of 5000 characters')
    }

    // Prepare options with defaults
    const modelId = options.modelId || CONFIG.voice.defaultModel
    const outputFormat = options.outputFormat || CONFIG.audio.defaultFormat
    const optimizeStreamingLatency = options.optimizeStreamingLatency ?? CONFIG.audio.streamingLatency

    const voiceSettings = {
      stability: options.stability ?? CONFIG.voice.defaultSettings.stability,
      similarity_boost: options.similarityBoost ?? CONFIG.voice.defaultSettings.similarity_boost,
      style: options.style ?? CONFIG.voice.defaultSettings.style,
      use_speaker_boost: options.useSpeakerBoost ?? CONFIG.voice.defaultSettings.use_speaker_boost
    }

    // Validate format
    if (!CONFIG.audio.supportedFormats.includes(outputFormat)) {
      throw new Error(`Unsupported audio format: ${outputFormat}`)
    }

    // Validate model
    if (!CONFIG.voice.availableModels.includes(modelId)) {
      console.warn(`[ElevenLabs] Model ${modelId} not in known models list, but attempting anyway`)
    }

    try {
      console.log(`[ElevenLabs] Generating audio: voice=${voiceId}, model=${modelId}, chars=${text.length}`)

      // Prepare request body
      const requestBody = {
        text: text.trim(),
        model_id: modelId,
        voice_settings: voiceSettings
      }

      // Add client tracking if available
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.Cliente?.cli_codigo) {
          requestBody.cli_clubf5 = user.Cliente.cli_codigo
        }
      } catch (err) {
        // Silently fail if user data not available
      }

      // Build endpoint with query params
      const endpoint = `text-to-speech/${voiceId}/stream?optimize_streaming_latency=${optimizeStreamingLatency}&output_format=${outputFormat}`

      // Make request
      const audioApi = createAudioInstance()
      const startTime = Date.now()

      const response = await retryWithBackoff(() =>
        audioApi.post(endpoint, requestBody)
      )

      const generationTime = Date.now() - startTime

      if (!response.data) {
        throw new Error('No audio data received from API')
      }

      // Create blob and URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)

      const metadata = {
        size: audioBlob.size,
        sizeKB: (audioBlob.size / 1024).toFixed(2),
        generationTimeMs: generationTime,
        voiceId,
        modelId,
        textLength: text.length,
        format: outputFormat,
        timestamp: new Date().toISOString()
      }

      console.log(`[ElevenLabs] Audio generated successfully:`, metadata)

      // Invalidate history cache since new audio was generated
      cache.remove(CONFIG.cache.keys.history)

      return {
        audioUrl,
        audioBlob,
        metadata
      }

    } catch (error) {
      handleApiError(error, 'Text to speech')
    }
  },

  /**
   * Convert text to speech with streaming (returns File object compatible with FormData)
   * @param {string} voiceId
   * @param {string} text
   * @param {Object} options
   * @returns {Promise<{audioUrl: string, audioFile: File}>}
   */
  async textToSpeechFile(voiceId, text, options = {}) {
    const result = await this.textToSpeech(voiceId, text, options)

    // Convert blob to File object
    const audioFile = new File(
      [result.audioBlob],
      `audio_${Date.now()}.mp3`,
      { type: 'audio/mpeg' }
    )

    return {
      audioUrl: result.audioUrl,
      audioFile
    }
  },

  /**
   * Get models information
   * @returns {Promise<Array>}
   */
  async getModels() {
    try {
      const api = createApiInstance()
      const response = await retryWithBackoff(() => api.get('models'))
      return response.data
    } catch (error) {
      // Return default models if API fails
      console.warn('[ElevenLabs] Failed to fetch models, using defaults')
      return CONFIG.voice.availableModels.map(id => ({ model_id: id }))
    }
  },

  // ============================================================================
  // Legacy compatibility methods (for backward compatibility)
  // ============================================================================

  /**
   * @deprecated Use getVoices() instead
   */
  async getVoicesCloned(useCache = true) {
    console.warn('[ElevenLabs] getVoicesCloned is deprecated, use getVoices instead')
    return this.getVoices(useCache)
  },

  /**
   * @deprecated Use getUserInfo() instead
   */
  async getInfoUser(useCache = true) {
    console.warn('[ElevenLabs] getInfoUser is deprecated, use getUserInfo instead')
    return this.getUserInfo(useCache)
  },

  /**
   * @deprecated Use getHistory() instead
   */
  async getHistoryCreate(force = false) {
    console.warn('[ElevenLabs] getHistoryCreate is deprecated, use getHistory instead')
    const history = await this.getHistory(!force)

    // Match old format
    return history.map(item => ({
      id: item.id,
      id_history: item.historyItemId,
      locutor: item.voiceName,
      id_locutor: item.voiceId,
      texto: item.text,
      voz: ''
    }))
  },

  /**
   * @deprecated Use getHistoryAudio() instead
   */
  async getHistoryAudioLocal(historyId) {
    console.warn('[ElevenLabs] getHistoryAudioLocal is deprecated')
    try {
      const historyList = JSON.parse(localStorage.getItem('HistoryList') || '[]')
      const historyItem = historyList.find(h => h.id_history == historyId)
      return historyItem?.voz || ''
    } catch (error) {
      return ''
    }
  },

  /**
   * @deprecated Use getHistory() instead
   */
  GetHistory(voiceId, text) {
    console.warn('[ElevenLabs] GetHistory is deprecated')
    try {
      const historyList = JSON.parse(localStorage.getItem('HistoryList') || '[]')
      return historyList.find(hist =>
        hist.id_locutor == voiceId &&
        hist.texto.toLowerCase().trim() === text.toLowerCase().trim()
      )
    } catch (error) {
      return null
    }
  },

  // ============================================================================
  // Utility methods
  // ============================================================================

  /**
   * Clear all cached data
   */
  clearCache() {
    cache.clear()
  },

  /**
   * Get cache information
   */
  getCacheInfo() {
    try {
      const voices = cache.get(CONFIG.cache.keys.voices)
      const history = cache.get(CONFIG.cache.keys.history)
      const subscription = cache.get(CONFIG.cache.keys.subscription)

      return {
        voices: {
          cached: !!voices,
          count: voices?.length || 0
        },
        history: {
          cached: !!history,
          count: history?.length || 0
        },
        subscription: {
          cached: !!subscription
        },
        cacheEnabled: CONFIG.cache.enabled,
        cacheTTL: CONFIG.cache.ttl
      }
    } catch (error) {
      console.error('[ElevenLabs] Error getting cache info:', error)
      return {
        error: error.message
      }
    }
  },

  /**
   * Get configuration
   */
  getConfig() {
    return {
      ...CONFIG,
      apiKey: CONFIG.apiKey ? '***' + CONFIG.apiKey.slice(-4) : 'not set'
    }
  },

  /**
   * Update configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfig(updates) {
    Object.assign(CONFIG, updates)
    console.log('[ElevenLabs] Configuration updated')
  }
}

export default ElevenLabsService
