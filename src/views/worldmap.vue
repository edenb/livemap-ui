<template>
  <v-layout child-flex>
    <l-map
      ref="worldmap"
      style="z-index: 1;"
      :zoom="zoom"
      :center="center"
    >
      <l-control-layers position="topright"/>
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"/>
      <l-feature-group
        layer-type="overlay"
        name="Devices"
      >
        <l-marker
          v-for="lastPosition in lastPositions"
          :key="lastPosition.device.device_id"
          :lat-lng="lastPosition.latLng"
        />
      </l-feature-group>
    </l-map>
  </v-layout>
</template>

<script>
import {axiosMixin} from '@/components/mixins/axiosMixin';
import {LMap, LTileLayer, LControlLayers, LFeatureGroup, LMarker} from 'vue2-leaflet';
export default {
  mixins: [axiosMixin],
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LFeatureGroup,
    LMarker
  },
  data () {
    return {
      zoom: 8,
      center: [52, 5],
      tileProviders: [
        {
          name: 'OpenStreetMap',
          visible: true,
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        },
        {
          name: 'OpenTopoMap',
          visible: false,
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution:
            'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
      ],
      lastPositions: []
    }
  },
  mounted() {
    this.$nextTick(() => {
    //this.$refs.worldmap.mapObject.ANY_LEAFLET_MAP_METHOD();
    });
  },
  sockets: {
    positionUpdate(socketPayloadStr) {
      try {
        const newMarker = createMarker(JSON.parse(socketPayloadStr));
        let idx = this.lastPositions.findIndex(x => x.device.device_id === newMarker.device.device_id);
        if (idx >=0) {
          this.lastPositions.splice(idx, 1);
        }
        this.lastPositions.push(newMarker);
      } catch(err) {
        console.log(err);
      }
    }
  }
}

function createMarker(socketPayload) {
  let newMarker = {};
  newMarker.latLng = {lat: socketPayload.data.loc_lat, lon: socketPayload.data.loc_lon};
  newMarker.device = socketPayload.data;

  return newMarker;
}
</script>
