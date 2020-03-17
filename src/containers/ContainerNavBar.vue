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
    <v-chip
      class="ma-2"
      color="secondary"
      text-color="white"
    >
      <v-avatar left>
        <v-icon>mdi-account-circle</v-icon>
      </v-avatar>
      {{$store.state.user.fullname}}
    </v-chip>
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
