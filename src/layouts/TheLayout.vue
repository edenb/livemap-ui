<template>
  <v-layout ref="app">
    <TheNavBar />
    <TheSidebarLeft />
    <v-main>
      <div style="height: 100%">
        <router-view />
      </div>
    </v-main>
  </v-layout>
</template>

<script setup>
import TheNavBar from "@/layouts/TheNavBar.vue";
import TheSidebarLeft from "@/layouts/TheSidebarLeft.vue";
</script>

<style>
body {
  /* 100vh causes problems in Safari so a CSS trick/hack is required */
  /* See: https://github.com/postcss/postcss-100vh-fix */
  height: 100vh;
}
</style>
