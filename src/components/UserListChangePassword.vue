<template>
  <v-dialog v-if="user" v-model="showDialog" max-width="500px">
    <v-form ref="form" v-model="inputValid">
      <v-card class="pa-4">
        <template #title>
          <span class="text-h5">Reset Password</span>
        </template>
        <template #subtitle>
          <div>User: {{ user.fullname }}</div>
          <div>Username: {{ user.username }}</div>
        </template>
        <template #text>
          <FormRenderer v-model="formData" :form-schema="schemaPassword" />
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

<script>
import { ref } from "vue";
import { ApiMixin } from "@/mixins/ApiMixin.js";
import FormRenderer from "@/components/FormRenderer.vue";

const rules = {
  required: (v) => !!v || "Field is required",
  min(minLength) {
    return (v) => v.length >= minLength || `At least ${minLength} characters`;
  },
};

const formSchemaPassword = [
  {
    label: "Password*",
    type: "FormField",
    state: "newpwd",
    colsSm: 12,
    hint: "*required. At least 8 characters",
    rules: [rules.required, rules.min(8)],
    isHidden: true,
    isPassword: true,
    isReadonly: false,
    hasCounter: true,
    hasHiddenControl: true,
  },
  {
    label: "Confirm password*",
    type: "FormField",
    state: "confirmpwd",
    colsSm: 12,
    hint: "*required. At least 8 characters",
    rules: [rules.required, rules.min(8)],
    isHidden: true,
    isPassword: true,
    isReadonly: false,
    hasCounter: true,
    hasHiddenControl: true,
  },
];

export default {
  name: "EditPassword",
  components: {
    FormRenderer,
  },
  mixins: [ApiMixin],
  setup() {
    const formData = ref({});
    const inputValid = ref(false);
    const schemaPassword = formSchemaPassword;
    const showDialog = ref(false);
    const resolve = ref(null);
    const reject = ref(null);
    const user = ref({});
    return {
      formData,
      inputValid,
      schemaPassword,
      showDialog,
      reject,
      resolve,
      user,
    };
  },
  methods: {
    copyObject(from, to, keys) {
      for (let key of keys) {
        to[key] = from[key];
      }
    },
    open(user) {
      this.user = user;
      this.formData = { ...user };
      this.errorResponseText = "";
      this.showDialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    async changed() {
      this.errorResponseText = "";
      await this.$refs.form.validate();

      let formValid = true;
      if (this.formData.newpwd !== this.formData.confirmpwd) {
        this.errorResponseText = "Passwords should match";
        formValid = false;
      }

      if (this.inputValid && formValid) {
        let modifiedPassword = {};
        this.copyObject(this.formData, modifiedPassword, [
          "newpwd",
          "confirmpwd",
        ]);
        this.apiRequest(
          "post",
          `users/${this.user.user_id}/password/reset`,
          modifiedPassword
        )
          .then(() => {
            this.resolve(true);
            this.showDialog = false;
          })
          .catch(() => {});
      }
    },
    noChange() {
      this.resolve(false);
      this.showDialog = false;
    },
  },
};
</script>
