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
          <editSharedUser ref="editSharedUser"></editSharedUser>
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
            :disabled="selectedOwned(selected) !== 1"
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
            :disabled="selectedOwned(selected) === 0"
            @click="shareItem()"
          >
            <v-icon dark>
              mdi-share-all
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
      <template v-slot:[`item.shared`]="{ item }">
        <v-chip-group
          v-if="item.shared"
          multiple
          max=0
          column
        >
          <v-chip
            dark
            :small="$vuetify.breakpoint.mobile"
            v-for="sharedUser in item.shared" :key="sharedUser"
            v-show="typeof sharedUser === 'string'"
            :color="getColor(sharedUser)"
          >
            {{ sharedUser }}
          </v-chip>
        </v-chip-group>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import Confirm from '@/views/confirm.vue';
import EditDevice from '@/views/editDevice.vue';
import EditSharedUser from '@/views/editSharedUser.vue';
export default {
  components: {
    Confirm,
    EditDevice,
    EditSharedUser
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
        { text: 'Shared With', value: 'shared' }
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
      usernameColors: []
    }
  },
  methods: {
    loadTable () {
      this.apiRequest('get', `users/${this.$store.state.user.user_id}/devices`)
        .then((response) => {
          this.allDevices = response.data
          this.allDevices.forEach((el) => {
            if (el.shared) {
              el.shared.sort();
            }
          });
        })
        .catch(() => {
          // Ignore failed (re)loads
        })
    },
    editItem () {
      const ownedSelected = this.selected.filter((el) => {
        return el.api_key && el.api_key === this.$store.state.user.api_key;
      });
      this.showDialogDevice(ownedSelected[0]);
    },
    newItem () {
      this.showDialogDevice(this.newDevice);
    },
    shareItem () {
      const ownedSelected = this.selected.filter((el) => {
        return el.api_key && el.api_key === this.$store.state.user.api_key;
      });
      this.showDialogSharedUser(ownedSelected);
    },
    deleteItem () {
      let deviceIdList = [];
      let deviceAliasList = [];
      let messageText = [];
      messageText.push('Are you sure you want to delete the following devices?');
      for (let item of this.selected) {
        deviceIdList.push(item.device_id);
        deviceAliasList.push(item.alias);
      }
      this.$refs.confirm.open('Delete', messageText, deviceAliasList,
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
    showDialogDevice (device) {
      this.$refs.editDevice.open(device)
        .then(() => {
          this.loadTable();
        })
    },
    showDialogSharedUser (devices) {
      this.$refs.editSharedUser.open(devices)
        .then(() => {
          this.loadTable();
        })
    },
    getColor (key) {
      const colors = ['blue', 'cyan', 'teal', 'green', 'amber', 'orange', 'pink', 'indigo'];
      let i = 0;
      while (i < this.usernameColors.length && this.usernameColors[i] !== key) {
        i++;
      }
      if (i === this.usernameColors.length && typeof key === 'string') {
        this.usernameColors.push(key);
      }
      return colors[i%(colors.length)];
    },
    selectedOwned (devices) {
      let total = 0;
      devices.forEach(el => {
        if (el.api_key && el.api_key === this.$store.state.user.api_key) {
          total++;
        }
      });
      return total;
    }
  }
}
</script>
