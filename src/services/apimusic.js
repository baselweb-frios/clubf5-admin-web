import axios from 'axios'

// Configuración por defecto del objeto axios
// a que api nos conectamos para obtener datos

//const url = `https://api.deezer.com/`
const url = `https://deezerdevs-deezer.p.rapidapi.com`
// const url = 'https://api.laf5.com/api/'
// const url = 'https://api.clubf5.com/api/'
// const url = 'https://api.clubf5.com/api/'

const apiUrlFiles = 'https://api.laf5.com/Files'

const instance = axios.create({
  baseURL: url
})

instance.interceptors.request.use(
  (config) => {
    config.headers={
      'x-rapidapi-key': '8a1d201eeamsh99cfb639120460cp172dbbjsnb86aee5171ec',
      'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com'
    }
    config.params={
      q: '*'
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.url = function () {
  return apiUrlFiles
}

export default instance
