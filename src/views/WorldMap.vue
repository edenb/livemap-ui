<template>
  <mapDrawer
    :base-layer-names="allBaseLayerNames"
    :base-layer-names-selected="baseLayerName"
    :overlay-names="allOverlayNames"
    :overlay-names-selected="overlayNames"
    :selector="mapDrawerSelector"
    @drawer-ready="map.invalidateSize({ pan: false })"
    @close-drawer="mapDrawerSelector = ''"
    @open-marker-popup="openPopup"
    @set-base-layer="setBaseLayer"
    @set-overlays="setOverlays"
  />
  <v-container id="worldmap" class="pa-0" fluid>
    <v-col>
      <v-row justify="end">
        <v-btn-group color="rgba(0, 0, 0, 0.6)" direction="vertical">
          <v-btn size="40" @click="zoomIn">
            <v-icon color="white" size="x-large">mdi-plus</v-icon>
          </v-btn>
          <v-btn size="40" @click="zoomOut">
            <v-icon color="white" size="x-large">mdi-minus</v-icon>
          </v-btn>
        </v-btn-group>
      </v-row>
      <v-row justify="end">
        <v-btn-toggle
          v-model="mapDrawerSelector"
          base-color="rgba(0, 0, 0, 0.6)"
          color="primary"
          direction="vertical"
        >
          <v-btn
            data-cy="map-drawer-layers-control"
            size="40"
            value="mapDrawerLayers"
          >
            <v-icon color="white" size="x-large">mdi-layers</v-icon>
          </v-btn>
          <v-btn
            data-cy="map-drawer-markers-control"
            size="40"
            value="mapDrawerMarkers"
          >
            <v-icon color="white" size="x-large">mdi-map-marker</v-icon>
          </v-btn>
          <v-btn
            data-cy="map-drawer-info-control"
            size="40 "
            value="mapDrawerInfo"
          >
            <v-icon color="white" size="x-large"
              >mdi-information-outline</v-icon
            >
          </v-btn>
        </v-btn-toggle>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useLayoutStore, usePositionStore, useWorldmapStore } from "@/store.js";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import L from "leaflet";
import { ExtraMarkers } from "leaflet-extra-markers";
import mapDrawer from "@/components/mapDrawer.vue";
import { standardizeColor as sColor } from "@/helpers/colors.js";

const allOverlayNames = ref([]);
const baseLayerName = ref("");
const connect = inject("connect");
const httpRequest = inject("httpRequest");
const { mapDrawerSelector } = storeToRefs(useLayoutStore());
const overlayNames = ref([]);
const positionUpdate = inject("positionUpdate");
const positionStore = usePositionStore();
const { show } = inject("snackbar");
const worldmapStore = useWorldmapStore();
const { menuDrawerOpen } = storeToRefs(useLayoutStore());

let map = null;
let deviceLayer = null;
let baseLayers = {};
let overlays = {};
const tileProviders = [
  {
    urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      name: "OpenStreetMap",
      defaultMap: true,
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  {
    urlTemplate: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    options: {
      name: "OpenTopoMap",
      defaultMap: false,
      attribution:
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    },
  },
];
const allBaseLayerNames = tileProviders.map(({ options }) => options.name);

watch(menuDrawerOpen, () => {
  map.invalidateSize({ pan: false });
});

watch(positionUpdate, () => {
  updateFromSocket(positionUpdate.value);
});

onMounted(() => {
  initMap();
  loadDeviceLayer(worldmapStore.overlayNames);
  loadStaticLayers(worldmapStore.overlayNames);
  connect();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});

function initMap() {
  map = L.map("worldmap", { zoomControl: false });
  const center = worldmapStore.center;
  const zoom = worldmapStore.zoom;
  if (center !== null && zoom !== null) {
    map.setView(center, zoom);
  } else {
    map.fitBounds([
      [-60, -50],
      [70, 50],
    ]);
  }

  let defaultBaseLayerName = tileProviders[0].options.name;
  tileProviders.forEach((tileProvider) => {
    const baseLayer = L.tileLayer(
      tileProvider.urlTemplate,
      tileProvider.options,
    );
    baseLayer.on("load", () => {
      document
        .getElementById("worldmap")
        .setAttribute("data-cy", "all-tiles-loaded");
    });
    if (tileProvider.options.defaultMap) {
      defaultBaseLayerName = tileProvider.options.name;
    }
    baseLayers[tileProvider.options.name] = baseLayer;
  });

  baseLayerName.value = worldmapStore.baseLayerName;
  if (baseLayerName.value === "") {
    baseLayerName.value = defaultBaseLayerName;
  }
  baseLayers[baseLayerName.value].addTo(map);
  // setBaseLayer[baseLayerName.value];
  // layerControl = L.control
  //   .layers(
  //     baseMaps,
  //     {},
  //     { collapsed: false, sortLayers: true, sortFunction: deviceOnTop },
  //   )
  //   .addTo(map);
  map.on("moveend", (e) => {
    worldmapStore.center = e.target.getCenter();
  });
  map.on("zoomend", (e) => {
    worldmapStore.zoom = e.target.getZoom();
    document
      .getElementById("worldmap")
      .setAttribute("data-cy", "zoom-animation-end");
  });
  // map.on("overlayadd", (e) => {
  //   storeOverlayControls(e.name, true);
  // });
  // map.on("overlayremove", (e) => {
  //   storeOverlayControls(e.name, false);
  // });
}

function setBaseLayer(name) {
  const layer = baseLayers[name];
  let isVisible = map.hasLayer(layer);
  if (!isVisible) {
    map.removeLayer(baseLayers[baseLayerName.value]);
    map.addLayer(baseLayers[name]);
  }
  baseLayerName.value = name;
  worldmapStore.baseLayerName = name;
}

function setOverlays(names) {
  Object.entries(overlays).forEach(([layerName, layer]) => {
    let isVisible = map.hasLayer(layer);
    if (!isVisible && names.includes(layerName)) {
      map.addLayer(layer);
    }
    if (isVisible && !names.includes(layerName)) {
      map.removeLayer(layer);
    }
  });
  allOverlayNames.value = Object.keys(overlays);
  overlayNames.value = names;
  worldmapStore.overlayNames = names;
}

function zoomIn() {
  map?.zoomIn();
}

function zoomOut() {
  map?.zoomOut();
}

// function deviceOnTop(layerA, layerB) {
//   if (layerA.options.onTop) {
//     return -1;
//   } else if (layerB.options.onTop) {
//     return 1;
//   } else {
//     return 0;
//   }
// }

// function storeOverlayNames(names) {
//   worldmapStore.overlayNames = names;
// }

// function storeOverlayControls(name, active) {
//   const overlayNames = worldmapStore.overlayNames;
//   if (active) {
//     if (!overlayNames.includes(name)) {
//       overlayNames.push(name);
//     }
//   } else {
//     overlayNames.splice(overlayNames.indexOf(name), 1);
//   }
// }

async function loadDeviceLayer(activeLayerNames) {
  let response;
  try {
    response = await httpRequest("get", "/positions");
  } catch (err) {
    show({ message: err.httpError.message, color: "error" });
  }

  if (response?.data) {
    deviceLayer = L.featureGroup();
    positionStore.clearLastPositions();
    for (let dev of response.data) {
      const popup = getPopupText(dev);
      const iconAttr = getMarkerIconAttr(dev);
      const opacity = getMarkerOpacity(dev);
      updateMarker(
        dev.device_id,
        dev.loc_lat,
        dev.loc_lon,
        popup,
        iconAttr,
        opacity,
      );
      positionStore.addLastPositions({
        raw: dev,
        latLng: { lat: dev.loc_lat, lon: dev.loc_lon },
        popup,
        iconAttr,
        opacity,
      });
    }
    if (worldmapStore.center === null || worldmapStore.zoom === null) {
      fitMarkers();
    }
    deviceLayer.options.onTop = true;
    // layerControl.addOverlay(deviceLayer, "Device");
    // if (activeLayerNames.includes("Device")) {
    //   deviceLayer.addTo(map);
    // }
    overlays["Devices"] = deviceLayer;
    setOverlays(activeLayerNames);
  }
}

async function loadStaticLayers(activeLayerNames) {
  let response;
  try {
    response = await httpRequest("get", "/staticlayers");
  } catch (err) {
    show({ message: err.httpError.message, color: "error" });
  }

  if (response?.data) {
    try {
      let staticLayers = [];
      let layerIndex = 1;
      for (let geojson of response.data) {
        staticLayers.push({
          layer: L.geoJSON(geojson, getGeoJsonOptions(geojson)),
          layerName: getStaticLayerName(geojson, layerIndex),
        });
        const layerName = getStaticLayerName(geojson, layerIndex);
        overlays[layerName] = L.geoJSON(geojson, getGeoJsonOptions(geojson));
        // overlayNames.value.push(layerName);
        layerIndex++;
      }
      replaceDuplicateNames(staticLayers);
      staticLayers.sort((a, b) => {
        return a.layerName.localeCompare(b.layerName);
      });
      staticLayers.forEach((element) => {
        // layerControl.addOverlay(element.layer, element.layerName);
        overlays[element.layerName] = element.layer;
        // overlayNames.value.push(element.layerName);
        // if (activeLayerNames.includes(element.layerName)) {
        //   element.layer.addTo(map);
        // }
      });
      setOverlays(activeLayerNames);
    } catch (err) {
      show({ message: err, color: "error" });
    }
  }
}

function getStaticLayerName(geojson, index) {
  let name = `Overlay ${index}`;
  if (geojson.properties && geojson.properties.name) {
    name = geojson.properties.name;
  }
  return name;
}

function replaceDuplicateNames(layerList) {
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
}

function updateMarker(id, lat, lon, popup, iconAttr, opacity) {
  if (deviceLayer) {
    const icon = ExtraMarkers.icon({
      icon: iconAttr.icon,
      prefix: iconAttr.prefix,
      markerColor: iconAttr.markerColor,
      iconColor: iconAttr.iconColor,
      svg: true,
    });
    const allMarkers = deviceLayer.getLayers();
    let marker = allMarkers.find((e) => e.options.id === id);
    if (!marker) {
      marker = L.marker([lat, lon], { id, icon, opacity, zIndexOffset: 1000 });
      marker.bindPopup(popup);
      deviceLayer.addLayer(marker);
    } else {
      marker.setLatLng([lat, lon]);
      marker.setIcon(icon);
      marker.bindPopup(popup);
      marker.setOpacity(opacity);
    }
  } else {
    console.log("Skip position update");
  }
}

function fitMarkers() {
  // Only change center and zoom if layer has markers
  if (deviceLayer.getLayers().length !== 0) {
    const bounds = deviceLayer.getBounds().pad(0.2);
    const paddingRight = map.getSize().x - map.getContainer().clientWidth;
    const paddingBottom = map.getSize().y - map.getContainer().clientHeight;
    map.flyToBounds(bounds, {
      paddingBottomRight: [paddingRight, paddingBottom],
      maxZoom: 12,
    });
  }
}

function getGeoJsonOptions(geojson) {
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
}

function getPopupText(dev) {
  const loc_type_str = { rec: "Recorded", left: "Last known" };
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
}

function getMarkerIconAttr(dev) {
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
}

function getMarkerOpacity(dev) {
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
}

function openPopup(id) {
  if (deviceLayer !== null) {
    deviceLayer.eachLayer((layer) => {
      if (layer.options.id === id) {
        layer.openPopup();
        if (map !== null) {
          map.panTo(layer.getLatLng());
        }
      }
    });
  }
}

function updateFromSocket(socketPayloadStr) {
  try {
    const dev = JSON.parse(socketPayloadStr).data;
    const popup = getPopupText(dev);
    const iconAttr = getMarkerIconAttr(dev);
    const opacity = getMarkerOpacity(dev);
    updateMarker(
      dev.device_id,
      dev.loc_lat,
      dev.loc_lon,
      popup,
      iconAttr,
      opacity,
    );
    const cbFindDuplicates = (e, i, a) =>
      e.raw.device_id === a[a.length - 1].raw.device_id;
    positionStore.addLastPositions({
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
}
</script>

<style>
#worldmap {
  height: 100%;
  .v-btn-group--vertical {
    margin-top: 20px;
    border-start-end-radius: 0px;
    border-end-end-radius: 0px;
  }
  .v-btn {
    z-index: 500;
  }
}
</style>
