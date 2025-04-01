<template>
  <v-dialog v-if="user" v-model="showDialog" max-width="800px">
    <v-form v-model="inputValid" @keydown.enter="changed">
      <v-card class="pa-4">
        <template #title>
          <span class="text-h5">{{ formTitle }}</span>
        </template>
        <template v-if="user.user_id >= 0" #subtitle>
          User ID: {{ user.user_id }}
        </template>
        <template #text>
          <FormRenderer v-model="formData" :form-schema="schemaUser" />
          <FormRenderer
            v-if="user.user_id < 0"
            v-model="formData"
            :form-schema="schemaPasswordNew"
          />
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
import { computed, inject, ref } from "vue";
import FormRenderer from "@/components/FormRenderer.vue";
import { schemaUser, schemaPasswordNew } from "@/forms/schemas.js";

defineExpose({ open });
const errorMessage = ref("");
const formData = ref({});
const formTitle = computed(() => {
  return user.value.user_id < 0 ? "New User" : "Edit User";
});
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
  if (formData.value.password !== formData.value.password2) {
    errorMessage.value = "Passwords should match";
    formValid = false;
  }
  if (inputValid.value && formValid) {
    // Existing users already have an ID
    if (formData.value.user_id >= 0) {
      const modifiedUser = {
        api_key: formData.value.api_key,
        email: formData.value.email,
        fullname: formData.value.fullname,
        role: formData.value.role,
        user_id: formData.value.user_id,
        username: formData.value.username,
      };
      try {
        await httpRequest("put", `users/${modifiedUser.user_id}`, modifiedUser);
        showDialog.value = false;
        show({
          message: `User ${modifiedUser.fullname} updated.`,
          color: "success",
        });
        resolve(true);
      } catch (err) {
        if (err.httpError.code && err.httpError.code === 409) {
          errorMessage.value = "API key already exists";
        } else {
          errorMessage.value = err.httpError.message;
        }
      }
    } else {
      const addedUser = {
        api_key: formData.value.api_key,
        email: formData.value.email,
        fullname: formData.value.fullname,
        password: formData.value.password,
        role: formData.value.role,
        username: formData.value.username,
      };
      try {
        await httpRequest("post", `users`, addedUser);
        showDialog.value = false;
        show({
          message: `User ${addedUser.fullname} created.`,
          color: "success",
        });
        resolve(true);
      } catch (err) {
        if (err.httpError.code && err.httpError.code === 409) {
          errorMessage.value = "API key already exists";
        } else {
          errorMessage.value = err.httpError.message;
        }
      }
    }
  }
}

function noChange() {
  showDialog.value = false;
  resolve(false);
}
</script>
