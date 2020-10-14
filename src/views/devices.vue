<template>
  <v-container fluid pa-3>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="allDevices"
      :search="search"
      item-key="device_id"
      :sort-by="['alias']"
      show-select
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
          flat
          dense
          color="secondary"
          dark
        >
          <confirm ref="confirm"></confirm>
          <editDevice ref="editDevice"></editDevice>
          <v-toolbar-title>Devices</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          >
          </v-text-field> 
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            @click="newItem()"
          >
            <v-icon dark>
              mdi-plus
            </v-icon>
          </v-btn>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            :disabled="selected.length!=1"
            @click="editItem()"
          >
            <v-icon dark>
              mdi-pencil
            </v-icon>
          </v-btn>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            :disabled="selected.length==0"
            @click="deleteItem()"
          >
            <v-icon dark>
              mdi-delete
            </v-icon>
          </v-btn>
        </v-toolbar>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import Confirm from '@/views/confirm.vue';
import EditDevice from '@/views/editDevice.vue';
export default {
  components: {
    Confirm,
    EditDevice
  },
  name: "Devices",
  mixins: [apiMixin],
  created() {
    this.loadTable();
  },
  data () {
    return {
      allDevices: [],
      selected: [],
      headers: [
        { text: 'Name', value: 'alias' },
        { text: 'Owner', value: 'owner' },
        { text: 'Shared with', value: 'shared' }
      ],
      search: '',
      newDevice: {
        device_id: -1,
        alias: '',
        identifier: '',
        api_key: this.$store.state.user.api_key,
        fixed_loc_lat: null,
        fixed_loc_lon: null
      },
    }
  },
  methods: {
    loadTable () {
      this.apiRequest('get', `users/${this.$store.state.user.user_id}/devices`)
        .then((response) => {
          this.allDevices = response.data
        })
        .catch(() => {
          // Ignore failed (re)loads
        })
    },
    editItem () {
      this.showDialog(this.selected[0]);
    },
    newItem () {
      this.showDialog(this.newDevice);
    },
    deleteItem () {
      let deviceIdList = [];
      let messageText = [];
      messageText.push('Are you sure you want to delete the following devices?');
      for (let item of this.selected) {
        deviceIdList.push(item.device_id);
        messageText.push(' •  ' + item.alias);
      }
      this.$refs.confirm.open('Delete', messageText,
        { color: 'red' })
        .then((confirm) => {
          if (confirm) {
            this.apiRequest('delete', `users/${this.$store.state.user.user_id}/devices/${deviceIdList}`)
              .then(() => {
                this.loadTable();
                this.selected = [];
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
    showDialog (device) {
      this.$refs.editDevice.open(device)
        .then(() => {
          this.loadTable();
          this.selected = [];
        })
    }
  }
}
</script>
