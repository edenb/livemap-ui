<template>
  <v-navigation-drawer
    v-model="drawerRight"
    app
    clipped
    right
    stateless
  >
    <v-list dense>
      <v-list-item
        @click.stop="drawerRight = !drawerRight"
      >
        <v-list-item-action>
          <v-icon>mdi-window-close</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Close</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: "ContainerSidebarRight",
    data: () => ({
      drawerRight: false,
    }),
    mounted () {
      this.$root.$on('toggle-sidebar-right', () => {
        this.drawerRight = !this.drawerRight
      })
    }
  }
</script>
