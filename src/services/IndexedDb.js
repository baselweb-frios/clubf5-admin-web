import { openDB } from 'idb'

const IndexedDbEnpoint = {}

const OpenDb = async () => {
  if (!('indexedDB' in window)) {
    alert('Este navegador no es compatible con la aplicación de descarga actualize su navegador')
    return
  }
  const db = await openDB('soundApp', 1, {
    upgrade (db) {
      if (!db.objectStoreNames.contains('tracks')) {
        const tracksObjectStore = db.createObjectStore('tracks', { keyPath: 'id', autoIncrement: true })
        tracksObjectStore.createIndex('folder', 'folder', { unique: false })
      }
      if (!db.objectStoreNames.contains('spots')) {
        const tracksObjectStore = db.createObjectStore('spots', { keyPath: 'id', autoIncrement: true })
        tracksObjectStore.createIndex('inicio', 'inicio', { unique: false })
        tracksObjectStore.createIndex('nombre', 'nombre', { unique: false })
        tracksObjectStore.createIndex('horadesde', 'horadesde', { unique: false })
        tracksObjectStore.createIndex('source', 'source', { unique: false })
        tracksObjectStore.createIndex('audio', 'audio', { unique: false })
      }
    }

  })
  return db
}

const existData = async (objectName, value, key) => {
  const db = await OpenDb()
  const trans = db.transaction(objectName, 'readonly')
  let cursor = await trans.store.openCursor()
  let exist = false
  while (cursor) {
    if (!exist) {
      exist = (cursor.value[key] == value)
    }
    cursor = await cursor.continue()
  }

  return exist
}
IndexedDbEnpoint.GetAllValue = async (nameObject, dowloadOnly = false) => {
  const db = await OpenDb()
  let result = await db.getAll(nameObject)
  if (dowloadOnly) {
    const existDownload = result.filter(music => typeof music.audio === 'object')
    if (existDownload.length > 0) {
      result = existDownload
    }
  }
  return result
}
IndexedDbEnpoint.GetAllValueCursor = async (nameObject, indexName, paramRange) => {
  const notNull = IDBKeyRange.only(paramRange)
  const db = await OpenDb()
  const trans = await db.transaction(nameObject, 'readonly')
  const index = trans.store.index(indexName)
  const cursor = await index.openCursor(notNull)
  return cursor
}

IndexedDbEnpoint.CountData = async (nameObject) => {
  const db = await OpenDb()
  const result = await db.getAll(nameObject)
  return result.length
}
IndexedDbEnpoint.AddItems = async (data, objectName, keyCompare = false) => {
  const db = await OpenDb()

  const promisesStore = []
  for (const d of data) {
    const trans = db.transaction(objectName, 'readwrite')
    promisesStore.push(trans.store.put(d))
  }

  await Promise.all(promisesStore)
  const result = await IndexedDbEnpoint.GetAllValue(objectName)
  return result
}
IndexedDbEnpoint.UpdateItems = async (data, objectName) => {
  const db = await OpenDb()
  const promisesStore = []
  for (const d of data) {
    const trans = db.transaction(objectName, 'readwrite')
    promisesStore.push(trans.store.put(d))
  }

  console.log('Inicio de carga')
  await Promise.all(promisesStore)
  console.log('Fin de carga')
}
export default IndexedDbEnpoint
