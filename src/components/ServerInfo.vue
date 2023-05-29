<template>
  <v-dialog
    v-if="info && info.application"
    v-model="dialog"
    :max-width="options.width"
  >
    <v-card>
      <v-toolbar color="primary" density="default">
        <v-toolbar-title>{{ info.application.name }}</v-toolbar-title>
      </v-toolbar>
      <div v-if="info.application.about && info.application.about.length > 0">
        <v-list-item>
          <v-list-item-title>
            <span class="text-overline">About</span>
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ info.application.about }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider class="mx-4 mt-2" />
      </div>
      <div>
        <v-list-item>
          <v-list-item-title>
            <span class="text-overline">Server</span>
            <transition :duration="1000" name="fade">
              <span v-if="copied[0]" class="text-caption text-green">
                Copied!
              </span>
            </transition>
          </v-list-item-title>
          <v-list-item-subtitle>
            <div>
              {{ serverUrl }}
              <v-icon
                icon="mdi-content-copy"
                size="small"
                class="ml-2"
                @click="copy(serverUrl, 0)"
              />
            </div>
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider class="mx-4 mt-2" />
      </div>
      <div v-if="info.mqtt">
        <v-list-item>
          <v-list-item-title>
            <span class="text-overline">MQTT broker</span>
            <transition :duration="1000" name="fade">
              <span v-if="copied[1]" class="text-caption text-green">
                Copied!
              </span>
            </transition>
          </v-list-item-title>
          <v-list-item-subtitle>
            <div>
              {{ info.mqtt.url }}
              <v-icon
                icon="mdi-content-copy"
                size="small"
                class="ml-2"
                @click="copy(info.mqtt.url, 1)"
              />
            </div>
            <div>Port: {{ info.mqtt.port }}</div>
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider class="mx-4 mt-2" />
      </div>
      <div v-if="info.application.license">
        <v-list-item>
          <v-list-item-title>
            <span class="text-overline"> License </span>
          </v-list-item-title>
          <v-list-item-subtitle>{{
            info.application.license
          }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider class="mx-4 mt-2" />
      </div>

      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="primary-darken-1" variant="text" @click="cancel">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ServerInfo",
  inject: ["httpRequest", "serverUrl"],
  data() {
    return {
      dialog: false,
      resolve: null,
      reject: null,
      info: {},
      copied: [false, false],
      options: {
        color: "primary",
        width: 480,
        zIndex: 2000,
      },
    };
  },
  methods: {
    open() {
      this.dialog = true;
      this.httpRequest("get", `server/info`).then((response) => {
        this.info = response.data;
        return new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        });
      });
    },
    cancel() {
      this.dialog = false;
    },
    async copy(clipboardText, copiedIdx) {
      // Use splice to make variable reactive
      this.copied.splice(copiedIdx, copiedIdx + 1, true);
      await navigator.clipboard.writeText(clipboardText);
      this.copied.splice(copiedIdx, copiedIdx + 1, false);
    },
  },
};
</script>
