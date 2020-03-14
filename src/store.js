import Vue from 'vue';
import Vuex from 'vuex';
import httpRequest from '@/helpers/axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    token: '',
    authorized: false
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
            resolve(response);
          })
         .catch((err) => {
            console.log(`Error: ${err}`);
            commit('DEL_TOKEN'); //ToDo: Alleen bij 401
            commit('DEL_USER');
            reject(err);
          });
      })
    },
    revokeUserToken({commit}) {
      commit('DEL_TOKEN');
      commit('DEL_USER');
    }
  }
})