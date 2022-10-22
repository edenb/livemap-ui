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

<script>
//import Vue100vh from 'vue-div-100vh';
import TheNavBar from "@/layouts/TheNavBar.vue";
import TheSidebarLeft from "@/layouts/TheSidebarLeft.vue";
export default {
  name: "TheLayout",
  components: {
    //Vue100vh,
    TheNavBar,
    TheSidebarLeft,
  },
};
</script>

<style>
body {
  height: 100vh;
}
</style>
