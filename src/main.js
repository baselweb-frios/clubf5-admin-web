import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import { useAuthStore } from '@/stores/auth'

// Import external libraries
import moment from 'moment'

// Import styles
import './assets/css/main.css'
// FontAwesome se carga via CDN en index.html para mejor compatibilidad en producción
// import '@fortawesome/fontawesome-free/css/all.css'
import './assets/styles/driver-theme.css'

// Import plugins
import toastPlugin from './plugins/toast'
import driverTourPlugin from './plugins/driverTour'

// Import locale files
import es from './locales/es.json'
import en from './locales/en.json'

// Configure moment locale
moment.locale('es')

// Create i18n instance
const i18n = createI18n({
  locale: import.meta.env.VITE_I18N_LOCALE || 'es',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'es',
  messages: {
    es,
    en
  },
  legacy: false // Use Composition API mode
})

// Create Pinia instance
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Register global properties
app.config.globalProperties.$moment = moment

// Global confirm dialog helper
app.config.globalProperties.$confirm = (options) => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(options.message || '¿Está seguro?')
    if (confirmed && options.callback) {
      options.callback(true)
    } else if (!confirmed && options.callback) {
      options.callback(false)
    }
    resolve(confirmed)
  })
}

// Use plugins
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(toastPlugin)
app.use(driverTourPlugin)

// Load user from storage before mounting (async)
const authStore = useAuthStore()

// Initialize app
;(async () => {
  try {
    await authStore.loadUserFromStorage()
    console.log('User and stores loaded from storage')
  } catch (error) {
    console.error('Error loading user from storage:', error)
  } finally {
    // Mount app regardless of load result
    app.mount('#app')
  }
})()
