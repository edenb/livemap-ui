<template>
  <v-app id="app">
    <Vue100vh>
      <ContainerNavBar />
      <ContainerSidebarLeft />
      <ContainerSidebarRight />
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
  import ContainerNavBar from '@/containers/ContainerNavBar';
  import ContainerSidebarLeft from '@/containers/ContainerSidebarLeft';
  import ContainerSidebarRight from '@/containers/ContainerSidebarRight';
  export default {
    name: "ContainerMain",
    components: {
      Vue100vh,
      ContainerNavBar,
      ContainerSidebarLeft,
      ContainerSidebarRight
    },
  }
</script>
