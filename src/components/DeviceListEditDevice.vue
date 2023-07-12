<template>
  <v-dialog v-if="device" v-model="showDialog" max-width="800px">
    <v-form v-model="inputValid">
      <v-card class="pa-4">
        <template #title>
          <span class="text-h5">{{ formTitle }}</span>
        </template>
        <template v-if="device.device_id >= 0" #subtitle>
          Device ID: {{ device.device_id }}
        </template>
        <template #text>
          <FormRenderer v-model="formData" :form-schema="schemaDevice" />
          <FormRenderer
            v-if="device.device_id >= 0"
            v-model="formData"
            :form-schema="schemaIdentifierRO"
          />
          <FormRenderer
            v-else
            v-model="formData"
            :form-schema="schemaIdentifier"
          />
        </template>
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
          <v-btn color="blue-darken-1" variant="text" @click="noChange">
            Cancel
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="changed">
            Save
          </v-btn>
        </template>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { computed, inject, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store.js";
import FormRenderer from "@/components/FormRenderer.vue";
import {
  schemaDevice,
  schemaIdentifier,
  schemaIdentifierRO,
} from "@/forms/schemas.js";

defineExpose({ open });
const device = ref({});
const errorResponseText = ref("");
const formData = ref({});
const formTitle = computed(() => {
  return device.value.device_id < 0 ? "New Device" : "Edit Device";
});
const httpRequest = inject("httpRequest");
const inputValid = ref(false);
let resolve = null;
const showDialog = ref(false);
const { user } = storeToRefs(useAuthStore());

function open(dialogDevice) {
  device.value = dialogDevice;
  // Form accepts only strings
  formData.value = { ...device.value };
  formData.value.fixed_loc_lat = convertToString(formData.value.fixed_loc_lat);
  formData.value.fixed_loc_lon = convertToString(formData.value.fixed_loc_lon);
  errorResponseText.value = "";
  showDialog.value = true;
  return new Promise((resolveOpen) => {
    resolve = resolveOpen;
  });
}

async function changed() {
  errorResponseText.value = "";
  if (inputValid.value) {
    // Existing devices already have an ID
    if (formData.value.device_id >= 0) {
      let modifiedDevice = {};
      copyObject(formData.value, modifiedDevice, [
        "alias",
        "device_id",
        "fixed_loc_lat",
        "fixed_loc_lon",
      ]);
      // For inputs that require numbers convert form strings
      modifiedDevice.fixed_loc_lat = convertToNumber(
        modifiedDevice.fixed_loc_lat,
      );
      modifiedDevice.fixed_loc_lon = convertToNumber(
        modifiedDevice.fixed_loc_lon,
      );
      httpRequest(
        "put",
        `users/${user.value.user_id}/devices/${modifiedDevice.device_id}`,
        modifiedDevice,
      )
        .then(() => {
          resolve(true);
          showDialog.value = false;
        })
        .catch((err) => {
          errorResponseText.value = err.errorResponseText;
        });
    } else {
      let addedDevice = {};
      copyObject(formData.value, addedDevice, [
        "alias",
        "fixed_loc_lat",
        "fixed_loc_lon",
        "identifier",
      ]);
      // For inputs that require numbers convert form strings
      addedDevice.fixed_loc_lat = convertToNumber(addedDevice.fixed_loc_lat);
      addedDevice.fixed_loc_lon = convertToNumber(addedDevice.fixed_loc_lon);
      httpRequest("post", `users/${user.value.user_id}/devices`, addedDevice)
        .then(() => {
          resolve(true);
          showDialog.value = false;
        })
        .catch((err) => {
          errorResponseText.value = err.errorResponseText;
        });
    }
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

function convertToString(value) {
  return isNaN(parseFloat(String(value))) ? "" : String(value);
}

function convertToNumber(text) {
  return isNaN(parseFloat(text)) ? null : parseFloat(text);
}
</script>
