<template>
  <v-main>
    <v-container class="fill-height">
      <v-row class="fill-height" justify="center">
        <v-col align-self="center" cols="12" sm="8" md="6">
          <v-card class="elevation-12">
            <v-toolbar color="primary">
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              color="primary"
            />
            <v-card-text>
              <v-form v-model="inputValid" @keydown.enter="loginUser">
                <FormRenderer v-model="formData" :form-schema="schemaLogin" />
              </v-form>
            </v-card-text>
            <v-card-actions class="px-4">
              <template v-if="errorMessage">
                <v-icon icon="mdi-alert" size="medium" color="error" />
                <div class="text-error px-2">
                  {{ errorMessage }}
                </div>
              </template>
              <v-spacer />
              <v-btn
                color="primary"
                data-cy="login"
                variant="text"
                :disabled="!inputValid"
                @click="loginUser"
              >
                Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store.js";
import FormRenderer from "@/components/FormRenderer.vue";
import { schemaLogin } from "@/forms/schemas.js";

const authStore = useAuthStore();
const errorMessage = ref("");
const formData = ref({});
const httpRequest = inject("httpRequest");
const inputValid = ref(false);
const loading = ref(false);
const router = useRouter();

async function loginUser() {
  if (inputValid.value) {
    loading.value = true;
    try {
      const response = await httpRequest("post", "/login", {
        username: formData.value.username,
        password: formData.value.password,
      });
      await authStore.setAuthorized(response.data.access_token);
      await router.push("/worldmap");
    } catch (err) {
      errorMessage.value = err.httpError.message;
    } finally {
      loading.value = false;
    }
  }
}
</script>
