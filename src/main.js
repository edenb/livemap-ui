import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
//import { loadFonts } from './plugins/webfontloader'
import store from "@/store.js";
import Configuration from "@/configuration";
import mitt from "mitt";
import socketio from "@/plugins/socketio";

//loadFonts()

const app = createApp(App);

const emitter = mitt();
app.config.globalProperties.emitter = emitter;

const socketioConf = {
  connection: Configuration.value("envServerUrl") || "http://localhost:3000",
  options: {
    autoConnect: false,
  },
};

app
  .use(router)
  .use(store)
  .use(vuetify)
  .use(socketio, socketioConf)
  .mount("#app");
