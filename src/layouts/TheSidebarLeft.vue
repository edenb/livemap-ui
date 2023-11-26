<template>
  <v-navigation-drawer
    v-model="drawer"
    name="drawerLeft"
    @transitionend="onTransistionEnd"
  >
    <v-list nav>
      <v-list-item title="Map" to="/worldmap" prepend-icon="mdi-map-outline" />
      <v-list-item
        v-if="user.role === 'admin'"
        data-cy="menu-select-user-list"
        title="Users"
        to="/users"
        prepend-icon="mdi-account-multiple-outline"
      />
      <v-list-item
        data-cy="menu-select-device-list"
        title="Devices"
        to="/devices"
        prepend-icon="mdi-devices"
      />
      <v-divider> default </v-divider>
      <v-list-item
        data-cy="menu-select-logout"
        title="Logout"
        to="/logout"
        prepend-icon="mdi-exit-to-app"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref } from "vue";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import { useAuthStore, useLayoutStore } from "@/store.js";

const drawer = ref(false);
const { drawerOpen } = storeToRefs(useLayoutStore());
const emitter = inject("emitter");
const { mobile } = useDisplay();
const { user } = storeToRefs(useAuthStore());

onMounted(() => {
  if ("left" in drawerOpen.value) {
    drawer.value = drawerOpen.value.left;
  } else {
    drawer.value = !mobile.value;
    drawerOpen.value.left = drawer.value;
  }
  emitter.on("toggle-sidebar-left", () => {
    drawer.value = !drawer.value;
  });
});

onUnmounted(() => {
  emitter.off("toggle-sidebar-left");
});

function onTransistionEnd(event) {
  if (event.propertyName === "transform") {
    drawerOpen.value.left = drawer.value;
  }
}
</script>
