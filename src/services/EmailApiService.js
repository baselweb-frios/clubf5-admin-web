/**
 * Servicio cliente para el microservicio de email
 * Conecta con clubf5-email-service
 */

const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001';
const EMAIL_API_KEY = import.meta.env.VITE_EMAIL_API_KEY || '';

class EmailApiService {
  constructor() {
    this.baseUrl = EMAIL_SERVICE_URL;
    this.apiKey = EMAIL_API_KEY;
  }

  async request(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en el servicio de email');
      }

      return result;
    } catch (error) {
      console.error('EmailApiService error:', error);
      throw error;
    }
  }

  /**
   * Envía un email de recuperación de contraseña
   */
  async sendPasswordReset(email, username, resetToken) {
    return this.request('/api/email/password-reset', {
      to: email,
      username,
      resetToken
    });
  }

  /**
   * Envía un email de bienvenida
   */
  async sendWelcome(email, username) {
    return this.request('/api/email/welcome', {
      to: email,
      username
    });
  }

  /**
   * Envía una notificación por email
   */
  async sendNotification(email, username, title, message) {
    return this.request('/api/email/notification', {
      to: email,
      username,
      title,
      message
    });
  }

  /**
   * Envía un email de factura
   */
  async sendInvoice(email, username, invoiceData) {
    return this.request('/api/email/invoice', {
      to: email,
      username,
      invoiceData
    });
  }

  /**
   * Envía un email personalizado
   */
  async sendCustomEmail(email, subject, htmlContent) {
    return this.request('/api/email/send', {
      to: email,
      subject,
      html: htmlContent
    });
  }

  /**
   * Verifica el estado del servicio
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new EmailApiService();
