<template>
  <section class="section obs-buefy">
    <b-notification
      v-if="alertMsg"
      :closable="true"
      type="is-info"
      position="is-top-right"
      @close="alertMsg = ''"
      class="obs-alert"
    >
      {{ alertMsg }}
    </b-notification>

    <b-card class="obs-card">
      <div class="level mb-2">
        <div class="level-left">
          <div>
            <h2 class="title is-4 has-text-link">
              <b-icon icon="cloud" size="is-medium"></b-icon>
              Gestor de Archivos OBS Cloud
            </h2>
            <p class="subtitle is-6 has-text-grey">
              Administra tus archivos y carpetas en la nube de forma sencilla y profesional.
            </p>
          </div>
        </div>
        <div class="level-right">
          <b-button type="is-success" icon-left="folder-plus" @click="showCreateFolder = true" class="mr-2">
            Nueva Carpeta
          </b-button>
          <b-upload
            v-model="uploadFiles"
            :multiple="false"
            accept="*"
            @input="onFileChange"
            class="obs-upload"
          >
            <b-button type="is-primary" icon-left="upload">
              Subir Archivo
            </b-button>
          </b-upload>
        </div>
      </div>

      <b-breadcrumb align="is-left" class="mb-4">
        <b-breadcrumb-item
          :active="breadcrumb.length === 0"
          @click.native="goToBreadcrumb(-1)"
          style="cursor:pointer"
        >
          Raíz
        </b-breadcrumb-item>
        <b-breadcrumb-item
          v-for="(segment, idx) in breadcrumb"
          :key="idx"
          :active="idx === breadcrumb.length - 1"
          @click.native="goToBreadcrumb(idx)"
          style="cursor:pointer"
        >
          {{ segment }}
        </b-breadcrumb-item>
      </b-breadcrumb>

      <b-table
        :data="objetos"
        :striped="true"
        :hoverable="true"
        :mobile-cards="true"
        class="obs-table"
      >
        <b-table-column field="name" label="Nombre">
          <template slot-scope="props">
            <span v-if="isFolder(props.row)">
              <b-icon icon="folder" type="is-info"></b-icon>
              <a @click.prevent="enterFolder(props.row)" class="has-text-link">{{ getName(props.row) }}</a>
            </span>
            <span v-else>
              <b-icon icon="file" type="is-link"></b-icon>
              {{ getName(props.row) }}
            </span>
          </template>
        </b-table-column>
        <b-table-column field="type" label="Tipo" width="120">
          <template slot-scope="props">
            <b-tag :type="isFolder(props.row) ? 'is-info' : 'is-light'">
              {{ isFolder(props.row) ? 'Carpeta' : 'Archivo' }}
            </b-tag>
          </template>
        </b-table-column>

        <b-table-column field="actions" label="Acciones" width="200">
          <template slot-scope="props">
            <b-tooltip label="Descargar" v-if="!isFolder(props.row)">
              <b-button type="is-info" size="is-small" icon-left="download" @click="downloadFile(props.row)" class="mr-1"/>
            </b-tooltip>
            <!-- <b-tooltip label="Renombrar/Mover">
              <b-button type="is-warning" size="is-small" icon-left="edit" @click="showRename(props.row)" class="mr-1"/>
            </b-tooltip> -->
            <b-tooltip label="Eliminar">
              <b-button type="is-danger" size="is-small" icon-left="trash" @click="deleteObject(props.row)" class="mr-1"/>
            </b-tooltip>
            <b-tooltip label="Link temporal" v-if="!isFolder(props.row)">
              <b-button type="is-primary" size="is-small" icon-left="link" @click="genLink(props.row)"/>
            </b-tooltip>
          </template>
        </b-table-column>
      </b-table>
      <div v-if="objetos.length === 0" class="has-text-grey has-text-centered py-5">
        <b-icon icon="inbox" size="is-large"></b-icon>
        <div>No hay archivos ni carpetas en esta ubicación.</div>
      </div>
    </b-card>

    <!-- Modal: Crear Carpeta -->
    <b-modal :active.sync="showCreateFolder" has-modal-card>
      <form @submit.prevent="createFolder">
        <div class="modal-card" style="width: 400px;">
          <header class="modal-card-head">
            <p class="modal-card-title">Crear Nueva Carpeta</p>
            <button type="button" class="delete" @click="showCreateFolder = false"></button>
          </header>
          <section class="modal-card-body">
            <b-field label="Nombre de la carpeta">
              <b-input v-model="newFolderName" required placeholder="Ej: Documentos"/>
            </b-field>
          </section>
          <footer class="modal-card-foot">
            <b-button type="is-secondary" @click="showCreateFolder = false">Cancelar</b-button>
            <b-button type="is-success" native-type="submit">Crear</b-button>
          </footer>
        </div>
      </form>
    </b-modal>

    <!-- Modal: Renombrar/Mover -->
    <b-modal :active.sync="showRenameModal" has-modal-card>
      <form @submit.prevent="renameObject">
        <div class="modal-card" style="width: 400px;">
          <header class="modal-card-head">
            <p class="modal-card-title">Renombrar / Mover</p>
            <button type="button" class="delete" @click="showRenameModal = false"></button>
          </header>
          <section class="modal-card-body">
            <b-field label="Nuevo nombre o ruta">
              <b-input v-model="renameTarget" required placeholder="nuevaCarpeta/archivo.txt"/>
            </b-field>
            <p class="help is-info">
              Puedes mover el objeto cambiando la ruta completa (ej: <code>nuevaCarpeta/archivo.txt</code>)
            </p>
          </section>
          <footer class="modal-card-foot">
            <b-button type="is-secondary" @click="showRenameModal = false">Cancelar</b-button>
            <b-button type="is-primary" native-type="submit">Renombrar/Mover</b-button>
          </footer>
        </div>
      </form>
    </b-modal>

    <!-- Modal: Link Compartido -->
    <b-modal :active.sync="showLinkModal" has-modal-card>
      <div class="modal-card" style="width: 400px;">
        <header class="modal-card-head">
          <p class="modal-card-title">Enlace Temporal</p>
          <button type="button" class="delete" @click="showLinkModal = false"></button>
        </header>
        <section class="modal-card-body">
          <b-field>
            <b-input :value="sharedLink" readonly icon="link"/>
          </b-field>
          <p class="help is-info">Copia y comparte este enlace. Expira en 24h.</p>
        </section>
        <footer class="modal-card-foot">
          <b-button type="is-secondary" @click="showLinkModal = false">Cerrar</b-button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import obsServices from '../../services/obsServices';

export default {
  name: "ObsCloudManager",
  data() {
    return {
      objetos: [],
      currentPrefix: "Music/online",
      breadcrumb: [],
      showCreateFolder: false,
      newFolderName: "",
      showRenameModal: false,
      renameObj: null,
      renameTarget: "",
      showLinkModal: false,
      sharedLink: "",
      alertMsg: "",
      uploadFiles: null
    };
  },
  created() {
    this.loadObjects();
  },
  methods: {
    async loadObjects() {
      try {
        const res = await obsServices.ListarObject({
          params: { prefix: this.currentPrefix }
        })
        this.objetos = res;
        this.breadcrumb = this.currentPrefix.split("/").filter(Boolean);
      } catch (e) {
        this.objetos = [];
        this.showAlert("Error al cargar objetos.");
      }
    },
    goToBreadcrumb(idx) {
      if (idx === -1) {
        this.currentPrefix = "";
      } else {
        this.currentPrefix = this.breadcrumb.slice(0, idx + 1).join("/") + "/";
      }
      this.loadObjects();
    },
    enterFolder(obj) {
      this.currentPrefix = obj.objectKey;
      this.loadObjects();
    },
    isFolder(obj) {
      return obj.objectKey.endsWith("/");
    },
    getName(obj) {
      const parts = obj.objectKey.split("/");
      return this.isFolder(obj) ? parts[parts.length - 2] : parts[parts.length - 1];
    },
    formatSize(bytes) {
      if (!bytes) return "-";
      const sizes = ["B", "KB", "MB", "GB"];
      let i = 0;
      while (bytes >= 1024 && i < sizes.length - 1) {
        bytes /= 1024;
        i++;
      }
      return bytes.toFixed(1) + " " + sizes[i];
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString();
    },
    async onFileChange(files) {
      const file = files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filePath", this.currentPrefix + file.name);
      try {
        await obsServices.SubirFiles(formData)
        this.showAlert("Archivo subido correctamente.");
        this.loadObjects();
      } catch {
        this.showAlert("Error al subir archivo.");
      }
      this.uploadFiles = null;
    },
    async createFolder() {
      if (!this.newFolderName) return;
      const folderKey = this.currentPrefix + this.newFolderName + "/";
      const blob = new Blob([], { type: "application/x-directory" });
      const formData = new FormData();
      formData.append("file", blob, ".empty");
      formData.append("filePath", folderKey + ".empty");
      try {
        await obsServices.SubirFiles(formData)
        this.showAlert("Carpeta creada correctamente.");
        this.showCreateFolder = false;
        this.newFolderName = "";
        this.loadObjects();
      } catch {
        this.showAlert("Error al crear carpeta.");
      }
    },
    showRename(obj) {
      this.renameObj = obj;
      this.renameTarget = obj.objectKey;
      this.showRenameModal = true;
    },
    async renameObject() {
      if (!this.renameObj || !this.renameTarget) return;
      try {
        await obsServices.Mover({
          Origen: this.renameObj.objectKey,
          Destino: this.renameTarget
        });
        this.showAlert("Objeto movido/renombrado correctamente.");
        this.showRenameModal = false;
        this.loadObjects();
      } catch {
        this.showAlert("Error al mover/renombrar objeto.");
      }
    },
    async deleteObject(obj) {
      if (!confirm("¿Seguro que deseas eliminar este objeto?")) return;
      try {
        if (this.isFolder(obj)) {
          await obsServices.Eliminar("/ObsCloud/EliminarObjeto", { params: { objectKey: obj.objectKey } });
        } else {
          await obsServices.Eliminar("/ObsCloud/Delete", { params: { objectName: obj.objectKey } });
        }
        this.showAlert("Objeto eliminado correctamente.");
        this.loadObjects();
      } catch {
        this.showAlert("Error al eliminar objeto.");
      }
    },
    async downloadFile(obj) {
      try {
        const res = await obsServices.Download({
          params: { objectName: obj.objectKey },
          responseType: "blob"
        });
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", this.getName(obj));
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch {
        this.showAlert("Error al descargar archivo.");
      }
    },
    async genLink(obj) {
      try {
        const res = await obsServices.GetLink({
          params: { objectKey: obj.objectKey }
        });
        this.sharedLink = res;
        this.showLinkModal = true;
      } catch {
        this.showAlert("Error al generar enlace.");
      }
    },
    showAlert(msg) {
      this.alertMsg = msg;
      setTimeout(() => (this.alertMsg = ""), 3500);
    }
  }
};
</script>

<style scoped>
.obs-buefy {
  background: linear-gradient(135deg, #e3f0ff 0%, #f9faff 100%);
  min-height: 100vh;
}
.obs-card {
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  padding: 2.5rem 2rem 2rem 2rem;
  margin: 2.5rem auto;
  max-width: 1100px;
}
.obs-table {
  border-radius: 1.2rem;
  background: #fff;
  box-shadow: 0 2px 8px #0061ff11;
}
.obs-upload {
  display: inline-block;
}
.obs-alert {
  z-index: 9999;
}
</style>

<!--
Requisitos:
- Instala Bootstrap 4 y FontAwesome para los íconos y estilos.
- Ajusta la URL base de axios si tu backend está en otro host/puerto.
- Asegúrate de que los endpoints de ObsCloudController estén accesibles.
-->
