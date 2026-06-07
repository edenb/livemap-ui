<template>
  <v-navigation-drawer
    v-model="open"
    name="mapDrawer"
    :location="mobile ? 'top' : 'right'"
    temporary
    :scrim="false"
    @transitionend="onTransistionEnd"
  >
    <v-toolbar color="transparent" :title="title">
      <template #append>
        <v-icon-btn icon="$close" @click="emit('closeDrawer')" />
      </template>
    </v-toolbar>
    <v-card
      id="drawer-container"
      class="overflow-y-auto"
      height="100%"
      @scroll="onScroll"
    >
      <template #text>
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
            elevation="3"
            icon="mdi-chevron-up"
            location="bottom right"
            position="fixed"
            @click="goTo(0, { container: '#drawer-container' })"
          />
        </v-slide-y-reverse-transition>
      </template>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, toRefs, watch } from "vue";
import { useDisplay, useGoTo } from "vuetify";
import mapDrawerInfo from "@/components/mapDrawerInfo.vue";
import mapDrawerLayers from "@/components/mapDrawerLayers.vue";
import mapDrawerMarkers from "@/components/mapDrawerMarkers.vue";

const selector = defineModel({ type: String });
const props = defineProps({
  overlayNames: { type: Array, default: () => [] },
  overlayNamesSelected: { type: Array, default: () => [] },
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
const { mobile } = useDisplay({ mobileBreakpoint: "sm" });
const open = ref(!!selector.value);
const showScrollUpButton = ref(false);
const title = computed(() => {
  return titles[selector.value];
});
const titles = {
  mapDrawerLayers: "Map",
  mapDrawerMarkers: "Devices",
  mapDrawerInfo: "Information",
};

watch(selector, () => {
  open.value = !!selector.value;
});

function onScroll(e) {
  showScrollUpButton.value = e.target.scrollTop > 100;
}

function onTransistionEnd(event) {
  if (event.propertyName === "transform") {
    emit("drawerReady");
  }
}
</script>
