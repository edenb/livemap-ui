<template>
  <v-dialog v-if="user" v-model="showDialog" max-width="500px">
    <v-form v-model="inputValid" @keydown.enter="changed">
      <v-card class="pa-4">
        <template #title>
          <span class="text-h5">Reset Password</span>
        </template>
        <template #subtitle>
          <div>User: {{ user.fullname }}</div>
          <div>Username: {{ user.username }}</div>
        </template>
        <template #text>
          <FormRenderer v-model="formData" :form-schema="schemaPasswordEdit" />
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
import { inject, ref } from "vue";
import FormRenderer from "@/components/FormRenderer.vue";
import { schemaPasswordEdit } from "@/forms/schemas.js";

defineExpose({ open });
const errorResponseText = ref("");
const formData = ref({});
const httpRequest = inject("httpRequest");
const inputValid = ref(false);
let resolve = null;
const showDialog = ref(false);
const user = ref({});

function open(dialogUser) {
  user.value = dialogUser;
  formData.value = { ...user.value };
  errorResponseText.value = "";
  showDialog.value = true;
  return new Promise((resolveOpen) => {
    resolve = resolveOpen;
  });
}

async function changed() {
  errorResponseText.value = "";
  let formValid = true;
  if (formData.value.newpwd !== formData.value.confirmpwd) {
    errorResponseText.value = "Passwords should match";
    formValid = false;
  }
  if (inputValid.value && formValid) {
    let modifiedPassword = {};
    copyObject(formData.value, modifiedPassword, ["newpwd", "confirmpwd"]);
    httpRequest(
      "post",
      `users/${user.value.user_id}/password/reset`,
      modifiedPassword,
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
