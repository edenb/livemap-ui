<template>
  <v-app id="app">
    <ContainerNavBar/>
    <ContainerSidebarLeft/>
    <ContainerSidebarRight/>

    <v-content>
      <v-container
        class="px-0 py-0 fill-height "
        fluid
      >
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import ContainerNavBar from '@/containers/ContainerNavBar';
  import ContainerSidebarLeft from '@/containers/ContainerSidebarLeft';
  import ContainerSidebarRight from '@/containers/ContainerSidebarRight';
  export default {
    name: "ContainerMain",
    props: {
      source: String,
    },
    components: {
      ContainerNavBar,
      ContainerSidebarLeft,
      ContainerSidebarRight
    }
  }
</script>
