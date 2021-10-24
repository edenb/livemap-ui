import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import App from '@/App.vue'
import router from '@/router'
import VueSocketIOExt from 'vue-socket.io-extended'
import io from 'socket.io-client'
import store from '@/store.js'
import Configuration from '@/configuration'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false
Vue.config.performance = true

// Create a socket but do not connect
const socket = io(Configuration.value('envServerUrl') || 'http://localhost:3000', {
  autoConnect: false
});

Vue.use(VueSocketIOExt, socket, {store});

new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  vuetify,
  icons: {
    iconfont: 'mdiSvg'
  },
  components: {
    App
  },
})
