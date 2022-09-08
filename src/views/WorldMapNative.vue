<template>
  <div
    id="worldmap"
  />
</template>

<script>
import { ApiMixin } from '@/mixins/ApiMixin';
import {SocketMixin} from '@/mixins/SocketMixin';
import 'leaflet/dist/leaflet.css';
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import L from 'leaflet';
import { ExtraMarkers } from 'leaflet-extra-markers';
import {mapState} from 'vuex';

export default {
  name: "WorldMap",
  mixins: [ApiMixin, SocketMixin],
  data() {
    return {
      map: null,
      baseLayers: null,
      deviceLayer: null,
      staticLayers: null,
      layerControl: null,
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
  computed: mapState(['drawerOpen']),
  watch: {
    drawerOpen: {
      deep: true,
      handler() {
        this.map.invalidateSize({pan: false});
      }
    }
  },
  mounted() {
    console.log('Mount map');
    this.initMap();
    this.loadDeviceLayer();
    this.loadStaticLayers();
  },
  beforeUnmount() {
    if (this.map) {
      console.log('Remove map');
      this.map.remove();
    }
  },
  methods: {
    initMap() {
      this.map = L.map("worldmap").setView([32, -110], 8);

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
      this.apiRequest('get', '/positions')
        .then((response) => {
          this.deviceLayer = L.featureGroup().addTo(this.map);
          //console.log("Positions loaded")
          //this.$store.dispatch('clearLastPositions');
          for (let dev of response.data) {
            //this.$store.dispatch('addLastPositions', {marker: createMarker(position)});
            //console.log(position)
            const popup = this.getPopupText(dev);
            const iconAttr = this.getMarkerIconAttr(dev);
            const opacity = this.getMarkerOpacity(dev);
            this.updateMarker(dev.device_id, dev.loc_lat, dev.loc_lon, popup, iconAttr, opacity);
          }
          this.fitMarkers();
          this.layerControl.addOverlay(this.deviceLayer, "Device");
        })
    },
    loadStaticLayers() {
      this.apiRequest('get', '/staticlayers')
        .then((response) => {
          this.staticLayers = L.featureGroup().addTo(this.map);
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
    updateMarker(id, lat, lon, popup, iconAttr, opacity) {
      //console.log(id, lon, lat, popup);
      if (this.deviceLayer) {
        const icon = ExtraMarkers.icon({
          icon: iconAttr.icon,
          prefix: iconAttr.prefix,
          markerColor: iconAttr.markerColor,
          iconColor: iconAttr.iconColor
        });
        const allMarkers = this.deviceLayer.getLayers();
        let marker = allMarkers.find(e => e.options.id === id);
        if (!marker) {
          marker = L.marker([lat, lon], {id, icon, opacity});
          marker.bindPopup(popup);
          this.deviceLayer.addLayer(marker);
        } else {
          marker.setLatLng([lat, lon]);
          marker.setIcon(icon);
          marker.bindPopup(popup);
          marker.setOpacity(opacity);
        }
      } else {
        console.log("Skip position update")
      }
    },
    fitMarkers() {
      const bounds = this.deviceLayer.getBounds().pad(0.2);
      const paddingRight = this.map.getSize().x - this.map.getContainer().clientWidth;
      const paddingBottom = this.map.getSize().y - this.map.getContainer().clientHeight;
      this.map.flyToBounds((bounds), {paddingBottomRight: [paddingRight, paddingBottom]});
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
    },
    getPopupText(dev) {
      const loc_type_str = {
        'rec': 'Recorded',
        'left': 'Last known'
      };
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
    },
    getMarkerIconAttr(dev) {
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
      let customIconAttr = { icon: `${cPrefix}-${cIcon}`,
                         prefix: cPrefix,
                         markerColor: cMarkerColor,
                         iconColor: cIconColor,
                         shape: cShape};
      return customIconAttr
    },
    getMarkerOpacity(dev) {
      // Default marker options
      let opacity = 1.0;

      // Define icon opacity
      if (dev.loc_type && dev.loc_type === 'left') {
        opacity = 0.5;
      } else {
        if (dev.loc_attr && dev.loc_attr.mopacity) {
          opacity = dev.loc_attr.mopacity;
        }
      }
      return opacity;
    }
  },
  sockets: {
    positionUpdate(socketPayloadStr) {
      try {
        const dev = JSON.parse(socketPayloadStr).data;
        const popup = this.getPopupText(dev);
        const iconAttr = this.getMarkerIconAttr(dev);
        const opacity = this.getMarkerOpacity(dev);
        this.updateMarker(dev.device_id, dev.loc_lat, dev.loc_lon, popup, iconAttr, opacity);
      } catch(err) {
        console.log(err);
      }
    }
  }
};
</script>

<style scoped>
#worldmap {
  height: 100%;
  z-index: 0;
}
</style>