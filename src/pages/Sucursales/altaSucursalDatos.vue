<template>
  <div class="alta-datos-container">
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Alta de Sucursal - Datos</h1>
          <p class="page-subtitle">Complete los datos adicionales de la sucursal</p>
        </div>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="guardarDatos" class="datos-form">
        <div class="form-section">
          <h3 class="section-title">Información Básica</h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Dirección</label>
              <input
                type="text"
                v-model="formData.direccion"
                class="form-input"
                placeholder="Ingrese la dirección"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input
                type="tel"
                v-model="formData.telefono"
                class="form-input"
                placeholder="Ingrese el teléfono"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input
                type="email"
                v-model="formData.email"
                class="form-input"
                placeholder="Ingrese el email"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Horario de Atención</label>
              <select v-model="formData.horario" class="form-input">
                <option value="">Seleccione horario</option>
                <option value="24hs">24 Horas</option>
                <option value="diurno">Diurno (8:00 - 20:00)</option>
                <option value="nocturno">Nocturno (20:00 - 8:00)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Configuración Técnica</h3>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Capacidad Máxima</label>
              <input
                type="number"
                v-model="formData.capacidad"
                class="form-input"
                placeholder="Número máximo de conexiones"
                min="1"
                max="100"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Zona Horaria</label>
              <select v-model="formData.timezone" class="form-input">
                <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Santiago">Santiago (GMT-3)</option>
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <textarea
              v-model="formData.observaciones"
              class="form-textarea"
              placeholder="Observaciones adicionales..."
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="$router.go(-1)">
            <i class="fas fa-arrow-left"></i>
            Volver
          </button>
          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i>
            Guardar Datos
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AltaSucursalDatos',
  data() {
    return {
      formData: {
        direccion: '',
        telefono: '',
        email: '',
        horario: '',
        capacidad: '',
        timezone: 'America/Buenos_Aires',
        observaciones: ''
      }
    }
  },
  methods: {
    guardarDatos() {
      // Validación básica
      if (!this.formData.direccion.trim()) {
        alert('La dirección es obligatoria')
        return
      }

      // Aquí iría la lógica para guardar los datos
      console.log('Datos a guardar:', this.formData)

      // Simular guardado exitoso
      alert('Datos guardados exitosamente')

      // Redirigir a la lista de sucursales
      this.$router.push('/sucursales')
    }
  }
}
</script>

<style scoped>
.alta-datos-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  backdrop-filter: blur(10px);
}

.header-text h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .alta-datos-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.3rem;
  }
}
</style>
