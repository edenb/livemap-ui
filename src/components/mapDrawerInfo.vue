<template>
  <v-list data-cy="map-drawer-info" class="pa-0" lines="false" nav>
    <div
      v-if="info?.application?.about && info?.application?.about?.length > 0"
    >
      <v-list-item class="px-0">
        <v-list-item-title>
          <span class="text-overline">About</span>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ info.application.about }}
        </v-list-item-subtitle>
      </v-list-item>
      <v-divider />
    </div>
    <div>
      <v-list-item class="px-0">
        <v-list-item-title>
          <span class="text-overline">Server</span>
          <v-icon
            icon="mdi-content-copy"
            size="small"
            class="ml-2"
            @click="copy(serverUrl, 0)"
          />
          <transition name="fade-out">
            <span v-if="copyResult[0]" :class="copyResult[0].class">
              {{ copyResult[0].text }}
            </span>
          </transition>
        </v-list-item-title>
        <v-list-item-subtitle>
          <div>
            {{ serverUrl }}
          </div>
        </v-list-item-subtitle>
      </v-list-item>
      <v-divider />
    </div>
    <div v-if="info.mqtt">
      <v-list-item class="px-0">
        <v-list-item-title>
          <span class="text-overline">MQTT broker</span>
          <v-icon
            icon="mdi-content-copy"
            size="small"
            class="ml-2"
            @click="copy(info.mqtt.url, 1)"
          />
          <transition name="fade-out">
            <span v-if="copyResult[1]" :class="copyResult[1].class">
              {{ copyResult[1].text }}
            </span>
          </transition>
        </v-list-item-title>
        <v-list-item-subtitle>
          <div>
            {{ info.mqtt.url }}
          </div>
          <div>Port: {{ info.mqtt.port }}</div>
        </v-list-item-subtitle>
      </v-list-item>
      <v-divider />
    </div>
    <div v-if="info?.application?.license">
      <v-list-item class="px-0">
        <v-list-item-title>
          <span class="text-overline"> License </span>
        </v-list-item-title>
        <v-list-item-subtitle>{{
          info.application.license
        }}</v-list-item-subtitle>
      </v-list-item>
      <v-divider />
    </div>
  </v-list>
</template>

<script setup>
import { inject, onMounted, ref } from "vue";

const copyResult = ref([null, null]);
const httpRequest = inject("httpRequest");
const info = ref({});
const { show } = inject("snackbar");
const serverUrl = inject("serverUrl");

onMounted(async () => {
  await loadInfo();
});

async function loadInfo() {
  try {
    const response = await httpRequest("get", `server/info`);
    info.value = response.data;
  } catch (err) {
    show({ message: err.httpError.message, color: "error" });
  }
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
