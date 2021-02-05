<template>
  <q-page
    style="background-image: linear-gradient(to top, #30cfd0 0%, #330867 100%);"
  >
    <div class="full-width row justify-center" style="height:30%;">
      <q-file
        v-model="files"
        label="Subir archivo Excel"
        filled
        accept=".xlsx,.xls"
        class="btn-grad btn-bg"
        label-color="white"
        color="white"
        style="color: white"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" color="white" />
        </template>
      </q-file>
      <q-btn :disable="!files" label="Importar" class="btn-grad btn-bg" @click="getGeocode(files)"></q-btn>
    </div>
    <div v-if="loading" style="position: absolute; left: 50%; margin-left: -50px; top: 50%; margin-top: -50px;">
      <q-spinner-cube
        color="light-blue"
        size="6em"
      />
    </div>
    <div v-if="data.length" class="q-pa-md">
      <q-table
        dense
        title="Coordenadas"
        :data="data"
        :columns="columns"
        row-key="name"
        :loading="loadingData"
        rows-per-page-label="Registros por página"
        no-data-label="No hay registros para mostrar"
      />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      files: null,
      columns: [
        { name: 'address', label: 'Direccion', field: 'address', align: 'left', sortable: true },
        { name: 'lat', label: 'Latitud', field: 'lat', align: 'left', sortable: true },
        { name: 'lng', label: 'Longitud', field: 'lng', align: 'left', sortable: true }
      ],
      loadingData: false,
      loading: false,
      geocode: '',
      data: []
    }
  },
  methods: {
    getGeocode (info) {
      var formData = new FormData()
      formData.append('file', info)
      this.loading = true
      this.$api.post('upload', formData, {
        headers:
          {
            'Content-Type': 'multipart/form-data'
          }
      }).then(res => {
        this.getFile(res.filename)
        this.data = res.data
        this.loading = false
      }).catch(e => {
        console.log(e)
      })
    },
    getFile (name) {
      this.$api.get(`download/${name}`, {
        responseType: 'blob',
        headers:
          {
            'Content-Type': 'application/json'
          }
      }).then(res => {
        console.log(res)
        var a = document.createElement('a')
        var data = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        var url = URL.createObjectURL(data)
        a.href = url
        a.download = 'Coordenadas.xlsx'
        document.body.appendChild(a)
        a.click()
        setTimeout(function () {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        },
        0)
        this.loading = false
      }).catch(function (error) {
        return error
      })
    }
  }
}
</script>
<style>
.btn-import {color: linear-gradient( 109.6deg,  rgba(62,161,219,1) 11.2%, rgba(93,52,236,1) 100.2% );}
.btn-bg {
  background-image: linear-gradient(
    to right,
    #085078 0%,
    #85d8ce 51%,
    #085078 100%
  )
}
.btn-grad {
  margin: 10px;
  padding: 5px 10px;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  display: block;
}

.btn-grad:hover {
  background-position: right center;
  color: #fff;
  text-decoration: none;
}
</style>
