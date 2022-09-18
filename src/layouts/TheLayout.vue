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
import TheNavBar from "@/layouts/TheNavBar";
import TheSidebarLeft from "@/layouts/TheSidebarLeft";
export default {
  name: "TheLayout",
  components: {
    //Vue100vh,
    TheNavBar,
    TheSidebarLeft,
  },
};
</script>
