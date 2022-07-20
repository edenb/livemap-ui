import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
//import { loadFonts } from './plugins/webfontloader'
import store from '@/store.js'
import VueSocketIOExt from 'vue-socket.io-extended'
import io from 'socket.io-client'
import Configuration from '@/configuration'
import $bus from '@/helpers/event.js';

//loadFonts()
// Create a socket but do not connect
const socket = io(Configuration.value('envServerUrl') || 'http://localhost:3000', {
  autoConnect: false
});

const app = createApp(App)

app.config.globalProperties.$bus = $bus;

app.use(router)
  .use(store)
  .use(vuetify)
  .use(VueSocketIOExt, socket) //, { store })
  .mount('#app')


