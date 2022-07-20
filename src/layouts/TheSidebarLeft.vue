<template>
  <v-navigation-drawer
    v-model="drawerLeft"
  >
    <v-list nav>
      <v-list-item
        link
        title="Map"
        prepend-icon="mdi-map-outline"
        @click="changeRoute('worldmap', 1)"
      />
      <v-list-item
        v-if="$store.state.user.role==='admin'"
        link
        title="Users"
        prepend-icon="mdi-account-multiple-outline"
        @click="changeRoute('users', 2)"
      />
      <v-list-item
        link
        title="Devices"
        prepend-icon="mdi-devices"
        @click="changeRoute('devices', 3)"
      />
      <v-divider> default </v-divider>
      <v-list-item
        link
        title="Logout"
        prepend-icon="mdi-exit-to-app"
        @click="changeRoute('logout', 4)"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: "TheSidebarLeft",
    data: () => ({
      drawerLeft: null,
      selectedIndex: 1,
    }),
    mounted () {
      this.$bus.$on('toggle-sidebar-left', () => {
        this.drawerLeft = !this.drawerLeft
      })
    },
    methods: {
      changeRoute(routeName, selectedIndex) {
        const vm = this;
        vm.selectedIndex = selectedIndex;
        return vm.$router.push({ name: routeName });
      },
    }
  }
</script>
