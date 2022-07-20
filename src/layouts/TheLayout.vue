<template>
  <v-app>
    <TheNavBar />
    <TheSidebarLeft />
    <TheSidebarRight />
    <v-main style="height: 100%">
      <div
        style="height: 100%"
        pa-0
        fluid
      >
        <router-view />
      </div>
    </v-main>
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
