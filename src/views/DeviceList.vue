<template>
  <v-container class="pa-3" fluid style="height: 100%">
    <v-row v-if="state === 'loading'" style="height: 100%">
      <v-col align-self="center" class="text-center">
        <v-progress-circular
          v-if="state === 'loading'"
          data-cy="device-list-state-loading"
          indeterminate
          :size="50"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="state === 'empty'"
      action-text="Add a device manually"
      data-cy="device-list-state-empty"
      icon="mdi-devices"
      style="height: 100%"
      text="You have no devices and no devices have been shared with you. Add your own device manually or configure your device with your API key to automatically add a new device."
      title="No devices yet."
      @click:action="newItem()"
    >
      <DeviceListEditDevice ref="deviceListEditDevice" />
    </v-empty-state>

    <v-empty-state
      v-if="state === 'empty-viewer'"
      data-cy="device-list-state-empty-viewer"
      icon="mdi-devices"
      style="height: 100%"
      text="No devices have been shared with you."
      title="No devices yet."
    ></v-empty-state>

    <v-empty-state
      v-if="state === 'failed'"
      data-cy="device-list-state-failed"
      icon="mdi-emoticon-sad"
      style="height: 100%"
      text="This may be caused by a server failure or a problem with your connection."
      title="Unable to show your devices."
    ></v-empty-state>

    <v-data-table
      v-if="state === 'loaded'"
      v-model="selected"
      data-cy="device-list-state-loaded"
      density="compact"
      :headers="headers"
      item-value="device_id"
      :items="allDevices"
      :mobile="null"
      mobile-breakpoint="md"
      :search="search"
      :sort-by="[{ key: 'alias', order: 'asc' }]"
      show-select
      class="elevation-1"
    >
      <template #top>
        <v-toolbar density="compact" color="secondary">
          <ConfirmDialog ref="confirmDialog" />
          <DeviceListEditDevice ref="deviceListEditDevice" />
          <DeviceListEditSharedUser ref="deviceListEditSharedUser" />
          <v-toolbar-title class="hidden-xs">Devices</v-toolbar-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            class="pl-4"
            density="compact"
            hide-details
            label="Search"
            single-line
          />
          <v-spacer />
          <v-btn
            v-tooltip="'Add device'"
            :disabled="user.role === 'viewer'"
            icon="mdi-plus"
            @click="newItem()"
          />
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
            density="compact"
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
const deviceListEditDevice = ref(null);
const deviceListEditSharedUser = ref(null);
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
const { show } = inject("snackbar");
const state = ref(null);
const { user } = storeToRefs(useAuthStore());
let usernameColors = [];

onMounted(async () => {
  await loadTable();
});

async function loadTable() {
  state.value = "loading";
  try {
    const response = await httpRequest(
      "get",
      `users/${user.value.user_id}/devices`,
    );
    allDevices.value = response.data;
    allDevices.value.forEach((e) => {
      if (e.shared) {
        e.shared.sort();
      }
    });
    if (allDevices.value.length === 0) {
      if (user.value.role === "viewer") {
        state.value = "empty-viewer";
      } else {
        state.value = "empty";
      }
    } else {
      state.value = "loaded";
    }
  } catch {
    state.value = "failed";
  }
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

async function deleteItems(items) {
  let deviceIdList = [];
  let deviceAliasList = [];
  const messageText = [
    "Are you sure you want to delete the following devices?",
  ];
  for (let item of items) {
    deviceIdList.push(item.device_id);
    deviceAliasList.push(item.alias);
  }
  const confirm = await confirmDialog.value.open(
    "Delete",
    messageText,
    deviceAliasList,
    { color: "red" },
  );
  if (confirm) {
    try {
      await httpRequest(
        "delete",
        `users/${user.value.user_id}/devices/${deviceIdList}`,
      );
      await loadTable();
      selected.value = [];
      show({ message: `Device(s) deleted.`, color: "success" });
    } catch (err) {
      show({ message: `Failed to delete device(s).`, color: "error" });
    }
  }
}

async function showDialogDevice(device) {
  const changed = await deviceListEditDevice.value.open(device);
  if (changed) {
    await loadTable();
  }
}

async function showDialogSharedUser(devices) {
  const changed = await deviceListEditSharedUser.value.open(devices);
  if (changed) {
    await loadTable();
  }
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
