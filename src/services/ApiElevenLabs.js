import axios from 'axios'

// Configuración por defecto del objeto axios
// a que api nos conectamos para obtener datos
const url = import.meta.env.VITE_API_ELEVENLABS_URL || 'https://api.elevenlabs.io/v1/';

const instance = axios.create({
  baseURL: url
})
instance.interceptors.request.use(
  (config) => {
    config.maxBodyLength = Infinity
    config.headers={
      'Content-Type': 'application/json',
      'xi-api-key': import.meta.env.VITE_ELEVEN_KEY_API

  }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default instance
