<template>
  <v-data-table
    :headers="headers"
    :items="allDevices"
    item-key="device_id"
    :sort-by="['device_id']"
    class="elevation-1 pa-3"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Devices</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on">New Item</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
              <v-spacer></v-spacer>
              <template v-if="editedItem.device_id >= 0">
                <span class="subtitle-1">Device ID: {{ editedItem.device_id }}</span>
              </template>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.alias" label="Alias"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.identifier" label="Identifier"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.api_key" label="API key"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.fixed_loc_lat" label="Fixed latitude"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.fixed_loc_lon" label="Fixed longitude"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <confirm ref="confirm"></confirm>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import Confirm from '@/views/confirm.vue';
export default {
  components: {
    Confirm
  },
  name: "Devices",
  mixins: [apiMixin],
  created() {
    this.loadTable();
  },
  computed: {
    formTitle: function () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    },
  },
  data () {
    return {
      allDevices: [],
      dialog: false,
      headers: [
        {
          text: 'Device ID',
          align: 'left',
          value: 'device_id',
        },
        { text: 'Alias', value: 'alias' },
        { text: 'Identifier', value: 'identifier' },
        { text: 'API key', value: 'api_key' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        device_id: -1,
        alias: '',
        identifier: '',
        api_key: this.$store.state.user.api_key,
        fixed_loc_lat: 0,
        fixed_loc_lon: 0
      },
      defaultItem: {
        device_id: -1,
        alias: '',
        identifier: '',
        api_key: this.$store.state.user.api_key,
        fixed_loc_lat: 0,
        fixed_loc_lon: 0
      },
    }
  },
  methods: {
    loadTable () {
      this.apiRequest('get', '/devices')
        .then((response) => {
          this.allDevices = response.data
        })
        .catch(() => {
          // Ignore failed (re)loads
        })
    },
    editItem (item) {
      this.editedIndex = this.allDevices.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      this.$refs.confirm.open('Delete',
        `Are you sure you want to delete device ${item.alias}?`,
        { color: 'red' })
        .then((confirm) => {
          if (confirm) {
            this.apiRequest('delete', `/devices/${item.device_id}`)
              .then(() => {
                this.loadTable();
              })
              .catch((err) => {
                // Do not reload the table on internal server error
                if(err.response.status < 500) {
                  this.loadTable();
                }
              })
          }
        })
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    save () {
      if (this.editedIndex > -1) {
        this.apiRequest('put', `/devices/${this.editedItem.device_id}`, this.editedItem)
          .then(() => {
            this.loadTable();
          })
          .catch((err) => {
            // Do not reload the table on internal server error
            if(err.response.status < 500) {
              this.loadTable();
            }
          })
      } else {
        this.apiRequest('post', '/devices', this.editedItem)
          .then(() => {
            this.loadTable();
          })
          .catch((err) => {
            // Do not reload the table on internal server error
            if(err.response.status < 500) {
              this.loadTable();
            }
          })
      }
      this.close()
    }
  }
}
</script>
