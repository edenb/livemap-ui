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
            @click="changed"
          >
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
const errorMessage = ref("");
const formData = ref({});
const httpRequest = inject("httpRequest");
const inputValid = ref(false);
let resolve;
const { show } = inject("snackbar");
const showDialog = ref(false);
const user = ref({});

function open(dialogUser) {
  user.value = dialogUser;
  formData.value = { ...user.value };
  errorMessage.value = "";
  showDialog.value = true;
  return new Promise((resolveOpen) => {
    resolve = resolveOpen;
  });
}

async function changed() {
  errorMessage.value = "";
  let formValid = true;
  if (formData.value.newpwd !== formData.value.confirmpwd) {
    errorMessage.value = "Passwords should match";
    formValid = false;
  }
  if (inputValid.value && formValid) {
    const modifiedPassword = {
      newpwd: formData.value.newpwd,
      confirmpwd: formData.value.confirmpwd,
    };
    try {
      await httpRequest(
        "post",
        `users/${user.value.user_id}/password/reset`,
        modifiedPassword,
      );
      showDialog.value = false;
      show({ message: `Password changed.`, color: "success" });
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
