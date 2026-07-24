/**
 * Simple toast notification plugin
 * Temporary replacement for Buefy toast
 */

export default {
  install(app) {
    // Create toast container
    const createToastContainer = () => {
      if (document.getElementById('toast-container')) return

      const container = document.createElement('div')
      container.id = 'toast-container'
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `
      document.body.appendChild(container)
    }

    // Show toast
    const showToast = (message, type = 'info', duration = 3000) => {
      createToastContainer()

      const toast = document.createElement('div')
      toast.style.cssText = `
        padding: 12px 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      `
      toast.textContent = message

      const container = document.getElementById('toast-container')
      container.appendChild(toast)

      // Add animation
      const style = document.createElement('style')
      if (!document.getElementById('toast-animations')) {
        style.id = 'toast-animations'
        style.textContent = `
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }

      // Auto remove
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in'
        setTimeout(() => toast.remove(), 300)
      }, duration)
    }

    // Create $buefy-like API
    const buefy = {
      toast: {
        open(options) {
          if (typeof options === 'string') {
            showToast(options)
          } else {
            showToast(
              options.message || '',
              options.type || 'info',
              options.duration || 3000
            )
          }
        }
      }
    }

    // Register global property
    app.config.globalProperties.$buefy = buefy

    // Also provide as simple toast function
    app.config.globalProperties.$toast = showToast

    // También se expone en `window` para poder disparar toasts fuera de un componente
    // (ej. navigation guards en router/index.js y guards.js, interceptors de axios, etc.)
    // donde no hay `getCurrentInstance()`/`this` disponible para llegar a globalProperties.
    window.$toast = showToast
  }
}
