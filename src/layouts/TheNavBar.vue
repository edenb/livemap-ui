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
    <v-btn
      variant="text"
      icon="mdi-information-outline"
      @click="showServerInfo()"
    />
    <v-menu bottom left origin="top right">
      <template #activator="{ props }">
        <v-chip
          v-if="!$vuetify.display.mobile"
          prepend-icon="mdi-account-circle"
          v-bind="props"
        >
          {{ $store.state.user.fullname }}
        </v-chip>
        <v-btn v-else variant="text" icon="mdi-account-circle" v-bind="props" />
      </template>
      <v-card>
        <v-toolbar color="secondary" density="compact">
          <v-toolbar-title>{{ $store.state.user.fullname }}</v-toolbar-title>
        </v-toolbar>
        <v-list density="compact">
          <v-list-item>
            <template #prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>
              {{ $store.state.user.username }}
            </v-list-item-title>
            <v-list-item-subtitle> Username </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon>mdi-account-key</v-icon>
            </template>
            <v-list-item-title>
              {{ $store.state.user.role }}
            </v-list-item-title>
            <v-list-item-subtitle> Permission level </v-list-item-subtitle>
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

import { inject } from "vue";
import ServerInfo from "@/components/ServerInfo.vue";

export default {
  name: "TheNavBar",
  components: {
    ServerInfo,
  },
  setup() {
    const connect = inject("connect");
    const isConnected = inject("isConnected");
    return {
      connect,
      isConnected,
    };
  },
  computed: {
    connectionIcon: function () {
      return this.isConnected
        ? connectionIcon["connected"]
        : connectionIcon["disconnected"];
    },
  },
  mounted() {
    this.connect(this.$store.state.token);
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
