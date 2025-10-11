<template>
  <v-navigation-drawer
    v-model="open"
    name="menuDrawer"
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
      <v-divider />
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
import { storeToRefs } from "pinia";
import { useAuthStore, useLayoutStore } from "@/store.js";

const emitter = inject("emitter");
const { menuDrawerOpen } = storeToRefs(useLayoutStore());
const open = ref();
const { user } = storeToRefs(useAuthStore());

onMounted(() => {
  open.value = menuDrawerOpen.value;
  emitter.on("toggle-sidebar-left", () => {
    open.value = !open.value;
  });
});

onUnmounted(() => {
  emitter.off("toggle-sidebar-left");
});

function onTransistionEnd(event) {
  if (event.propertyName === "transform") {
    menuDrawerOpen.value = open.value;
  }
}
</script>
