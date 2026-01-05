<template>
  <section class="section dropbox-buefy">
    <b-notification
      v-if="error"
      :closable="true"
      type="is-danger"
      position="is-top-right"
      @close="error = ''"
      class="dropbox-alert"
    >
      <b-icon icon="alert-circle" type="is-danger" /> {{ error }}
    </b-notification>
    <b-notification
      v-if="loading"
      :closable="false"
      type="is-info"
      position="is-top-right"
      class="dropbox-alert"
    >
      <b-icon icon="loading" type="is-info" custom-class="fa-spin" /> Cargando...
    </b-notification>

    <b-card class="dropbox-card">
      <div class="level mb-2">
        <div class="level-left">
          <div>
            <h2 class="title is-4 has-text-link">
              <b-icon icon="box" size="is-medium"></b-icon>
              Dropbox Manager
            </h2>
            <p class="subtitle is-6 has-text-grey">
              Administra tus archivos y carpetas en Dropbox de forma sencilla y profesional.
            </p>
          </div>
        </div>
        <div class="level-right">
          <b-button type="is-success" icon-left="folder-plus" @click="showCreateFolder = true" class="mr-2">
            Nueva Carpeta
          </b-button>
          <b-upload
            v-model="uploadFiles"
            :multiple="true"
            accept="*"
            @input="onFileChange"
            class="dropbox-upload"
          >
            <b-button type="is-primary" icon-left="upload">
              Subir Archivos
            </b-button>
          </b-upload>
          <b-button
            type="is-secondary"
            icon-left="arrow-up"
            v-if="currentPath"
            @click="goUp"
            class="ml-2"
          >
            Subir nivel
          </b-button>
        </div>
      </div>

      <b-field label="Ubicación actual" class="mb-2">
        <b-input
          v-model="currentPath"
          readonly
          icon="folder"
          expanded
        />
      </b-field>

      <b-table
        :data="entries"
        :striped="true"
        :hoverable="true"
        :mobile-cards="true"
        class="dropbox-table"
      >
        <b-table-column field="type" label="Tipo" width="80">
          <template slot-scope="props">
            <b-icon
              :icon="props.row['.tag'] === 'folder' ? 'folder' : 'file'"
              :type="props.row['.tag'] === 'folder' ? 'is-info' : 'is-link'"
            />
          </template>
        </b-table-column>
        <b-table-column field="name" label="Nombre">
          <template slot-scope="props">
            <span
              v-if="props.row['.tag'] === 'folder'"
              @click="openFolder(props.row.path_lower)"
              class="folder-link"
            >
              {{ props.row.name }}
            </span>
            <span v-else>
              {{ props.row.name }}
            </span>
          </template>
        </b-table-column>
        <b-table-column field="actions" label="Acciones" width="200">
          <template slot-scope="props">
            <b-tooltip label="Descargar" v-if="props.row['.tag'] === 'file'">
              <b-button type="is-info" size="is-small" icon-left="download" @click="downloadFile(props.row)" class="mr-1"/>
            </b-tooltip>
            <b-tooltip label="Eliminar">
              <b-button type="is-danger" size="is-small" icon-left="trash" @click="deleteEntry(props.row)" class="mr-1"/>
            </b-tooltip>
            <b-tooltip label="Abrir" v-if="props.row['.tag'] === 'folder'">
              <b-button type="is-primary" size="is-small" icon-left="folder-open" @click="openFolder(props.row.path_lower)" />
            </b-tooltip>
          </template>
        </b-table-column>
      </b-table>
      <div v-if="entries.length === 0" class="has-text-grey has-text-centered py-5">
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
  </section>
</template>

<script>
export default {
  name: 'DropboxManager',
  data() {
    return {
      DROPBOX_TOKEN: 'sl.u.AFzEKj97-0HFnaNrgJZVJsDQUUBIFnoGTQv22p7sHrgJiuulBXU9qSmcDgqeT_KM3rW1UfyDIOm1x9DDf_ykpjpQbbpqmFWXF2ijK6H8M_vWJaUW_S-D_DAgTnSIdmvGPXL2zYKmBKkOYa6ME5XdQkksQ5Es7jz8ae5XOHyIFPd-b4G76UzHFPknfGfAKDeeGEDY4G_ie0sQzE0AQN-FYSfTpcuyRrtyTJl1iDt6dgJ2X-nx0xR-1R7Hu6WtxzB_QBrik1joirxpyatRL8aXfLuGBO-uQghNSAUc8OIEBDpiLis9IPmBrUuePQ7-Yq8asLAEDYJuuhk2cfxZxP8yBboPW49_H4waVsmBdB98NZS4Zx4m1SF9p0EMpYGMohGWW9Ldvc8KZwCANeppUkwVD7-Wn_FGyJEBNvdTYzE5hh30wvOiuMGDADIUR_GfrpG7PMd8blbqxFHl8tkCyWj-wpBJTz5uY8HafoQASv7AFrnMLlWI4HLqjibyhAuBKdrR428LnhB3ELkwcswoL4RnQ4ZvH1UPg6-uUX3EWOvMJ4_i4-_3N5l4Ec2dBykG_6q-WCm0LtlBl-bj-7Ue_e4sF46wzSBqsWNA_WBrZN1YEyNPBJUmjHRZDEkZgHr0Cit-a2svLaAuk7wXF9leG2fKLS9YhGqvrw8-kkD5Y3i-5vYfVMo_6dEWXdyftSWLIuUYD8Qa5KyI2XIGsXgELDz8ghuvpugdiu3vw4mYXbGwriBH2Agt51xVm0N_wmnuzl4qAEfC6ejQ2rK9hcCqvuDswXyt14pTiVYI5mnrhaRYwx515MQ1BbMCLmg3almV2N_kQl30rG41uUdDFDeL4yINX9OgFV6lB7t9dawFniwB9tJZ8PfJXQLnIXoyRLK92DAwvu52MlJ4AgPvjIPMD-_V7uu63375z8Q9ENh2RakaOxE09E3EVr-LbIMgreJGJiIU77AKWLovCqfxTx5OKflouy8A-ihBYkUZ2xPxiICK-FkDufO2G2M1CcqLi2PK2S7A_YIkGrZ9uO-D7ixnysf0Zt-Cbo2OLXOf4YTFpuUA-u1TVwgvAxGXwmnTm5RdxzHG2QXk-hkO2yjAHNTUMl25ovzUrzj3DTFo26iwRUafQ8-QAH6QLCCCyJ3HrecWHJgNr04lNdj5wBhqkoyqEN--TrRFqX1l-9VINxrxHg2a27qsy9kBpihrBH-dQaaaPTEcmLWqE4YS0xHYE8YrBIVMRlZmI2j69_aKOtvaQINCfSJmT_fw9UDDItKMY-01R0fhGYNDeDI--CtieyvL0LSEezwl',
      entries: [],
      currentPath: '',
      error: '',
      loading: false,
      showCreateFolder: false,
      newFolderName: '',
      uploadFiles: null
    }
  },
  methods: {
    async onFileChange(files) {
      if (!files || !files.length) return
      this.loading = true
      try {
        for (let file of files) {
          const path = (this.currentPath || '') + '/' + file.name
          await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.DROPBOX_TOKEN}`,
              'Dropbox-API-Arg': JSON.stringify({
                path,
                mode: 'add',
                autorename: true,
                mute: false
              }),
              'Content-Type': 'application/octet-stream'
            },
            body: file
          })
        }
        await this.listFolder(this.currentPath)
        this.uploadFiles = null
      } catch (e) {
        this.error = 'Error al subir archivos: ' + e.message
      }
      this.loading = false
    },
    async listFolder(path = '') {
      this.error = ''
      this.loading = true
      try {
        const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.DROPBOX_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: path || ''
          })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error_summary)
        this.entries = data.entries
        this.currentPath = path
      } catch (e) {
        this.error = 'Error al listar carpeta: ' + e.message
      }
      this.loading = false
    },
    openFolder(path) {
      this.listFolder(path)
    },
    goUp() {
      if (!this.currentPath) return
      const parts = this.currentPath.split('/')
      parts.pop()
      const upPath = parts.join('/') || ''
      this.listFolder(upPath)
    },
    async deleteEntry(entry) {
      if (!confirm(`¿Eliminar ${entry['.tag'] === 'folder' ? 'carpeta' : 'archivo'} ${entry.name}?`)) return
      this.error = ''
      this.loading = true
      try {
        await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.DROPBOX_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: entry.path_lower })
        })
        await this.listFolder(this.currentPath)
      } catch (e) {
        this.error = 'Error al eliminar: ' + e.message
      }
      this.loading = false
    },
    async createFolder() {
      if (!this.newFolderName) return
      this.error = ''
      this.loading = true
      try {
        const path = (this.currentPath || '') + '/' + this.newFolderName
        await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.DROPBOX_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path })
        })
        this.newFolderName = ''
        this.showCreateFolder = false
        await this.listFolder(this.currentPath)
      } catch (e) {
        this.error = 'Error al crear carpeta: ' + e.message
      }
      this.loading = false
    },
    async downloadFile(entry) {
      this.error = ''
      try {
        const res = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.DROPBOX_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: entry.path_lower })
        })
        const data = await res.json()
        if (data.link) {
          window.open(data.link, '_blank')
        } else {
          this.error = 'No se pudo obtener el enlace de descarga.'
        }
      } catch (e) {
        this.error = 'Error al obtener link de descarga: ' + e.message
      }
    }
  },
  mounted() {
    this.listFolder('')
  }
}
</script>

<style scoped>
.dropbox-buefy {
  background: linear-gradient(135deg, #e3f0ff 0%, #f9faff 100%);
  min-height: 100vh;
}
.dropbox-card {
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
  padding: 2.5rem 2rem 2rem 2rem;
  margin: 2.5rem auto;
  max-width: 900px;
}
.dropbox-table {
  border-radius: 1.2rem;
  background: #fff;
  box-shadow: 0 2px 8px #0061ff11;
}
.dropbox-upload {
  display: inline-block;
}
.dropbox-alert {
  z-index: 9999;
}
.folder-link {
  color: #0061ff;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.18s;
}
.folder-link:hover {
  color: #00a2ff;
  text-decoration: underline;
}
</style>