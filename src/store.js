//import Vue from 'vue';
import { createStore } from "vuex";
import httpRequest from "@/helpers/axios.js";

//Vue.use(Vuex);

const store = createStore({
  state: {
    user: {},
    lastPositions: [],
    token: localStorage.getItem("jwt"),
    authorized: false,
    mapZoom: null,
    mapCenter: null,
    drawerOpen: {},
  },
  getters: {},
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.authorized = true;
    },
    DEL_USER(state) {
      state.user = {};
      state.authorized = false;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
    DEL_TOKEN(state) {
      state.token = "";
    },
    CLEAR_LASTPOSITIONS(state) {
      state.lastPositions = [];
    },
    ADD_LASTPOSITIONS(state, lastPosition) {
      state.lastPositions.push(lastPosition);
    },
    DEL_LASTPOSITIONS(state, index) {
      state.lastPositions.splice(index, 1);
    },
    CLEAR_MAPZOOM(state) {
      state.mapZoom = null;
    },
    SET_MAPZOOM(state, mapZoom) {
      state.mapZoom = mapZoom;
    },
    CLEAR_MAPCENTER(state) {
      state.mapCenter = null;
    },
    SET_MAPCENTER(state, mapCenter) {
      state.mapCenter = mapCenter;
    },
    SET_DRAWEROPEN(state, { name, open }) {
      state.drawerOpen[name] = open;
    },
  },
  actions: {
    setUserToken({ commit }, token) {
      return new Promise((resolve, reject) => {
        commit("SET_TOKEN", token);
        httpRequest("get", "/account")
          .then((response) => {
            //console.log(`User ID: ${response.data.fullname}`);
            commit("SET_USER", response.data);
            localStorage.setItem("jwt", token);
            resolve(response);
          })
          .catch((err) => {
            console.log(`Error: ${err}`);
            commit("DEL_TOKEN"); //ToDo: Alleen bij 401
            commit("DEL_USER");
            localStorage.removeItem("jwt");
            reject(err);
          });
      });
    },
    revokeUserToken({ commit }) {
      commit("DEL_TOKEN");
      commit("DEL_USER");
      localStorage.removeItem("jwt");
    },
    clearLastPositions({ commit }) {
      commit("CLEAR_LASTPOSITIONS");
    },
    addLastPositions({ commit }, payload) {
      commit("ADD_LASTPOSITIONS", payload);
      // If present remove the previous position of the device
      // i.e. the device with the same id as the last one added
      if (typeof payload.cb === "function") {
        let idx = this.state.lastPositions.findIndex(payload.cb);
        if (idx >= 0 && idx !== this.state.lastPositions.length - 1) {
          commit("DEL_LASTPOSITIONS", idx);
        }
      }
    },
    clearMapZoom({ commit }) {
      commit("CLEAR_MAPZOOM");
    },
    setMapZoom({ commit }, mapZoom) {
      commit("SET_MAPZOOM", mapZoom);
    },
    clearMapCenter({ commit }) {
      commit("CLEAR_MAPCENTER");
    },
    setMapCenter({ commit }, mapCenter) {
      commit("SET_MAPCENTER", mapCenter);
    },
    setDrawerOpen({ commit }, { name, open }) {
      commit("SET_DRAWEROPEN", { name, open });
    },
  },
});

export default store;
