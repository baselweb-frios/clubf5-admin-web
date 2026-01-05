import { computed } from 'vue'
import { useI18n as vueUseI18n } from 'vue-i18n'

/**
 * Composable for internationalization
 * @returns {object}
 */
export function useI18n() {
  const i18n = vueUseI18n()

  /**
   * Get current locale
   */
  const locale = computed({
    get: () => i18n.locale.value,
    set: (val) => {
      i18n.locale.value = val
      localStorage.setItem('locale', val)
      document.documentElement.lang = val
    }
  })

  /**
   * Get available locales
   */
  const availableLocales = computed(() => {
    return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  })

  /**
   * Set locale
   * @param {string} newLocale
   */
  const setLocale = (newLocale) => {
    if (i18n.availableLocales.includes(newLocale)) {
      locale.value = newLocale
    } else {
      console.warn(`Locale ${newLocale} not available`)
    }
  }

  /**
   * Toggle between locales
   */
  const toggleLocale = () => {
    const currentLocale = locale.value
    const newLocale = currentLocale === 'es' ? 'en' : 'es'
    setLocale(newLocale)
  }

  /**
   * Translate text with parameters
   * @param {string} key
   * @param {object} params
   * @returns {string}
   */
  const t = (key, params = {}) => {
    return i18n.t(key, params)
  }

  /**
   * Check if translation exists
   * @param {string} key
   * @returns {boolean}
   */
  const te = (key) => {
    return i18n.te(key)
  }

  /**
   * Get current locale name
   */
  const localeName = computed(() => {
    const current = availableLocales.value.find(l => l.code === locale.value)
    return current ? current.name : locale.value
  })

  /**
   * Load locale from storage
   */
  const loadLocale = () => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && i18n.availableLocales.includes(savedLocale)) {
      locale.value = savedLocale
    }
  }

  return {
    // State
    locale,
    availableLocales,
    localeName,

    // Methods
    t,
    te,
    setLocale,
    toggleLocale,
    loadLocale
  }
}

export default useI18n
