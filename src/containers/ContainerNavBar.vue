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
      Livemap UI
    </v-toolbar-title>
    <v-spacer />
    <v-chip
      class="ma-2"
      color="secondary"
      text-color="white"
      v-if="response.data && response.data.length!==0"
    >
      <v-avatar left>
        <v-icon>mdi-account-circle</v-icon>
      </v-avatar>
      {{this.response.data.fullname}}
    </v-chip>
    <v-app-bar-nav-icon @click.stop="toggleSidebarRight" />
  </v-app-bar>
</template>

<script>
  import {axiosMixin} from '@/components/mixins/axiosMixin';
  export default {
    name: "ContainerNavBar",
    mixins: [axiosMixin],
    created() {
      this.apiRequest('get', '/account');
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
