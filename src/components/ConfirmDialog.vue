<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar :color="options.color" density="comfortable">
        <v-toolbar-title>
          {{ title }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text
        v-for="message in messages"
        v-show="!!message"
        :key="message"
      >
        {{ message }}
      </v-card-text>
      <v-card-text>
        <v-chip v-for="item in items" :key="item" class="ma-1">
          {{ item }}
        </v-chip>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="blue-darken-1" variant="text" @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="agree"> Yes </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";

defineExpose({ open });
const dialog = ref(false);
const items = ref([]);
const messages = ref([]);
const options = ref({
  color: "primary",
  width: 290,
  zIndex: 1200,
});
let resolve = null;
const title = ref(null);

function open(dialogTitle, dialogMessages, dialogItems, dialogOptions) {
  dialog.value = true;
  title.value = dialogTitle;
  messages.value = dialogMessages;
  items.value = dialogItems;
  options.value = Object.assign(options.value, dialogOptions);
  return new Promise((openResolve) => {
    resolve = openResolve;
  });
}

function agree() {
  resolve(true);
  dialog.value = false;
}

function cancel() {
  resolve(false);
  dialog.value = false;
}
</script>
