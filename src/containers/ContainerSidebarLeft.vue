<template>
  <v-navigation-drawer
    v-model="drawerLeft"
    app
    clipped
  >
    <v-list dense>
      <v-list-item
        link
        @click="changeRoute('worldmap', 1)"
      >
        <v-list-item-action>
          <v-icon>mdi-map-outline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Map</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        link
        @click="changeRoute('users', 2)"
        v-if="$store.state.user.role==='admin'"
      >
        <v-list-item-action>
          <v-icon>mdi-account-multiple-outline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Users</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        link
        @click="changeRoute('devices', 3)"
      >
        <v-list-item-action>
          <v-icon>mdi-devices</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Devices</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        link
        @click="changeRoute('positions', 4)"
      >
        <v-list-item-action>
          <v-icon>mdi-map-marker-outline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Positions</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider> default </v-divider>
      <v-list-item
        link
        @click="changeRoute('logout', 5)"
      >
        <v-list-item-action>
          <v-icon>mdi-exit-to-app</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: "ContainerSidebarLeft",
    data: () => ({
      drawerLeft: null,
      selectedIndex: 1,
    }),
    mounted () {
      this.$root.$on('toggle-sidebar-left', () => {
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
