import api from './api'

const clienteProgramacionService = {}

clienteProgramacionService.listarProgRadios = async function () {
  return api.get('/clienteProgramacion/Radio/').then(res => localStorage.listProgRadio=JSON.stringify(res.data))
}

clienteProgramacionService.listarProgSpot = async function () {
  
  console.log('🔄 Solicitando programaciones de spots al servidor...')
  return api.get('/clienteProgramacion/Spot/').then(res => {
    console.log('✅ Respuesta del servidor - Programaciones de spots:', res.data)
    console.log(`   📊 Total de programaciones recibidas: ${res.data?.length || 0}`)
    
    localStorage.setItem('listProgSpot', JSON.stringify(res.data))
    console.log('💾 Programaciones guardadas en localStorage.listProgSpot')

    return res.data
  }).catch(error => {
    console.error('❌ Error al obtener programaciones de spots:', error)
    throw error
  })
}

export default clienteProgramacionService
