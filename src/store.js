import { ref } from "vue";
import { defineStore } from "pinia";
import httpRequest from "@/helpers/axios.js";

export const useWorldmapStore = defineStore("worldmap", () => {
  const baseLayerName = ref("");
  const center = ref(null);
  const overlayNames = ref(["Device"]);
  const zoom = ref(null);
  function resetAll() {
    baseLayerName.value = "";
    center.value = null;
    overlayNames.value = ["Device"];
    zoom.value = null;
  }

  return { baseLayerName, center, overlayNames, zoom, resetAll };
});

export const usePositionStore = defineStore("position", () => {
  const lastPositions = ref([]);
  function addLastPositions(payload) {
    this.lastPositions.push(payload);
    // If present remove the previous position of the device
    // i.e. the device with the same id as the last one added
    if (typeof payload.cb === "function") {
      let idx = this.lastPositions.findIndex(payload.cb);
      if (idx >= 0 && idx !== this.lastPositions.length - 1) {
        this.lastPositions.splice(idx, 1);
      }
    }
  }
  function clearLastPositions() {
    this.lastPositions = [];
  }

  return { lastPositions, clearLastPositions, addLastPositions };
});

export const useLayoutStore = defineStore("layout", () => {
  const drawerOpen = ref({});

  return { drawerOpen };
});

export const useAuthStore = defineStore("auth", () => {
  const user = ref({});
  const token = ref(localStorage.getItem("jwt"));
  const authorized = ref(false);
  function setAuthorized(token) {
    this.token = token;
    return new Promise((resolve, reject) => {
      httpRequest("get", "/account")
        .then((response) => {
          this.user = {
            ...response.data,
          };
          localStorage.setItem("jwt", token);
          this.authorized = true;
          resolve(response);
        })
        .catch((err) => {
          console.log(`Error: ${err}`);
          this.authorized = false;
          this.token = ""; //ToDo: 401 only?
          this.user = {};
          localStorage.removeItem("jwt");
          reject(err);
        });
    });
  }
  function revokeAuthorized() {
    this.authorized = false;
    this.token = "";
    this.user = {};
    localStorage.removeItem("jwt");
  }

  return { user, token, authorized, setAuthorized, revokeAuthorized };
});
