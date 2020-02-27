import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import App from '@/App.vue'
import router from '@/router'
import VueSocketIOExt from 'vue-socket.io-extended'
import io from 'socket.io-client'
//import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false
Vue.config.performance = true

const socket = io('http://localhost:3000');
 
Vue.use(VueSocketIOExt, socket);

new Vue({
  el: '#app',
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
