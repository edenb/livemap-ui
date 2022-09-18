<template>
  <v-app-bar
    name="navBar"
    color="primary"
    :density="$vuetify.display.mobile ? 'compact' : 'default'"
  >
    <v-app-bar-nav-icon @click.stop="toggleSidebarLeft" />
    <v-toolbar-title>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-icon
            :icon="connectionIcon.name"
            class="mb-1"
            :color="connectionIcon.color"
            size="x-small"
            v-bind="props"
          />
        </template>
        <span>{{ connectionIcon.tooltip }}</span>
      </v-tooltip>
      <span class="hidden-xs-only pl-3">Livemap UI</span>
    </v-toolbar-title>
    <v-spacer />

    <serverInfo ref="serverInfo" />
    <v-btn color="white" fab dark small icon @click="showServerInfo()">
      <v-icon icon="mdi-information-outline" dark />
    </v-btn>
    <v-menu bottom left origin="top right">
      <template #activator="{ props }">
        <v-chip class="ma-2" color="secondary" v-bind="props">
          <v-avatar left class="ml-0 mr-0">
            <v-icon icon="mdi-account-circle" />
          </v-avatar>
          <span v-if="!$vuetify.display.mobile" class="ml-2">
            {{ $store.state.user.fullname }}
          </span>
        </v-chip>
      </template>
      <v-card>
        <v-toolbar color="secondary" density="compact">
          <v-toolbar-title>{{ $store.state.user.fullname }}</v-toolbar-title>
        </v-toolbar>
        <v-list density="compact">
          <v-list-item>
            <v-icon icon="mdi-account" class="mr-2" mdi-account />
            <v-list-item-content>
              <v-list-item-title>{{
                $store.state.user.username
              }}</v-list-item-title>
              <v-list-item-subtitle>Username</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-icon icon="mdi-account-key" class="mr-2" />
            <v-list-item-content>
              <v-list-item-title>{{
                $store.state.user.role
              }}</v-list-item-title>
              <v-list-item-subtitle>Permission level</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <v-app-bar-nav-icon @click.stop="toggleSidebarRight" />
  </v-app-bar>
</template>

<script>
const connectionIcon = [];
connectionIcon["connected"] = {
  name: "mdi-circle",
  color: "green",
  tooltip: "Live connection",
};
connectionIcon["disconnected"] = {
  name: "mdi-alert",
  color: "red",
  tooltip: "No live connection",
};

import { ApiMixin } from "@/mixins/ApiMixin";
import { SocketMixin } from "@/mixins/SocketMixin";
import ServerInfo from "@/components/ServerInfo.vue";
export default {
  name: "TheNavBar",
  components: {
    ServerInfo,
  },
  mixins: [ApiMixin, SocketMixin],
  computed: {
    connectionIcon: function () {
      return this.$socket.connected
        ? connectionIcon["connected"]
        : connectionIcon["disconnected"];
    },
  },
  methods: {
    toggleSidebarLeft() {
      this.emitter.emit("toggle-sidebar-left");
    },
    toggleSidebarRight() {
      this.emitter.emit("toggle-sidebar-right");
    },
    showServerInfo() {
      this.$refs.serverInfo.open();
    },
  },
};
</script>
