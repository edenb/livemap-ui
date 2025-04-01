<template>
  <v-dialog v-if="devices" v-model="showDialog" max-width="500px">
    <v-form v-model="inputValid">
      <v-card class="pa-4">
        <template #title>
          <span class="text-h5">Share / Unshare</span>
        </template>
        <template #text>
          <FormRenderer v-model="formData" :form-schema="schemaUsername" />
        </template>
        <v-card-text>
          <div class="text-h5">Affected devices</div>
          <v-chip
            v-for="device in devices"
            :key="device"
            class="ma-1"
            density="compact"
          >
            {{ device.alias }}
          </v-chip>
        </v-card-text>
        <template #actions>
          <template v-if="errorMessage">
            <v-icon class="pl-8" icon="mdi-alert" size="medium" color="error" />
            <span class="text-error px-2">
              {{ errorMessage }}
            </span>
          </template>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="noChange">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            :disabled="!inputValid"
            @click="addUser"
          >
            Share
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            :disabled="!inputValid"
            @click="removeUser"
          >
            Unshare
          </v-btn>
        </template>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { inject, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store.js";
import FormRenderer from "@/components/FormRenderer.vue";
import { schemaUsername } from "@/forms/schemas.js";

defineExpose({ open });
const devices = ref([]);
const errorMessage = ref("");
const formData = ref({});
const httpRequest = inject("httpRequest");
const inputValid = ref(false);
let resolve;
const { show } = inject("snackbar");
const showDialog = ref(false);
const { user } = storeToRefs(useAuthStore());

function open(dialogDevices) {
  devices.value = dialogDevices;
  errorMessage.value = "";
  showDialog.value = true;
  return new Promise((resolveOpen) => {
    resolve = resolveOpen;
  });
}

async function addUser() {
  errorMessage.value = "";
  if (inputValid.value) {
    const sharedUser = { username: formData.value.username };
    const deviceIdList = devices.value.map(({ device_id }) => device_id);
    try {
      await httpRequest(
        "post",
        `users/${user.value.user_id}/devices/${deviceIdList}/shareduser`,
        sharedUser,
      );
      showDialog.value = false;
      show({
        message: `Device(s) shared with username ${sharedUser.username}.`,
        color: "success",
      });
      resolve(true);
    } catch (err) {
      errorMessage.value = err.httpError.message;
    }
  }
}

async function removeUser() {
  errorMessage.value = "";
  if (inputValid.value) {
    const unsharedUser = { username: formData.value.username };
    const deviceIdList = devices.value.map(({ device_id }) => device_id);
    try {
      await httpRequest(
        "delete",
        `users/${user.value.user_id}/devices/${deviceIdList}/shareduser`,
        unsharedUser,
      );
      showDialog.value = false;
      show({
        message: `Device(s) no longer shared with username ${unsharedUser.username}.`,
        color: "success",
      });
      resolve(true);
    } catch (err) {
      errorMessage.value = err.httpError.message;
    }
  }
}

function noChange() {
  showDialog.value = false;
  resolve(false);
}
</script>
