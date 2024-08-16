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
          <ConfirmDialog ref="confirmDialog" />
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
          <v-btn v-tooltip="'Add device'" icon="mdi-plus" @click="newItem()" />
          <v-btn
            v-tooltip="'Edit selected device'"
            :disabled="selectedOwned(selected).length !== 1"
            icon="mdi-pencil"
            @click="editItem(selectedOwned(selected)[0])"
          />
          <v-btn
            v-tooltip="'Share/unshare selected devices'"
            :disabled="selectedOwned(selected).length == 0"
            icon="mdi-share-all"
            @click="shareItems(selectedOwned(selected))"
          />
          <v-btn
            v-tooltip="'Remove selected devices'"
            :disabled="selectedOwned(selected).length == 0"
            icon="mdi-delete"
            @click="deleteItems(selectedOwned(selected))"
          />
        </v-toolbar>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn
          v-if="item.api_key === user.api_key"
          v-tooltip="'Edit device'"
          icon="mdi-pencil"
          size="small"
          variant="plain"
          @click="editItem(item)"
        />
        <v-btn
          v-if="item.api_key === user.api_key"
          v-tooltip="'Share/unshare device'"
          icon="mdi-share-all"
          size="small"
          variant="plain"
          @click="shareItems([item])"
        />
        <v-btn
          v-if="item.api_key === user.api_key"
          v-tooltip="'Remove device'"
          icon="mdi-delete"
          size="small"
          variant="plain"
          @click="deleteItems([item])"
        />
      </template>
      <template #[`item.shared`]="{ item }">
        <div
          v-if="item.shared && item.shared[0] != null && item.shared.length > 0"
        >
          <v-chip
            v-for="sharedUser in item.shared"
            :key="sharedUser"
            class="ma-1"
            :color="getColor(sharedUser)"
          >
            {{ sharedUser }}
          </v-chip>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { inject, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import DeviceListEditDevice from "@/components/DeviceListEditDevice.vue";
import DeviceListEditSharedUser from "@/components/DeviceListEditSharedUser.vue";

const allDevices = ref([]);
const confirmDialog = ref(null);
const editDevice = ref(null);
const editSharedUser = ref(null);
const headers = [
  { title: "Name", key: "alias" },
  { title: "Owner", key: "owner" },
  { title: "Shared With", key: "shared" },
  { title: "Actions", key: "actions", sortable: false },
];
const httpRequest = inject("httpRequest");
const newDevice = ref({
  device_id: -1,
  alias: "",
  identifier: "",
  api_key: "",
  fixed_loc_lat: "",
  fixed_loc_lon: "",
});
const search = ref("");
const selected = ref([]);
const { user } = storeToRefs(useAuthStore());
let usernameColors = [];

onMounted(() => {
  loadTable();
});

function loadTable() {
  httpRequest("get", `users/${user.value.user_id}/devices`)
    .then((response) => {
      allDevices.value = response.data;
      allDevices.value.forEach((e) => {
        if (e.shared) {
          e.shared.sort();
        }
      });
    })
    .catch(() => {
      // Ignore failed (re)loads
    });
}

function editItem(item) {
  showDialogDevice(item);
}

function newItem() {
  newDevice.value.api_key = user.value.api_key;
  showDialogDevice(newDevice.value);
}

function shareItems(items) {
  showDialogSharedUser(items);
}

function deleteItems(items) {
  let deviceIdList = [];
  let deviceAliasList = [];
  let messageText = [];
  messageText.push("Are you sure you want to delete the following devices?");
  for (let item of items) {
    deviceIdList.push(item.device_id);
    deviceAliasList.push(item.alias);
  }
  confirmDialog.value
    .open("Delete", messageText, deviceAliasList, { color: "red" })
    .then((confirm) => {
      if (confirm) {
        httpRequest(
          "delete",
          `users/${user.value.user_id}/devices/${deviceIdList}`,
        )
          .then(() => {
            loadTable();
            selected.value = [];
          })
          .catch((err) => {
            // Do not reload the table on internal server error
            if (err.response.status < 500) {
              loadTable();
            }
          });
      }
    });
}

function showDialogDevice(device) {
  editDevice.value.open(device).then(() => {
    loadTable();
  });
}

function showDialogSharedUser(devices) {
  editSharedUser.value.open(devices).then(() => {
    loadTable();
  });
}

function getColor(key) {
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
  while (i < usernameColors.length && usernameColors[i] !== key) {
    i++;
  }
  if (i === usernameColors.length && typeof key === "string") {
    usernameColors.push(key);
  }
  return colors[i % colors.length];
}

function selectedOwned(ids) {
  return allDevices.value.filter((e) => {
    return (
      ids.includes(e.device_id) && e.api_key && e.api_key === user.value.api_key
    );
  });
}
</script>
