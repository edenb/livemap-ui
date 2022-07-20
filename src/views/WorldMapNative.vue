<template>
  <div id="worldmap" class="leaflet-container" />
</template>

<script>
import { ApiMixin } from '@/mixins/ApiMixin';
import "leaflet/dist/leaflet.css";
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import L from "leaflet";
import { ExtraMarkers } from 'leaflet-extra-markers';

export default {
  name: "WorldMap",
  mixins: [ApiMixin],
  data() {
    return {
      map: null,
      baseLayers: null,
      deviceLayer: null,
      staticLayers: null,
      layerControl: null,
      pos: null,
      tileProviders: [
        {
          urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            name: 'OpenStreetMap',
            visible: true,
            attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        {
          urlTemplate: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          options: {
            name: 'OpenTopoMap',
            visible: false,
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          }
        },
      ]
    };
  },
  mounted() {
    this.initMap();
    this.loadDeviceLayer();
    this.loadStaticLayers();

    setTimeout(() => { this.updatePos(1) }, 3000)
    //L.marker([53, 20]).addTo(this.map);
    //L.marker([49.5, 19.5]).addTo(this.map);
    //L.marker([49, 25]).addTo(this.map);
    //L.marker([-10, 25]).addTo(this.map);
    //L.marker([10, -25]).addTo(this.map);
    //L.marker([0, 0]).addTo(this.map);
  },
  onBeforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    initMap() {
      this.map = L.map("worldmap").setView([46.05, 11.05], 5);

      let baseMaps = {};
      this.tileProviders.forEach((tileProvider) => {
        const baseLayer = L.tileLayer(tileProvider.urlTemplate, tileProvider.options);
        if (tileProvider.options.visible) {
          baseLayer.addTo(this.map);
        }
        baseMaps[tileProvider.options.name] = baseLayer;
      });
      this.layerControl = L.control.layers(baseMaps, {}, { collapsed: false }).addTo(this.map);
    },
    loadDeviceLayer() {
      this.deviceLayer = L.featureGroup([]).addTo(this.map);
      this.deviceLayer.addLayer(L.marker([50, 14], {
        device_id: 1, icon: ExtraMarkers.icon({
          icon: 'mdi-home', prefix: 'mdi', markerColor: 'green',
          iconColor: 'white'
        })
      }).addTo(this.map));
      this.layerControl.addOverlay(this.deviceLayer, "Device");
    },
    loadStaticLayers() {
      this.apiRequest('get', '/staticlayers')
        .then((response) => {
          this.staticLayers = L.featureGroup([]).addTo(this.map);
          let layerControlStatic = [];
          let layerIndex = 1;
          for (let geojson of response.data) {
            const staticLayer = this.staticLayers.addLayer(L.geoJSON(geojson, this.getGeoJsonOptions(geojson)));
            layerControlStatic.push({layer: staticLayer, layerName: this.getStaticLayerName(geojson, layerIndex)});
            layerIndex++;
          }
          layerControlStatic.sort((a, b) => {
            return a.layerName - b.layerName;
          });
          layerControlStatic.forEach((element) => {
            this.layerControl.addOverlay(element.layer, element.layerName);
          });
        })
    },
    getStaticLayerName(geojson, index) {
      let name = `Overlay ${index}`
      if (geojson.properties && geojson.properties.name) {
        name = geojson.properties.name;
      }
      return name;
    },
    updatePos(id) {
      this.deviceLayer.getLayers().forEach((layer) => {
        if (layer.options.device_id === id) {
          layer.setLatLng([52, 5]);
        }
      })
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
  }
};
</script>

<style scoped>
#worldmap {
  width: 100%;
  height: 100%;
}
</style>