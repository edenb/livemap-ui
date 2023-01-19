<template>
  <v-dialog v-if="device" v-model="showDialog" max-width="800px">
    <v-form ref="form" v-model="inputValid" lazy-validation>
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

<script>
import { computed, ref } from "vue";
import { ApiMixin } from "@/mixins/ApiMixin.js";
import FormRenderer from "@/components/FormRenderer.vue";

const rules = {
  required: (v) => !!v || "Field is required",
  min(minLength) {
    return (v) => v.length >= minLength || `At least ${minLength} characters`;
  },
};

const formSchemaDevice = [
  {
    label: "Alias*",
    type: "FormField",
    state: "alias",
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
    label: "API key",
    type: "FormField",
    state: "api_key",
    colsSm: 6,
    hint: "Read-only",
    rules: [rules.required, rules.min(4)],
    isHidden: true,
    isPassword: true,
    isReadonly: true,
    hasCounter: false,
    hasHiddenControl: true,
  },
  {
    label: "Fixed latitude",
    type: "FormField",
    state: "fixed_loc_lat",
    colsSm: 6,
    hint: "",
    rules: [],
    isHidden: false,
    isPassword: false,
    isReadonly: false,
    hasCounter: false,
    hasHiddenControl: false,
  },
  {
    label: "Fixed longitude",
    type: "FormField",
    state: "fixed_loc_lon",
    colsSm: 6,
    hint: "",
    rules: [],
    isHidden: false,
    isPassword: false,
    isReadonly: false,
    hasCounter: false,
    hasHiddenControl: false,
  },
];

const formSchemaIdentifier = [
  {
    label: "Identifier*",
    type: "FormField",
    state: "identifier",
    colsSm: 12,
    hint: "*required. At least 4 characters",
    rules: [rules.required, rules.min(4)],
    isHidden: true,
    isPassword: true,
    isReadonly: false,
    hasCounter: true,
    hasHiddenControl: true,
  },
];

const formSchemaIdentifierRO = [
  {
    label: "Identifier",
    type: "FormField",
    state: "identifier",
    colsSm: 12,
    hint: "Read-only",
    rules: [rules.required, rules.min(4)],
    isHidden: true,
    isPassword: true,
    isReadonly: true,
    hasCounter: false,
    hasHiddenControl: true,
  },
];

export default {
  name: "EditDevice",
  components: {
    FormRenderer,
  },
  mixins: [ApiMixin],
  setup() {
    const device = ref({});
    const formData = ref({});
    const inputValid = ref(false);
    const schemaIdentifier = formSchemaIdentifier;
    const schemaIdentifierRO = formSchemaIdentifierRO;
    const schemaDevice = formSchemaDevice;
    const showDialog = ref(false);
    const resolve = ref(null);
    const reject = ref(null);
    const formTitle = computed(() => {
      return device.value.device_id < 0 ? "New Device" : "Edit Device";
    });
    return {
      device,
      formData,
      inputValid,
      schemaIdentifier,
      schemaIdentifierRO,
      schemaDevice,
      showDialog,
      reject,
      resolve,
      formTitle,
    };
  },
  methods: {
    open(device) {
      this.device = device;
      this.formData = { ...device };
      // Form accepts only strings
      this.formData.fixed_loc_lat = this.convertToString(
        this.formData.fixed_loc_lat
      );
      this.formData.fixed_loc_lon = this.convertToString(
        this.formData.fixed_loc_lon
      );

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

      if (this.inputValid) {
        // Existing devices already have an ID
        if (this.formData.device_id >= 0) {
          let modifiedDevice = {};
          this.copyObject(this.formData, modifiedDevice, [
            "alias",
            "device_id",
            "fixed_loc_lat",
            "fixed_loc_lon",
          ]);
          // For inputs that require numbers convert form strings
          modifiedDevice.fixed_loc_lat = this.convertToNumber(
            modifiedDevice.fixed_loc_lat
          );
          modifiedDevice.fixed_loc_lon = this.convertToNumber(
            modifiedDevice.fixed_loc_lon
          );
          this.apiRequest(
            "put",
            `users/${this.$store.state.user.user_id}/devices/${modifiedDevice.device_id}`,
            modifiedDevice
          )
            .then(() => {
              this.resolve(true);
              this.showDialog = false;
            })
            .catch(() => {});
        } else {
          let addedDevice = {};
          this.copyObject(this.formData, addedDevice, [
            "alias",
            "fixed_loc_lat",
            "fixed_loc_lon",
            "identifier",
          ]);
          // For inputs that require numbers convert form strings
          addedDevice.fixed_loc_lat = this.convertToNumber(
            addedDevice.fixed_loc_lat
          );
          addedDevice.fixed_loc_lon = this.convertToNumber(
            addedDevice.fixed_loc_lon
          );
          this.apiRequest(
            "post",
            `users/${this.$store.state.user.user_id}/devices`,
            addedDevice
          )
            .then(() => {
              this.resolve(true);
              this.showDialog = false;
            })
            .catch(() => {});
        }
      }
    },
    noChange() {
      this.resolve(false);
      this.showDialog = false;
    },
    copyObject(from, to, keys) {
      for (let key of keys) {
        to[key] = from[key];
      }
    },
    convertToString(value) {
      return isNaN(parseFloat(String(value))) ? "" : String(value);
    },
    convertToNumber(text) {
      return isNaN(parseFloat(text)) ? null : parseFloat(text);
    },
  },
};
</script>
