<template>
  <v-navigation-drawer
    v-model="open"
    name="mapDrawer"
    location="right"
    permanent
    @transitionend="onTransistionEnd"
  >
    <v-card height="100%">
      <template #title>{{ title }}</template>
      <template #append>
        <v-icon-btn icon="$close" @click="emit('closeDrawer')" />
      </template>
      <mapDrawerMarkers
        v-if="selector === 'mapDrawerMarkers'"
        @open-marker-popup="emit('openMarkerPopup', $event)"
      />
      <mapDrawerInfo v-if="selector === 'mapDrawerInfo'" />
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, toRefs } from "vue";
import mapDrawerInfo from "@/components/mapDrawerInfo.vue";
import mapDrawerMarkers from "@/components/mapDrawerMarkers.vue";

const props = defineProps({
  selector: { type: String, default: "" },
});
const emit = defineEmits(["closeDrawer", "drawerReady", "openMarkerPopup"]);
const open = computed(() => {
  return !!selector.value;
});
const { selector } = toRefs(props);
const title = computed(() => {
  return titles[selector.value];
});
const titles = {
  mapDrawerLayers: "Map layers",
  mapDrawerMarkers: "Devices",
  mapDrawerInfo: "Information",
};

function onTransistionEnd(event) {
  if (event.propertyName === "transform") {
    emit("drawerReady");
  }
}
</script>
