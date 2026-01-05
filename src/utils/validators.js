/**
 * Validation utilities
 */

/**
 * Check if value is empty
 * @param {*} value
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Validate required field
 * @param {*} value
 * @returns {boolean}
 */
export const required = (value) => {
  return !isEmpty(value)
}

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const email = (email) => {
  if (isEmpty(email)) return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

/**
 * Validate phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const phone = (phone) => {
  if (isEmpty(phone)) return false
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
  return re.test(String(phone))
}

/**
 * Validate URL
 * @param {string} url
 * @returns {boolean}
 */
export const url = (url) => {
  if (isEmpty(url)) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate minimum length
 * @param {string} value
 * @param {number} min
 * @returns {boolean}
 */
export const minLength = (value, min) => {
  if (isEmpty(value)) return false
  return String(value).length >= min
}

/**
 * Validate maximum length
 * @param {string} value
 * @param {number} max
 * @returns {boolean}
 */
export const maxLength = (value, max) => {
  if (isEmpty(value)) return false
  return String(value).length <= max
}

/**
 * Validate minimum value (for numbers)
 * @param {number} value
 * @param {number} min
 * @returns {boolean}
 */
export const minValue = (value, min) => {
  if (isEmpty(value)) return false
  return Number(value) >= min
}

/**
 * Validate maximum value (for numbers)
 * @param {number} value
 * @param {number} max
 * @returns {boolean}
 */
export const maxValue = (value, max) => {
  if (isEmpty(value)) return false
  return Number(value) <= max
}

/**
 * Validate numeric value
 * @param {*} value
 * @returns {boolean}
 */
export const numeric = (value) => {
  if (isEmpty(value)) return false
  return !isNaN(Number(value))
}

/**
 * Validate alpha (letters only)
 * @param {string} value
 * @returns {boolean}
 */
export const alpha = (value) => {
  if (isEmpty(value)) return false
  const re = /^[a-zA-Z]+$/
  return re.test(String(value))
}

/**
 * Validate alphanumeric
 * @param {string} value
 * @returns {boolean}
 */
export const alphaNum = (value) => {
  if (isEmpty(value)) return false
  const re = /^[a-zA-Z0-9]+$/
  return re.test(String(value))
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { valid: boolean, strength: string, message: string }
 */
export const passwordStrength = (password) => {
  if (isEmpty(password)) {
    return { valid: false, strength: 'none', message: 'Password is required' }
  }

  const length = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (length < 6) {
    return { valid: false, strength: 'weak', message: 'Password must be at least 6 characters' }
  }

  let strength = 0
  if (hasLower) strength++
  if (hasUpper) strength++
  if (hasNumber) strength++
  if (hasSpecial) strength++
  if (length >= 10) strength++

  if (strength <= 2) {
    return { valid: true, strength: 'weak', message: 'Weak password' }
  } else if (strength === 3) {
    return { valid: true, strength: 'medium', message: 'Medium strength password' }
  } else {
    return { valid: true, strength: 'strong', message: 'Strong password' }
  }
}

/**
 * Validate file size
 * @param {File} file
 * @param {number} maxSize - in bytes
 * @returns {boolean}
 */
export const fileSize = (file, maxSize) => {
  if (!file) return false
  return file.size <= maxSize
}

/**
 * Validate file type
 * @param {File} file
 * @param {Array} allowedTypes
 * @returns {boolean}
 */
export const fileType = (file, allowedTypes) => {
  if (!file) return false
  return allowedTypes.includes(file.type)
}

/**
 * Validate date format
 * @param {string} date
 * @param {string} format
 * @returns {boolean}
 */
export const dateFormat = (date, format = 'YYYY-MM-DD') => {
  if (isEmpty(date)) return false
  // Simple date validation, can be enhanced with moment.js
  const re = /^\d{4}-\d{2}-\d{2}$/
  return re.test(String(date))
}

/**
 * Validate matching values
 * @param {*} value1
 * @param {*} value2
 * @returns {boolean}
 */
export const match = (value1, value2) => {
  return value1 === value2
}

/**
 * Create custom validator
 * @param {Function} validatorFn
 * @param {string} message
 * @returns {Function}
 */
export const custom = (validatorFn, message) => {
  return (value) => {
    const result = validatorFn(value)
    return {
      valid: result,
      message: result ? '' : message
    }
  }
}

export default {
  isEmpty,
  required,
  email,
  phone,
  url,
  minLength,
  maxLength,
  minValue,
  maxValue,
  numeric,
  alpha,
  alphaNum,
  passwordStrength,
  fileSize,
  fileType,
  dateFormat,
  match,
  custom
}
