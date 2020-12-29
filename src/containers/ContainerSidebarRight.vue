<template>
  <v-navigation-drawer
    v-model="drawerRight"
    app
    clipped
    right
    stateless
  >
    <v-data-table
      dense
      :headers="headers"
      :items="deviceList"
      :sort-by="['alias']"
      hide-default-header
      hide-default-footer
      @click:row="openDevicePopup"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Devices</v-toolbar-title>
        </v-toolbar>
      </template>
    </v-data-table>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "ContainerSidebarRight",
  data () {
    return {
      drawerRight: true,
      headers: [
        { text: 'Name', value: 'alias' },
      ],
    }
  },
  computed: {
    deviceList: function() {
      return this.$store.state.lastPositions.map(({ raw }) => {
        return {alias: raw.alias, device_id: raw.device_id}
      })
    }
  },
  mounted() {
    this.$root.$on('toggle-sidebar-right', () => {
      this.drawerRight = !this.drawerRight
    })
  },
  methods: {
    openDevicePopup(row) {
      this.$root.$emit('open-device-popup', row.device_id)
    }
  }
}
</script>

<style>
.v-data-table td {
    border-bottom: none !important;
}
</style>
