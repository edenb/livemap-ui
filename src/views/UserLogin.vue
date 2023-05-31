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
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="username"
                  autocomplete="username"
                  label="Username*"
                  name="username"
                  prepend-icon="mdi-account"
                  type="text"
                  :rules="usernameRules"
                  required
                  @keyup.enter="loginUser"
                />
                <v-text-field
                  id="password"
                  v-model="password"
                  autocomplete="current-password"
                  label="Password*"
                  name="password"
                  prepend-icon="mdi-lock"
                  type="password"
                  :rules="passwordRules"
                  required
                  @keyup.enter="loginUser"
                />
              </v-form>
            </v-card-text>
            <v-card-actions class="px-4">
              <template v-if="errorResponseText !== ''">
                <v-icon icon="mdi-alert" size="medium" color="error" />
                <div class="text-error px-2">
                  {{ errorResponseText }}
                </div>
              </template>
              <v-spacer />
              <v-btn :disabled="!valid" color="primary" @click="loginUser">
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

const authStore = useAuthStore();
const errorResponseText = ref("");
const httpRequest = inject("httpRequest");
const loading = ref(false);
const username = ref("");
const usernameRules = [(v) => !!v || "Username is required"];
const password = ref("");
const passwordRules = [(v) => !!v || "Password is required"];
const router = useRouter();
const valid = ref(false);

function loginUser() {
  if (username.value && password.value) {
    loading.value = true;
    httpRequest("post", "/login", {
      username: username.value,
      password: password.value,
    })
      .then((response) => {
        return authStore.setAuthorized(response.data.access_token);
      })
      .then(() => {
        router.push("/worldmap");
      })
      .catch((err) => {
        errorResponseText.value = err.errorResponseText;
      })
      .finally(() => {
        loading.value = false;
      });
  }
}
</script>
