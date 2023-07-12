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
          <v-btn color="primary" variant="text" @click="changed"> Save </v-btn>
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
const errorResponseText = ref("");
const formData = ref({});
const formTitle = computed(() => {
  return user.value.user_id < 0 ? "New User" : "Edit User";
});
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
  if (formData.value.password !== formData.value.password2) {
    errorResponseText.value = "Passwords should match";
    formValid = false;
  }
  if (inputValid.value && formValid) {
    // Existing users already have an ID
    if (formData.value.user_id >= 0) {
      let modifiedUser = {};
      copyObject(formData.value, modifiedUser, [
        "api_key",
        "email",
        "fullname",
        "role",
        "user_id",
        "username",
      ]);
      httpRequest("put", `users/${modifiedUser.user_id}`, modifiedUser)
        .then(() => {
          resolve(true);
          showDialog.value = false;
        })
        .catch((err) => {
          errorResponseText.value = err.errorResponseText;
        });
    } else {
      let AddedUser = {};
      copyObject(formData.value, AddedUser, [
        "api_key",
        "email",
        "fullname",
        "password",
        "role",
        "username",
      ]);
      httpRequest("post", `users`, AddedUser)
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
</script>
