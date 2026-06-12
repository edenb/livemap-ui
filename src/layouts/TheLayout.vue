<template>
  <v-app>
    <SnackbarProvider>
      <TheNavBar />
      <menuDrawer
        v-model="menuDrawerOpen"
        @menu-drawer-opened="onMenuDrawerOpened"
      />
      <v-main>
        <div style="height: 100%">
          <router-view :menu-drawer-opened="menuDrawerOpened" />
        </div>
      </v-main>
    </SnackbarProvider>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import SnackbarProvider from "@/components/SnackbarProvider.vue";
import TheNavBar from "@/layouts/TheNavBar.vue";
import menuDrawer from "@/layouts/TheMenuDrawer.vue";
import { useLayoutStore } from "@/store.js";

const menuDrawerOpened = ref(null);
const { menuDrawerOpen } = storeToRefs(useLayoutStore());

function onMenuDrawerOpened(isOpen) {
  menuDrawerOpened.value = isOpen;
}

onMounted(() => {
  const { mobile } = useDisplay();
  menuDrawerOpen.value = !mobile.value;
});
</script>

<style>
body {
  /* 100vh causes problems in Safari so a CSS trick/hack is required */
  /* See: https://github.com/postcss/postcss-100vh-fix */
  height: 100vh;
}
</style>
