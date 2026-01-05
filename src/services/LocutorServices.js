import api from './api'

const LocutorService = {}

LocutorService.getAll = async function () {
  
  if(localStorage.getItem('etiqueta')==null){
    return api.get('/Locutor/etiqueta').then(res => res.data)
  }else{
    return JSON.parse(localStorage.etiqueta)
  }
}

LocutorService.getLocutores = async function () {
  return api.get('/Locutor').then(res => res.data)
}
/*
LocutorService.post= async function(prop1, prop2) {
  return api.post('/Locutor/',{

    prop1, prop2

  }).then(res => res.data);
}
*/

export default LocutorService
