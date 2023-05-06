<template>
  <TheSidebarRight />
  <div id="worldmap" />
</template>

<script>
import { inject } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store.js";
import { useLayoutStore } from "@/store.js";
import { usePositionStore } from "@/store.js";
import { useWorldmapStore } from "@/store.js";
import { ApiMixin } from "@/mixins/ApiMixin.js";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import L from "leaflet";
import { ExtraMarkers } from "leaflet-extra-markers";
import TheSidebarRight from "@/layouts/TheSidebarRight.vue";
import { standardizeColor as sColor } from "@/helpers/colors.js";

export default {
  name: "WorldMap",
  components: {
    TheSidebarRight,
  },
  mixins: [ApiMixin],
  setup() {
    const connect = inject("connect");
    const positionUpdate = inject("positionUpdate");
    const authStore = useAuthStore();
    const positionStore = usePositionStore();
    const worldmapStore = useWorldmapStore();
    const layoutStore = useLayoutStore();
    const { drawerOpen } = storeToRefs(layoutStore);

    return {
      authStore,
      connect,
      drawerOpen,
      positionStore,
      positionUpdate,
      worldmapStore,
    };
  },
  watch: {
    drawerOpen: {
      deep: true,
      handler() {
        this.map.invalidateSize({ pan: false });
      },
    },
    positionUpdate(position) {
      this.updateFromSocket(position);
    },
  },
  created() {
    // Leaflet objects do not have to be reactive
    this.map = null;
    this.deviceLayer = null;
    this.layerControl = null;
    this.tileProviders = [
      {
        urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        options: {
          name: "OpenStreetMap",
          visible: true,
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      {
        urlTemplate: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        options: {
          name: "OpenTopoMap",
          visible: false,
          attribution:
            'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
      },
    ];
  },
  mounted() {
    this.initMap();
    this.loadDeviceLayer(this.worldmapStore.overlayNames);
    this.loadStaticLayers(this.worldmapStore.overlayNames);
    this.emitter.on("open-device-popup", (device_id) => {
      this.openPopup(device_id);
    });
    this.connect(this.authStore.token);
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
    this.emitter.off("open-device-popup");
  },
  methods: {
    initMap() {
      this.map = L.map("worldmap");
      const center = this.worldmapStore.center;
      const zoom = this.worldmapStore.zoom;
      if (center !== null && zoom !== null) {
        this.map.setView(center, zoom);
      } else {
        this.map.fitBounds([
          [-60, -50],
          [70, 50],
        ]);
      }

      let baseMaps = {};
      this.tileProviders.forEach((tileProvider) => {
        const baseLayer = L.tileLayer(
          tileProvider.urlTemplate,
          tileProvider.options
        );
        if (
          this.worldmapStore.baseLayerName === tileProvider.options.name ||
          (this.worldmapStore.baseLayerName === "" &&
            tileProvider.options.visible)
        ) {
          baseLayer.addTo(this.map);
        }
        baseMaps[tileProvider.options.name] = baseLayer;
      });
      this.layerControl = L.control
        .layers(
          baseMaps,
          {},
          {
            collapsed: false,
            sortLayers: true,
            sortFunction: this.deviceOnTop,
          }
        )
        .addTo(this.map);
      this.map.on("moveend", (e) => {
        this.worldmapStore.center = e.target.getCenter();
      });
      this.map.on("zoomend", (e) => {
        this.worldmapStore.zoom = e.target.getZoom();
      });
      this.map.on("baselayerchange", (e) => {
        this.worldmapStore.baseLayerName = e.name;
      });
      this.map.on("overlayadd", (e) => {
        this.storeOverlayControls(e.name, true);
      });
      this.map.on("overlayremove", (e) => {
        this.storeOverlayControls(e.name, false);
      });
    },
    deviceOnTop(layerA, layerB) {
      if (layerA.options.onTop) {
        return -1;
      } else if (layerB.options.onTop) {
        return 1;
      } else {
        return 0;
      }
    },
    storeOverlayControls(name, active) {
      const overlayNames = this.worldmapStore.overlayNames;
      if (active) {
        if (!overlayNames.includes(name)) {
          overlayNames.push(name);
        }
      } else {
        overlayNames.splice(overlayNames.indexOf(name), 1);
      }
    },
    loadDeviceLayer(activeLayerNames) {
      this.apiRequest("get", "/positions").then((response) => {
        this.deviceLayer = L.featureGroup();
        this.positionStore.clearLastPositions();
        for (let dev of response.data) {
          const popup = this.getPopupText(dev);
          const iconAttr = this.getMarkerIconAttr(dev);
          const opacity = this.getMarkerOpacity(dev);
          this.updateMarker(
            dev.device_id,
            dev.loc_lat,
            dev.loc_lon,
            popup,
            iconAttr,
            opacity
          );
          this.positionStore.addLastPositions({
            raw: dev,
            latLng: { lat: dev.loc_lat, lon: dev.loc_lon },
            popup,
            iconAttr,
            opacity,
          });
        }
        if (
          this.worldmapStore.center === null ||
          this.worldmapStore.zoom === null
        ) {
          this.fitMarkers();
        }
        this.deviceLayer.options.onTop = true;
        this.layerControl.addOverlay(this.deviceLayer, "Device");
        if (activeLayerNames.includes("Device")) {
          this.deviceLayer.addTo(this.map);
        }
      });
    },
    loadStaticLayers(activeLayerNames) {
      this.apiRequest("get", "/staticlayers").then((response) => {
        let layerControlStatic = [];
        let layerIndex = 1;
        for (let geojson of response.data) {
          layerControlStatic.push({
            layer: L.geoJSON(geojson, this.getGeoJsonOptions(geojson)),
            layerName: this.getStaticLayerName(geojson, layerIndex),
          });
          layerIndex++;
        }
        this.replaceDuplicateNames(layerControlStatic);
        layerControlStatic.sort((a, b) => {
          return a.layerName.localeCompare(b.layerName);
        });
        layerControlStatic.forEach((element) => {
          this.layerControl.addOverlay(element.layer, element.layerName);
          if (activeLayerNames.includes(element.layerName)) {
            element.layer.addTo(this.map);
          }
        });
      });
    },
    getStaticLayerName(geojson, index) {
      let name = `Overlay ${index}`;
      if (geojson.properties && geojson.properties.name) {
        name = geojson.properties.name;
      }
      return name;
    },
    replaceDuplicateNames(layerList) {
      const dupNames = layerList
        .map(({ layerName }) => layerName)
        .filter((e, i, a) => a.indexOf(e) === i && a.lastIndexOf(e) !== i);
      layerList.forEach((layer) => {
        if (dupNames.includes(layer.layerName)) {
          let count = 1;
          let newName = "";
          let allNames = [];
          do {
            allNames = layerList.map(({ layerName }) => layerName);
            newName = `${layer.layerName}-${count}`;
            count++;
          } while (allNames.includes(newName));
          layer.layerName = newName;
        }
      });
    },
    updateMarker(id, lat, lon, popup, iconAttr, opacity) {
      if (this.deviceLayer) {
        const icon = ExtraMarkers.icon({
          icon: iconAttr.icon,
          prefix: iconAttr.prefix,
          markerColor: iconAttr.markerColor,
          iconColor: iconAttr.iconColor,
          svg: true,
        });
        const allMarkers = this.deviceLayer.getLayers();
        let marker = allMarkers.find((e) => e.options.id === id);
        if (!marker) {
          marker = L.marker([lat, lon], { id, icon, opacity });
          marker.bindPopup(popup);
          this.deviceLayer.addLayer(marker);
        } else {
          marker.setLatLng([lat, lon]);
          marker.setIcon(icon);
          marker.bindPopup(popup);
          marker.setOpacity(opacity);
        }
      } else {
        console.log("Skip position update");
      }
    },
    fitMarkers() {
      // Only change center and zoom if layer has markers
      if (this.deviceLayer.getLayers().length !== 0) {
        const bounds = this.deviceLayer.getBounds().pad(0.2);
        const paddingRight =
          this.map.getSize().x - this.map.getContainer().clientWidth;
        const paddingBottom =
          this.map.getSize().y - this.map.getContainer().clientHeight;
        this.map.flyToBounds(bounds, {
          paddingBottomRight: [paddingRight, paddingBottom],
          maxZoom: 12,
        });
      }
    },
    getGeoJsonOptions(geojson) {
      return {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, {
            opacity:
              (geojson.properties &&
                geojson.properties.marker &&
                geojson.properties.marker.opacity) ||
              0.8,
            icon: ExtraMarkers.icon({
              icon: `mdi-${
                (geojson.properties &&
                  geojson.properties.marker &&
                  geojson.properties.marker.icon) ||
                "star"
              }`,
              prefix: "mdi",
              markerColor:
                (geojson.properties &&
                  geojson.properties.marker &&
                  sColor(geojson.properties.marker.markercolor)) ||
                sColor("green"),
              iconColor:
                (geojson.properties &&
                  geojson.properties.marker &&
                  sColor(geojson.properties.marker.iconcolor)) ||
                sColor("white"),
              shape: "circle",
              svg: true,
            }),
          });
        },
        style: (feature) => {
          // Only apply style to (multi)lines and polygons
          if (feature.geometry.type !== "Point") {
            return {
              color:
                (geojson.properties &&
                  geojson.properties.line &&
                  sColor(geojson.properties.line.color)) ||
                sColor("red"),
              weight:
                (geojson.properties &&
                  geojson.properties.line &&
                  geojson.properties.line.weight) ||
                5,
              opacity:
                (geojson.properties &&
                  geojson.properties.line &&
                  geojson.properties.line.opacity) ||
                0.65,
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
              let popupText = "";
              let popupKeys = Object.keys(feature.properties);
              let popupValues = Object.values(feature.properties);
              for (let i = 0; i < popupKeys.length; i += 1) {
                popupText += popupKeys[i] + ": " + popupValues[i] + "<br>";
              }
              layer.bindPopup(popupText);
            }
          }
        },
      };
    },
    getPopupText(dev) {
      const loc_type_str = {
        rec: "Recorded",
        left: "Last known",
      };
      let htmlText = "",
        PopupType;

      const PopupTime = new Date(dev.loc_timestamp);
      // If loc_type is defined use predefined label
      if (dev.loc_type) {
        PopupType = loc_type_str[dev.loc_type];
        htmlText += "<b>" + dev.alias + "</b>";
        if (typeof PopupType !== "undefined") {
          htmlText += " (" + PopupType + ")";
        }
        htmlText += "<br>";
        htmlText += PopupTime.toLocaleString() + "<br>";
      } else {
        if (dev.loc_attr) {
          if (dev.loc_attr.labelshowalias) {
            htmlText += "<b>" + dev.alias + "</b><br>";
          }
          if (dev.loc_attr.labelshowtime) {
            htmlText += PopupTime.toLocaleString() + "<br>";
          }
          if (dev.loc_attr.labelcustomhtml) {
            htmlText += dev.loc_attr.labelcustomhtml;
          }
        }
      }

      if (htmlText === "") {
        // Show at least the alias
        htmlText = "<b>" + dev.alias + "</b>";
      }

      return htmlText;
    },
    getMarkerIconAttr(dev) {
      // Default marker icon
      let cIcon = "home";
      let cPrefix = "mdi"; // Ignore prefix provided by the device
      let cMarkerColor = sColor("cyan");
      let cIconColor = sColor("white");
      let cShape = "circle";

      // If loc_type is defined use predefined marker/icon sets
      if (dev.loc_type) {
        if (dev.loc_type === "rec") {
          cIcon = "circle";
          cMarkerColor = sColor("blue");
        }
        if (dev.loc_type === "now" || dev.loc_type === "left") {
          cIcon = "circle";
          cMarkerColor = sColor("green");
        }
      } else {
        if (dev.loc_attr) {
          if (dev.loc_attr.miconname) {
            cIcon = dev.loc_attr.miconname;
          }
          if (dev.loc_attr.mcolor) {
            cMarkerColor = sColor(dev.loc_attr.mcolor);
          }
          if (dev.loc_attr.miconcolor) {
            cIconColor = sColor(dev.loc_attr.miconcolor);
          }
        }
      }
      let customIconAttr = {
        icon: `${cPrefix}-${cIcon}`,
        prefix: cPrefix,
        markerColor: cMarkerColor,
        iconColor: cIconColor,
        shape: cShape,
      };
      return customIconAttr;
    },
    getMarkerOpacity(dev) {
      // Default marker options
      let opacity = 1.0;

      // Define icon opacity
      if (dev.loc_type && dev.loc_type === "left") {
        opacity = 0.5;
      } else {
        if (dev.loc_attr && dev.loc_attr.mopacity) {
          opacity = dev.loc_attr.mopacity;
        }
      }
      return opacity;
    },
    openPopup(id) {
      if (this.deviceLayer !== null) {
        this.deviceLayer.eachLayer((layer) => {
          if (layer.options.id === id) {
            layer.openPopup();
            if (this.map !== null) {
              this.map.panTo(layer.getLatLng());
            }
          }
        });
      }
    },
    updateFromSocket(socketPayloadStr) {
      try {
        const dev = JSON.parse(socketPayloadStr).data;
        const popup = this.getPopupText(dev);
        const iconAttr = this.getMarkerIconAttr(dev);
        const opacity = this.getMarkerOpacity(dev);
        this.updateMarker(
          dev.device_id,
          dev.loc_lat,
          dev.loc_lon,
          popup,
          iconAttr,
          opacity
        );
        const cbFindDuplicates = (e, i, a) =>
          e.raw.device_id === a[a.length - 1].raw.device_id;
        this.positionStore.addLastPositions({
          raw: dev,
          latLng: { lat: dev.loc_lat, lon: dev.loc_lon },
          popup,
          iconAttr,
          opacity,
          cb: cbFindDuplicates,
        });
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
#worldmap {
  height: 100%;
  z-index: 0;
}
</style>
