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
          <v-chip v-for="device in devices" :key="device" class="ma-1">
            {{ device.alias }}
          </v-chip>
        </v-card-text>
        <template #actions>
          <v-card-item>
            <template v-if="errorResponseText !== ''">
              <v-icon
                class="px-2"
                icon="mdi-alert"
                size="medium"
                color="error"
              />
              <span class="text-error px-2">
                {{ errorResponseText }}
              </span>
            </template>
          </v-card-item>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="noChange">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" @click="addUser"> Share </v-btn>
          <v-btn color="primary" variant="text" @click="removeUser">
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
const errorResponseText = ref("");
const formData = ref({});
const httpRequest = inject("httpRequest");
const inputValid = ref(false);
let resolve = null;
const showDialog = ref(false);
const { user } = storeToRefs(useAuthStore());

function open(dialogDevices) {
  devices.value = dialogDevices;
  errorResponseText.value = "";
  showDialog.value = true;
  return new Promise((resolveOpen) => {
    resolve = resolveOpen;
  });
}

async function addUser() {
  errorResponseText.value = "";
  if (inputValid.value) {
    let sharedUser = {};
    copyObject(formData.value, sharedUser, ["username"]);
    let deviceIdList = [];
    for (let item of devices.value) {
      deviceIdList.push(item.device_id);
    }
    httpRequest(
      "post",
      `users/${user.value.user_id}/devices/${deviceIdList}/shareduser`,
      sharedUser,
    )
      .then(() => {
        resolve(true);
        showDialog.value = false;
      })
      .catch((err) => {
        errorResponseText.value = err.errorResponseText;
      });
  }
}

async function removeUser() {
  errorResponseText.value = "";
  if (inputValid.value) {
    let unsharedUser = {};
    copyObject(formData.value, unsharedUser, ["username"]);
    let deviceIdList = [];
    for (let item of devices.value) {
      deviceIdList.push(item.device_id);
    }
    httpRequest(
      "delete",
      `users/${user.value.user_id}/devices/${deviceIdList}/shareduser`,
      unsharedUser,
    )
      .then(() => {
        resolve(true);
        showDialog.value = false;
      })
      .catch((err) => {
        errorResponseText.value = err.errorResponseText;
      });
  }
}

function noChange() {
  resolve(false);
  showDialog.value = false;
}

function copyObject(from, to, keys) {
  for (let key of keys) {
    to[key] = from[key];
  }
}
</script>
