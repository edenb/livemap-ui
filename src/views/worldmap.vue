<template>
  <l-map
    ref="worldmap"
    style="z-index: 1"
    :zoom="zoom"
    :center="center"
    @update:zoom="zoomUpdate"
    @update:center="centerUpdate"
  >
    <l-control-layers
      position="topright"
      :collapsed="false"
    />
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
        :key="lastPosition.raw.device_id"
        :lat-lng="lastPosition.latLng"
      >
        <l-popup :content="lastPosition.popup" />
      </l-marker>
    </l-feature-group>
  </l-map>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import {LMap, LTileLayer, LControlLayers, LFeatureGroup, LMarker, LPopup} from 'vue2-leaflet';
export default {
  mixins: [apiMixin],
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LFeatureGroup,
    LMarker,
    LPopup
  },
  data () {
    return {
      zoom: this.$store.state.mapZoom,
      center: this.$store.state.mapCenter,
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
  beforeCreate() {
    if (this.$store.state.mapZoom < 0) {
      this.$store.dispatch('setMapZoom', 3);
      this.$store.dispatch('setMapCenter', { lng: -40, lat: 40 });
    }
  },
  created() {
    this.$socket.client.open();
    this.apiRequest('get', '/positions')
      .then(() => {
        this.$socket.client.emit('authenticate', 'Authenticated!!');
      })
  },
  watch: {
    response: function () {
      if (this.response.data) {
        this.lastPositions = [];
        for (let position of this.response.data) {
          this.lastPositions.push(createMarker(position));
        }
      }
    }
  },
  methods: {
    zoomUpdate(zoom) {
      this.$store.dispatch('setMapZoom', zoom);
    },
    centerUpdate(center) {
      this.$store.dispatch('setMapCenter', center);
    }
  },
  sockets: {
    connect() {
      console.log('Connected!!');
      //this.$socket.client.emit('authenticate', 'Authenticated!!');
    },
    positionUpdate(socketPayloadStr) {
      try {
        const newMarker = createMarker(JSON.parse(socketPayloadStr).data);
        let idx = this.lastPositions.findIndex(x => x.raw.device_id === newMarker.raw.device_id);
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

function createMarker(payload) {
  let newMarker = {};
  newMarker.raw = payload;
  newMarker.latLng = {lat: payload.loc_lat, lon: payload.loc_lon};
  newMarker.popup = getPopupText(payload);

  return newMarker;
}

const loc_type_str = {
  'rec': 'Recorded',
  'left': 'Last known'
};

function getPopupText(dev) {
  let htmlText = '', PopupType;

  const PopupTime = new Date(dev.loc_timestamp);
  // If loc_type is defined use predefined label
  if (dev.loc_type) {
    PopupType = loc_type_str[dev.loc_type];
    htmlText += '<b>' + dev.alias + '</b>';
    if (typeof PopupType !== 'undefined') {
      htmlText += ' (' + PopupType + ')';
    }
    htmlText += '<br>';
    htmlText += PopupTime.toLocaleString() + '<br>';
  } else {
    if (dev.loc_attr) {
      if (dev.loc_attr.labelshowalias) {
        htmlText += '<b>' + dev.alias + '</b><br>';
      }
      if (dev.loc_attr.labelshowtime) {
        htmlText += PopupTime.toLocaleString() + '<br>';
      }
      if (dev.loc_attr.labelcustomhtml) {
        htmlText += dev.loc_attr.labelcustomhtml;
      }
    }
  }

  if (htmlText === '') {
    // Show at least the alias
    htmlText = '<b>' + dev.alias + '</b>';
  }

  return htmlText;
}
</script>
