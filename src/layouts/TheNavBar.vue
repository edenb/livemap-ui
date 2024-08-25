<template>
  <v-app-bar
    name="navBar"
    color="primary"
    :density="$vuetify.display.mobile ? 'compact' : 'default'"
  >
    <template #prepend>
      <v-app-bar-nav-icon
        data-cy="navbar-menu-drawer-control"
        @click.stop="toggleSidebarLeft"
      ></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-icon
            :icon="connectionIcon.name"
            class="mb-1"
            :color="connectionIcon.color"
            data-cy="navbar-connection-status"
            size="x-small"
            v-bind="props"
          />
        </template>
        <span>{{ connectionIcon.tooltip }}</span>
      </v-tooltip>
      <span class="hidden-xs pl-3">Livemap</span>
    </v-app-bar-title>

    <template #append>
      <ServerInfo ref="serverInfo" />
      <v-btn
        data-cy="navbar-info-dialog-control"
        icon="mdi-information-outline"
        variant="text"
        @click="serverInfo.open()"
      />
      <v-menu>
        <template #activator="{ props }">
          <v-chip
            v-if="!$vuetify.display.mobile"
            data-cy="navbar-account-dialog-control"
            prepend-icon="mdi-account-circle"
            v-bind="props"
          >
            {{ authStore.user.fullname }}
          </v-chip>
          <v-btn
            v-else
            data-cy="navbar-account-dialog-control"
            icon="mdi-account-circle"
            variant="text"
            v-bind="props"
          />
        </template>
        <v-card>
          <v-toolbar color="secondary" density="compact">
            <v-toolbar-title>{{ authStore.user.fullname }}</v-toolbar-title>
          </v-toolbar>
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-account" />
              </template>
              <v-list-item-title>
                {{ authStore.user.username }}
              </v-list-item-title>
              <v-list-item-subtitle> Username </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-account-key" />
              </template>
              <v-list-item-title>
                {{ authStore.user.role }}
              </v-list-item-title>
              <v-list-item-subtitle> Permission level </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      <v-app-bar-nav-icon
        data-cy="navbar-device-drawer-control"
        @click.stop="toggleSidebarRight"
      />
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useAuthStore } from "@/store.js";
import ServerInfo from "@/components/ServerInfo.vue";

const authStore = useAuthStore();
const connect = inject("connect");
const connectionIcon = computed(() => {
  if (isConnected.value) {
    return {
      name: "mdi-circle",
      color: "green",
      tooltip: "Live connection",
    };
  } else {
    return {
      name: "mdi-alert",
      color: "red",
      tooltip: "No live connection",
    };
  }
});
const emitter = inject("emitter");
const isConnected = inject("isConnected");
const serverInfo = ref(null);

onMounted(() => {
  connect(authStore.token);
});

function toggleSidebarLeft() {
  emitter.emit("toggle-sidebar-left");
}

function toggleSidebarRight() {
  emitter.emit("toggle-sidebar-right");
}
</script>
