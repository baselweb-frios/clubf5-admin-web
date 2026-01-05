import moment from 'moment'
import { DATE_FORMATS } from './constants'

/**
 * Format date using moment
 * @param {string|Date} date
 * @param {string} format
 * @returns {string}
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY_DATE) => {
  if (!date) return ''
  return moment(date).format(format)
}

/**
 * Format datetime using moment
 * @param {string|Date} datetime
 * @param {string} format
 * @returns {string}
 */
export const formatDateTime = (datetime, format = DATE_FORMATS.DISPLAY_DATETIME) => {
  if (!datetime) return ''
  return moment(datetime).format(format)
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const relativeTime = (date) => {
  if (!date) return ''
  return moment(date).fromNow()
}

/**
 * Check if date is valid
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isValidDate = (date) => {
  return moment(date).isValid()
}

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration (seconds to mm:ss)
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep clone object
 * @param {object} obj
 * @returns {object}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Generate unique ID
 * @returns {string}
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substr(0, length) + '...'
}

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

/**
 * Check if object is empty
 * @param {object} obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0
}

/**
 * Sort array of objects by property
 * @param {Array} array
 * @param {string} key
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array}
 */
export const sortBy = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })
}

/**
 * Group array by property
 * @param {Array} array
 * @param {string} key
 * @returns {object}
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

/**
 * Download file
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

export default {
  formatDate,
  formatDateTime,
  relativeTime,
  isValidDate,
  formatFileSize,
  formatDuration,
  debounce,
  throttle,
  deepClone,
  generateId,
  capitalize,
  truncate,
  getInitials,
  isEmpty,
  sortBy,
  groupBy,
  downloadFile,
  copyToClipboard
}
