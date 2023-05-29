<template>
  <v-dialog v-if="devices" v-model="showDialog" max-width="500px">
    <v-form ref="form" v-model="inputValid">
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
            :model-value="true"
          >
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
          <v-btn color="blue-darken-1" variant="text" @click="noChange">
            Cancel
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="addUser">
            Share
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="removeUser">
            Unshare
          </v-btn>
        </template>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { inject, ref } from "vue";
import { useAuthStore } from "@/store.js";
import FormRenderer from "@/components/FormRenderer.vue";

const formSchemaUsername = [
  {
    label: "Username",
    type: "FormField",
    state: "username",
    colsSm: 12,
    hint: "User to share or unshare the affected devices with",
    rules: [],
    isHidden: false,
    isPassword: false,
    isReadonly: false,
    hasCounter: false,
    hasHiddenControl: false,
  },
];

export default {
  name: "EditSharedUser",
  components: {
    FormRenderer,
  },
  setup() {
    const authStore = useAuthStore();
    const devices = ref([]);
    const errorResponseText = ref("");
    const formData = ref({});
    const httpRequest = inject("httpRequest");
    const inputValid = ref(false);
    const schemaUsername = formSchemaUsername;
    const showDialog = ref(false);
    const resolve = ref(null);
    const reject = ref(null);
    const username = ref("");
    return {
      authStore,
      devices,
      errorResponseText,
      formData,
      httpRequest,
      inputValid,
      schemaUsername,
      showDialog,
      reject,
      resolve,
      username,
    };
  },
  methods: {
    copyObject(from, to, keys) {
      for (let key of keys) {
        to[key] = from[key];
      }
    },
    open(devices) {
      this.devices = devices;
      this.errorResponseText = "";
      this.showDialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    async addUser() {
      this.errorResponseText = "";
      await this.$refs.form.validate();

      if (this.inputValid) {
        let sharedUser = {};
        this.copyObject(this.formData, sharedUser, ["username"]);

        let deviceIdList = [];
        for (let item of this.devices) {
          deviceIdList.push(item.device_id);
        }
        this.httpRequest(
          "post",
          `users/${this.authStore.user.user_id}/devices/${deviceIdList}/shareduser`,
          sharedUser
        )
          .then(() => {
            this.resolve(true);
            this.showDialog = false;
          })
          .catch((err) => {
            this.errorResponseText = err.errorResponseText;
          });
      }
    },
    async removeUser() {
      this.errorResponseText = "";
      await this.$refs.form.validate();

      if (this.inputValid) {
        let unsharedUser = {};
        this.copyObject(this.formData, unsharedUser, ["username"]);

        let deviceIdList = [];
        for (let item of this.devices) {
          deviceIdList.push(item.device_id);
        }
        this.httpRequest(
          "delete",
          `users/${this.authStore.user.user_id}/devices/${deviceIdList}/shareduser`,
          unsharedUser
        )
          .then(() => {
            this.resolve(true);
            this.showDialog = false;
          })
          .catch((err) => {
            this.errorResponseText = err.errorResponseText;
          });
      }
    },
    noChange() {
      this.resolve(false);
      this.showDialog = false;
    },
  },
};
</script>
