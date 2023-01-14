<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <v-container fluid pa-3>
    <v-data-table
      v-model="selected"
      density="compact"
      :headers="headers"
      item-value="device_id"
      :items="allDevices"
      :search="search"
      :sort-by="[{ key: 'alias', order: 'asc' }]"
      show-select
      class="elevation-1"
    >
      <template #top>
        <v-toolbar density="compact" color="secondary">
          <ConfirmDialog ref="confirm" />
          <DeviceListEditDevice ref="editDevice" />
          <DeviceListEditSharedUser ref="editSharedUser" />
          <v-toolbar-title>Devices</v-toolbar-title>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            density="compact"
            hide-details
            label="Search"
            single-line
          />
          <v-spacer />
          <v-btn icon="mdi-plus" @click="newItem()" />
          <v-btn
            :disabled="selectedOwned(selected).length !== 1"
            icon="mdi-pencil"
            @click="editItem(selectedOwned(selected)[0])"
          />
          <v-btn
            :disabled="selectedOwned(selected).length == 0"
            icon="mdi-share-all"
            @click="shareItems(selectedOwned(selected))"
          />
          <v-btn
            :disabled="selectedOwned(selected).length == 0"
            icon="mdi-delete"
            @click="deleteItems(selectedOwned(selected))"
          />
        </v-toolbar>
      </template>
      <template #item.actions="{ item }">
        <v-btn
          v-if="item.raw.api_key === $store.state.user.api_key"
          icon="mdi-pencil"
          size="small"
          variant="plain"
          @click="editItem(item.raw)"
        />
        <v-btn
          v-if="item.raw.api_key === $store.state.user.api_key"
          icon="mdi-share-all"
          size="small"
          variant="plain"
          @click="shareItems([item.raw])"
        />
        <v-btn
          v-if="item.raw.api_key === $store.state.user.api_key"
          icon="mdi-delete"
          size="small"
          variant="plain"
          @click="deleteItems([item.raw])"
        />
      </template>
      <template #item.shared="{ item }">
        <div
          v-if="
            item.raw.shared &&
            item.raw.shared[0] != null &&
            item.raw.shared.length > 0
          "
        >
          <v-chip
            v-for="sharedUser in item.raw.shared"
            :key="sharedUser"
            class="ma-1"
            :color="getColor(sharedUser)"
            :model-value="true"
          >
            {{ sharedUser }}
          </v-chip>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { ApiMixin } from "@/mixins/ApiMixin.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import DeviceListEditDevice from "@/components/DeviceListEditDevice.vue";
import DeviceListEditSharedUser from "@/components/DeviceListEditSharedUser.vue";
export default {
  name: "DeviceList",
  components: {
    ConfirmDialog,
    DeviceListEditDevice,
    DeviceListEditSharedUser,
  },
  mixins: [ApiMixin],
  data() {
    return {
      allDevices: [],
      search: "",
      selected: [],
      usernameColors: [],
    };
  },
  created() {
    this.headers = [
      { title: "Name", key: "alias" },
      { title: "Owner", key: "owner" },
      { title: "Shared With", key: "shared" },
      { title: "Actions", key: "actions", sortable: false },
    ];
    this.newDevice = {
      device_id: -1,
      alias: "",
      identifier: "",
      api_key: this.$store.state.user.api_key,
      fixed_loc_lat: "",
      fixed_loc_lon: "",
    };
    this.loadTable();
  },
  methods: {
    loadTable() {
      this.apiRequest("get", `users/${this.$store.state.user.user_id}/devices`)
        .then((response) => {
          this.allDevices = response.data;
          this.allDevices.forEach((e) => {
            if (e.shared) {
              e.shared.sort();
            }
          });
        })
        .catch(() => {
          // Ignore failed (re)loads
        });
    },
    editItem(item) {
      this.showDialogDevice(item);
    },
    newItem() {
      this.showDialogDevice(this.newDevice);
    },
    shareItems(items) {
      this.showDialogSharedUser(items);
    },
    deleteItems(items) {
      let deviceIdList = [];
      let deviceAliasList = [];
      let messageText = [];
      messageText.push(
        "Are you sure you want to delete the following devices?"
      );
      for (let item of items) {
        deviceIdList.push(item.device_id);
        deviceAliasList.push(item.alias);
      }
      this.$refs.confirm
        .open("Delete", messageText, deviceAliasList, { color: "red" })
        .then((confirm) => {
          if (confirm) {
            this.apiRequest(
              "delete",
              `users/${this.$store.state.user.user_id}/devices/${deviceIdList}`
            )
              .then(() => {
                this.loadTable();
                this.selected = [];
              })
              .catch((err) => {
                // Do not reload the table on internal server error
                if (err.response.status < 500) {
                  this.loadTable();
                }
              });
          }
        });
    },
    showDialogDevice(device) {
      this.$refs.editDevice.open(device).then(() => {
        this.loadTable();
      });
    },
    showDialogSharedUser(devices) {
      this.$refs.editSharedUser.open(devices).then(() => {
        this.loadTable();
      });
    },
    getColor(key) {
      const colors = [
        "blue",
        "cyan",
        "teal",
        "green",
        "amber",
        "orange",
        "pink",
        "indigo",
      ];
      let i = 0;
      while (i < this.usernameColors.length && this.usernameColors[i] !== key) {
        i++;
      }
      if (i === this.usernameColors.length && typeof key === "string") {
        this.usernameColors.push(key);
      }
      return colors[i % colors.length];
    },
    selectedOwned(ids) {
      return this.allDevices.filter((e) => {
        return (
          ids.includes(e.device_id) &&
          e.api_key &&
          e.api_key === this.$store.state.user.api_key
        );
      });
    },
  },
};
</script>
