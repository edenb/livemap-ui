<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    name="drawerRight"
    location="right"
    @transitionend="onTransistionEnd"
  >
    <v-list dense>
      <v-list-subheader>DEVICES</v-list-subheader>
      <v-list-item
        v-for="(device, i) in deviceList"
        :key="i"
        @click="openDevicePopup(device.device_id)"
      >
        <v-list-item-avatar :size="25">
          <v-icon
            :icon="device.icon"
            :class="device.markerColor"
            :size="15"
            dark
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ device.alias }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-action-text>
            {{ getAgeText(device.timestamp) }}
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "TheSidebarRight",
  data () {
    return {
      drawerOpen: false, //!this.$vuetify.breakpoint.mobile,
      headers: [
        { text: 'Name', value: 'alias' },
      ],
    }
  },
  computed: {
    deviceList: function() {
      let devList = this.$store.state.lastPositions.map(({ raw, icon }) => {
        return {
          alias: raw.alias,
          device_id: raw.device_id,
          icon: icon.options.icon,
          iconColor: icon.options.iconColor,
          markerColor: icon.options.markerColor,
          timestamp: raw.loc_timestamp
        }
      })
      // Sort device list in alphabetical order (by device alias)
      devList.sort((a, b) => a.alias.localeCompare(b.alias))
      return devList
    }
  },
  mounted() {
    this.drawerOpen = !this.$vuetify.display.mobile;
    this.$bus.$on('toggle-sidebar-right', () => {
      this.drawerOpen = !this.drawerOpen
    })
    this.updateStore();
  },
  methods: {
    openDevicePopup(device_id) {
      this.$bus.$emit('open-device-popup', device_id)
    },
    getAgeText(birth) {
      const tsBirth = new Date(birth)
      const tsNow = new Date(Date.now())
      const td = (tsNow-tsBirth)/1000
      if (td<60) {
        return `<1m`
      }
      if (td<3600) {
        return `${(td/60).toFixed()}m`
      }
      if (td<(3600*24)) {
        return `${(td/3600).toFixed()}h`
      }
      if (td<(3600*24*99)) {
        return `${(td/(3600*24)).toFixed()}d`
      }
      return `>99d`
    },
    updateStore() {
      this.$store.dispatch('setDrawerOpen', {
        name: 'drawerRight',
        open: this.drawerOpen
      });
    },
    onTransistionEnd(drawer) {
      if (drawer.propertyName==='transform') {
        this.updateStore();
      }
    }
  }
}
</script>
