<template>
  <div class="page-wrapper">
    <!-- Alert Notifications -->
    <div
v-if="alertMsg"
class="p-4 max-w-md mx-auto mb-6"
>
      <div :class="['alert', `alert-${getAlertVariant(alertType)}`]">
        <i class="fas fa-info-circle flex-shrink-0" />
        <span>{{ alertMsg }}</span>
        <button
class="ml-auto flex-shrink-0"
aria-label="Cerrar"
@click="alertMsg = ''"
>
          <i class="fas fa-times" />
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="page-content">
      <div class="card">
        <div class="flex-between mb-6 pb-6 border-b border-dark-border">
          <h1 class="text-2xl font-bold text-text-primary">
Gestión de Paquetes
</h1>
          <button
class="btn btn-primary"
@click="abrirModalNuevo"
>
            <i class="fas fa-plus" />
            Nuevo Paquete
          </button>
        </div>

        <!-- Loading State -->
        <div
v-if="loading"
class="flex-center py-12"
>
          <div class="spinner" />
          <span class="ml-3 text-text-secondary">Cargando paquetes...</span>
        </div>

        <!-- Data Table -->
        <div
v-else
class="table-container"
>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Cant. Equipos</th>
                <th>Precio</th>
                <th>Max. Spots</th>
                <th>Límite IA</th>
                <th class="text-right">
Acciones
</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paquetes.length === 0">
                <td
colspan="7"
class="text-center py-8 text-text-tertiary"
>
                  <i class="fas fa-inbox text-2xl mb-2 block" />
                  <p>No se encontraron paquetes</p>
                </td>
              </tr>
              <tr
v-for="paq in paquetes"
:key="paq.paq_codigo"
>
                <td>
                  <span class="font-medium text-text-primary">{{ paq.paq_codigo }}</span>
                </td>
                <td>{{ paq.paq_descri }}</td>
                <td>{{ paq.paq_canequ || '-' }}</td>
                <td>{{ formatPrecio(paq.paq_precio) }}</td>
                <td>{{ paq.paq_maxspo || '-' }}</td>
                <td>{{ paq.paq_ia_limit || '-' }}</td>
                <td>
                  <div class="flex-end gap-1.5">
                    <button
class="btn btn-ghost btn-icon btn-sm text-primary-400"
title="Editar"
@click="editarPaquete(paq)"
>
                      <i class="fas fa-pencil" />
                    </button>
                    <button
class="btn btn-ghost btn-icon btn-sm text-danger-400"
title="Eliminar"
@click="eliminarPaquete(paq)"
>
                      <i class="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
v-if="showModal"
class="modal-backdrop"
@click.self="showModal = false"
>
      <div class="modal max-w-md">
        <div class="modal-header">
          <h2 class="text-lg font-bold text-text-primary">
{{ form.title }}
</h2>
          <button
class="btn btn-ghost btn-icon"
aria-label="Cerrar"
@click="showModal = false"
>
            <i class="fas fa-times" />
          </button>
        </div>

        <div class="modal-body">
          <div class="space-y-4">
            <div class="form-group">
              <label class="label">Descripción</label>
              <input
v-model="paquete.paq_descri"
type="text"
class="input"
placeholder="Ingrese la descripción del paquete"
required
>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="label">Cant. Equipos</label>
                <input
v-model.number="paquete.paq_canequ"
type="number"
class="input"
placeholder="Equipos"
min="0"
>
              </div>
              <div class="form-group">
                <label class="label">Precio</label>
                <input
v-model.number="paquete.paq_precio"
type="number"
class="input"
placeholder="Precio"
min="0"
step="0.01"
>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="label">Max. Spots</label>
                <input
v-model.number="paquete.paq_maxspo"
type="number"
class="input"
placeholder="Spots"
min="0"
>
              </div>
              <div class="form-group">
                <label class="label">Límite IA</label>
                <input
v-model.number="paquete.paq_ia_limit"
type="number"
class="input"
placeholder="IA"
min="0"
>
              </div>
            </div>

            <div class="form-group">
              <label class="label">Características</label>
              <textarea
v-model="paquete.paq_caract"
class="input"
rows="3"
placeholder="Descripción de características"
/>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="showModal = false"
>
Cancelar
</button>
          <button
class="btn btn-primary"
:disabled="saving"
@click="guardarPaquete"
>
            <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
/>
            {{ form.submitLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import paqueteService from '@/services/PaqueteServices';

// Alert state
const alertMsg = ref('');
const alertType = ref('info');

// Modal state
const showModal = ref(false);
const saving = ref(false);
const loading = ref(false);

// Form data
const paquetes = ref([]);
const paquete = ref({
  paq_codigo: null,
  paq_descri: '',
  paq_canequ: 0,
  paq_precio: 0,
  paq_caract: '',
  paq_maxspo: 0,
  paq_ia_limit: 0,
});

const form = ref({
  title: 'Nuevo Paquete',
  submitLabel: 'Crear',
});

// Load paquetes on mount
const cargarPaquetes = async () => {
  try {
    loading.value = true;
    const response = await paqueteService.getAll();
    paquetes.value = response || [];
  } catch (error) {
    console.error('Error loading paquetes:', error);
    mostrarAlerta('Error al cargar los paquetes', 'danger');
  } finally {
    loading.value = false;
  }
};

// Methods
const abrirModalNuevo = () => {
  resetForm();
  form.value = {
    title: 'Nuevo Paquete',
    submitLabel: 'Crear',
  };
  showModal.value = true;
};

const editarPaquete = (paq) => {
  paquete.value = { ...paq };
  form.value = {
    title: 'Editar Paquete',
    submitLabel: 'Guardar',
  };
  showModal.value = true;
};

const guardarPaquete = async () => {
  try {
    if (!paquete.value.paq_descri) {
      mostrarAlerta('La descripción es requerida', 'warning');
      return;
    }

    saving.value = true;

    if (paquete.value.paq_codigo) {
      // Update existing
      await paqueteService.update(paquete.value.paq_codigo, paquete.value);
      mostrarAlerta('Paquete actualizado correctamente', 'success');
    } else {
      // Create new
      await paqueteService.create(paquete.value);
      mostrarAlerta('Paquete creado correctamente', 'success');
    }

    showModal.value = false;
    await cargarPaquetes();
  } catch (error) {
    console.error('Error saving paquete:', error);
    mostrarAlerta('Error al guardar el paquete', 'danger');
  } finally {
    saving.value = false;
  }
};

const eliminarPaquete = async (paq) => {
  if (!confirm(`¿Desea eliminar el paquete "${paq.paq_descri}"?`)) {
    return;
  }

  try {
    saving.value = true;
    await paqueteService.delete(paq.paq_codigo);
    mostrarAlerta('Paquete eliminado correctamente', 'success');
    await cargarPaquetes();
  } catch (error) {
    console.error('Error deleting paquete:', error);
    mostrarAlerta('Error al eliminar el paquete', 'danger');
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  paquete.value = {
    paq_codigo: null,
    paq_descri: '',
    paq_canequ: 0,
    paq_precio: 0,
    paq_caract: '',
    paq_maxspo: 0,
    paq_ia_limit: 0,
  };
};

const mostrarAlerta = (mensaje, tipo = 'info') => {
  alertMsg.value = mensaje;
  alertType.value = tipo;
  setTimeout(() => {
    alertMsg.value = '';
  }, 5000);
};

const formatPrecio = (precio) => {
  if (!precio) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precio);
};

const getAlertVariant = (type) => {
  const variants = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
  };
  return variants[type] || 'info';
};

// Load data on mount
cargarPaquetes();
</script>

