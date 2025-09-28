<template>
  <v-navigation-drawer
    v-model="open"
    name="mapDrawer"
    location="right"
    permanent
    @transitionend="onTransistionEnd"
  >
    <v-card
      id="drawer-container"
      v-scroll.self="onScroll"
      class="overflow-y-auto"
      height="100%"
    >
      <template #title>{{ title }}</template>
      <template #append>
        <v-icon-btn icon="$close" @click="emit('closeDrawer')" />
      </template>
      <mapDrawerLayers
        v-if="selector === 'mapDrawerLayers'"
        :overlay-names="overlayNames"
        :overlay-names-selected="overlayNamesSelected"
        :base-layer-names="baseLayerNames"
        :base-layer-names-selected="baseLayerNamesSelected"
        @set-base-layer="emit('setBaseLayer', $event)"
        @set-overlays="emit('setOverlays', $event)"
      />
      <mapDrawerMarkers
        v-if="selector === 'mapDrawerMarkers'"
        @open-marker-popup="emit('openMarkerPopup', $event)"
      />
      <mapDrawerInfo v-if="selector === 'mapDrawerInfo'" />
      <v-slide-y-reverse-transition>
        <v-btn
          v-show="showScrollUpButton"
          class="ma-4"
          color="primary"
          elevation="8"
          icon="mdi-chevron-up"
          location="bottom right"
          position="fixed"
          @click="goTo(0, { container: '#drawer-container' })"
        />
      </v-slide-y-reverse-transition>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, toRefs } from "vue";
import { useGoTo } from "vuetify";
import mapDrawerInfo from "@/components/mapDrawerInfo.vue";
import mapDrawerLayers from "@/components/mapDrawerLayers.vue";
import mapDrawerMarkers from "@/components/mapDrawerMarkers.vue";

const props = defineProps({
  overlayNames: { type: Array, default: () => [] },
  overlayNamesSelected: { type: Array, default: () => [] },
  selector: { type: String, default: "" },
  baseLayerNames: { type: Array, default: () => [] },
  baseLayerNamesSelected: { type: String, default: "" },
});
const emit = defineEmits([
  "closeDrawer",
  "drawerReady",
  "openMarkerPopup",
  "setBaseLayer",
  "setOverlays",
]);
const goTo = useGoTo();
const open = computed(() => {
  return !!selector.value;
});
const showScrollUpButton = ref(false);
const { selector } = toRefs(props);
const title = computed(() => {
  return titles[selector.value];
});
const titles = {
  mapDrawerLayers: "Map",
  mapDrawerMarkers: "Devices",
  mapDrawerInfo: "Information",
};

function onScroll(e) {
  showScrollUpButton.value = e.target.scrollTop > 100;
}

function onTransistionEnd(event) {
  if (event.propertyName === "transform") {
    emit("drawerReady");
  }
}
</script>
