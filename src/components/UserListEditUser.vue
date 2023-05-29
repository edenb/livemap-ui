<template>
  <v-dialog v-if="user" v-model="showDialog" max-width="800px">
    <v-form ref="form" v-model="inputValid">
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
            :form-schema="schemaPassword"
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

<script>
import { computed, inject, ref } from "vue";
import FormRenderer from "@/components/FormRenderer.vue";

const rules = {
  required: (v) => !!v || "Field is required",
  min(minLength) {
    return (v) => v.length >= minLength || `At least ${minLength} characters`;
  },
  zeroOrMin(minLength) {
    return (v) =>
      v.length >= minLength ||
      v.length == 0 ||
      `Leave empty or at least ${minLength} characters`;
  },
  emptyOrEmail: (v) =>
    /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(
      v
    ) ||
    v.length == 0 ||
    "E-mail must be valid",
};

const formSchemaUser = [
  {
    label: "Username*",
    type: "FormField",
    state: "username",
    colsSm: 6,
    hint: "*required. At least 4 characters",
    rules: [rules.required, rules.min(4)],
    isHidden: false,
    isPassword: false,
    isReadonly: false,
    hasCounter: false,
    hasHiddenControl: false,
  },
  {
    label: "Role*",
    type: "FormSelect",
    state: "role",
    colsSm: 6,
    hint: "*required. Select role",
    items: ["admin", "manager", "viewer"],
    rules: [rules.required],
    isReadonly: false,
    hasCounter: false,
  },
  {
    label: "Full Name*",
    type: "FormField",
    state: "fullname",
    colsSm: 12,
    hint: "*required. At least 4 characters",
    rules: [rules.required, rules.min(4)],
    isHidden: false,
    isPassword: false,
    isReadonly: false,
    hasCounter: false,
    hasHiddenControl: false,
  },
  {
    label: "E-mail",
    type: "FormField",
    state: "email",
    colsSm: 12,
    hint: "Optional mail address",
    rules: [rules.emptyOrEmail],
    isHidden: false,
    isPassword: false,
    isReadonly: false,
    hasCounter: false,
    hasHiddenControl: false,
  },
  {
    label: "API key",
    type: "FormField",
    state: "api_key",
    colsSm: 12,
    hint: "Leave empty for auto-generated key",
    rules: [rules.zeroOrMin(8)],
    isHidden: true,
    isPassword: true,
    isReadonly: false,
    hasCounter: true,
    hasHiddenControl: true,
  },
];

const formSchemaPassword = [
  {
    label: "Password",
    type: "FormField",
    state: "password",
    colsSm: 6,
    hint: "At least 8 characters",
    rules: [rules.required, rules.min(8)],
    isHidden: true,
    isPassword: true,
    isReadonly: false,
    hasCounter: true,
    hasHiddenControl: true,
  },
  {
    label: "Confirm password",
    type: "FormField",
    state: "password2",
    colsSm: 6,
    hint: "At least 8 characters",
    rules: [rules.required, rules.min(8)],
    isHidden: true,
    isPassword: true,
    isReadonly: false,
    hasCounter: true,
    hasHiddenControl: true,
  },
];

export default {
  name: "EditUser",
  components: {
    FormRenderer,
  },
  emits: ["input"],
  setup() {
    const errorResponseText = ref("");
    const formData = ref({});
    const httpRequest = inject("httpRequest");
    const inputValid = ref(false);
    const schemaPassword = formSchemaPassword;
    const schemaUser = formSchemaUser;
    const showDialog = ref(false);
    const resolve = ref(null);
    const reject = ref(null);
    const user = ref({});
    const formTitle = computed(() => {
      return user.value.user_id < 0 ? "New User" : "Edit User";
    });
    return {
      errorResponseText,
      formData,
      httpRequest,
      inputValid,
      schemaPassword,
      schemaUser,
      showDialog,
      reject,
      resolve,
      user,
      formTitle,
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
      if (this.formData.password !== this.formData.password2) {
        this.errorResponseText = "Passwords should match";
        formValid = false;
      }

      if (this.inputValid && formValid) {
        // Existing users already have an ID
        if (this.formData.user_id >= 0) {
          let modifiedUser = {};
          this.copyObject(this.formData, modifiedUser, [
            "api_key",
            "email",
            "fullname",
            "role",
            "user_id",
            "username",
          ]);
          this.httpRequest("put", `users/${modifiedUser.user_id}`, modifiedUser)
            .then(() => {
              this.resolve(true);
              this.showDialog = false;
            })
            .catch((err) => {
              this.errorResponseText = err.errorResponseText;
            });
        } else {
          let AddedUser = {};
          this.copyObject(this.formData, AddedUser, [
            "api_key",
            "email",
            "fullname",
            "password",
            "role",
            "username",
          ]);
          this.httpRequest("post", `users`, AddedUser)
            .then(() => {
              this.resolve(true);
              this.showDialog = false;
            })
            .catch((err) => {
              this.errorResponseText = err.errorResponseText;
            });
        }
      }
    },
    noChange() {
      this.resolve(false);
      this.showDialog = false;
    },
  },
};
</script>
