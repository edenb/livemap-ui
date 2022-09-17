<template>
  <v-navigation-drawer
    v-model="drawer"
    name="drawerRight"
    location="right"
    @transitionend="onTransistionEnd"
  >
    <v-list
      density="compact"
      nav
    >
      <v-list-subheader>DEVICES</v-list-subheader>
      <v-list-item
        v-for="(device, i) in lastPositionsOrdered"
        :key="i"
        @click="openDevicePopup(device.raw.device_id)"
      >
        <template #prepend>
          <v-avatar
            variant="elevated"
            :color="device.iconAttr.markerColor"
            size="small"
          >
            <v-icon
              :icon="device.iconAttr.icon"
              :color="device.iconAttr.iconColor"
              size="x-small"
            />
          </v-avatar>
        </template>
        <v-list-item-title>
          {{ device.raw.alias }}
        </v-list-item-title>
        <template #append>
          <v-list-item-title>
            {{ getAgeText(device.raw.loc_timestamp) }}
          </v-list-item-title>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "TheSidebarRight",
  data () {
    return {
      drawer: false,
      headers: [
        { text: 'Name', value: 'alias' },
      ],
    }
  },
  computed: {
    ...mapState(['lastPositions', 'drawerOpen']),
    lastPositionsOrdered: function() {
      let lastPositionsOrdered = this.lastPositions;
      lastPositionsOrdered.sort((a, b) => a.raw.alias.localeCompare(b.raw.alias))
      return lastPositionsOrdered
    }
  },
  mounted() {
    if ('right' in this.drawerOpen) {
      this.drawer = this.drawerOpen.right;
    } else {
      this.drawer = !this.$vuetify.display.mobile;
    }
    this.emitter.on('toggle-sidebar-right', () => {
      this.drawer = !this.drawer;
    })
  },
  beforeUnmount() {
    this.emitter.off('toggle-sidebar-right')
  },
  methods: {
    openDevicePopup(device_id) {
      this.emitter.emit('open-device-popup', device_id);
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
    onTransistionEnd(event) {
      if (event.propertyName==='transform') {
        this.$store.dispatch('setDrawerOpen', {
          name: 'right',
          open: this.drawer
        });
      }
    }
  }
}
</script>
