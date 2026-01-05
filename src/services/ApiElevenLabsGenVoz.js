import axios from 'axios'

// ElevenLabs Audio Generation API Configuration
const ELEVENLABS_AUDIO_CONFIG = {
  baseURL: import.meta.env.VITE_API_ELEVENLABS_URL || 'https://api.elevenlabs.io/v1/',
  apiKey: import.meta.env.VITE_API_ELEVENLABS_KEY,
  timeout: 30000
}

const instance = axios.create({
  baseURL: ELEVENLABS_AUDIO_CONFIG.baseURL,
  timeout: ELEVENLABS_AUDIO_CONFIG.timeout
})

instance.interceptors.request.use(
  (config) => {
    if (!ELEVENLABS_AUDIO_CONFIG.apiKey) {
      throw new Error('ElevenLabs API key is not configured. Please set VITE_API_ELEVENLABS_KEY environment variable.')
    }

    config.maxBodyLength = Infinity
    config.headers = {
      accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_AUDIO_CONFIG.apiKey
    }
    config.responseType = 'arraybuffer'
    return config
  },
  (error) => {
    console.error('ElevenLabs Audio API Request Error:', error)
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('ElevenLabs Audio API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default instance
