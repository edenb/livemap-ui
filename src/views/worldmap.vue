<template>
  <l-map
    ref="worldmap"
    style="z-index: 1"
    :options="{ tap: false }"
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
        v-for="lastPosition in $store.state.lastPositions"
        :key="lastPosition.raw.device_id"
        :lat-lng="lastPosition.latLng"
        :icon="lastPosition.icon"
        :options="lastPosition.options"
      >
        <l-popup :content="lastPosition.popup" />
      </l-marker>
    </l-feature-group>
    <l-feature-group
      layer-type="overlay"
      v-for="(staticLayer, index) in staticLayers"
      :key="index"
      :name="getStaticLayerName(staticLayer.geojson, index)"
    >
      <l-geo-json
        :geojson="staticLayer.geojson"
        :options="staticLayer.options"
      >
      </l-geo-json>
    </l-feature-group>
  </l-map>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import {socketMixin} from '@/components/mixins/socketMixin';
import * as L from "leaflet";
import 'leaflet/dist/leaflet.css'; // Leaflet stylesheet in script section (see vue2leaflet FAQ)
import {LMap, LTileLayer, LControlLayers, LFeatureGroup, LMarker, LPopup, LGeoJson} from 'vue2-leaflet';
import {ExtraMarkers} from 'leaflet-extra-markers';
export default {
  mixins: [apiMixin, socketMixin],
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LFeatureGroup,
    LMarker,
    LPopup,
    LGeoJson
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
      staticLayers: []
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
    this.$socket.client.emit('token', this.$store.state.token);
    this.apiRequest('get', '/positions')
      .then((response) => {
        this.$store.dispatch('clearLastPositions');
        for (let position of response.data) {
          this.$store.dispatch('addLastPositions', {marker: createMarker(position)});
        }
      })
    this.apiRequest('get', '/staticlayers')
      .then((response) => {
        this.staticLayers = [];
        for (let geojson of response.data) {
          let staticLayer = {};
          staticLayer.geojson = geojson;
          staticLayer.options = this.getGeoJsonOptions(geojson);
          this.staticLayers.push(staticLayer);
        }
      })
  },
  methods: {
    zoomUpdate(zoom) {
      this.$store.dispatch('setMapZoom', zoom);
    },
    centerUpdate(center) {
      this.$store.dispatch('setMapCenter', center);
    },
    getStaticLayerName(geojson, index) {
      let name = `Overlay ${index}`
      if (geojson.properties && geojson.properties.name) {
        name = geojson.properties.name;
      }
      return name;
    },
    getGeoJsonOptions(geojson) {
      return {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, {
            opacity: (geojson.properties && geojson.properties.marker && geojson.properties.marker.opacity) || 0.8,
            icon: ExtraMarkers.icon({
              icon: `mdi-${(geojson.properties && geojson.properties.marker && geojson.properties.marker.icon) || 'star'}`,
              prefix: 'mdi',
              markerColor: (geojson.properties && geojson.properties.marker && geojson.properties.marker.markercolor) || 'green',
              iconColor: (geojson.properties && geojson.properties.marker && geojson.properties.marker.iconcolor) || 'white',
              shape: 'circle'
            })
          });
        },
        style: (feature) => {
          // Only apply style to (multi)lines and polygons
          if (feature.geometry.type !== 'Point') {
            return {
              color: (geojson.properties && geojson.properties.line && geojson.properties.line.color) || 'red',
              weight: (geojson.properties && geojson.properties.line && geojson.properties.line.weight) || 5,
              opacity: (geojson.properties && geojson.properties.line && geojson.properties.line.opacity) || 0.65
            };
          } else {
            return {};
          }
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            if (feature.properties.popup) {
              layer.bindPopup(feature.properties.popup);
            } else {
              let popupText = '';
              let popupKeys = Object.keys(feature.properties);
              let popupValues = Object.values(feature.properties);
              for (let i = 0; i < popupKeys.length; i += 1) {
                popupText += popupKeys[i] + ': ' + popupValues[i] + '<br>';
              }
              layer.bindPopup(popupText);
            }
          }
        }
      }
    }
  },
  sockets: {
    positionUpdate(socketPayloadStr) {
      try {
        const newMarker = createMarker(JSON.parse(socketPayloadStr).data);
        const cbFindDuplicates = (e, i, a) => e.raw.device_id === a[a.length-1].raw.device_id;
        this.$store.dispatch('addLastPositions', {marker: newMarker, cb: cbFindDuplicates});
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
  newMarker.icon = ExtraMarkers.icon(getMarkerIcon(payload));
  newMarker.options = getMarkerOptions(payload);
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

function getMarkerIcon(dev) {
  // Default marker icon
  let cIcon = 'home';
  let cPrefix = 'mdi'; // Ignore prefix provided by the device
  let cMarkerColor = 'cyan';
  let cIconColor = 'white';
  let cShape = 'circle';

  // If loc_type is defined use predefined marker/icon sets
  if (dev.loc_type) {
    if (dev.loc_type === 'rec') {
      cIcon = 'circle';
      cMarkerColor = 'blue';
    }
    if ((dev.loc_type === 'now') || (dev.loc_type === 'left')) {
      cIcon = 'circle';
      cMarkerColor = 'green';
    }
  } else {
    if (dev.loc_attr) {
      if (dev.loc_attr.miconname) {
        cIcon = dev.loc_attr.miconname;
      }
      if (dev.loc_attr.mcolor) {
        cMarkerColor = dev.loc_attr.mcolor;
      }
      if (dev.loc_attr.miconcolor) {
        cIconColor = dev.loc_attr.miconcolor;
      }
    }
  }
  let customIcon = { icon: `${cPrefix}-${cIcon}`,
                     prefix: cPrefix,
                     markerColor: cMarkerColor,
                     iconColor: cIconColor,
                     shape: cShape};
  return customIcon
}

function getMarkerOptions(dev) {
  // Default marker options
  let cOpacity = 1.0;

  // Define icon opacity
  if (dev.loc_type && dev.loc_type === 'left') {
    cOpacity = 0.5;
  } else {
    if (dev.loc_attr && dev.loc_attr.mopacity) {
      cOpacity = dev.loc_attr.mopacity;
    }
  }
  return {opacity: cOpacity};
}
</script>

<style>
@import '../../node_modules/leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
</style>
