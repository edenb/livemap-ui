import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import Configuration from "@/configuration.js";
import socketio from "@/plugins/socketio.js";
import http from "@/plugins/http.js";
import emitter from "@/plugins/emitter.js";

loadFonts();

const pinia = createPinia();
const app = createApp(App);

const socketioConf = {
  connection: Configuration.value("envServerUrl") || "http://localhost:3000",
  options: {
    autoConnect: false,
  },
};

const httpConf = {
  serverUrl: Configuration.value("envServerUrl") || "http://localhost:3000",
  apiPath: "/api/v1",
};

app
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(socketio, socketioConf)
  .use(http, httpConf)
  .use(emitter)
  .mount("#app");
