<template>
  <v-dialog
    v-if="info && info.application"
    v-model="dialog"
    data-cy="server-info-dialog"
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
            <transition name="fade-out">
              <span v-if="copyResult[0]" :class="copyResult[0].class">
                {{ copyResult[0].text }}
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
            <transition name="fade-out">
              <span v-if="copyResult[1]" :class="copyResult[1].class">
                {{ copyResult[1].text }}
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
        <v-btn color="primary" variant="text" @click="cancel"> OK </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { inject, ref } from "vue";

defineExpose({ open });
const copyResult = ref([null, null]);
const dialog = ref(false);
const httpRequest = inject("httpRequest");
const info = ref({});
const options = {
  color: "primary",
  width: 480,
  zIndex: 2000,
};
const { show } = inject("snackbar");
const serverUrl = inject("serverUrl");

async function open() {
  try {
    const response = await httpRequest("get", `server/info`);
    info.value = response.data;
    dialog.value = true;
  } catch (err) {
    show({ message: err.errorResponseText, color: "error" });
  }
}

function cancel() {
  dialog.value = false;
}

async function copy(clipboardText, copyIdx) {
  copyResult.value[copyIdx] = null;
  try {
    await navigator.clipboard.writeText(clipboardText);
    copyResult.value[copyIdx] = {
      text: "Copied!",
      class: "ma-2 text-caption text-success",
    };
  } catch {
    copyResult.value[copyIdx] = {
      text: "Copy failed!",
      class: "ma-2 text-caption text-error",
    };
  } finally {
    setTimeout(
      (idx) => {
        copyResult.value[idx] = null;
      },
      1000,
      copyIdx,
    );
  }
}
</script>

<style scoped>
.fade-out-leave-active {
  transition: opacity 1s;
}

.fade-out-leave-to {
  opacity: 0;
}
</style>
