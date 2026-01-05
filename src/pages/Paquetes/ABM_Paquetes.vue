<template>
  <div class="container is-fluid">
    <!-- Alert Notifications -->
    <div v-if="alertMsg" class="notification-container">
      <div :class="['notification', `is-${alertType}`]">
        <button class="delete" @click="alertMsg = ''"></button>
        <span>{{ alertMsg }}</span>
      </div>
    </div>

    <!-- Main Content Card -->
    <BaseCard title="Gestión de Paquetes">
      <template #actions>
        <BaseButton
          variant="primary"
          icon="fas fa-plus"
          @click="abrirModalNuevo"
        >
          Nuevo Paquete
        </BaseButton>
      </template>

      <!-- Data Table -->
      <DataTable
        :columns="tableColumns"
        :rows="paquetes"
        :loading="loading"
        :row-buttons="tableButtons"
        :config="tableConfig"
        no-data-message="No se encontraron paquetes"
      >
        <template #paq_precio="{ row }">
          {{ formatPrecio(row.paq_precio) }}
        </template>
        <template #paq_canequ="{ row }">
          {{ row.paq_canequ || '-' }}
        </template>
        <template #paq_maxspo="{ row }">
          {{ row.paq_maxspo || '-' }}
        </template>
        <template #paq_ia_limit="{ row }">
          {{ row.paq_ia_limit || '-' }}
        </template>
      </DataTable>
    </BaseCard>

    <!-- Create/Edit Modal -->
    <Modal
      v-model="showModal"
      :title="form.title"
      size="md"
      @close="resetForm"
    >
      <div class="form-grid">
        <BaseInput
          v-model="paquete.paq_descri"
          label="Descripción"
          placeholder="Ingrese la descripción del paquete"
          icon="tag"
          required
        />

        <div class="form-row">
          <BaseInput
            v-model.number="paquete.paq_canequ"
            type="number"
            label="Cantidad de Equipos"
            placeholder="Cantidad de equipos"
            :min="0"
          >
            <template #prepend>
              <i class="fas fa-desktop"></i>
            </template>
          </BaseInput>

          <BaseInput
            v-model.number="paquete.paq_precio"
            type="number"
            label="Precio"
            placeholder="Precio del paquete"
            :min="0"
            :step="0.01"
          >
            <template #prepend>
              <i class="fas fa-dollar-sign"></i>
            </template>
          </BaseInput>
        </div>

        <div class="form-row">
          <BaseInput
            v-model.number="paquete.paq_maxspo"
            type="number"
            label="Máximo de Spots"
            placeholder="Máximo de spots permitidos"
            :min="0"
          >
            <template #prepend>
              <i class="fas fa-bullhorn"></i>
            </template>
          </BaseInput>

          <BaseInput
            v-model.number="paquete.paq_ia_limit"
            type="number"
            label="Límite de IA"
            placeholder="Límite de uso de IA"
            :min="0"
          >
            <template #prepend>
              <i class="fas fa-robot"></i>
            </template>
          </BaseInput>
        </div>

        <div class="field">
          <label class="input-label">Características</label>
          <textarea
            v-model="paquete.paq_caract"
            class="textarea-field"
            rows="3"
            placeholder="Descripción de las características del paquete"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <BaseButton
          variant="secondary"
          @click="showModal = false"
          :disabled="saving"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="success"
          icon="fas fa-save"
          @click="guardarPaquete"
          :loading="saving"
        >
          {{ form.submitLabel }}
        </BaseButton>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import Modal from '@/components/ui/Modal.vue';
import DataTable from '@/components/ui/DataTable.vue';
import paqueteService from '@/services/PaqueteServices';

// State
const loading = ref(false);
const saving = ref(false);
const paquetes = ref([]);
const showModal = ref(false);
const alertMsg = ref('');
const alertType = ref('info');

const paquete = ref({
  paq_codigo: -1,
  paq_descri: '',
  paq_canequ: null,
  paq_precio: null,
  paq_caract: '',
  paq_maxspo: null,
  paq_ia_limit: null
});

const form = ref({
  title: 'Nuevo Paquete',
  submitLabel: 'Crear Paquete'
});

// Table configuration
const tableConfig = {
  per_page: 10,
  global_search: {
    visibility: true,
    placeholder: 'Buscar paquetes...'
  },
  highlight_row_hover: true
};

const tableColumns = [
  { field: 'paq_codigo', label: 'ID', sortable: true },
  { field: 'paq_descri', label: 'Descripción', sortable: true },
  { field: 'paq_canequ', label: 'Cant. Equipos', sortable: true },
  { field: 'paq_precio', label: 'Precio', sortable: true },
  { field: 'paq_maxspo', label: 'Max. Spots', sortable: true },
  { field: 'paq_ia_limit', label: 'Límite IA', sortable: true }
];

const tableButtons = computed(() => [
  {
    label: 'Editar',
    type: 'success',
    icon: 'pencil',
    showLabel: true,
    fn: (row) => editarPaquete(row)
  },
  {
    label: 'Eliminar',
    type: 'danger',
    icon: 'trash',
    showLabel: true,
    fn: (row) => eliminarPaquete(row)
  }
]);

// Methods
async function cargarPaquetes() {
  try {
    loading.value = true;
    const response = await paqueteService.getAll();
    paquetes.value = response || [];
  } catch (error) {
    showAlert('Error al cargar los paquetes.', 'danger');
    console.error('Error cargando paquetes:', error);
  } finally {
    loading.value = false;
  }
}

function abrirModalNuevo() {
  resetForm();
  showModal.value = true;
}

function editarPaquete(row) {
  paquete.value = { ...row };
  form.value.title = 'Editar Paquete';
  form.value.submitLabel = 'Actualizar Paquete';
  showModal.value = true;
}

async function eliminarPaquete(row) {
  if (!confirm(`¿Seguro que desea eliminar el paquete "${row.paq_descri}"?`)) {
    return;
  }

  try {
    await paqueteService.delete(row.paq_codigo);
    showAlert('Paquete eliminado correctamente.', 'success');
    cargarPaquetes();
  } catch (error) {
    showAlert('Error al eliminar el paquete.', 'danger');
    console.error('Error eliminando paquete:', error);
  }
}

async function guardarPaquete() {
  if (!paquete.value.paq_descri || !paquete.value.paq_descri.trim()) {
    showAlert('La descripción del paquete es requerida.', 'warning');
    return;
  }

  try {
    saving.value = true;

    if (paquete.value.paq_codigo === -1) {
      await paqueteService.create(paquete.value);
      showAlert('Paquete creado correctamente.', 'success');
    } else {
      await paqueteService.update(paquete.value.paq_codigo, paquete.value);
      showAlert('Paquete actualizado correctamente.', 'success');
    }

    showModal.value = false;
    resetForm();
    cargarPaquetes();
  } catch (error) {
    showAlert('Error al guardar el paquete.', 'danger');
    console.error('Error guardando paquete:', error);
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  paquete.value = {
    paq_codigo: 0,
    paq_descri: '',
    paq_canequ: null,
    paq_precio: null,
    paq_caract: '',
    paq_maxspo: null,
    paq_ia_limit: null
  };
  form.value.title = 'Nuevo Paquete';
  form.value.submitLabel = 'Crear Paquete';
}

function formatPrecio(precio) {
  if (precio === null || precio === undefined) return '-';
  return `$${precio.toFixed(2)}`;
}

function showAlert(msg, type = 'info') {
  alertMsg.value = msg;
  alertType.value = type;
  setTimeout(() => (alertMsg.value = ''), 5000);
}

// Load data on mount
cargarPaquetes();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
  width: 100%;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  animation: slideIn 0.3s ease;
}

.notification.is-success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.notification.is-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.notification.is-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.notification.is-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.notification .delete {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.notification .delete:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notification .delete::before,
.notification .delete::after {
  content: '';
  position: absolute;
  width: 0.75rem;
  height: 2px;
  background: currentColor;
}

.notification .delete::before {
  transform: rotate(45deg);
}

.notification .delete::after {
  transform: rotate(-45deg);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Form Grid */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Textarea field styling to match BaseInput */
.input-label {
  display: block;
  margin-bottom: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #a1a1aa;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.textarea-field {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: #ffffff;
  font-size: 0.9375rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.textarea-field::placeholder {
  color: #52525b;
}

.textarea-field:hover {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
}

.textarea-field:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.field {
  margin-bottom: 1.25rem;
}

/* Responsive */
@media (min-width: 768px) {
  .notification-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
}
</style>
