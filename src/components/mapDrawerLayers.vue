<template>
  <v-list
    v-model:selected="selectedBaseLayerNames"
    class="pa-0"
    density="compact"
    mandatory
    nav
    select-strategy="single-leaf"
    @update:selected="emit('setBaseLayer', selectedBaseLayerNames[0])"
  >
    <v-list-subheader>Base maps</v-list-subheader>
    <v-list-item
      v-for="baseLayerName in baseLayerNames"
      :key="baseLayerName"
      :title="baseLayerName"
      :value="baseLayerName"
    >
      <template #prepend="{ isSelected, select }">
        <v-list-item-action start>
          <v-checkbox-btn
            density="compact"
            :model-value="isSelected"
            false-icon="$radioOff"
            true-icon="$radioOn"
            @update:model-value="select"
          ></v-checkbox-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
  <v-divider />
  <v-list
    v-if="overlayNamesOrdered.length > 0"
    v-model:selected="selectedOverlayNames"
    class="pa-0"
    density="compact"
    nav
    select-strategy="leaf"
    @update:selected="emit('setOverlays', selectedOverlayNames)"
  >
    <v-list-subheader>Overlays</v-list-subheader>
    <v-list-item
      v-for="overlayName in overlayNamesOrdered"
      :key="overlayName"
      :title="overlayName"
      :value="overlayName"
    >
      <template #prepend="{ isSelected, select }">
        <v-list-item-action start>
          <v-checkbox-btn
            density="compact"
            :model-value="isSelected"
            @update:model-value="select"
          ></v-checkbox-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { computed, ref, toRefs, watch } from "vue";

const props = defineProps({
  overlayNames: { type: Array, default: () => [] },
  overlayNamesSelected: { type: Array, default: () => [] },
  baseLayerNames: { type: Array, default: () => [] },
  baseLayerNamesSelected: { type: String, default: () => "" },
});
const emit = defineEmits(["setBaseLayer", "setOverlays"]);
const { overlayNamesSelected, baseLayerNamesSelected } = toRefs(props);
const selectedBaseLayerNames = ref([props.baseLayerNamesSelected]);
const selectedOverlayNames = ref(props.overlayNamesSelected);

const overlayNamesOrdered = computed(() => {
  const layersOnTop = ["Devices"];
  let overlayNamesTop = [];
  let overlayNamesBottom = [];
  props.overlayNames.forEach((layerName) => {
    if (layersOnTop.includes(layerName)) {
      overlayNamesTop.push(layerName);
    } else {
      overlayNamesBottom.push(layerName);
    }
  });
  overlayNamesTop.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  overlayNamesBottom.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  return overlayNamesTop.concat(overlayNamesBottom);
});

watch(baseLayerNamesSelected, () => {
  selectedBaseLayerNames.value = [baseLayerNamesSelected.value];
});

watch(overlayNamesSelected, () => {
  selectedOverlayNames.value = overlayNamesSelected.value;
});
</script>
