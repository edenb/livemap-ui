<template>
  <v-app id="app">
    <ContainerNavBar/>
    <ContainerSidebarLeft/>
    <ContainerSidebarRight/>
    <v-content>
      <Vue100vh>
        <v-container
          pa-0
          fluid
        >
          <router-view></router-view>
        </v-container>
      </Vue100vh>
    </v-content>
  </v-app>
</template>

<script>
  import Vue100vh from 'vue-div-100vh'
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

<style lang="scss">
.container {
  height: calc(100% - 64px);
}
</style>
