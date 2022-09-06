<template>
  <v-app>
    <v-layout ref="app">
      <TheNavBar />
      <TheSidebarLeft />
      <TheSidebarRight />
      <v-main>
        <div
          style="height: 100%"
        >
          <router-view />
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
  //import Vue100vh from 'vue-div-100vh';
  import TheNavBar from '@/layouts/TheNavBar';
  import TheSidebarLeft from '@/layouts/TheSidebarLeft';
  import TheSidebarRight from '@/layouts/TheSidebarRight';
  export default {
    name: "TheLayout",
    components: {
      //Vue100vh,
      TheNavBar,
      TheSidebarLeft,
      TheSidebarRight
    },
  }
</script>
