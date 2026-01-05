/**
 * Helper utilities for Pinia stores
 */

import { useAuthStore } from '@/stores/auth'

/**
 * Check if user is authenticated before making API calls
 * @param {string} storeName - Name of the store for logging
 * @param {string} actionName - Name of the action for logging
 * @returns {boolean} - true if authenticated, false otherwise
 */
export function requireAuth(storeName, actionName) {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    console.warn(`${storeName}: User not authenticated, skipping ${actionName}`)
    return false
  }

  return true
}

/**
 * Wrapper for store actions that require authentication
 * @param {string} storeName - Name of the store
 * @param {string} actionName - Name of the action
 * @param {Function} action - The action to execute
 * @param {any} defaultReturn - Default value to return if not authenticated
 * @returns {Promise<any>} - Result of action or default value
 */
export async function withAuth(storeName, actionName, action, defaultReturn = []) {
  if (!requireAuth(storeName, actionName)) {
    return defaultReturn
  }

  try {
    return await action()
  } catch (error) {
    console.error(`${storeName}.${actionName}: Error:`, error)
    throw error
  }
}

/**
 * Check if token exists in localStorage
 * @returns {boolean}
 */
export function hasToken() {
  return !!localStorage.getItem('token')
}

/**
 * Check if user data exists in localStorage
 * @returns {boolean}
 */
export function hasUser() {
  return !!localStorage.getItem('user')
}

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}
