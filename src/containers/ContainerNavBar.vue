<template>
  <v-app-bar
    app
    clipped-left
    clipped-right
    color="primary"
    dark
  >
    <v-app-bar-nav-icon @click.stop="toggleSidebarLeft" />
    <v-toolbar-title>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon
            class="mb-1"
            :color="connectionIcon.color"
            dense
            v-on="on"
          >
            {{connectionIcon.name}}
          </v-icon>
        </template>
        <span>{{connectionIcon.tooltip}}</span>
      </v-tooltip>
      <span class="pl-3">Livemap UI</span>
    </v-toolbar-title>
    <v-spacer />

    <v-menu
      bottom
      left
      :nudge-bottom="8"
      origin="top right"
      transition="scale-transition"
      offset-y
    >
      <template v-slot:activator="{ on } ">
        <v-chip
          class="ma-2"
          color="secondary"
          v-on="on"
        >
          <v-avatar left>
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
          {{$store.state.user.fullname}}
        </v-chip>
      </template>
      <v-card>
        <v-list dense>
          <v-subheader>ACCOUNT</v-subheader>
          <v-list-item>
            <v-list-item-avatar color="secondary" size="36">
              <v-icon>mdi-account</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{$store.state.user.username}}</v-list-item-title>
              <v-list-item-subtitle>Username</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar color="secondary" size="36">
              <v-icon>mdi-account-key</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{$store.state.user.role}}</v-list-item-title>
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
  connectionIcon["connected"] = {name: "mdi-circle", color: "green", tooltip: "Live connection"};
  connectionIcon["disconnected"] = {name: "mdi-alert-circle", color: "red", tooltip: "No live connection"};

  import {apiMixin} from '@/components/mixins/apiMixin';
  export default {
    name: "ContainerNavBar",
    mixins: [apiMixin],
    created() {
      this.$socket.client.open();
    },
    computed: {
      connectionIcon: function() {
        return this.$socket.connected?connectionIcon["connected"]:connectionIcon["disconnected"];
      }
    },
    methods: {
      toggleSidebarLeft() {
        this.$root.$emit('toggle-sidebar-left')
      },
      toggleSidebarRight() {
        this.$root.$emit('toggle-sidebar-right')
      },
    }
  }
</script>
