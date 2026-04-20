<template>
  <div class="container is-fluid">
    <!-- Alert Notifications -->
    <div
v-if="alertMsg"
class="notification-container"
>
      <div :class="['notification', `is-${alertType}`]">
        <button
class="delete"
@click="alertMsg = ''"
/>
        <span>{{ alertMsg }}</span>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-title">
          <span class="icon has-text-primary">
            <i class="fas fa-tags" />
          </span>
          <span>Gestión de Categorías</span>
        </div>
        <div class="card-header-icon">
          <button
class="button is-primary"
@click="showModal = true"
>
            <span class="icon">
              <i class="fas fa-plus" />
            </span>
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      <div class="card-content">
        <!-- Search Section -->
        <div class="field has-addons">
          <div class="control has-icons-left is-expanded">
            <input
              v-model="searchTerm"
              class="input"
              type="text"
              placeholder="Buscar categorías..."
              @keyup.enter="filtrarCategorias()"
            >
            <span class="icon is-small is-left">
              <i class="fas fa-search" />
            </span>
          </div>
          <div class="control">
            <button
class="button is-info"
@click="filtrarCategorias()"
>
              <span class="icon">
                <i class="fas fa-search" />
              </span>
              <span>Buscar</span>
            </button>
          </div>
        </div>

        <!-- Data Table -->
        <div class="table-container">
          <b-table
            :data="filteredCategorias"
            :columns="tableColumns"
            :loading="loading"
            :paginated="true"
            :per-page="10"
            :mobile-cards="true"
            empty-text="No se encontraron categorías"
            loading-text="Cargando categorías..."
            class="table is-striped is-hoverable is-fullwidth"
          >
            <template #default="props">
              <b-table-column
field="actions"
label="Acciones"
width="200"
>
                <div class="buttons are-small">
                  <button
                    v-for="(button, index) in tableButtons"
                    :key="`action-${index}`"
                    :class="['button', `is-${button.type || 'danger'}`]"
                    :title="button.label"
                    @click="button.fn ? button.fn(props.row) : null"
                  >
                    <span class="icon is-small">
                      <i :class="`fas fa-${button.icon}`" />
                    </span>
                    <span>{{ button.label }}</span>
                  </button>
                </div>
              </b-table-column>
            </template>
          </b-table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
v-if="showModal"
class="modal is-active"
>
      <div
class="modal-background"
@click="showModal = false"
/>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span class="icon has-text-primary">
              <i class="fas fa-tag" />
            </span>
            {{ form.title }}
          </p>
          <button
class="delete"
@click="showModal = false"
/>
        </header>

        <section class="modal-card-body">
          <div class="content">
            <div class="field">
              <label class="label">Nombre de la Categoría *</label>
              <div class="control has-icons-left">
                <input
                  v-model="categoria.cat_nombre"
                  class="input"
                  type="text"
                  placeholder="Ingrese el nombre de la categoría"
                  required
                >
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Descripción</label>
              <div class="control">
                <textarea
                  v-model="categoria.cat_descripcion"
                  class="textarea"
                  rows="3"
                  placeholder="Descripción opcional de la categoría"
                />
              </div>
            </div>

            <div class="field">
              <label class="label">Tipo de Categoría</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="categoria.cat_tipo">
                    <option value="">
Seleccionar tipo...
</option>
                    <option value="musica">
Música
</option>
                    <option value="spots">
Spots
</option>
                    <option value="general">
General
</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input
                    v-model="categoria.cat_estado"
                    type="checkbox"
                    true-value="A"
                    false-value="B"
                  >
                  Categoría activa
                </label>
              </div>
            </div>
          </div>
        </section>

        <footer class="modal-card-foot">
          <button
class="button is-success"
@click="guardarCategoria()"
>
            <span class="icon">
              <i class="fas fa-save" />
            </span>
            <span>{{ form.submitLabel }}</span>
          </button>
          <button
class="button"
@click="showModal = false"
>
            <span class="icon">
              <i class="fas fa-times" />
            </span>
            <span>Cancelar</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import categoriaService from '@/services/CategoriaServices';

export default {
  name: "CategoriaManager",
  data() {
    return {
      loading: false,
      categorias: [],
      filteredCategorias: [],
      searchTerm: "",
      showModal: false,
      categoria: {
        cat_codigo: 0,
        cat_nombre: "",
        cat_descripcion: "",
        cat_tipo: "",
        cat_estado: "A"
      },
      form: {
        title: "Nueva Categoría",
        submitLabel: "Crear Categoría"
      },
      alertMsg: "",
      alertType: "info"
    }
  },
  computed: {
    tableColumns() {
      return [
        { field: "cat_codigo", label: "ID", sortable: true, width: 80 },
        { field: "cat_nombre", label: "Nombre", sortable: true },
        { field: "cat_descripcion", label: "Descripción", sortable: true },
        { field: "cat_tipo", label: "Tipo", sortable: true, width: 120 },
        { field: "cat_estado", label: "Estado", sortable: true, width: 100 }
      ];
    },
    tableButtons() {
      return [
        {
          label: "Editar",
          type: "success",
          icon: "pencil",
          fn: (row) => this.editarCategoria(row)
        },
        {
          label: "Eliminar",
          type: "danger",
          icon: "trash",
          fn: (row) => this.eliminarCategoria(row)
        }
      ];
    }
  },
  watch: {
    searchTerm() {
      this.filtrarCategorias();
    }
  },
  created() {
    this.cargarCategorias();
  },
  methods: {
    async cargarCategorias() {
      try {
        this.loading = true;
        const response = await categoriaService.getAll();
        this.categorias = response || [];
        this.filteredCategorias = [...this.categorias];
      } catch (error) {
        this.showAlert("Error al cargar las categorías.", "danger");
        console.error("Error cargando categorías:", error);
      } finally {
        this.loading = false;
      }
    },

    filtrarCategorias() {
      if (!this.searchTerm) {
        this.filteredCategorias = [...this.categorias];
      } else {
        const term = this.searchTerm.toLowerCase();
        this.filteredCategorias = this.categorias.filter(cat =>
          cat.cat_nombre.toLowerCase().includes(term) ||
          cat.cat_descripcion.toLowerCase().includes(term) ||
          cat.cat_tipo.toLowerCase().includes(term)
        );
      }
    },

    editarCategoria(categoria) {
      this.categoria = { ...categoria };
      this.form.title = "Editar Categoría";
      this.form.submitLabel = "Actualizar Categoría";
      this.showModal = true;
    },

    async eliminarCategoria(categoria) {
      if (!confirm(`¿Seguro que desea eliminar la categoría "${categoria.cat_nombre}"?`)) {
        return;
      }

      try {
        await categoriaService.delete(categoria.cat_codigo);
        this.showAlert("Categoría eliminada correctamente.", "success");
        this.cargarCategorias();
      } catch (error) {
        this.showAlert("Error al eliminar la categoría.", "danger");
        console.error("Error eliminando categoría:", error);
      }
    },

    async guardarCategoria() {
      if (!this.categoria.cat_nombre.trim()) {
        this.showAlert("El nombre de la categoría es requerido.", "warning");
        return;
      }

      try {
        if (this.categoria.cat_codigo === 0) {
          // Crear nueva categoría
          await categoriaService.create(this.categoria);
          this.showAlert("Categoría creada correctamente.", "success");
        } else {
          // Actualizar categoría existente
          await categoriaService.update(this.categoria.cat_codigo, this.categoria);
          this.showAlert("Categoría actualizada correctamente.", "success");
        }

        this.showModal = false;
        this.resetForm();
        this.cargarCategorias();
      } catch (error) {
        this.showAlert("Error al guardar la categoría.", "danger");
        console.error("Error guardando categoría:", error);
      }
    },

    resetForm() {
      this.categoria = {
        cat_codigo: 0,
        cat_nombre: "",
        cat_descripcion: "",
        cat_tipo: "",
        cat_estado: "A"
      };
      this.form.title = "Nueva Categoría";
      this.form.submitLabel = "Crear Categoría";
    },

    showAlert(msg, type = "info") {
      this.alertMsg = msg;
      this.alertType = type;
      setTimeout(() => (this.alertMsg = ""), 5000);
    }
  }
};
</script>

