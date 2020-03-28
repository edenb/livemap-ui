<template>
  <l-map
    ref="staticlayers"
    style="z-index: 1;"
    :zoom="zoom"
    :center="center"
  >
    <l-tile-layer :url="url"/>
    <l-geo-json :geojson="allLayers" :options="options"/>
  </l-map>
</template>

<script>
  import {apiMixin} from '@/components/mixins/apiMixin';
  import {LMap, LTileLayer, LGeoJson} from 'vue2-leaflet';
  import L from 'leaflet';
  export default {
    name: "StaticLayers",
    mixins: [apiMixin],
    components: {
      LMap,
      LTileLayer,
      LGeoJson,
    },
    data () {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        zoom: 3,
        center: [40, -40],
        options: {
          onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.popup) {
              layer.bindPopup(feature.properties.popup);
            }
          }
        }
      }
    },
    computed: {
      allLayers: function () {
        if (this.response.data) {
          for (let staticLayerData of this.response.data) {
            L.geoJson(staticLayerData)
            .addTo(this.$refs.staticlayers.mapObject);
          }
          return this.response.data;
        } else {
          return null;
        }
      }
    },
    created() {
      this.apiRequest('get', '/staticlayers');
    },
    mounted() {
      this.$nextTick(() => {
        //this.$refs.worldmap.mapObject.ANY_LEAFLET_MAP_METHOD();
      });
    },
  }
</script>
