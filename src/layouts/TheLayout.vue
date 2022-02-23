<template>
  <v-app id="app">
    <Vue100vh>
      <TheNavBar />
      <TheSidebarLeft />
      <TheSidebarRight />
      <v-main style="height: 100%">
        <v-container
          style="height: 100%"
          pa-0
          fluid
        >
          <router-view />
        </v-container>
      </v-main>
    </Vue100vh>
  </v-app>
</template>

<script>
  import Vue100vh from 'vue-div-100vh';
  import TheNavBar from '@/layouts/TheNavBar';
  import TheSidebarLeft from '@/layouts/TheSidebarLeft';
  import TheSidebarRight from '@/layouts/TheSidebarRight';
  export default {
    name: "TheLayout",
    components: {
      Vue100vh,
      TheNavBar,
      TheSidebarLeft,
      TheSidebarRight
    },
  }
</script>
