import { inject, ref } from "vue";
import { defineStore } from "pinia";

export const useWorldmapStore = defineStore("worldmap", () => {
  const baseLayerName = ref("");
  const center = ref(null);
  const overlayNames = ref(["Devices"]);
  const zoom = ref(null);
  function resetAll() {
    baseLayerName.value = "";
    center.value = null;
    overlayNames.value = ["Devices"];
    zoom.value = null;
  }

  return { baseLayerName, center, overlayNames, zoom, resetAll };
});

export const usePositionStore = defineStore("position", () => {
  const lastPositions = ref([]);
  function addLastPositions(payload) {
    lastPositions.value.push(payload);
    // If present remove the previous position of the device
    // i.e. the device with the same id as the last one added
    if (typeof payload.cb === "function") {
      let idx = lastPositions.value.findIndex(payload.cb);
      if (idx >= 0 && idx !== lastPositions.value.length - 1) {
        lastPositions.value.splice(idx, 1);
      }
    }
  }
  function clearLastPositions() {
    lastPositions.value = [];
  }

  return { lastPositions, clearLastPositions, addLastPositions };
});

export const useLayoutStore = defineStore("layout", () => {
  const mapDrawerSelector = ref("");
  const menuDrawerOpen = ref(true);

  return { mapDrawerSelector, menuDrawerOpen };
});

export const useAuthStore = defineStore("auth", () => {
  const authorized = ref(false);
  const httpRequest = inject("httpRequest");
  const user = ref({});
  const token = ref(localStorage.getItem("jwt"));

  async function setAuthorized(updateToken) {
    token.value = updateToken;
    try {
      const response = await httpRequest("get", "/account");
      user.value = { ...response.data };
      localStorage.setItem("jwt", token.value);
      authorized.value = true;
      return response;
    } catch (err) {
      authorized.value = false;
      user.value = {};
      localStorage.removeItem("jwt");
      throw err;
    }
  }

  function revokeAuthorized() {
    authorized.value = false;
    token.value = null;
    user.value = {};
    localStorage.removeItem("jwt");
  }

  return { user, token, authorized, setAuthorized, revokeAuthorized };
});
