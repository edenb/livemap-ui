<template>
  <v-list
    v-model:selected="selectedBaseLayerNames"
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

    <!-- <v-list-item class="pl-2">
      <v-radio-group
        v-model="selectedBaseLayerName"
        density="compact"
        hide-details
        @update:model-value="emit('setBaseLayer', selectedBaseLayerName)"
      >
        <v-radio
          v-for="tileProviderName in tileProviderNames"
          :key="tileProviderName"
          :label="tileProviderName"
          :value="tileProviderName"
          class="pa-0"
        ></v-radio>
      </v-radio-group>
    </v-list-item> -->
  </v-list>
  <v-divider class="mx-2" />
  <v-list
    v-if="overlayNames.length > 0"
    v-model:selected="selectedOverlayNames"
    density="compact"
    nav
    select-strategy="leaf"
    @update:selected="emit('setOverlays', selectedOverlayNames)"
  >
    <v-list-subheader>Overlays</v-list-subheader>
    <v-list-item
      v-for="overlayName in overlayNames"
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

    <!-- <v-list-item
      v-for="overlayName in overlayNames"
      :key="overlayName"
      class="pl-3 pa-0"
    >
      <v-checkbox
        :label="overlayName"
        :value="overlayName"
        density="compact"
        hide-details
      ></v-checkbox>
    </v-list-item> -->
  </v-list>
</template>

<script setup>
import { ref, toRefs, watch } from "vue";

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

watch(baseLayerNamesSelected, () => {
  selectedBaseLayerNames.value = [baseLayerNamesSelected.value];
});

watch(overlayNamesSelected, () => {
  selectedOverlayNames.value = overlayNamesSelected.value;
});
</script>
