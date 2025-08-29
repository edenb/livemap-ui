<template>
  <v-navigation-drawer
    v-model="open"
    name="mapDrawer"
    location="right"
    permanent
    @transitionend="onTransistionEnd"
  >
    <v-list density="compact" nav>
      <v-list-subheader>DEVICES</v-list-subheader>
      <v-list-item
        v-for="(device, i) in lastPositionsOrdered"
        :key="i"
        link
        @click="openDevicePopup(device.raw.device_id)"
      >
        <template #prepend>
          <v-avatar
            variant="elevated"
            :color="device.iconAttr.markerColor"
            size="small"
          >
            <v-icon
              :icon="device.iconAttr.icon"
              :color="device.iconAttr.iconColor"
              size="x-small"
            />
          </v-avatar>
        </template>
        <v-list-item-title>
          {{ device.raw.alias }}
        </v-list-item-title>
        <template #append>
          <v-list-item-title>
            {{ getAgeText(device.raw.loc_timestamp) }}
          </v-list-item-title>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, toRefs } from "vue";
//import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import { usePositionStore, useLayoutStore } from "@/store.js";

const props = defineProps({
  selector: { type: String, default: "" },
});
// const drawer = computed(() => {
//   return selector.value ? true : false;
// });
//const { drawerOpen } = storeToRefs(useLayoutStore());
const emitter = inject("emitter");
const { lastPositions } = storeToRefs(usePositionStore());
const lastPositionsOrdered = computed(() => {
  let lastPositionsOrdered = lastPositions.value;
  lastPositionsOrdered.sort((a, b) => a.raw.alias.localeCompare(b.raw.alias));
  return lastPositionsOrdered;
});
//const { mobile } = useDisplay();
const open = computed(() => {
  return !!selector.value;
});
const { selector } = toRefs(props);

onMounted(() => {
  // if ("right" in drawerOpen.value) {
  //   drawer.value = drawerOpen.value.right;
  // } else {
  //   drawer.value = !mobile.value;
  //   drawerOpen.value.right = drawer.value;
  // }
  // emitter.on("toggle-sidebar-right", () => {
  //   drawer.value = !drawer.value;
  // });
});

onUnmounted(() => {
  emitter.off("toggle-sidebar-right");
});

function openDevicePopup(device_id) {
  emitter.emit("open-device-popup", device_id);
}

function getAgeText(birth) {
  const tsBirth = new Date(birth);
  const tsNow = new Date(Date.now());
  const td = (tsNow - tsBirth) / 1000;
  if (td < 60) {
    return `<1m`;
  }
  if (td < 3600) {
    return `${(td / 60).toFixed()}m`;
  }
  if (td < 3600 * 24) {
    return `${(td / 3600).toFixed()}h`;
  }
  if (td < 3600 * 24 * 99) {
    return `${(td / (3600 * 24)).toFixed()}d`;
  }
  return `>99d`;
}

function onTransistionEnd(event) {
  //   // if (event.propertyName === "transform") {
  //   //   drawerOpen.value.right = drawer.value;
  //   // }
}
</script>
