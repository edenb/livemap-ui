import Vue from 'vue';
import Vuex from 'vuex';
import httpRequest from '@/helpers/axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    lastPositions: [],
    token: localStorage.getItem('jwt'),
    authorized: false,
    mapZoom: -1,
    mapCenter: {}
  },
  getters: {

  },
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
      state.token = '';
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
    SET_MAPZOOM(state, mapZoom) {
      state.mapZoom = mapZoom;
    },
    SET_MAPCENTER(state, mapCenter) {
      state.mapCenter = mapCenter;
    }
  },
  actions: {
    setUserToken({commit}, token) {
      return new Promise ((resolve, reject) => {
        commit('SET_TOKEN', token);
        httpRequest('get', '/account')
          .then((response) => {
            //console.log(`User ID: ${response.data.fullname}`);
            commit('SET_USER', response.data);
            localStorage.setItem('jwt', token);
            resolve(response);
          })
         .catch((err) => {
            console.log(`Error: ${err}`);
            commit('DEL_TOKEN'); //ToDo: Alleen bij 401
            commit('DEL_USER');
            localStorage.removeItem('jwt');
            reject(err);
          });
      })
    },
    revokeUserToken({commit}) {
      commit('DEL_TOKEN');
      commit('DEL_USER');
      localStorage.removeItem('jwt')
    },
    clearLastPositions({commit}) {
      commit('CLEAR_LASTPOSITIONS');
    },
    addLastPositions({commit}, payload) {
      commit('ADD_LASTPOSITIONS', payload.marker);
      // If present remove the previous position of the device
      // i.e. the device with the same id as the last one added
      if (typeof payload.cb === 'function') {
        let idx = this.state.lastPositions.findIndex(payload.cb);
        if (idx >=0) {
          commit('DEL_LASTPOSITIONS', idx);
        }
      }
    },
    setMapZoom({commit}, mapZoom) {
      commit('SET_MAPZOOM', mapZoom);
    },
    setMapCenter({commit}, mapCenter) {
      commit('SET_MAPCENTER', mapCenter);
    }
  }
})
