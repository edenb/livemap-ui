<template>
  <v-navigation-drawer
    v-model="drawer"
    name="drawerLeft"
    @transitionend="onTransistionEnd"
  >
    <v-list nav>
      <v-list-item
        link
        title="Map"
        prepend-icon="mdi-map-outline"
        @click="changeRoute('worldmap', 1)"
      />
      <v-list-item
        v-if="user.role === 'admin'"
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
import { mapState } from "pinia";
import { useAuthStore } from "@/store.js";
import { useLayoutStore } from "@/store.js";

export default {
  name: "TheSidebarLeft",
  data: () => ({
    drawer: false,
    selectedIndex: 1,
  }),
  computed: {
    ...mapState(useAuthStore, ["user"]),
    ...mapState(useLayoutStore, ["drawerOpen"]),
  },
  mounted() {
    if ("left" in this.drawerOpen) {
      this.drawer = this.drawerOpen.left;
    } else {
      this.drawer = !this.$vuetify.display.mobile;
      this.drawerOpen.left = this.drawer;
    }
    this.emitter.on("toggle-sidebar-left", () => {
      this.drawer = !this.drawer;
    });
  },
  beforeUnmount() {
    this.emitter.off("toggle-sidebar-left");
  },
  methods: {
    changeRoute(routeName, selectedIndex) {
      const vm = this;
      vm.selectedIndex = selectedIndex;
      return vm.$router.push({ name: routeName });
    },
    onTransistionEnd(event) {
      if (event.propertyName === "transform") {
        this.drawerOpen.left = this.drawer;
      }
    },
  },
};
</script>
