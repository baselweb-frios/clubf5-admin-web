/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44354'
export const API_TIMEOUT = 30000

// User Roles
export const USER_ROLES = {
  CLIENTE: 'Cliente',
  OPERADOR: 'Operador',
  REPRODUCTOR: 'Reproductor'
}

// Route Names
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  NOT_FOUND: 'NotFound',
  SUCURSALES: 'Sucursales',
  PROGRAMA_MUSICA: 'ProgramaMusica',
  BIBLIOTECA_SPOT: 'BibliotecaSpot',
  CATEGORIAS: 'Categorias',
  FACTURAS: 'Facturas',
  OPERADOR: 'Operador',
  CONTROL_AIRE: 'ControlAire',
  USUARIOS: 'Usuarios',
  RADIOS: 'Radios',
  REPRODUCTOR: 'Reproductor'
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}

// Date Formats
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm'
}

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10485760, // 10MB in bytes
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
}

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  LOCALE: 'locale',
  SIDEBAR_OPEN: 'sidebarOpen'
}

// Status
export const STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
}

// Connection Status
export const CONNECTION_STATUS = {
  CONNECTED: 1,
  DISCONNECTED: 0
}

// SignalR Events
export const SIGNALR_EVENTS = {
  SUCURSAL_STATUS_UPDATED: 'SucursalStatusUpdated',
  SPOT_PLAYING: 'SpotPlaying',
  MUSIC_PLAYING: 'MusicPlaying',
  MESSAGE_RECEIVED: 'MessageReceived'
}

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000
}

// Locales
export const LOCALES = {
  ES: 'es',
  EN: 'en'
}

export default {
  API_BASE_URL,
  API_TIMEOUT,
  USER_ROLES,
  ROUTE_NAMES,
  PAGINATION,
  DATE_FORMATS,
  FILE_UPLOAD,
  STORAGE_KEYS,
  STATUS,
  CONNECTION_STATUS,
  SIGNALR_EVENTS,
  TOAST_DURATION,
  LOCALES
}
