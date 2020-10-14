<template>
  <v-dialog v-if="device" v-model="showDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline px-3">{{ formTitle }}</span>
        <v-spacer></v-spacer>
        <template v-if="device.device_id >= 0">
          <span class="subtitle-1 px-3">Device ID: {{ device.device_id }}</span>
        </template>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="device.alias" label="Alias"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="device.identifier" :disabled="device.device_id >= 0" label="Identifier"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="device.api_key" label="API key"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="device.fixed_loc_lat" label="Fixed latitude"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="device.fixed_loc_lon" label="Fixed longitude"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="noChange">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="changed">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
export default {
  name: "EditDevice",
  mixins: [apiMixin],
  computed: {
    formTitle: function () {
      return this.device.device_id < 0 ? 'New Device' : 'Edit Device'
    }
  },
  data () {
    return {
      showDialog: false,
      resolve: null,
      reject: null,
      device: {}
    }
  },
  methods: {
    open(device) {
      this.device = device;
      this.showDialog = true
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    changed() {
      // Existing devices already have an ID
      if (this.device.device_id >= 0) {
        this.apiRequest('put', `users/${this.$store.state.user.user_id}/devices/${this.device.device_id}`, this.device)
          .then(() => {
            this.resolve(true)
           })
          .catch((err) => {
            // Only throw an error on server errors
            if(err.response.status >= 500) {
              this.reject(true)
            } else {
              this.resolve(false)
            }
          })
          .finally(() => {
            this.showDialog = false
          })
      } else {
        this.apiRequest('post', `users/${this.$store.state.user.user_id}/devices`, this.device)
          .then(() => {
            this.resolve(true)
          })
          .catch((err) => {
            // Only throw an error on server errors
            if(err.response.status >= 500) {
              this.reject(true)
            } else {
              this.resolve(false)

            }
          })
          .finally(() => {
            this.showDialog = false
          })
      }
    },
    noChange() {
      this.resolve(false)
      this.showDialog = false
    }
  }
}
</script>
